import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Play, ArrowRight, Volume2, VolumeX, Music, Activity, Info, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/ui/PageTransition';
import { 
  staggerContainer, staggerChild, fadeInUp, fadeInLeft, fadeInRight, 
  gentleSpring, snappySpring 
} from '../lib/motion';

/* ─── Course Data ─── */
const courses = [
  {
    id: "dma-special",
    title: "Spécial Drum Master Academy",
    category: "Fondation Complète",
    level: "DÉBUTANT À INTERMÉDIAIRE",
    badge: "Recommandé",
    desc: "Le programme idéal pour débuter. Apprenez les bases solides et progressez jusqu'au niveau intermédiaire.",
    img: "assets/images/josue_1.jpg",
    link: "/courses/dma-special",
    primary: true
  },
  {
    id: "gospel",
    title: "Masterclass Gospel",
    category: "Gospel Chops & Grooves",
    level: "AVANCÉ",
    desc: "Maîtrisez les rudiments avancés, les fills linéaires et la dynamique émotionnelle propre au Gospel moderne.",
    img: "assets/images/gospel-pro-thumbnail.png",
    link: "/courses/gospel"
  },
  {
    id: "afro",
    title: "Spécialisation Afro Fusion",
    category: "Rythmes du Monde",
    level: "INTERMÉDIAIRE À AVANCÉ",
    desc: "Intégrez les polyrythmies ouest-africaines et les grooves Afrobeats dans un contexte de batterie moderne.",
    img: "assets/images/josue_2.jpg",
    link: "/courses/afro"
  },
  {
    id: "jazz",
    title: "Jazz Moderne & Studio",
    category: "Technique Pro",
    level: "AVANCÉ",
    desc: "Développez votre vocabulaire jazz, l'indépendance de vos membres et l'art d'enregistrer en studio professionnel.",
    img: "assets/images/josue_3.jpg",
    link: "/courses/jazz"
  },
  {
    id: "rythmes",
    title: "Étude des Rythmes",
    category: "Rythmes & Technique",
    level: "TOUS NIVEAUX",
    desc: "Explorez les fondamentaux rythmiques à travers la Salsa, le Merengue, l'Afro-Cuban, le Jazz Swing et le Funk.",
    img: "assets/images/etudes_rythmes.jpg",
    link: "/courses/rythmes"
  },
  {
    id: "rudiments",
    title: "40 Drum Basic Rudiments",
    category: "Fondations Essentielles",
    level: "TOUS NIVEAUX",
    badge: "INDISPENSABLE",
    desc: "Maîtrisez le lexique international de la batterie. Un parcours structuré couvrant les 40 rudiments officiels (PAS).",
    img: "assets/images/rudiments-pro-thumbnail.png",
    link: "/courses/rudiments",
    primary: true
  }
];

const testimonials = [
  {
    name: "Marc D.",
    role: "Batteur d'église, France",
    text: "La Masterclass Gospel a complètement transformé mon jeu. L'approche de Josué est incroyable et facile à suivre même à distance."
  },
  {
    name: "Sarah M.",
    role: "Musicienne pro, Canada",
    text: "J'ai pu intégrer des rythmes Afro de manière super fluide dans mes sets Jazz. Une pédagogie de classe mondiale."
  },
  {
    name: "Koffi A.",
    role: "Étudiant intermédiaire, Togo",
    text: "Une qualité de vidéo et un son parfaits. C'est comme si Josué était dans la pièce avec moi. Je recommande à 100%."
  }
];

/* ─── Animated Counter Hook ─── */
const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.min(Math.round((target / steps) * step), target));
      if (step >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/* ─── Section Components ─── */

const HeroSection: React.FC = () => (
  <section className="relative min-h-[90vh] flex items-center justify-center bg-zinc-950 overflow-hidden py-20 px-4" aria-label="Accueil héros">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center opacity-40 scale-105" 
      style={{ backgroundImage: `url('assets/images/josue_5.jpg')` }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-transparent z-[1]" aria-hidden="true" />
    
    <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="lg:col-span-8 text-left space-y-6"
      >
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, ...gentleSpring }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase"
        >
          <Award className="w-3.5 h-3.5" /> Excellence Musicale
        </motion.span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans leading-tight">
          Maîtrisez le Rythme.<br />
          Trouvez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-300 font-bold drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]">Voix</span>.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Rejoignez la Drum Master Academy. Une formation d'élite en Gospel, Afro Fusion et Jazz moderne, conçue pour propulser votre carrière musicale au niveau international.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snappySpring}>
            <Link to="/courses" className="btn-gold flex items-center gap-2 group text-sm md:text-base">
              Découvrir les cours
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snappySpring}>
            <Link to="/courses" className="btn-gold-outline flex items-center gap-2 text-sm md:text-base">
              <Play className="w-4 h-4 fill-current" /> En savoir plus
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const AboutSection: React.FC = () => {
  const years = useCountUp(10);
  const scenes = useCountUp(100);
  const languages = useCountUp(3);

  return (
    <section className="py-24 bg-obsidian relative" aria-label="À propos de l'instructeur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            variants={fadeInLeft}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="text-sm font-semibold tracking-wider text-gold-400 uppercase">
              À propos de l'instructeur
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans">
              Rencontrez Josué <span className="text-gold-400">ADETI</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
              Fondateur de la Drum Master Academy, Josué est un batteur professionnel, formateur et réalisateur rythmique togolais cumulant plus d'une décennie d'expertise. Sa maîtrise des studios d'enregistrement, de la production musicale (MAO) et de la scène live fait de lui une référence incontournable en Afrique de l'Ouest.
            </p>
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
              Son enseignement unique fusionne la rigueur de la technique de caisse claire internationale, la sensibilité créative du Gospel drumming et la richesse polyrythmique des traditions africaines.
            </p>

            {/* Stats Counters */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">{years}+</span>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Années d'Expérience</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">{scenes}+</span>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Scènes &amp; Studios</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">{languages}</span>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Langues Parlées</p>
              </div>
            </div>
          </motion.div>

          {/* Profile Image card */}
          <motion.div 
            variants={fadeInRight}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative group max-w-sm w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" aria-hidden="true" />
              <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-950">
                <img 
                  src="assets/images/josue_1.jpg" 
                  alt="Josué ADETI, fondateur et instructeur principal de la Drum Master Academy" 
                  className="w-full aspect-[4/5] object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 border-t border-white/5">
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">Fondateur &amp; Instructeur</span>
                  <h3 className="text-lg font-bold text-white">Josué ADETI</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// 🥁 INTERACTIVE STUDIO SECTION (Web Audio Synthesizers & Step Sequencer)
// ============================================================================
const InteractiveStudioSection: React.FC = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const [isPlayingSequencer, setIsPlayingSequencer] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [volume, setVolume] = useState(50); // 0 to 100
  
  // Game state
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rank, setRank] = useState('Débutant');

  const [activePads, setActivePads] = useState<Record<string, boolean>>({
    kick: false,
    snare: false,
    hihat: false,
    crash: false,
  });

  // Step sequencer grids (8 steps)
  const [sequence, setSequence] = useState<Record<string, boolean[]>>({
    kick: [true, false, false, false, true, false, false, false],
    snare: [false, false, true, false, false, false, true, false],
    hihat: [true, true, true, true, true, true, true, true],
    crash: [false, false, false, false, false, false, false, false],
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainVolumeGainRef = useRef<GainNode | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<any>(null);

  // Initialize audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume / 100, ctx.currentTime);
      mainGain.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      mainVolumeGainRef.current = mainGain;
    } else {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  };

  // Adjust volume
  useEffect(() => {
    if (mainVolumeGainRef.current && audioCtxRef.current) {
      mainVolumeGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Acoustic synthesizer modeling
  const playKick = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playSnare = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(oscGain);
    oscGain.connect(dest);

    noise.start();
    osc.start();
    noise.stop(ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  };

  const playHiHat = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(8000, ctx.currentTime);
    filter.Q.setValueAtTime(8, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.05);
  };

  const playCrash = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5500, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 1.2);
  };

  const playMetronomeTick = (ctx: AudioContext, dest: AudioNode, isDownbeat: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 750, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  // Helper trigger
  const triggerInstrument = (id: string, isManual = false) => {
    initAudio();
    if (!audioCtxRef.current || !mainVolumeGainRef.current) return;
    const ctx = audioCtxRef.current;
    const dest = mainVolumeGainRef.current;

    setActivePads(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setActivePads(prev => ({ ...prev, [id]: false }));
    }, 100);

    if (id === 'kick') playKick(ctx, dest);
    else if (id === 'snare') playSnare(ctx, dest);
    else if (id === 'hihat') playHiHat(ctx, dest);
    else if (id === 'crash') playCrash(ctx, dest);

    // Rhythm game scoring mechanism (only for manual taps when metronome is playing)
    if (isManual && isPlayingMetronome) {
      const beatDuration = (60 / bpm) * 1000;
      const pressTime = Date.now();
      const timeSinceLast = pressTime - lastTickTimeRef.current;
      const timeToNext = beatDuration - timeSinceLast;
      const errorMs = Math.min(timeSinceLast, timeToNext);

      let points = 0;
      let feed = '';
      if (errorMs < 75) {
        points = 100;
        feed = '🔥 PARFAIT !';
      } else if (errorMs < 140) {
        points = 50;
        feed = '✨ SUPER !';
      } else if (errorMs < 220) {
        points = 20;
        feed = '👍 BIEN';
      } else {
        points = 0;
        feed = '❌ OUPS';
      }

      if (points > 0) {
        setScore(prev => prev + points);
        setCombo(prev => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
      } else {
        setCombo(0);
      }
      setFeedback(feed);
      
      // Auto-clear feedback text with ref tracking
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(''), 1000);
    }
  };

  // Update Rank based on Score
  useEffect(() => {
    if (score > 5000) setRank('🥁 RYTHME VIRTUOSE');
    else if (score > 2500) setRank('⚡ GROOVE MASTER');
    else if (score > 1000) setRank('🌟 BATTEUR PRO');
    else if (score > 300) setRank('🎵 INITIÉ');
    else setRank('Débutant');
  }, [score]);

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 's') triggerInstrument('snare', true);
      else if (key === 'd') triggerInstrument('hihat', true);
      else if (key === 'f') triggerInstrument('kick', true);
      else if (key === 'g') triggerInstrument('crash', true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingMetronome, bpm]);

  // Master Clock / Tick Loop for Sequencer and Metronome
  useEffect(() => {
    if (!isPlayingSequencer && !isPlayingMetronome) {
      setCurrentStep(-1);
      return;
    }

    // Two ticks per beat (8th notes: step 0..7)
    const stepDurationMs = (60 / bpm) * 1000 / 2;

    const tick = () => {
      lastTickTimeRef.current = Date.now();

      setCurrentStep((prev) => {
        const next = (prev + 1) % 8;

        // Sound trigger block
        if (audioCtxRef.current && mainVolumeGainRef.current) {
          const ctx = audioCtxRef.current;
          const dest = mainVolumeGainRef.current;

          // Play sequencer tracks
          if (isPlayingSequencer) {
            if (sequence.kick[next]) playKick(ctx, dest);
            if (sequence.snare[next]) playSnare(ctx, dest);
            if (sequence.hihat[next]) playHiHat(ctx, dest);
            if (sequence.crash[next]) playCrash(ctx, dest);
          }

          // Play metronome tick on standard beats (steps 0, 2, 4, 6)
          if (isPlayingMetronome && next % 2 === 0) {
            const isDownbeat = next === 0;
            playMetronomeTick(ctx, dest, isDownbeat);
          }
        }

        return next;
      });
    };

    // Run first step instantly
    tick();

    const timer = setInterval(tick, stepDurationMs);
    return () => clearInterval(timer);
  }, [isPlayingSequencer, isPlayingMetronome, bpm, sequence]);

  // Load beat presets
  const loadPreset = (presetName: string) => {
    initAudio();
    if (presetName === 'gospel') {
      setSequence({
        kick: [true, false, false, true, false, false, true, false],
        snare: [false, false, true, false, false, true, false, true],
        hihat: [true, true, true, true, true, true, true, true],
        crash: [true, false, false, false, false, false, false, false],
      });
      setBpm(130);
    } else if (presetName === 'afro') {
      setSequence({
        kick: [true, false, false, false, true, false, false, false],
        snare: [false, false, true, false, false, false, true, false],
        hihat: [true, false, true, false, true, false, true, false],
        crash: [true, false, false, false, false, false, false, false],
      });
      setBpm(110);
    } else if (presetName === 'rock') {
      setSequence({
        kick: [true, false, false, false, true, false, false, false],
        snare: [false, false, true, false, false, false, true, false],
        hihat: [true, true, true, true, true, true, true, true],
        crash: [false, false, false, false, false, false, false, false],
      });
      setBpm(120);
    }
  };

  const clearSequence = () => {
    setSequence({
      kick: Array(8).fill(false),
      snare: Array(8).fill(false),
      hihat: Array(8).fill(false),
      crash: Array(8).fill(false),
    });
  };

  // Drum Pads configurations
  const padsList = [
    { id: 'crash', name: 'CRASH', key: 'G', color: 'from-purple-600 to-indigo-600', glowColor: 'rgba(168, 85, 247, 0.4)', bgGlow: 'bg-purple-500/20', soundName: 'Crash Cymbal' },
    { id: 'hihat', name: 'HI-HAT', key: 'D', color: 'from-gold-600 to-amber-500', glowColor: 'rgba(212, 175, 55, 0.4)', bgGlow: 'bg-gold-500/20', soundName: 'Charley' },
    { id: 'snare', name: 'SNARE', key: 'S', color: 'from-blue-600 to-cyan-500', glowColor: 'rgba(59, 130, 246, 0.4)', bgGlow: 'bg-blue-500/20', soundName: 'Caisse Claire' },
    { id: 'kick', name: 'KICK', key: 'F', color: 'from-rose-600 to-orange-500', glowColor: 'rgba(244, 63, 94, 0.4)', bgGlow: 'bg-rose-500/20', soundName: 'Grosse Caisse' },
  ];

  return (
    <section className="py-24 bg-zinc-950/80 border-t border-b border-white/5 relative overflow-hidden" aria-label="DMA Interactive Studio">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> DMA. Studio Virtuel
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-sans">
            DMA. Interactive <span className="text-gold-400">Studio</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Expérimentez le rythme instantanément. Utilisez votre clavier ou cliquez sur les pads ci-dessous pour jouer. Programmez votre séquenceur et essayez de rester dans le groove !
          </p>
        </motion.div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Dynamic Glowing Drum Pads */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 border-white/5 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-zinc-300 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold-400 animate-pulse" /> CLAVIER ACTIF : S - D - F - G
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => initAudio()} 
                    className="text-xs bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-1 rounded-md border border-white/10 transition-colors"
                  >
                    Activer Audio Context
                  </button>
                </div>
              </div>

              {/* The Pads Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {padsList.map((pad) => (
                  <motion.button
                    key={pad.id}
                    onClick={() => triggerInstrument(pad.id, true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      boxShadow: activePads[pad.id]
                        ? `0 0 30px ${pad.glowColor}`
                        : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                    }}
                    className={`relative aspect-square sm:aspect-[1.2/1] rounded-2xl border transition-all duration-75 overflow-hidden flex flex-col items-center justify-between p-6 ${
                      activePads[pad.id]
                        ? `${pad.bgGlow} border-white/30 scale-[0.98]`
                        : 'bg-obsidian-card/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {/* Ring ripple on press */}
                    {activePads[pad.id] && (
                      <motion.span
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl border border-white/50 pointer-events-none"
                      />
                    )}

                    {/* Glowing LED Header */}
                    <div className="w-full flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${activePads[pad.id] ? 'bg-white animate-ping' : 'bg-zinc-700'}`} />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{pad.soundName}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-950/80 border border-white/10 text-gold-400/90 shadow-md">
                        TOUCHE {pad.key}
                      </span>
                    </div>

                    {/* Pad Center Title */}
                    <span className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${pad.color} bg-clip-text text-transparent group-hover:brightness-110`}>
                      {pad.name}
                    </span>

                    {/* Visual Wave Preview */}
                    <div className="w-full h-1 flex gap-1 items-end justify-center">
                      {[...Array(6)].map((_, idx) => (
                        <motion.span
                          key={idx}
                          animate={{
                            height: activePads[pad.id] ? [4, Math.random() * 24 + 4, 4] : 4
                          }}
                          transition={{
                            duration: 0.15,
                            repeat: activePads[pad.id] ? 1 : 0
                          }}
                          className={`w-1 rounded-t bg-gradient-to-t ${pad.color}`}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Timings / Feedback bar */}
            <div className="glass-card p-4 border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gold-400" />
                <span className="text-xs text-zinc-400">
                  Tapez en rythme avec le métronome pour accumuler les combos et marquer des points.
                </span>
              </div>
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.span
                    key={feedback}
                    initial={{ opacity: 0, scale: 0.6, y: 10 }}
                    animate={{ opacity: 1, scale: 1.1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={snappySpring}
                    className={`text-sm font-extrabold tracking-wider px-3 py-1 rounded border shadow-lg ${
                      feedback.includes('PARFAIT')
                        ? 'bg-success-muted border-success/30 text-success'
                        : feedback.includes('SUPER')
                        ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                        : feedback.includes('BIEN')
                        ? 'bg-info-muted border-info/30 text-info'
                        : 'bg-danger-muted border-danger/30 text-danger'
                    }`}
                  >
                    {feedback}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Rhythm game + Metronome & Sequencer controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Dashboard de Score & Métrome */}
            <div className="glass-card p-6 border-white/5 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white tracking-wide">PANNEAU DE GROOVE</h3>
                <span className="text-xs text-gold-400 font-bold tracking-widest">{rank}</span>
              </div>

              {/* Rhythm Game Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-wider">Score</span>
                  <span className="text-xl font-bold text-white">{score}</span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-wider">Combo Actuel</span>
                  <span className="text-xl font-bold text-gold-400 animate-pulse">{combo}</span>
                </div>
                <div className="bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 block mb-1 uppercase tracking-wider">Combo Max</span>
                  <span className="text-xl font-bold text-purple-400">{maxCombo}</span>
                </div>
              </div>

              {/* Metronome & BPM Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Contrôle de Tempo (BPM)</span>
                  <span className="text-sm font-extrabold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">{bpm} BPM</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="flex-1 accent-gold-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    {/* Visual Pulse LED synced to current beats (steps 0, 2, 4, 6) */}
                    <div 
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-75 ${
                        (isPlayingMetronome || isPlayingSequencer) && currentStep % 2 === 0
                          ? currentStep === 0
                            ? 'bg-purple-500 shadow-[0_0_12px_#a855f7] border-purple-400'
                            : 'bg-gold-500 shadow-[0_0_12px_#d4af37] border-gold-400'
                          : 'bg-zinc-800 border-white/5'
                      }`}
                    />
                    <span className="text-xs text-zinc-500">Impulsion LED</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        initAudio();
                        setIsPlayingMetronome(prev => !prev);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isPlayingMetronome
                          ? 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isPlayingMetronome ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      Métronome
                    </button>
                    <button
                      onClick={() => {
                        setScore(0);
                        setCombo(0);
                        setMaxCombo(0);
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 text-zinc-400 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Game
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Step Sequencer / Boîte à Rythmes */}
            <div className="glass-card p-6 border-white/5 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gold-400" />
                  <h3 className="text-base font-bold text-white tracking-wide">SÉQUENCEUR DE BOUCLE</h3>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => loadPreset('gospel')} 
                    className="text-[10px] bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded border border-gold-500/20"
                  >
                    Gospel
                  </button>
                  <button 
                    onClick={() => loadPreset('afro')} 
                    className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20"
                  >
                    Afro
                  </button>
                  <button 
                    onClick={() => loadPreset('rock')} 
                    className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20"
                  >
                    Rock
                  </button>
                  <button 
                    onClick={clearSequence} 
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-400 px-2 py-0.5 rounded border border-white/5"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Grid 8 steps * 4 tracks */}
              <div className="space-y-3">
                {/* Visual Step indicators at the top */}
                <div className="grid grid-cols-9 gap-1 items-center">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider text-right pr-2">Temps</span>
                  <div className="col-span-8 grid grid-cols-8 gap-1.5">
                    {[...Array(8)].map((_, idx) => (
                      <span
                        key={idx}
                        className={`text-center text-[10px] font-black rounded ${
                          currentStep === idx
                            ? 'text-gold-400 bg-gold-400/10 scale-110'
                            : 'text-zinc-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instrument Rows */}
                {Object.keys(sequence).map((instrument) => {
                  const instDetails = padsList.find(p => p.id === instrument);
                  return (
                    <div key={instrument} className="grid grid-cols-9 gap-1 items-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-right pr-2">
                        {instrument}
                      </span>
                      <div className="col-span-8 grid grid-cols-8 gap-1.5">
                        {sequence[instrument].map((isActive, stepIdx) => (
                          <button
                            key={stepIdx}
                            onClick={() => {
                              initAudio();
                              const newSeq = { ...sequence };
                              newSeq[instrument][stepIdx] = !isActive;
                              setSequence(newSeq);
                            }}
                            className={`aspect-square w-full rounded-md border flex items-center justify-center transition-all ${
                              isActive
                                ? `bg-gradient-to-br ${instDetails?.color} border-white/20 shadow-md scale-95`
                                : currentStep === stepIdx
                                ? 'bg-zinc-800 border-zinc-700'
                                : 'bg-zinc-950/80 border-white/5 hover:border-white/10'
                            }`}
                            aria-label={`Étape ${stepIdx + 1} pour ${instrument}`}
                          >
                            {currentStep === stepIdx && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volume & Sequencer Switch */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-1 accent-gold-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    initAudio();
                    setIsPlayingSequencer(prev => !prev);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                    isPlayingSequencer
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                      : 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow hover:bg-gold-400'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingSequencer ? 'animate-spin-slow' : ''}`} />
                  {isPlayingSequencer ? 'Arrêter la Boucle' : 'Lancer la Séquence'}
                </button>
              </div>
            </div>
            
          </div>
          
        </div>

      </div>
    </section>
  );
};

const CoursesSection: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => (
  <section className="py-24 bg-zinc-950/50 relative" aria-label="Nos formations">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16 space-y-4"
      >
        <span className="text-sm font-semibold tracking-wider text-gold-400 uppercase">
          Programmes d'élite
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-sans">
          Nos <span className="text-gold-400">Formations</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Découvrez nos programmes d'élite conçus pour propulser votre talent. De l'initiation technique aux masterclasses professionnelles de niveau international.
        </p>
      </motion.div>

      {/* Courses grid with stagger */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {courses.map((course) => (
          <motion.div
            key={course.id}
            variants={staggerChild}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`glass-card group flex flex-col h-full border ${
              course.badge 
                ? "border-gold-500/30 hover:border-gold-500/50 shadow-gold-glow-subtle" 
                : "border-white/5 hover:border-white/20"
            } overflow-hidden`}
          >
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={course.img}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" aria-hidden="true" />
              
              {course.badge && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-bold text-[10px] px-2.5 py-1 rounded-md shadow-lg">
                  {course.badge}
                </span>
              )}
              
              <span className="absolute bottom-4 right-4 text-[10px] bg-black/60 backdrop-blur-md text-zinc-300 font-semibold px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                {course.level}
              </span>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">
                  {course.category}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                  {course.title}
                </h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed flex-1">
                {course.desc}
              </p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={snappySpring}>
                <Link
                  to={isLoggedIn ? `/courses/${course.id}` : "/login"}
                  className={`block mt-4 w-full text-center py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    course.badge
                      ? "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300"
                      : "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isLoggedIn ? "Accéder au cours" : "Voir le programme"}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snappySpring}>
          <Link to="/courses" className="btn-gold-outline inline-flex items-center gap-2 text-sm">
            Voir le catalogue complet <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const TestimonialsSection: React.FC = () => {
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-obsidian border-y border-white/5 overflow-hidden" aria-label="Témoignages">
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center space-y-4"
      >
        <span className="text-sm font-semibold tracking-wider text-gold-400 uppercase">
          Témoignages
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-sans">
          Ils ont <span className="text-gold-400">réussi</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Découvrez les retours d'expérience et les réussites de nos batteurs du monde entier.
        </p>
      </motion.div>

      {/* Cinematic infinite marquee slider */}
      <div className="cinematic-marquee py-4">
        <div className="cinematic-marquee-track">
          {marqueeItems.map((item, idx) => (
            <motion.div 
              key={`${item.name}-${idx}`} 
              whileHover={{ scale: 1.03, y: -4 }}
              transition={snappySpring}
              className="w-[300px] sm:w-[350px] shrink-0 glass-card bg-obsidian-card/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 hover:border-gold-500/20 transition-colors duration-300 cursor-default"
            >
              <div className="space-y-4">
                <div className="flex text-gold-400 gap-1" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current shrink-0" />
                  ))}
                </div>
                <p className="text-zinc-300 text-xs sm:text-sm italic leading-relaxed">
                  "{item.text}"
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center font-bold text-obsidian text-xs">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{item.name}</h4>
                  <span className="text-[10px] text-zinc-500">{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => (
  <section className="py-24 bg-gradient-to-b from-obsidian to-zinc-950 relative border-b border-white/5" aria-label="Appel à l'action">
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans">
          Prêt à passer au niveau <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-400 font-bold">supérieur</span> ?
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Rejoignez la Drum Master Academy aujourd'hui, libérez votre potentiel rythmique et commencez votre voyage vers l'excellence musicale aux côtés des plus grands experts.
        </p>
        <div className="pt-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={snappySpring}
            className="inline-block"
          >
            <Link
              to={isLoggedIn ? "/dashboard" : "/register"}
              className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm md:text-base animate-pulse-gold"
            >
              S'inscrire maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
    {/* Decorative radial glow */}
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_50%,rgba(212,175,55,0.05)_0px,transparent_60%)]" />
    </div>
  </section>
);

/* ─── Main Home Page ─── */
export const Home: React.FC = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen text-zinc-100 overflow-x-hidden font-sans">
        <HeroSection />
        <AboutSection />
        <InteractiveStudioSection />
        <CoursesSection isLoggedIn={isLoggedIn} />
        <TestimonialsSection />
        <CTASection isLoggedIn={isLoggedIn} />
      </div>
    </PageTransition>
  );
};
