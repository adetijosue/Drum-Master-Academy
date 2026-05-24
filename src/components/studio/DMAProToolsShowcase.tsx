import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Music, Sliders, TrendingUp, VolumeX, Shield, Lock, ArrowRight, Layers 
} from 'lucide-react';
import { snappySpring, fadeInUp, springTransition } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';

export const DMAProToolsShowcase: React.FC = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [activeTab, setActiveTab] = useState<'studio' | 'metronome'>('studio');

  // Animation states for simulated Virtual Studio Sequencer
  const [seqStep, setSeqStep] = useState(0);
  const [equalizerHeights, setEqualizerHeights] = useState<number[]>(Array(18).fill(20));

  // Animation states for simulated Metronome Pro
  const [metroBeat, setMetroBeat] = useState(0);
  const [metroBpm, setMetroBpm] = useState(120);
  const [metroPulsing, setMetroPulsing] = useState(false);
  const [metroMuted, setMetroMuted] = useState(false);

  // Simulated Sequencer clock (120 BPM = 500ms per beat, 125ms per sixteenth note step)
  useEffect(() => {
    const interval = setInterval(() => {
      setSeqStep((prev) => (prev + 1) % 16);
      
      // Randomize equalizer bar heights to simulate dancing audio
      setEqualizerHeights(
        Array(18)
          .fill(0)
          .map(() => Math.floor(15 + Math.random() * 85))
      );
    }, 125);

    return () => clearInterval(interval);
  }, []);

  // Simulated Metronome clock (120 BPM = 500ms per beat)
  useEffect(() => {
    let measureCount = 0;
    const interval = setInterval(() => {
      setMetroBeat((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          measureCount++;
          // Simulate Speed Trainer: accelerate slightly every 2 measures
          if (measureCount % 2 === 0) {
            setMetroBpm((bpm) => {
              if (bpm >= 130) return 120; // reset
              return bpm + 2;
            });
          }
          // Simulate Gap Click: mute the visuals on alternate measures
          setMetroMuted(measureCount % 4 >= 2);
        }
        return next;
      });
      
      setMetroPulsing(true);
      setTimeout(() => setMetroPulsing(false), 80);

    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Demo Sequencer Channels steps definition
  const demoChannels = [
    { name: 'KICK', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], color: 'from-gold-600 to-gold-400' },
    { name: 'SNARE', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true], color: 'from-purple-600 to-indigo-500' },
    { name: 'HI-HAT', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], color: 'from-zinc-500 to-zinc-400' },
    { name: 'CLAP', steps: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false], color: 'from-amber-500 to-gold-500' },
  ];

  return (
    <section className="py-16 sm:py-20 bg-zinc-950/60 relative overflow-hidden border-y border-white/5" aria-label="Outils d'élite">
      {/* Decorative colored lights behind */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <span className="text-sm font-semibold tracking-wider text-gold-400 uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
            Outils Révolutionnaires Inclus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">
            Sculptez votre Tempo avec le <span className="text-gold-400 font-bold">Studio DMA &amp; Métronome Pro</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Profitez de nos applications exclusives intégrées pour développer une précision métronomique et programmer vos propres boucles rythmiques.
          </p>
        </motion.div>

        {/* Tab Selection Row */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-zinc-900/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian shadow-gold-glow font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              Virtual DMA Studio
            </button>
            <button
              onClick={() => setActiveTab('metronome')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'metronome'
                  ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian shadow-gold-glow font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Métronome Pro
            </button>
          </div>
        </div>

        {/* Main Content Showcase Panel */}
        <div className="glass-card bg-obsidian-card/20 border border-white/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden min-h-[480px] flex items-center justify-center shadow-2xl">
          
          <AnimatePresence mode="wait">
            {activeTab === 'studio' ? (
              
              /* ─── VIRTUAL STUDIO TAB MOCKUP ─── */
              <motion.div
                key="studio-demo"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={snappySpring}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                
                {/* Visual Sequencer Graphic */}
                <div className="lg:col-span-8 bg-zinc-950/80 p-5 rounded-2xl border border-white/10 shadow-inner relative space-y-5 overflow-x-auto min-w-full">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 min-w-[550px]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black text-emerald-400 tracking-wider">LIVE DEMO</span>
                      </div>
                      <span className="text-zinc-500 text-[10px] font-semibold">120 BPM • PATTERN 1</span>
                    </div>
                    
                    {/* Simulated Equalizer wave */}
                    <div className="flex items-end gap-0.5 h-6 opacity-80">
                      {equalizerHeights.map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-[2px] bg-gradient-to-t from-gold-600 to-gold-400 rounded-t transition-all duration-100"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tracks Sequence grid */}
                  <div className="space-y-3 min-w-[550px]">
                    {demoChannels.map((channel, chIdx) => (
                      <div key={chIdx} className="flex items-center gap-3">
                        {/* Channel Badge */}
                        <div className="w-16 py-1 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-[8px] font-black text-zinc-300 uppercase tracking-widest text-center select-none shrink-0 shadow-sm">
                          {channel.name}
                        </div>

                        {/* Step matrix */}
                        <div className="flex-grow flex gap-1 items-center justify-between">
                          {channel.steps.map((isActive, sIdx) => {
                            const isCurrent = seqStep === sIdx;
                            const isBeatGroupA = Math.floor(sIdx / 4) % 2 === 0;

                            return (
                              <div
                                key={sIdx}
                                className={`aspect-square w-full max-h-5 max-w-5 rounded-[4px] border transition-all duration-100 flex items-center justify-center ${
                                  isActive
                                    ? isCurrent
                                      ? 'bg-white scale-110 shadow-white-glow border-white z-10'
                                      : `bg-gradient-to-br ${channel.color} border-transparent shadow-gold-glow-subtle`
                                    : isCurrent
                                    ? 'bg-zinc-700 border-zinc-500 scale-105'
                                    : isBeatGroupA
                                    ? 'bg-zinc-900/50 border-zinc-800/40'
                                    : 'bg-zinc-950/60 border-zinc-900/60'
                                }`}
                              >
                                {isCurrent && !isActive && (
                                  <div className="w-1 h-1 rounded-full bg-white/70" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini-controls mock row */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 min-w-[550px]">
                    <div className="flex gap-2">
                      <div className="w-16 h-4 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-[7px] font-black text-zinc-500 uppercase tracking-widest">
                        RACK FX
                      </div>
                      <div className="flex gap-1">
                        {['D', 'R', 'X', 'F'].map((fx) => (
                          <div key={fx} className={`w-3 h-3 rounded-full text-[6px] font-black flex items-center justify-center ${
                            fx === 'R' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/40 shadow-[0_0_6px_#a855f7]' : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                          }`}>
                            {fx}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="w-48 h-1.5 bg-zinc-900 rounded-full relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-100" 
                        style={{ width: `${(seqStep / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Features & Promotional Pitch */}
                <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider text-purple-400 bg-purple-400/10 border border-purple-400/20 uppercase">
                      <Layers className="w-3 h-3" /> Synthesis &amp; MAO intégrée
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Séquenceur Multi-pistes Audio &amp; Table de Mixage
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      Concevez vos patterns de batterie préférés directement en ligne avec nos synthétiseurs de percussions, notre rack d'effets (Delay, Reverb, Distortion) et notre console de mixage complète.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-zinc-300 font-semibold max-w-sm mx-auto lg:mx-0 text-left">
                    <li className="flex items-center gap-2">
                      <span className="text-gold-400">⚡</span> Séquenceur 16 Pas à latence zéro.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold-400">🎛️</span> Console de mixage avec Faders et Level Meters.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold-400">🎸</span> Banque d'instruments : Batterie, Afro Percussions, Claves.
                    </li>
                  </ul>
                </div>

              </motion.div>
            ) : (
              
              /* ─── METRONOME TAB MOCKUP ─── */
              <motion.div
                key="metronome-demo"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={snappySpring}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                
                {/* Visual Metronome Graphic */}
                <div className="lg:col-span-8 flex justify-center">
                  <div className="bg-zinc-950/80 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-inner max-w-sm w-full space-y-6 text-center relative overflow-hidden">
                    
                    {/* Top Status */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-gold-400 tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> MÉTRONOME PRO
                      </span>
                      {metroMuted ? (
                        <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1 animate-pulse">
                          <VolumeX className="w-2.5 h-2.5" /> GAP MUTE ACTIVE
                        </span>
                      ) : (
                        <span className="text-[8px] bg-gold-400/10 border border-gold-400/20 text-gold-400 px-2 py-0.5 rounded font-black uppercase">
                          CLIC ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Beats Visualizing Pulsar circles */}
                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((bIdx) => {
                        const isCurrent = metroBeat === bIdx;
                        const isFirst = bIdx === 0;

                        return (
                          <motion.div
                            key={bIdx}
                            animate={{
                              scale: isCurrent ? 1.25 : 1.0,
                              backgroundColor: isCurrent 
                                ? metroMuted
                                  ? '#3F3F46' // Muted gray
                                  : isFirst ? '#F59E0B' : '#D4AF37' 
                                : '#09090b',
                              borderColor: isCurrent ? metroMuted ? '#52525B' : '#D4AF37' : '#27272a',
                              boxShadow: isCurrent && !metroMuted ? '0 0 14px rgba(212, 175, 55, 0.6)' : 'none',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                            className="w-11 h-11 rounded-full border flex items-center justify-center font-mono text-xs font-black text-zinc-300 relative shadow-sm"
                          >
                            <span>{bIdx + 1}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Big BPM Counter Display */}
                    <div className="py-4 bg-black/40 rounded-xl border border-white/5 relative flex flex-col items-center">
                      <motion.h2 
                        animate={{ scale: metroPulsing && !metroMuted ? 1.04 : 1.0 }}
                        className="text-5xl sm:text-6xl font-black text-white font-mono leading-none tracking-tighter"
                      >
                        {metroBpm}
                        <span className="text-xs text-gold-400 font-extrabold ml-1 uppercase tracking-widest">BPM</span>
                      </motion.h2>
                      
                      {/* Active Speed Trainer Visual Info */}
                      <div className="flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-[9px] text-gold-400 font-extrabold uppercase tracking-wider animate-pulse">
                        <TrendingUp className="w-3 h-3" />
                        <span>SPEED TRAINER ACTIVÉ (+2 BPM)</span>
                      </div>
                    </div>

                    {/* Subdivision display */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Signature</span>
                        <span className="text-xs font-bold text-zinc-300">4/4 Standard</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Timbre</span>
                        <span className="text-xs font-bold text-zinc-300">Woodblock</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Features & Promotional Pitch */}
                <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
                      <TrendingUp className="w-3 h-3" /> Entraîneur Intellectuel
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Métronome Tactique &amp; Éditeur de Timing
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      Développez votre rigueur et sculptez votre précision temporelle grâce aux deux fonctions professionnelles exclusives d'entraînement rythmique.
                    </p>
                  </div>

                  <ul className="space-y-3.5 text-xs text-zinc-300 font-semibold max-w-sm mx-auto lg:mx-0 text-left">
                    <li className="flex items-start gap-2.5">
                      <span className="text-gold-400 font-bold mt-0.5">📈</span>
                      <div>
                        <strong className="text-white block font-bold">Speed Trainer Mode</strong>
                        Augmente le tempo automatiquement toutes les X mesures pour pousser vos limites de jeu.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-gold-400 font-bold mt-0.5">🔇</span>
                      <div>
                        <strong className="text-white block font-bold">Mute Coach (Gap Click)</strong>
                        Coupe périodiquement le clic de référence pour tester et renforcer votre tempo interne.
                      </div>
                    </li>
                  </ul>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* VISITOR UNAUTHORIZED OVERLAY BLOCKER */}
          {!isLoggedIn ? (
            <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[7px] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={springTransition}
                className="w-full max-w-md glass-card bg-obsidian-card/85 border border-gold-500/30 p-6 sm:p-8 rounded-2xl text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
              >
                <div className="w-14 h-14 bg-zinc-950 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-400 shadow-gold-glow mx-auto animate-pulse">
                  <Lock className="w-6 h-6 animate-bounce-subtle" />
                </div>
                
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 bg-gold-400/10 border border-gold-400/20 text-gold-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-gold-400" />
                    Accès Privé aux Étudiants
                  </span>
                  <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                    Débloquez la DMA Pro Tool suite
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                    Programmez vos Gospel Chops, entraînez-vous en mode Speed Trainer et créez vos propres boucles rythmiques.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link
                    to="/register"
                    className="btn-gold py-2.5 text-xs font-black uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 text-obsidian bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 cursor-pointer"
                  >
                    Créer un compte pour débloquer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-zinc-400 hover:text-white text-xs font-bold transition-all underline"
                  >
                    Déjà membre ? Se connecter
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : (
            
            /* CONNECTED STUDENT JUMP-IN OVERLAY */
            <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md glass-card bg-obsidian-card/90 border border-gold-500/30 p-6 sm:p-8 rounded-2xl text-center space-y-6 shadow-2xl"
              >
                <div className="w-14 h-14 bg-zinc-950 border border-gold-500/30 rounded-full flex items-center justify-center text-gold-400 shadow-gold-glow mx-auto animate-bounce-subtle">
                  <Sparkles className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 bg-gold-400/10 border border-gold-400/20 text-gold-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Accès Illimité Activé
                  </span>
                  <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                    Ravi de vous revoir, <span className="text-gold-400">{user.name.split(' ')[0]}</span> !
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                    Vos outils d'élite sont entièrement débloqués et prêts dans votre Espace Étudiant.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                  <Link
                    to="/studio"
                    className="btn-gold py-2.5 px-4 text-xs font-black uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 text-obsidian bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5" />
                    Ouvrir le Studio
                  </Link>
                  <Link
                    to="/tools"
                    className="btn-gold-outline py-2.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-gold-500/30 text-gold-400 hover:bg-gold-500/10 cursor-pointer animate-pulse-subtle"
                  >
                    <Sliders className="w-3.5 h-3.5 animate-pulse" />
                    Lancer le Métronome
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
