import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';
import { springTransition } from '../../lib/motion';

interface PracticeLog {
  id: string;
  user_id: string;
  exercise_name: string;
  bpm: number;
  duration: number; // in minutes
  notes: string;
  created_at: string;
}

interface PracticeLoggerProps {
  supabaseConnected: boolean;
}

export const PracticeLogger: React.FC<PracticeLoggerProps> = ({ supabaseConnected }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [logExercise, setLogExercise] = useState('');
  const [logBpm, setLogBpm] = useState<number | string>(120);
  const [logDuration, setLogDuration] = useState('15');
  const [logNotes, setLogNotes] = useState('');

  // Practice Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive]);

  // Load practice logs from Supabase or localStorage
  const fetchPracticeLogs = async () => {
    if (!user) return;
    try {
      if (supabaseConnected) {
        const { data, error } = await supabase
          .from('practice_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          setPracticeLogs(data);
          localStorage.setItem(`dma_practice_logs_${user.id}`, JSON.stringify(data));
        }
      } else {
        const stored = localStorage.getItem(`dma_practice_logs_${user.id}`);
        if (stored) {
          setPracticeLogs(JSON.parse(stored));
        }
      }
    } catch (err) {
      console.error('Error fetching practice logs:', err);
      const stored = localStorage.getItem(`dma_practice_logs_${user.id}`);
      if (stored) {
        setPracticeLogs(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    fetchPracticeLogs();
  }, [user, supabaseConnected]);

  // Smart AI Coach custom event dispatch listeners
  useEffect(() => {
    const handleLogPractice = (e: Event) => {
      const customEvt = e as CustomEvent<{ title: string; bpm: number }>;
      const { title, bpm: newBpm } = customEvt.detail;
      
      setLogExercise(title);
      setLogBpm(newBpm);
      showToast(`Exercice pré-rempli dans ton journal : ${title} 📝`, "info");
    };
    window.addEventListener('dma-log-practice', handleLogPractice);
    return () => {
      window.removeEventListener('dma-log-practice', handleLogPractice);
    };
  }, [showToast]);

  // Create practice log
  const handleCreatePracticeLog = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !logExercise.trim()) return;

    const durationMin = timerActive
      ? Math.max(1, Math.round(timerSeconds / 60))
      : parseInt(logDuration) || 15;

    const newLog: PracticeLog = {
      id: crypto.randomUUID(),
      user_id: user.id,
      exercise_name: logExercise.trim(),
      bpm: parseInt(logBpm.toString()) || 120,
      duration: durationMin,
      notes: logNotes.trim(),
      created_at: new Date().toISOString()
    };

    const updated = [newLog, ...practiceLogs];
    setPracticeLogs(updated);
    localStorage.setItem(`dma_practice_logs_${user.id}`, JSON.stringify(updated));

    // Reset Form
    setLogExercise('');
    setLogNotes('');
    setLogDuration('15');
    if (timerActive) {
      setTimerActive(false);
      setTimerSeconds(0);
    }

    showToast("Entraînement enregistré avec succès ! 🥁📝", "success");

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('practice_logs')
          .insert([newLog]);
        if (error) throw error;
        fetchPracticeLogs();
      } catch (err) {
        console.error('Error saving practice log to Supabase:', err);
      }
    }
  };

  // Delete practice log
  const handleDeletePracticeLog = async (id: string) => {
    if (!user) return;
    const updated = practiceLogs.filter(log => log.id !== id);
    setPracticeLogs(updated);
    localStorage.setItem(`dma_practice_logs_${user.id}`, JSON.stringify(updated));

    showToast("Entraînement supprimé.", "info");

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('practice_logs')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchPracticeLogs();
      } catch (err) {
        console.error('Error deleting practice log from Supabase:', err);
      }
    }
  };

  // Curved Bezier SVG line chart generator
  const getChartPoints = () => {
    const lastLogs = [...practiceLogs]
      .reverse()
      .slice(-7); // Chronological last 7
    
    if (lastLogs.length === 0) return { path: '', points: [], filledPath: '' };

    const width = 500;
    const height = 150;
    const padding = 30;

    const bpms = lastLogs.map(log => log.bpm);
    const minBpm = Math.min(...bpms, 60);
    const maxBpm = Math.max(...bpms, 180);
    const bpmRange = maxBpm - minBpm || 10;

    const points = lastLogs.map((log, idx) => {
      const x = padding + (idx / Math.max(1, lastLogs.length - 1)) * (width - padding * 2);
      const y = height - padding - ((log.bpm - minBpm) / bpmRange) * (height - padding * 2);
      return { 
        x, 
        y, 
        bpm: log.bpm, 
        date: new Date(log.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        name: log.exercise_name
      };
    });

    if (points.length === 1) {
      const p = points[0];
      return {
        path: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        points,
        filledPath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${height - padding} L ${p.x - 20} ${height - padding} Z`
      };
    }

    // Cubic spline path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const filledPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { path, points, filledPath };
  };

  return (
    <motion.div
      key="practice-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={springTransition}
      className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in"
    >
      {/* Left Side: Form & Active Timer */}
      <div className="md:col-span-5 space-y-6">
        {/* Timer Card */}
        <div className="glass-card bg-obsidian-card/45 border border-white/5 p-6 rounded-2xl text-center space-y-4">
          <h4 className="text-gold-400 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-gold-400" />
            <span>Session Active (Chronomètre)</span>
          </h4>
          
          <div className="py-6 bg-black/40 rounded-xl border border-white/5 shadow-inner">
            <span className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_10px_rgba(212,175,55,0.25)]">
              {(() => {
                const hrs = Math.floor(timerSeconds / 3600);
                const mins = Math.floor((timerSeconds % 3600) / 60);
                const secs = timerSeconds % 60;
                return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              })()}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTimerActive(!timerActive)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                timerActive
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-gold-500/15 border-gold-500/30 text-gold-400 hover:bg-gold-500/20'
              }`}
            >
              {timerActive ? 'Pause' : 'Démarrer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerActive(false);
                setTimerSeconds(0);
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleCreatePracticeLog} className="glass-card bg-obsidian-card/45 border border-white/5 p-6 rounded-2xl space-y-4">
          <h4 className="text-gold-400 font-extrabold text-sm uppercase tracking-wider">
            📝 Enregistrer un Entraînement
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase block">Exercice / Rudiment</label>
              <input
                type="text"
                required
                placeholder="ex: Paradiddle caisse claire, Gospel Chops #1"
                value={logExercise}
                onChange={(e) => setLogExercise(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 focus:border-gold-500/40 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase block">Tempo (BPM)</label>
                <input
                  type="number"
                  required
                  min={20}
                  max={300}
                  value={logBpm}
                  onChange={(e) => setLogBpm(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 focus:border-gold-500/40 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase block">Durée (Minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={480}
                  disabled={timerSeconds > 10}
                  value={timerSeconds > 10 ? Math.max(1, Math.round(timerSeconds / 60)).toString() : logDuration}
                  onChange={(e) => setLogDuration(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 focus:border-gold-500/40 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {timerSeconds > 10 && (
                  <span className="text-[9px] text-gold-400 font-semibold mt-0.5 block animate-pulse">
                    Calibré par le chronomètre
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase block">Notes &amp; Observations</label>
              <textarea
                placeholder="Observations du jour (difficultés, ressenti, relâchement...)"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 focus:border-gold-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none min-h-[90px] resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold shadow-gold-glow"
          >
            <Plus className="w-4 h-4" /> Enregistrer la Session
          </button>
        </form>
      </div>

      {/* Right Side: Graph & Logs List */}
      <div className="md:col-span-7 space-y-6">
        {/* Graph Card */}
        <div className="glass-card bg-obsidian-card/45 border border-white/5 p-6 rounded-2xl">
          <h4 className="text-gold-400 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Vitesse &amp; Rigueur (BPM Max)</span>
          </h4>
          {(() => {
            const chartData = getChartPoints();
            return practiceLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Aucune donnée d'entraînement pour le moment. Enregistrez votre première session pour voir le graphique ! 📈
              </div>
            ) : (
              <div className="w-full overflow-x-auto select-none">
                <svg viewBox="0 0 500 150" className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="30" y1="75" x2="470" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(255,255,255,0.05)" />

                  {/* Filled Area */}
                  {chartData.filledPath && (
                    <path d={chartData.filledPath} fill="url(#chart-glow)" />
                  )}
                  
                  {/* Curved Line */}
                  {chartData.path && (
                    <path 
                      d={chartData.path} 
                      fill="none" 
                      stroke="#D4AF37" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      className="drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
                    />
                  )}

                  {/* Interactive Dots & Text Labels */}
                  {chartData.points.map((p, idx) => (
                    <g key={idx} className="group/dot">
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="5" 
                        fill="#D4AF37" 
                        stroke="#0B0B0C" 
                        strokeWidth="2" 
                        className="transition-all duration-300 hover:scale-150 cursor-pointer"
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 12} 
                        fill="#D4AF37" 
                        fontSize="9" 
                        fontWeight="extrabold" 
                        textAnchor="middle"
                        className="font-mono font-sans"
                      >
                        {p.bpm}
                      </text>
                      <text 
                        x={p.x} 
                        y="142" 
                        fill="#71717A" 
                        fontSize="8" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {p.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Logs list */}
        <div className="space-y-4">
          <h4 className="text-zinc-400 font-semibold text-xs uppercase tracking-widest border-b border-white/5 pb-2">
            Dernières Sessions
          </h4>
          {practiceLogs.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {practiceLogs.map(log => (
                <div
                  key={log.id}
                  className="glass-card bg-obsidian-card/30 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 group hover:border-white/10 transition-all duration-300"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-white text-sm font-bold">{log.exercise_name}</h5>
                      <span className="text-[10px] bg-gold-400/10 border border-gold-400/20 text-gold-400 px-2 py-0.5 rounded font-mono font-bold">
                        ⚡ {log.bpm} BPM
                      </span>
                      <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono font-semibold">
                        ⏱️ {log.duration} min
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">
                      {new Date(log.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {log.notes && (
                      <p className="text-xs text-zinc-400 leading-normal bg-zinc-950/30 p-2.5 rounded-lg border border-white/5">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeletePracticeLog(log.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all"
                    title="Supprimer la session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-white/5 rounded-xl">
              <p className="text-zinc-500 text-xs">Aucun entraînement dans le journal.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
