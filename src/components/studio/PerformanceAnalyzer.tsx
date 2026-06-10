import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { springTransition } from '../../lib/motion';

interface PerformanceAnalyzerProps {
  metronomePlaying: boolean;
  bpm: number;
}

interface ExpectedTick {
  beat: number;
  sub: number;
  time: number;
}

interface OffsetDetail {
  index: number;
  offset: number; // ms
  type: 'perfect' | 'ahead' | 'behind' | 'missed';
}

export const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({
  metronomePlaying,
  bpm: _bpm,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    totalBeats: number;
    hitsCount: number;
    averageOffset: number;
    offsets: OffsetDetail[];
    feedback: string;
  } | null>(null);

  // References for Audio Recording and analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Timestamps tracking
  const expectedTicks = useRef<ExpectedTick[]>([]);
  const detectedHits = useRef<number[]>([]);
  
  // Peak detection helper variables
  const lastHitTime = useRef(0);
  const rmsHistory = useRef<number[]>([]);

  // Listen for metronome ticks during recording
  useEffect(() => {
    const handleMetronomeTick = (e: Event) => {
      if (!isRecording) return;
      const customEvt = e as CustomEvent<ExpectedTick>;
      const { beat, sub, time, isMuted } = (customEvt as any).detail;
      
      // Only record ticks that are audible (not muted by gap click)
      if (!isMuted) {
        expectedTicks.current.push({ beat, sub, time });
      }
    };

    window.addEventListener('dma-metronome-tick', handleMetronomeTick);
    return () => {
      window.removeEventListener('dma-metronome-tick', handleMetronomeTick);
    };
  }, [isRecording]);

  // Handle metronome stopping: auto-stop recording
  useEffect(() => {
    if (!metronomePlaying && isRecording) {
      stopRecordingAndAnalyze();
    }
  }, [metronomePlaying]);

  const startRecording = async () => {
    try {
      // Clear previous lists
      expectedTicks.current = [];
      detectedHits.current = [];
      rmsHistory.current = [];
      lastHitTime.current = 0;
      setAnalysisResult(null);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Initialize Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      
      micSourceRef.current = ctx.createMediaStreamSource(stream);
      
      // Create ScriptProcessorNode for peak detection (1024 buffer size)
      scriptProcessorRef.current = ctx.createScriptProcessor(1024, 1, 1);
      
      micSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(ctx.destination);

      setIsRecording(true);

      // Audio analysis loop (Peak detection)
      scriptProcessorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        
        // Calculate RMS (Root Mean Square) energy of the buffer
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        
        // Update mic level for UI visualization
        setMicLevel(rms * 10); // scale it up for UI

        // Peak detection algorithm
        // We track the running average RMS energy to set a dynamic threshold
        rmsHistory.current.push(rms);
        if (rmsHistory.current.length > 50) {
          rmsHistory.current.shift(); // Keep history size bounded
        }
        
        const avgRms = rmsHistory.current.reduce((a, b) => a + b, 0) / rmsHistory.current.length;
        const now = performance.now();
        
        // A peak (drum hit) is detected if the current volume is high enough
        // and rises significantly above the running average, with a debounce of 150ms
        const threshold = Math.max(0.06, avgRms * 1.8);
        if (rms > threshold && now - lastHitTime.current > 150) {
          detectedHits.current.push(now);
          lastHitTime.current = now;
        }
      };

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert("Impossible d'accéder au micro. Veuillez vérifier vos permissions.");
    }
  };

  const stopRecordingAndAnalyze = () => {
    setIsRecording(false);
    setMicLevel(0);

    // Disconnect and release audio resources
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyzePerformance();
  };

  const analyzePerformance = () => {
    const ticks = expectedTicks.current;
    const hits = detectedHits.current;

    if (ticks.length === 0) {
      return; // No beats recorded
    }

    const offsets: OffsetDetail[] = [];
    let matchedHits = 0;
    let totalScore = 0;
    let sumOffset = 0;

    // Compare each metronome beat with closest hits
    ticks.forEach((tick, idx) => {
      // Find the hit that has the smallest time difference from this metronome click
      let minDiff = Infinity;
      let closestHit: number | null = null;

      hits.forEach(hit => {
        const diff = hit - tick.time;
        if (Math.abs(diff) < Math.abs(minDiff)) {
          minDiff = diff;
          closestHit = hit;
        }
      });

      // Max window of +/- 160ms to classify as a hit for this beat
      const windowSize = 160;

      if (closestHit !== null && Math.abs(minDiff) <= windowSize) {
        matchedHits++;
        sumOffset += minDiff;
        
        // Score: 100 points for 0ms error, scaling down to 0 points at 160ms error
        const beatScore = Math.max(0, 100 - (Math.abs(minDiff) / windowSize) * 100);
        totalScore += beatScore;

        let type: 'perfect' | 'ahead' | 'behind' = 'perfect';
        if (minDiff < -20) type = 'ahead';
        else if (minDiff > 20) type = 'behind';

        offsets.push({
          index: idx + 1,
          offset: minDiff,
          type
        });
      } else {
        // Missed beat
        offsets.push({
          index: idx + 1,
          offset: 0,
          type: 'missed'
        });
      }
    });

    const finalScore = Math.round(ticks.length > 0 ? (totalScore / ticks.length) : 0);
    const avgOffset = matchedHits > 0 ? Math.round(sumOffset / matchedHits) : 0;

    // Generate descriptive feedback
    let feedback = "";
    if (finalScore >= 90) {
      feedback = "Excellent ! Ton timing est d'une régularité professionnelle. Tu enterres le click ! 🥁🔥";
    } else if (finalScore >= 75) {
      feedback = "Bien joué ! Le groove est solide. Fais attention aux légères variations en avance ou en retard. 👍";
    } else if (finalScore >= 50) {
      feedback = "Travail en cours. Ralentis un peu le tempo du métronome et concentre-toi bien sur l'alignement précis de chaque coup. 💪";
    } else {
      feedback = "Besoin de pratique. Fais des sessions régulières à tempo lent et focalise-toi sur le rebond naturel. 🥢";
    }

    setAnalysisResult({
      score: finalScore,
      totalBeats: ticks.length,
      hitsCount: hits.length,
      averageOffset: avgOffset,
      offsets,
      feedback
    });
  };

  return (
    <div className="glass-card border border-white/5 bg-zinc-900/20 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-600 via-transparent to-transparent opacity-20" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] text-gold-400 font-extrabold uppercase tracking-wider block">
            Analyse de Précision Rythmique
          </span>
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-gold-400" />
            <span>Timing & Performance Analyzer</span>
          </h4>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Enregistrement micro...
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
        Lancez le métronome, cliquez sur **Enregistrer** et jouez sur votre batterie (ou tapez sur votre pad/table). L'outil analysera en direct votre régularité par rapport au clic.
      </p>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!metronomePlaying}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
              metronomePlaying
                ? "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow border-transparent"
                : "bg-zinc-950/40 border-white/5 text-zinc-500 cursor-not-allowed"
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span>Enregistrer ma frappe</span>
          </button>
        ) : (
          <button
            onClick={stopRecordingAndAnalyze}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border-none"
          >
            <MicOff className="w-4 h-4 shrink-0" />
            <span>Arrêter & Analyser</span>
          </button>
        )}
        
        {analysisResult && (
          <button
            onClick={() => setAnalysisResult(null)}
            className="p-3 rounded-xl bg-zinc-950 border border-white/5 hover:border-gold-500/30 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
            title="Réinitialiser l'analyse"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!metronomePlaying && !isRecording && !analysisResult && (
        <div className="flex items-center gap-2 p-3 bg-gold-400/5 border border-gold-400/10 rounded-xl text-[10px] text-gold-400 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Veuillez d'abord démarrer le métronome pour pouvoir vous enregistrer.</span>
        </div>
      )}

      {/* Live Mic Level Visualizer */}
      {isRecording && (
        <div className="space-y-1.5 p-3 bg-zinc-950/60 rounded-xl border border-white/5">
          <div className="flex justify-between text-[8px] text-zinc-500 font-extrabold uppercase tracking-widest">
            <span>Détection de frappe micro</span>
            <span>Seuil d'impact</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative flex items-center">
            {/* Threshold marker line */}
            <div className="absolute left-[30%] top-0 bottom-0 w-[1.5px] bg-gold-500 opacity-60 z-10" />
            <motion.div
              animate={{ width: `${Math.min(100, micLevel * 150)}%` }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`h-full rounded-full ${
                micLevel * 1.5 > 0.3
                  ? 'bg-gradient-to-r from-emerald-500 to-gold-400'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springTransition}
            className="border-t border-white/5 pt-4 space-y-4"
          >
            {/* Score & Summary metrics */}
            <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex flex-col items-center justify-center shrink-0 shadow-gold-glow">
                <span className="text-obsidian text-2xl font-black leading-none">{analysisResult.score}%</span>
                <span className="text-obsidian text-[7px] font-black uppercase tracking-widest mt-0.5">Score</span>
              </div>
              <div className="space-y-1 flex-1">
                <h5 className="font-bold text-white text-xs tracking-wide">
                  {analysisResult.score >= 75 ? 'Groove validé ! ✓' : 'Travaillez la précision'}
                </h5>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold italic">
                  "{analysisResult.feedback}"
                </p>
              </div>
            </div>

            {/* Timing Offset Scatter Chart */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 space-y-3">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                Graphique de Timing Offsets (ms)
              </span>
              
              <div className="h-16 w-full relative flex items-center justify-center">
                {/* Timeline axis line */}
                <div className="absolute left-0 right-0 h-[1px] bg-zinc-800" />
                
                {/* Center marker (0ms / Perfect) */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-zinc-700 border-l border-dashed border-zinc-600 left-1/2 flex flex-col justify-between items-center z-10 pointer-events-none">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest -mt-2">Temps</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest -mb-2">0ms</span>
                </div>

                {/* Left/Right bounds text */}
                <div className="absolute left-2 text-[8px] text-zinc-600 uppercase font-black tracking-widest">
                  &larr; Avance (-160ms)
                </div>
                <div className="absolute right-2 text-[8px] text-zinc-600 uppercase font-black tracking-widest">
                  Retard (+160ms) &rarr;
                </div>

                {/* Plot offset points */}
                {analysisResult.offsets.map((item, idx) => {
                  if (item.type === 'missed') return null;
                  
                  // Map -160ms to 160ms to 0% to 100% position on the timeline
                  const percentage = 50 + (item.offset / 160) * 50;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: idx * 0.05 }}
                      className={`absolute w-3.5 h-3.5 rounded-full border flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition-transform ${
                        item.type === 'perfect'
                          ? 'bg-emerald-500 border-emerald-400'
                          : item.type === 'ahead'
                          ? 'bg-rose-500 border-rose-400'
                          : 'bg-indigo-500 border-indigo-400'
                      }`}
                      style={{ left: `calc(${percentage}% - 7px)` }}
                      title={`Coup ${item.index}: ${Math.round(item.offset)}ms`}
                    >
                      <span className="text-[7px] text-white font-black leading-none">{item.index}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend guide */}
              <div className="flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider text-zinc-500 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Sur le beat (±20ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>En avance (&lt;-20ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>En retard (&gt;20ms)</span>
                </div>
              </div>
            </div>

            {/* List of offsets details */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-[10px] scrollbar-thin">
              {analysisResult.offsets.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-white/5"
                >
                  <span className="text-zinc-500 font-bold">Coup #{item.index}</span>
                  {item.type === 'missed' ? (
                    <span className="text-rose-500 font-black uppercase text-[8px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      Coup Manqué / Vide
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-black font-mono ${
                        item.type === 'perfect'
                          ? 'text-emerald-400'
                          : item.type === 'ahead'
                          ? 'text-rose-400'
                          : 'text-indigo-400'
                      }`}>
                        {item.offset > 0 ? `+${Math.round(item.offset)}` : Math.round(item.offset)} ms
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        item.type === 'perfect'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : item.type === 'ahead'
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                      } border`}>
                        {item.type === 'perfect' ? 'Excellent' : item.type === 'ahead' ? 'Avance' : 'Retard'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
