import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/ui/PageTransition';
import { 
  staggerContainer, springTransition, snappySpring, scaleFade 
} from '../lib/motion';

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
    img: "assets/images/josue_1.jpg",
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
    img: "assets/images/gospel-pro-thumbnail.png",
    features: ["Fills linéaires & complexes", "Grooves Worship modernes", "Indépendance avancée"]
  },
  {
    id: "afro",
    title: "Spécialisation Afro Fusion",
    category: "afro",
    categoryLabel: "Rythmes du Monde",
    level: "INTERMÉDIAIRE À AVANCÉ",
    desc: "Intégrez les polyrythmies ouest-africaines et les grooves Afrobeats dans un contexte de batterie moderne.",
    img: "assets/images/josue_2.jpg",
    features: ["Polyrythmies 6/8 & 12/8", "Grooves Afrobeats modernes", "Techniques de caisse claire"]
  },
  {
    id: "jazz",
    title: "Jazz Moderne & Studio",
    category: "jazz",
    categoryLabel: "Technique Pro",
    level: "AVANCÉ",
    desc: "Développez votre vocabulaire jazz, l'indépendance de vos membres et l'art d'enregistrer en studio professionnel.",
    img: "assets/images/josue_3.jpg",
    features: ["Swing & Bebop vocabulaire", "Recording en studio pro", "Improvisation & Solo"]
  },
  {
    id: "rythmes",
    title: "Étude des Rythmes",
    category: "technique",
    categoryLabel: "Rythmes & Technique",
    level: "TOUS NIVEAUX",
    desc: "Explorez les fondamentaux rythmiques à travers la Salsa, le Merengue, l'Afro-Cuban, le Jazz Swing et le Funk.",
    img: "assets/images/etudes_rythmes.jpg",
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
    img: "assets/images/rudiments-pro-thumbnail.png",
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

  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24">
        {/* Hero Section */}
        <section className="relative min-h-[45vh] flex items-center justify-center bg-zinc-950 overflow-hidden py-16 px-4" aria-label="Catalogue des formations">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30" 
            style={{ backgroundImage: `url('assets/images/josue_5.jpg')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent z-[1]" aria-hidden="true" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="max-w-4xl mx-auto w-full relative z-10 text-center space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <Compass className="w-3.5 h-3.5" /> Programmes d'Excellence
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans leading-tight">
              Élevez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-400 font-bold">Jeu</span>.
            </h1>
            <p className="text-zinc-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              Des cursus structurés de classe mondiale, conçus par un professionnel pour vous guider pas à pas vers la maîtrise rythmique absolue.
            </p>
          </motion.div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" aria-label="Filtres et liste des cours">
          {/* Filters with animated indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16" role="tablist" aria-label="Filtrer par catégorie">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                role="tab"
                aria-selected={activeFilter === cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => setActiveFilter(cat.id)}
                className={`relative px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${
                  activeFilter === cat.id
                    ? 'text-obsidian border-transparent'
                    : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {activeFilter === cat.id && (
                  <motion.div
                    layoutId="course-filter-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-gold-glow"
                    transition={springTransition}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Cursus Grid */}
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
                return (
                  <motion.div
                    key={course.id}
                    layout
                    variants={scaleFade}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`glass-card group flex flex-col h-full border ${
                      course.recommended 
                        ? "border-gold-500/30 hover:border-gold-500/50 shadow-gold-glow-subtle" 
                        : "border-white/5 hover:border-white/20"
                    } overflow-hidden`}
                  >
                    {/* Image banner */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={course.img}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" aria-hidden="true" />
                      
                      {course.badge && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-bold text-[10px] px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wider">
                          {course.badge}
                        </span>
                      )}
                      
                      <span className="absolute bottom-4 right-4 text-[10px] bg-black/60 backdrop-blur-md text-zinc-300 font-bold px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                        {course.level}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">
                          {course.categoryLabel}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed flex-1">
                        {course.desc}
                      </p>

                      <ul className="space-y-2 py-2 border-y border-white/5">
                        {course.features.map((feat, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={snappySpring}
                        onClick={() => handleCourseAccess(course.id)}
                        className={`mt-4 w-full py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                          enrolled
                            ? "bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            : course.recommended
                              ? "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow"
                              : "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{enrolled ? "Reprendre le cursus" : "Rejoindre le cursus"}</span>
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
                className="text-center py-24"
              >
                <p className="text-zinc-500 text-sm">Aucun cours trouvé pour cette catégorie.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </PageTransition>
  );
};
