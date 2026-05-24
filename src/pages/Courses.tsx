import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Compass, BookOpen, Clock, Trophy, Flame, Target, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/ui/PageTransition';
import { 
  staggerContainer, springTransition, snappySpring, scaleFade 
} from '../lib/motion';
import { COURSES_DATABASE, Lesson } from '../data/courses';

interface Course {
  id: string;
  title: string;
  category: 'gospel' | 'afro' | 'jazz' | 'technique';
  categoryLabel: string;
  level: string;
  badge?: string;
  desc: string;
  img: string;
  features: string[];
  recommended?: boolean;
}

const courses: Course[] = [
  {
    id: "dma-special",
    title: "Spécial Drum Master Academy",
    category: "technique",
    categoryLabel: "Fondation Complète",
    level: "DÉBUTANT À INTERMÉDIAIRE",
    badge: "Recommandé",
    desc: "Le programme idéal pour débuter. Apprenez les bases solides et progressez jusqu'au niveau intermédiaire avec la méthode exclusive de Josué ADETI.",
    img: "/assets/images/josue_1.jpg",
    features: ["Posture & Tenue de baguettes", "Premiers Grooves & Coordination", "Indépendance & Lecture"],
    recommended: true
  },
  {
    id: "gospel",
    title: "Masterclass Gospel",
    category: "gospel",
    categoryLabel: "Gospel Chops & Grooves",
    level: "AVANCÉ",
    badge: "Masterclass",
    desc: "Maîtrisez les rudiments avancés, les fills linéaires et la dynamique émotionnelle propre à la musique worship moderne.",
    img: "/assets/images/gospel-pro-thumbnail.png",
    features: ["Fills linéaires & complexes", "Grooves Worship modernes", "Indépendance avancée"]
  },
  {
    id: "afro",
    title: "Spécialisation Afro Fusion",
    category: "afro",
    categoryLabel: "Rythmes du Monde",
    level: "INTERMÉDIAIRE À AVANCÉ",
    desc: "Intégrez les polyrythmies ouest-africaines et les grooves Afrobeats dans un contexte de batterie moderne.",
    img: "/assets/images/josue_2.jpg",
    features: ["Polyrythmies 6/8 & 12/8", "Grooves Afrobeats modernes", "Techniques de caisse claire"]
  },
  {
    id: "jazz",
    title: "Jazz Moderne & Studio",
    category: "jazz",
    categoryLabel: "Technique Pro",
    level: "AVANCÉ",
    desc: "Développez votre vocabulaire jazz, l'indépendance de vos membres et l'art d'enregistrer en studio professionnel.",
    img: "/assets/images/josue_3.jpg",
    features: ["Swing & Bebop vocabulaire", "Recording en studio pro", "Improvisation & Solo"]
  },
  {
    id: "rythmes",
    title: "Étude des Rythmes",
    category: "technique",
    categoryLabel: "Rythmes & Technique",
    level: "TOUS NIVEAUX",
    desc: "Explorez les fondamentaux rythmiques à travers la Salsa, le Merengue, l'Afro-Cuban, le Jazz Swing et le Funk.",
    img: "/assets/images/etudes_rythmes.jpg",
    features: ["Latin salsa & merengue", "Afro-Cuban clave", "Subdivisions & Tempo"]
  },
  {
    id: "rudiments",
    title: "40 Drum Basic Rudiments",
    category: "technique",
    categoryLabel: "Fondations Essentielles",
    level: "TOUS NIVEAUX",
    badge: "INDISPENSABLE",
    desc: "Maîtrisez le lexique international de la batterie. Un parcours structuré couvrant les 40 rudiments officiels (PAS).",
    img: "/assets/images/rudiments-pro-thumbnail.png",
    features: ["Roulés, Frisés, Paradiddles", "Technique de mains (Moeller)", "Contrôle & Vitesse"],
    recommended: true
  }
];

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'gospel', label: 'Gospel' },
  { id: 'afro', label: 'Afro Fusion' },
  { id: 'jazz', label: 'Jazz & Studio' },
  { id: 'technique', label: 'Technique' }
] as const;

export const Courses: React.FC = () => {
  const { user, enrollCourse, isEnrolled } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'gospel' | 'afro' | 'jazz' | 'technique'>('all');

  const filteredCourses = activeFilter === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeFilter);

  const handleCourseAccess = async (courseId: string) => {
    if (!user) {
      showToast("Connectez-vous pour commencer votre apprentissage.", "info");
      navigate('/login');
      return;
    }

    if (isEnrolled(courseId)) {
      navigate(`/courses/${courseId}`);
    } else {
      showToast("Inscription au cursus en cours...", "info");
      const res = await enrollCourse(courseId);
      if (res.success) {
        showToast("Inscription réussie ! Bon travail !", "success");
        navigate(`/courses/${courseId}`);
      } else {
        showToast(res.message || "Erreur d'inscription.", "error");
      }
    }
  };

  // Dynamic statistics calculation
  const enrolledCoursesList = courses.filter(c => isEnrolled(c.id));
  const enrolledCount = enrolledCoursesList.length;

  const completedLessonsCount = courses.reduce((acc, c) => {
    return acc + (user?.courseProgress?.[c.id]?.completedLessons?.length || 0);
  }, 0);

  const totalLessonsCount = courses.reduce((acc, c) => {
    return acc + (COURSES_DATABASE[c.id]?.lessons?.length || 0);
  }, 0);

  const overallProgressPercent = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  const totalPracticeTimeMinutes = courses.reduce((acc, c) => {
    const completed = user?.courseProgress?.[c.id]?.completedLessons || [];
    const courseDb = COURSES_DATABASE[c.id];
    if (!courseDb) return acc;
    const completedDurations = courseDb.lessons
      .filter((l: Lesson) => completed.includes(l.id))
      .reduce((sum: number, l: Lesson) => sum + (parseInt(l.duration) || 0), 0);
    return acc + completedDurations;
  }, 0);

  const practiceHours = Math.floor(totalPracticeTimeMinutes / 60);
  const practiceMinutes = totalPracticeTimeMinutes % 60;

  // Level classification based on dynamic progress
  let userRank = "Batteur Cadet";
  let rankColor = "text-zinc-400 bg-zinc-950";
  let rankIcon = <Star className="w-3.5 h-3.5 text-zinc-400" />;

  if (overallProgressPercent > 0 && overallProgressPercent <= 30) {
    userRank = "Rythmiste Initié";
    rankColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    rankIcon = <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />;
  } else if (overallProgressPercent > 30 && overallProgressPercent <= 70) {
    userRank = "Groover Pro";
    rankColor = "text-gold-400 bg-gold-400/10 border-gold-400/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]";
    rankIcon = <Flame className="w-3.5 h-3.5 text-gold-400 animate-pulse" />;
  } else if (overallProgressPercent > 70) {
    userRank = "Drum Master Elite";
    rankColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
    rankIcon = <Trophy className="w-3.5 h-3.5 text-emerald-400" />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24 bg-obsidian relative">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gold-600/3 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden py-16 px-4" aria-label="Catalogue des formations">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25" 
            style={{ backgroundImage: `url('/assets/images/josue_5.jpg')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent z-[1]" aria-hidden="true" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="max-w-4xl mx-auto w-full relative z-10 text-center space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <Compass className="w-3.5 h-3.5" /> Espace Académique
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              VOTRE CHEMIN VERS LA <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-400 font-black">MAÎTRISE</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Suivez nos parcours structurés étape par étape, pratiquez avec nos outils de studio intégrés et devenez le batteur que vous avez toujours rêvé d'être.
            </p>
          </motion.div>
        </section>

        {/* User Stats Board Section (Only visible for signed-in students) */}
        {user && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20" aria-label="Tableau de bord de progression">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="glass-card border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              {/* Header inside the panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                    <span>Tableau de Bord Étudiant</span>
                  </h2>
                  <p className="text-zinc-500 text-xs font-medium">Suivi de vos objectifs rythmiques en temps réel.</p>
                </div>
                
                {/* User Rank Tag */}
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider ${rankColor}`}>
                  {rankIcon}
                  <span>{userRank}</span>
                </div>
              </div>

              {/* Progress Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                
                {/* Stat 1: Cursus */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-gold-500/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Cursus Inscrits</span>
                    <span className="text-2xl font-black text-white font-mono">{enrolledCount}</span>
                  </div>
                </div>

                {/* Stat 2: Completed Lessons */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-gold-500/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Leçons Validées</span>
                    <span className="text-2xl font-black text-white font-mono">{completedLessonsCount} <span className="text-xs text-zinc-500 font-bold">/ {totalLessonsCount}</span></span>
                  </div>
                </div>

                {/* Stat 3: Practice hours */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-gold-500/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Temps de Studio</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {practiceHours > 0 ? `${practiceHours}h ` : ''}{practiceMinutes}m
                    </span>
                  </div>
                </div>

                {/* Stat 4: Global progress bar */}
                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-2 hover:border-gold-500/20 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-500 flex items-center gap-1"><Target className="w-3.5 h-3.5 text-gold-400" /> Completion</span>
                    <span className="text-gold-400 font-mono">{overallProgressPercent}%</span>
                  </div>
                  
                  <div className="h-2 bg-zinc-950 rounded-full border border-white/5 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgressPercent}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          </section>
        )}

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16" aria-label="Filtres et catalogue">
          
          {/* Filters with modern animated sliding indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12" role="tablist" aria-label="Filtrer par catégorie">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                role="tab"
                aria-selected={activeFilter === cat.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={snappySpring}
                onClick={() => setActiveFilter(cat.id)}
                className={`relative px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider border transition-colors ${
                  activeFilter === cat.id
                    ? 'text-obsidian border-transparent shadow-[0_4px_20px_rgba(212,175,55,0.25)]'
                    : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:border-white/15 hover:text-white backdrop-blur-sm'
                }`}
              >
                {activeFilter === cat.id && (
                  <motion.div
                    layoutId="course-filter-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                    transition={springTransition}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {cat.id === 'gospel' && <Flame className="w-3 h-3 shrink-0" />}
                  {cat.id === 'afro' && <Compass className="w-3 h-3 shrink-0" />}
                  {cat.id === 'jazz' && <Trophy className="w-3 h-3 shrink-0" />}
                  {cat.id === 'technique' && <Target className="w-3 h-3 shrink-0" />}
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Course Card Grid */}
          <motion.div 
            layout
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => {
                const enrolled = isEnrolled(course.id);
                const courseDbData = COURSES_DATABASE[course.id];
                const totalLessons = courseDbData?.lessons?.length || 0;
                
                // Calculate total duration of lessons
                const totalDuration = courseDbData?.lessons?.reduce((acc: number, curr: Lesson) => {
                  const min = parseInt(curr.duration) || 0;
                  return acc + min;
                }, 0) || 0;

                const completedLessons = user?.courseProgress?.[course.id]?.completedLessons || [];
                const completedLessonsCount = completedLessons.length;
                const progressPercent = totalLessons > 0 
                  ? Math.min(Math.round((completedLessonsCount / totalLessons) * 100), 100) 
                  : 0;

                // Determine dynamic status badges
                let progressBadge = null;
                if (enrolled) {
                  if (completedLessonsCount === 0) {
                    progressBadge = { label: "Inscrit", style: "bg-blue-500/10 text-blue-400 border border-blue-500/20" };
                  } else if (completedLessonsCount < totalLessons) {
                    progressBadge = { label: "En cours", style: "bg-gold-500/10 text-gold-400 border border-gold-500/20" };
                  } else {
                    progressBadge = { label: "Terminé ✓", style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
                  }
                }

                return (
                  <motion.div
                    key={course.id}
                    layout
                    variants={scaleFade}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover={{ y: -10 }}
                    transition={springTransition}
                    className={`glass-card group flex flex-col h-full border transition-all duration-300 relative overflow-hidden rounded-2xl ${
                      enrolled && completedLessonsCount === totalLessons
                        ? "border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_15px_30px_rgba(16,185,129,0.05)]"
                        : course.recommended 
                          ? "border-gold-500/30 hover:border-gold-500/50 shadow-gold-glow-subtle bg-gradient-to-b from-obsidian via-obsidian to-gold-500/2" 
                          : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    {/* Hover internal decorative lighting glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/0 via-gold-500/0 to-gold-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Thumbnail banner */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={course.img}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" aria-hidden="true" />
                      
                      {/* Top left recommendation badge */}
                      {course.badge && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-black text-[9px] px-3 py-1 rounded-md shadow-lg uppercase tracking-wider">
                          {course.badge}
                        </span>
                      )}

                      {/* Top right progress status */}
                      {progressBadge && (
                        <span className={`absolute top-4 right-4 font-extrabold text-[9px] px-3 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-md border ${progressBadge.style}`}>
                          {progressBadge.label}
                        </span>
                      )}
                      
                      {/* Level Tag */}
                      <span className="absolute bottom-4 right-4 text-[9px] bg-black/80 backdrop-blur-md text-zinc-300 font-extrabold px-2.5 py-1 rounded border border-white/5 uppercase tracking-wider">
                        {course.level}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 flex flex-col flex-1 gap-4 relative">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-widest">
                            {course.categoryLabel}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {totalDuration} MIN
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-gold-400 transition-colors leading-snug tracking-tight">
                          {course.title}
                        </h3>
                      </div>
                      
                      <p className="text-zinc-400 text-xs leading-relaxed flex-1 font-medium">
                        {course.desc}
                      </p>

                      {/* Progress bar inside cards (active only) */}
                      {enrolled && (
                        <div className="space-y-2 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 backdrop-blur-sm shadow-inner">
                          <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wider uppercase">
                            <span className="text-zinc-500">Progression</span>
                            <span className="text-gold-400 font-mono">{progressPercent}%</span>
                          </div>
                          
                          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5 relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ type: "spring", stiffness: 100, damping: 15 }}
                              className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-[0_0_6px_rgba(212,175,55,0.25)]"
                            />
                          </div>
                          
                          <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase">
                            <span>{totalLessons} LEÇONS</span>
                            <span>{completedLessonsCount} COMPLÉTÉES</span>
                          </div>
                        </div>
                      )}

                      {/* Key features checklist */}
                      <ul className="space-y-2 py-3 border-y border-white/5">
                        {course.features.map((feat, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-center gap-2 font-medium">
                            <CheckCircle className="w-4 h-4 text-gold-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* CTA Action button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={snappySpring}
                        onClick={() => handleCourseAccess(course.id)}
                        className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                          enrolled
                            ? completedLessonsCount === totalLessons
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-zinc-800 border-white/5 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                            : course.recommended
                              ? "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow border-transparent"
                              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Play className={`w-3.5 h-3.5 fill-current ${enrolled && completedLessonsCount === totalLessons ? 'hidden' : ''}`} />
                        <span>
                          {enrolled 
                            ? completedLessonsCount === totalLessons
                              ? "Cursus Complété ✓" 
                              : "Reprendre la formation" 
                            : "Commencer la formation"}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          <AnimatePresence>
            {filteredCourses.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springTransition}
                className="text-center py-24 bg-zinc-900/10 rounded-3xl border border-white/5"
              >
                <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Aucun cursus trouvé pour cette catégorie.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </PageTransition>
  );
};
