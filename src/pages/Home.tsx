import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Award, Star, Play, ArrowRight, Volume2, VolumeX, Music, Activity, Info, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/ui/PageTransition';
import { 
  staggerContainer, staggerChild, fadeInUp, fadeInLeft, fadeInRight, 
  gentleSpring, snappySpring 
} from '../lib/motion';
import { CollaborationsGallery } from '../components/CollaborationsGallery';

/* ─── Course Data ─── */
const courses = [
  {
    id: "dma-special",
    title: "Spécial Drum Master Academy",
    category: "Fondation Complète",
    level: "DÉBUTANT À INTERMÉDIAIRE",
    badge: "Recommandé",
    desc: "Le programme idéal pour débuter. Apprenez les bases solides et progressez jusqu'au niveau intermédiaire.",
    img: "/assets/images/josue_1.jpg",
    link: "/courses/dma-special",
    primary: true
  },
  {
    id: "gospel",
    title: "Masterclass Gospel",
    category: "Gospel Chops & Grooves",
    level: "AVANCÉ",
    desc: "Maîtrisez les rudiments avancés, les fills linéaires et la dynamique émotionnelle propre au Gospel moderne.",
    img: "/assets/images/gospel-pro-thumbnail.png",
    link: "/courses/gospel"
  },
  {
    id: "afro",
    title: "Spécialisation Afro Fusion",
    category: "Rythmes du Monde",
    level: "INTERMÉDIAIRE À AVANCÉ",
    desc: "Intégrez les polyrythmies ouest-africaines et les grooves Afrobeats dans un contexte de batterie moderne.",
    img: "/assets/images/josue_2.jpg",
    link: "/courses/afro"
  },
  {
    id: "jazz",
    title: "Jazz Moderne & Studio",
    category: "Technique Pro",
    level: "AVANCÉ",
    desc: "Développez votre vocabulaire jazz, l'indépendance de vos membres et l'art d'enregistrer en studio professionnel.",
    img: "/assets/images/josue_3.jpg",
    link: "/courses/jazz"
  },
  {
    id: "rythmes",
    title: "Étude des Rythmes",
    category: "Rythmes & Technique",
    level: "TOUS NIVEAUX",
    desc: "Explorez les fondamentaux rythmiques à travers la Salsa, le Merengue, l'Afro-Cuban, le Jazz Swing et le Funk.",
    img: "/assets/images/etudes_rythmes.jpg",
    link: "/courses/rythmes"
  },
  {
    id: "rudiments",
    title: "40 Drum Basic Rudiments",
    category: "Fondations Essentielles",
    level: "TOUS NIVEAUX",
    badge: "INDISPENSABLE",
    desc: "Maîtrisez le lexique international de la batterie. Un parcours structuré couvrant les 40 rudiments officiels (PAS).",
    img: "/assets/images/rudiments-pro-thumbnail.png",
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

/* ─── Scroll-Triggered Animated Counter Component ─── */
const AnimatedCounter: React.FC<{ target: number; duration?: number; suffix?: string }> = ({ 
  target, 
  duration = 2000, 
  suffix = "" 
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      setCount(Math.round(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Section Components ─── */

const HeroSection: React.FC = () => (
  <section className="relative min-h-[90vh] flex items-center justify-center bg-zinc-950 overflow-hidden py-24 px-4 sm:px-6 lg:px-8" aria-label="Accueil héros">
    {/* Cinematic Slow Ken Burns Background Image */}
    <motion.div 
      animate={{ 
        scale: [1.02, 1.07, 1.02],
        x: [0, 8, 0],
        y: [0, -6, 0]
      }}
      transition={{ 
        duration: 24, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className="absolute inset-0 bg-cover bg-center opacity-35 filter brightness-[0.7] contrast-[1.1]" 
      style={{ backgroundImage: `url('/assets/images/josue_5.jpg')` }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-transparent z-[1]" aria-hidden="true" />
    
    <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      {/* Left Column: Title and details */}
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

      {/* Right Column: Cinematic Video Card (Ken Burns + REC elements + Waveform) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
        className="lg:col-span-4 flex justify-center relative group"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
        
        {/* Main Cinematic Video Box */}
        <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-950 aspect-[4/5] w-full max-w-[340px] group cursor-pointer">
          {/* Background image slow Ken Burns */}
          <motion.div
            animate={{ 
              scale: [1, 1.06, 1],
              rotate: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-full h-full bg-cover bg-center filter brightness-[0.85] contrast-[1.05]"
            style={{ backgroundImage: `url('/assets/images/josue_5.jpg')` }}
          />
          
          {/* Cinema Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
          
          {/* Camera Viewfinder Bracket Overlay */}
          <div className="absolute top-4 left-4 border-l-2 border-t-2 border-white/20 w-3 h-3" />
          <div className="absolute top-4 right-4 border-r-2 border-t-2 border-white/20 w-3 h-3" />
          <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-white/20 w-3 h-3" />
          <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-white/20 w-3 h-3" />
          
          {/* Live Recording Indicator */}
          <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[9px] font-bold text-white tracking-widest uppercase">REC</span>
          </div>

          {/* Timecode */}
          <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">
            <span className="text-[9px] font-mono text-zinc-300 tracking-wider">00:12:45:09</span>
          </div>
          
          {/* Subtle Video CRT Filter Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{ 
              background: 'repeating-linear-gradient(rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 4px)' 
            }}
          />

          {/* Floating Play Button with golden ripple rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian flex items-center justify-center shadow-gold-glow cursor-pointer group/btn"
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping opacity-60 pointer-events-none" />
              <Play className="w-6 h-6 fill-obsidian ml-1 group-hover/btn:scale-105 transition-transform" />
            </motion.div>
          </div>

          {/* Text details & Waveform Visualizer */}
          <div className="absolute bottom-0 inset-x-0 p-5 space-y-3">
            <div>
              <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">Trailer Officiel</span>
              <h3 className="text-base font-bold text-white group-hover:text-gold-300 transition-colors">Découvrez la DMA</h3>
            </div>
            
            {/* Animated Audio Waveform Visualizer */}
            <div className="flex items-end gap-1 h-4 opacity-75 group-hover:opacity-100 transition-opacity">
              {Array.from({ length: 22 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [
                      "20%",
                      `${15 + Math.random() * 85}%`,
                      "20%"
                    ]
                  }}
                  transition={{ 
                    duration: 0.4 + Math.random() * 0.6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-gold-500/80 w-[2px] rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const AboutSection: React.FC = () => {
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

            {/* Stats Counters with Intersection-Observer Scroll Trigger */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">
                  <AnimatedCounter target={10} suffix="+" />
                </span>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Années d'Expérience</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">
                  <AnimatedCounter target={100} suffix="+" />
                </span>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium">Scènes &amp; Studios</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-gold-400">
                  <AnimatedCounter target={3} />
                </span>
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
                  src="/assets/images/josue_1.jpg" 
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
  const [selectedPack, setSelectedPack] = useState<'drum' | 'afro' | 'latin' | 'hand'>('drum');
  
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

  // Dynamic instrument mapping & synthesizers
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

  // Afro Percussion Synthesizers
  const playDjembeLow = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  };

  const playDjembeHigh = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    
    // Slap noise burst
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    noise.start();
    osc.stop(ctx.currentTime + 0.1);
    noise.stop(ctx.currentTime + 0.1);
  };

  const playShekere = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.07;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(6200, ctx.currentTime);
    filter.Q.setValueAtTime(4, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.07);
  };

  const playWoodblock = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, ctx.currentTime);
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  // Latin Percussion Synthesizers
  const playConga = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  const playBongo = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(310, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const playCowbell = (ctx: AudioContext, dest: AudioNode) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(540, ctx.currentTime);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.22);
    osc2.stop(ctx.currentTime + 0.22);
  };

  const playClave = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2050, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  // Hand/Modern Percussion Synthesizers
  const playClap = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let amplitude = 0;
      if (i < ctx.sampleRate * 0.01) {
        amplitude = (Math.random() * 2 - 1) * 0.3;
      } else if (i < ctx.sampleRate * 0.02) {
        amplitude = (Math.random() * 2 - 1) * 0.4;
      } else if (i < ctx.sampleRate * 0.03) {
        amplitude = (Math.random() * 2 - 1) * 0.5;
      } else {
        const t = (i - ctx.sampleRate * 0.03) / (bufferSize - ctx.sampleRate * 0.03);
        amplitude = (Math.random() * 2 - 1) * Math.exp(-t * 6);
      }
      data[i] = amplitude;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  };

  const playShaker = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = t < 0.2 ? t / 0.2 : (1 - t) / 0.8;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7200, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();
    noise.stop(ctx.currentTime + 0.08);
  };

  const playTambourine = (ctx: AudioContext, dest: AudioNode) => {
    const bufferSize = ctx.sampleRate * 0.16;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 7);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9500, ctx.currentTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    
    const skinOsc = ctx.createOscillator();
    const skinGain = ctx.createGain();
    skinOsc.type = 'triangle';
    skinOsc.frequency.setValueAtTime(175, ctx.currentTime);
    skinGain.gain.setValueAtTime(0.25, ctx.currentTime);
    skinGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    
    skinOsc.connect(skinGain);
    skinGain.connect(dest);
    
    noise.start();
    skinOsc.start();
    noise.stop(ctx.currentTime + 0.16);
    skinOsc.stop(ctx.currentTime + 0.16);
  };

  const playTriangle = (ctx: AudioContext, dest: AudioNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3100, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
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

  // Instrument Packs Definition
  const INSTRUMENT_PACKS = {
    drum: {
      name: 'Batterie Kit',
      tracks: [
        { id: 'track1', name: 'KICK', label: 'Grosse Caisse', play: playKick },
        { id: 'track2', name: 'SNARE', label: 'Caisse Claire', play: playSnare },
        { id: 'track3', name: 'HI-HAT', label: 'Charley', play: playHiHat },
        { id: 'track4', name: 'CRASH', label: 'Crash', play: playCrash },
      ]
    },
    afro: {
      name: 'Afro Percu',
      tracks: [
        { id: 'track1', name: 'DJEMBE L', label: 'Djembe Grave', play: playDjembeLow },
        { id: 'track2', name: 'DJEMBE H', label: 'Djembe Aigu', play: playDjembeHigh },
        { id: 'track3', name: 'SHEKERE', label: 'Chéquéré', play: playShekere },
        { id: 'track4', name: 'WOODBLK', label: 'Woodblock', play: playWoodblock },
      ]
    },
    latin: {
      name: 'Latin Percu',
      tracks: [
        { id: 'track1', name: 'CONGA', label: 'Conga', play: playConga },
        { id: 'track2', name: 'BONGO', label: 'Bongo', play: playBongo },
        { id: 'track3', name: 'COWBELL', label: 'Cloche', play: playCowbell },
        { id: 'track4', name: 'CLAVE', label: 'Clave', play: playClave },
      ]
    },
    hand: {
      name: 'Hand Percu',
      tracks: [
        { id: 'track1', name: 'CLAP', label: 'Hand Clap', play: playClap },
        { id: 'track2', name: 'SHAKER', label: 'Shaker', play: playShaker },
        { id: 'track3', name: 'TAMBOUR', label: 'Tambourin', play: playTambourine },
        { id: 'track4', name: 'TRIANGLE', label: 'Triangle', play: playTriangle },
      ]
    }
  };

  // Step sequencer grids (8 steps for 4 generic tracks)
  const [sequence, setSequence] = useState<Record<string, boolean[]>>({
    track1: [true, false, false, false, true, false, false, false],
    track2: [false, false, true, false, false, false, true, false],
    track3: [true, true, true, true, true, true, true, true],
    track4: [false, false, false, false, false, false, false, false],
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

  // Drum Pads configurations (always mapped to drum kit for playing accompaniment)
  const padsList = [
    { id: 'crash', name: 'CRASH', key: 'G', color: 'from-purple-600 to-indigo-600', glowColor: 'rgba(168, 85, 247, 0.4)', bgGlow: 'bg-purple-500/20', soundName: 'Crash Cymbal' },
    { id: 'hihat', name: 'HI-HAT', key: 'D', color: 'from-gold-600 to-amber-500', glowColor: 'rgba(212, 175, 55, 0.4)', bgGlow: 'bg-gold-500/20', soundName: 'Charley' },
    { id: 'snare', name: 'SNARE', key: 'S', color: 'from-blue-600 to-cyan-500', glowColor: 'rgba(59, 130, 246, 0.4)', bgGlow: 'bg-blue-500/20', soundName: 'Caisse Claire' },
    { id: 'kick', name: 'KICK', key: 'F', color: 'from-rose-600 to-orange-500', glowColor: 'rgba(244, 63, 94, 0.4)', bgGlow: 'bg-rose-500/20', soundName: 'Grosse Caisse' },
  ];

  // Helper trigger for pads (accompanied playing)
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

    // Rhythm game scoring mechanism (only for manual taps when metronome/sequencer is playing)
    if (isManual && (isPlayingMetronome || isPlayingSequencer)) {
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

  // Physical keyboard listeners (Drum Pad Accompaniment)
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
  }, [isPlayingMetronome, isPlayingSequencer, bpm]);

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

        if (audioCtxRef.current && mainVolumeGainRef.current) {
          const ctx = audioCtxRef.current;
          const dest = mainVolumeGainRef.current;

          // Play sequencer tracks according to active pack
          if (isPlayingSequencer) {
            const pack = INSTRUMENT_PACKS[selectedPack];
            if (sequence.track1[next]) pack.tracks[0].play(ctx, dest);
            if (sequence.track2[next]) pack.tracks[1].play(ctx, dest);
            if (sequence.track3[next]) pack.tracks[2].play(ctx, dest);
            if (sequence.track4[next]) pack.tracks[3].play(ctx, dest);
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

    tick();
    const timer = setInterval(tick, stepDurationMs);
    return () => clearInterval(timer);
  }, [isPlayingSequencer, isPlayingMetronome, bpm, sequence, selectedPack]);

  // Load beat presets with corresponding Pack & Sequence Steps
  const loadPreset = (presetName: string) => {
    initAudio();
    if (presetName === 'gospel') {
      setSelectedPack('drum');
      setSequence({
        track1: [true, false, false, true, false, false, true, false],
        track2: [false, false, true, false, false, true, false, true],
        track3: [true, true, true, true, true, true, true, true],
        track4: [true, false, false, false, false, false, false, false],
      });
      setBpm(130);
    } else if (presetName === 'afro') {
      setSelectedPack('afro');
      setSequence({
        track1: [true, false, false, false, true, false, false, false], // Djembe L
        track2: [false, false, true, false, false, false, true, false], // Djembe H
        track3: [true, false, true, false, true, false, true, false], // Shekere
        track4: [true, false, false, false, false, true, false, false], // Woodblk
      });
      setBpm(110);
    } else if (presetName === 'latin') {
      setSelectedPack('latin');
      setSequence({
        track1: [true, false, false, false, true, false, false, false], // Conga
        track2: [false, false, true, false, false, false, true, false], // Bongo
        track3: [true, false, true, false, true, false, true, false], // Cowbell
        track4: [true, false, false, true, false, false, true, false], // Clave
      });
      setBpm(124);
    } else if (presetName === 'hand') {
      setSelectedPack('hand');
      setSequence({
        track1: [false, false, true, false, false, false, true, false], // Clap
        track2: [true, true, true, true, true, true, true, true], // Shaker
        track3: [true, false, false, false, true, false, false, false], // Tambourine
        track4: [false, false, false, false, false, false, false, true], // Triangle
      });
      setBpm(115);
    }
  };

  const clearSequence = () => {
    setSequence({
      track1: Array(8).fill(false),
      track2: Array(8).fill(false),
      track3: Array(8).fill(false),
      track4: Array(8).fill(false),
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-zinc-950/80 border-t border-b border-white/5 relative overflow-hidden" aria-label="DMA Interactive Studio">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-64 sm:w-96 h-64 sm:h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
            <Sparkles className="w-3.5 h-3.5" /> DMA. Studio Virtuel
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-sans text-white">
            DMA. Interactive <span className="text-gold-400">Studio</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
            Composez vos loops de percussion comme backingtracks personnalisés et accompagnez-les à la batterie sur les pads ou avec les touches de votre clavier !
          </p>
        </motion.div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: Dynamic Glowing Drum Pads */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6 border-white/5 shadow-2xl relative">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold-400 animate-pulse" /> 
                  <span className="hidden sm:inline">CLAVIER ACTIF : S - D - F - G</span>
                  <span className="sm:hidden">BATTERIE D'ACCOMPAGNEMENT</span>
                </span>
                <button 
                  onClick={() => initAudio()} 
                  className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 text-zinc-300 px-2.5 py-1 rounded-md border border-white/10 transition-colors"
                >
                  Init Audio
                </button>
              </div>

              {/* The Pads Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {padsList.map((pad) => (
                  <motion.button
                    key={pad.id}
                    onClick={() => triggerInstrument(pad.id, true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      boxShadow: activePads[pad.id]
                        ? `0 0 25px ${pad.glowColor}`
                        : '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                    className={`relative aspect-square sm:aspect-[1.3/1] rounded-xl sm:rounded-2xl border transition-all duration-75 overflow-hidden flex flex-col items-center justify-between p-3 sm:p-5 ${
                      activePads[pad.id]
                        ? `${pad.bgGlow} border-white/30 scale-[0.98]`
                        : 'bg-obsidian-card/40 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {activePads[pad.id] && (
                      <motion.span
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/50 pointer-events-none"
                      />
                    )}

                    {/* Glowing LED Header */}
                    <div className="w-full flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${activePads[pad.id] ? 'bg-white animate-ping' : 'bg-zinc-700'}`} />
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest hidden xs:inline">{pad.soundName}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-950/80 border border-white/10 text-gold-400/90 shadow-md hidden sm:inline-block">
                        TOUCHE {pad.key}
                      </span>
                    </div>

                    {/* Pad Center Title */}
                    <span className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${pad.color} bg-clip-text text-transparent group-hover:brightness-110`}>
                      {pad.name}
                    </span>

                    {/* Visual Wave Preview */}
                    <div className="w-full h-1.5 flex gap-0.5 sm:gap-1 items-end justify-center">
                      {[...Array(5)].map((_, idx) => (
                        <motion.span
                          key={idx}
                          animate={{
                            height: activePads[pad.id] ? [4, Math.random() * 20 + 4, 4] : 4
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
            <div className="glass-card p-3 sm:p-4 border-white/5 flex gap-4 items-center justify-between min-h-[48px]">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-[10px] sm:text-xs text-zinc-400 leading-tight">
                  Jouez par-dessus le boucleur en rythme pour accumuler les points !
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
                    className={`text-[10px] sm:text-xs font-extrabold tracking-wider px-2.5 py-0.5 rounded border shadow-lg shrink-0 ${
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
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            
            {/* 1. Score & Metronome Controls */}
            <div className="glass-card p-4 sm:p-6 border-white/5 space-y-4 sm:space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">GROOVE MASTER SCORE</h3>
                <span className="text-[10px] sm:text-xs text-gold-400 font-bold tracking-widest uppercase">{rank}</span>
              </div>

              {/* Rhythm Game Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="bg-zinc-950/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 block mb-0.5 sm:mb-1 uppercase tracking-wider">Score</span>
                  <span className="text-sm sm:text-lg font-bold text-white">{score}</span>
                </div>
                <div className="bg-zinc-950/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 block mb-0.5 sm:mb-1 uppercase tracking-wider">Combo</span>
                  <span className="text-sm sm:text-lg font-bold text-gold-400 animate-pulse">{combo}</span>
                </div>
                <div className="bg-zinc-950/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 block mb-0.5 sm:mb-1 uppercase tracking-wider">Max</span>
                  <span className="text-sm sm:text-lg font-bold text-purple-400">{maxCombo}</span>
                </div>
              </div>

              {/* Metronome & BPM Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">Tempo Backingtrack</span>
                  <span className="text-xs font-extrabold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">{bpm} BPM</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="flex-1 accent-gold-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    {/* Visual Pulse LED synced to beats */}
                    <div 
                      className={`w-3 h-3 rounded-full border transition-all duration-75 ${
                        (isPlayingMetronome || isPlayingSequencer) && currentStep % 2 === 0
                          ? currentStep === 0
                            ? 'bg-purple-500 shadow-[0_0_10px_#a855f7] border-purple-400'
                            : 'bg-gold-500 shadow-[0_0_10px_#d4af37] border-gold-400'
                          : 'bg-zinc-800 border-white/5'
                      }`}
                    />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">LED</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        initAudio();
                        setIsPlayingMetronome(prev => !prev);
                      }}
                      className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                        isPlayingMetronome
                          ? 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isPlayingMetronome ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      Clic
                    </button>
                    <button
                      onClick={() => {
                        setScore(0);
                        setCombo(0);
                        setMaxCombo(0);
                      }}
                      className="text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 text-zinc-400 px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Step Sequencer / Boîte à Rythmes */}
            <div className="glass-card p-4 sm:p-6 border-white/5 space-y-4 sm:space-y-6 shadow-2xl">
              
              {/* Selector for Percussion Packs */}
              <div className="border-b border-white/5 pb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-2">
                  Sélectionner un Pack de Percussions :
                </span>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
                  {Object.entries(INSTRUMENT_PACKS).map(([key, pack]) => (
                    <button
                      key={key}
                      onClick={() => {
                        initAudio();
                        setSelectedPack(key as any);
                      }}
                      className={`text-[9px] sm:text-[10px] font-bold py-1.5 px-2 rounded-lg border text-center transition-all truncate ${
                        selectedPack === key
                          ? 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {pack.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loop Presets */}
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">Presets de Loops</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button 
                    onClick={() => loadPreset('gospel')} 
                    className="text-[9px] bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded border border-gold-500/20 font-bold"
                  >
                    Gospel
                  </button>
                  <button 
                    onClick={() => loadPreset('afro')} 
                    className="text-[9px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold"
                  >
                    Afro
                  </button>
                  <button 
                    onClick={() => loadPreset('latin')} 
                    className="text-[9px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold"
                  >
                    Latin
                  </button>
                  <button 
                    onClick={() => loadPreset('hand')} 
                    className="text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold"
                  >
                    Hand
                  </button>
                  <button 
                    onClick={clearSequence} 
                    className="text-[9px] bg-white/5 hover:bg-white/10 text-zinc-400 px-2 py-0.5 rounded border border-white/5"
                  >
                    Vider
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable container for mobile-strict responsiveness */}
              <div className="overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
                <div className="min-w-[460px] sm:min-w-0 space-y-3">
                  
                  {/* Visual Step indicators at the top */}
                  <div className="grid grid-cols-9 gap-1 items-center">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider text-right pr-2">Temps</span>
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

                  {/* Instrument Rows based on active pack */}
                  {INSTRUMENT_PACKS[selectedPack].tracks.map((track, trackIdx) => {
                    const trackKey = `track${trackIdx + 1}`;
                    return (
                      <div key={track.id} className="grid grid-cols-9 gap-1 items-center">
                        <span 
                          title={track.label} 
                          className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider text-right pr-2 truncate cursor-help"
                        >
                          {track.name}
                        </span>
                        <div className="col-span-8 grid grid-cols-8 gap-1.5">
                          {sequence[trackKey].map((isActive, stepIdx) => (
                            <button
                              key={stepIdx}
                              onClick={() => {
                                initAudio();
                                const newSeq = { ...sequence };
                                newSeq[trackKey][stepIdx] = !isActive;
                                setSequence(newSeq);
                              }}
                              className={`aspect-square w-full rounded-md border flex items-center justify-center transition-all ${
                                isActive
                                  ? 'bg-gradient-to-br from-gold-600 to-gold-400 text-obsidian border-white/20 shadow-md scale-95 shadow-gold-glow/20'
                                  : currentStep === stepIdx
                                  ? 'bg-zinc-800 border-zinc-700'
                                  : 'bg-zinc-950/80 border-white/5 hover:border-white/10'
                              }`}
                              aria-label={`Étape ${stepIdx + 1} pour ${track.name}`}
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
              </div>

              {/* Volume & Sequencer Switch */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Vol.</span>
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
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg border transition-all ${
                    isPlayingSequencer
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                      : 'bg-gold-500 text-obsidian border-gold-400 shadow-gold-glow hover:bg-gold-400'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingSequencer ? 'animate-spin-slow' : ''}`} />
                  {isPlayingSequencer ? 'Pause Boucle' : 'Jouer la Boucle'}
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
        <CollaborationsGallery />
        <InteractiveStudioSection />
        <CoursesSection isLoggedIn={isLoggedIn} />
        <TestimonialsSection />
        <CTASection isLoggedIn={isLoggedIn} />
      </div>
    </PageTransition>
  );
};
