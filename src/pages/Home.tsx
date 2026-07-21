import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Award, Star, Play, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/ui/PageTransition';
import { 
  staggerContainer, staggerChild, fadeInUp, fadeInLeft, fadeInRight, 
  gentleSpring, snappySpring 
} from '../lib/motion';
import { CollaborationsGallery } from '../components/CollaborationsGallery';
import { DMAProToolsShowcase } from '../components/studio/DMAProToolsShowcase';
import { YoutubeChannelMiniature } from '../components/YoutubeChannelMiniature';

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

interface HeroSectionProps {
  onPlayClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPlayClick }) => (
  <section className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center justify-center bg-zinc-950 overflow-hidden py-14 sm:py-16 px-4 sm:px-6 lg:px-8" aria-label="Accueil héros">
    {/* Cinematic Video Background */}
    <div className="absolute inset-0 overflow-hidden opacity-30 filter brightness-[0.6] contrast-[1.15] pointer-events-none" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        poster="/assets/images/josue_5.jpg"
      >
        <source src="/assets/videos/video_festival_josue_adeti.mp4" type="video/mp4" />
      </video>
    </div>
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
            <button onClick={onPlayClick} className="btn-gold-outline flex items-center gap-2 text-sm md:text-base">
              <Play className="w-4 h-4 fill-current" /> Voir le Live
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Column: Cinematic Video Card (Live Video Preview + REC elements + Waveform) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
        className="lg:col-span-4 flex justify-center relative group"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
        
        {/* Main Cinematic Video Box */}
        <div 
          onClick={onPlayClick}
          className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-950 aspect-[4/5] w-full max-w-[340px] group cursor-pointer"
        >
          {/* Live Video Thumbnail */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 ease-out"
            poster="/assets/images/josue_5.jpg"
          >
            <source src="/assets/videos/video_festival_josue_adeti.mp4" type="video/mp4" />
          </video>
          
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
    <section className="py-14 sm:py-16 bg-obsidian relative" aria-label="À propos de l'instructeur">
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

            <div className="pt-6">
              <Link to="/gallery" className="btn-gold-outline inline-flex items-center gap-2 text-sm">
                Découvrir la Galerie photos <ArrowRight className="w-4 h-4" />
              </Link>
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
const CoursesSection: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => (
  <section className="py-14 sm:py-16 bg-zinc-950/50 relative" aria-label="Nos formations">
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
    <section className="py-14 sm:py-16 bg-obsidian border-y border-white/5 overflow-hidden" aria-label="Témoignages">
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
  <section className="py-14 sm:py-16 bg-gradient-to-b from-obsidian to-zinc-950 relative border-b border-white/5" aria-label="Appel à l'action">
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

/* ─── Live Festival Showcase Section ─── */
const LiveFestivalShowcase: React.FC<{ onPlayClick: () => void }> = ({ onPlayClick }) => (
  <section className="py-16 bg-zinc-950/80 border-t border-b border-white/5 relative overflow-hidden">
    {/* Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" aria-hidden="true" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="glass-card border border-gold-500/20 bg-zinc-900/35 p-8 sm:p-12 rounded-3xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 shadow-gold-glow-subtle">
        
        {/* Left Side: Information */}
        <div className="flex-1 space-y-6 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
            Performance de Scène
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight font-sans">
            Josué ADETI en Concert :<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-400 font-bold drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">Festival Live 2026</span>
          </h2>
          <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
            Découvrez la virtuosité technique et l'énergie scénique de Josué ADETI. Ce montage exclusif rassemble ses plus grands moments de scène, alliant fills linéaires gospel explosifs, grooves syncopés afro-fusion et technique de batterie moderne internationale.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-500">
            <div className="bg-zinc-950/50 px-3.5 py-1.5 rounded-lg border border-white/5">
              ⏱️ Durée : <span className="text-gold-400 font-bold">35s</span>
            </div>
            <div className="bg-zinc-950/50 px-3.5 py-1.5 rounded-lg border border-white/5">
              🎵 Son : <span className="text-gold-400 font-bold">Stéréo Mixé</span>
            </div>
            <div className="bg-zinc-950/50 px-3.5 py-1.5 rounded-lg border border-white/5">
              📺 Vidéo : <span className="text-gold-400 font-bold">HD 720p</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clickable Interactive Player Card */}
        <div className="w-full lg:w-[440px] shrink-0">
          <div 
            onClick={onPlayClick}
            className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-zinc-950 cursor-pointer group"
          >
            {/* Live background looping preview (sourdine) */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-700 ease-out"
              poster="/assets/images/josue_2.jpg"
            >
              <source src="/assets/videos/video_festival_josue_adeti.mp4" type="video/mp4" />
            </video>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian flex items-center justify-center shadow-gold-glow relative"
              >
                <div className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping opacity-60 pointer-events-none" />
                <Play className="w-6 h-6 fill-obsidian ml-1" />
              </motion.div>
            </div>
            
            <span className="absolute bottom-4 right-4 text-[9px] bg-black/75 backdrop-blur-md text-gold-400 font-bold px-2.5 py-1 rounded-md border border-gold-400/20 uppercase tracking-widest">
              Lancer le show
            </span>
          </div>
        </div>
        
      </div>
    </div>
  </section>
);

/* ─── Main Home Page ─── */
export const Home: React.FC = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen text-zinc-100 overflow-x-hidden font-sans">
        <HeroSection onPlayClick={() => setIsLightboxOpen(true)} />
        <LiveFestivalShowcase onPlayClick={() => setIsLightboxOpen(true)} />
        <AboutSection />
        <CollaborationsGallery />
        <YoutubeChannelMiniature />
        <DMAProToolsShowcase />
        <CoursesSection isLoggedIn={isLoggedIn} />
        <TestimonialsSection />
        <CTASection isLoggedIn={isLoggedIn} />

        {/* Video Lightbox Modal */}
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />

              {/* Video Modal Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
                  <div>
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">Performance Live de Scène</span>
                    <h3 className="text-base font-bold text-white">Josué ADETI — Festival Showcase</h3>
                  </div>
                  <button 
                    onClick={() => setIsLightboxOpen(false)}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video w-full bg-black">
                  <video
                    src="/assets/videos/video_festival_josue_adeti.mp4"
                    autoPlay
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
