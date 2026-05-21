import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, BookOpen, Award, CheckCircle2, Menu, X, 
  ArrowLeft, Check, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition } from '../lib/motion';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string; // YouTube embed ID or path
  description: string;
  pedagogyTip?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

interface CourseData {
  id: string;
  title: string;
  category: string;
  level: string;
  badge?: string;
  desc: string;
  img: string;
  lessons: Lesson[];
}

const COURSES_DATABASE: Record<string, CourseData> = {
  "dma-special": {
    id: "dma-special",
    title: "Spécial Drum Master Academy",
    category: "Fondation Complète",
    level: "Débutant à Intermédiaire",
    badge: "Recommandé",
    desc: "Le programme idéal pour débuter. Apprenez les bases solides et progressez jusqu'au niveau intermédiaire.",
    img: "assets/images/josue_1.jpg",
    lessons: [
      {
        id: "dma-bases",
        title: "1. Posture & Tenue de baguettes",
        duration: "12 min",
        videoUrl: "PszV3Q3T1jI", // YouTube ID placeholder
        description: "Maîtrisez la posture anatomique parfaite derrière le kit, la technique traditionnelle contre la pince appairée, et évitez les blessures courantes.",
        pedagogyTip: "Entraînez-vous devant un miroir pour vérifier l'alignement de vos coudes et la symétrie de vos frappes."
      },
      {
        id: "dma-grooves",
        title: "2. Premiers Grooves & Coordination",
        duration: "18 min",
        videoUrl: "W_K7uP6aAks",
        description: "Entrez dans l'application pratique en apprenant des rythmes de base en 4/4 à la charleston, caisse claire et grosse caisse.",
        pedagogyTip: "Travaillez d'abord le motif mains/pieds lentement à 60 BPM avant d'accélérer."
      },
      {
        id: "dma-independance",
        title: "3. Indépendance & Lecture",
        duration: "15 min",
        videoUrl: "T3j31ZlT3ks",
        description: "Apprenez à séparer les mouvements de vos 4 membres tout en lisant une partition de batterie standard.",
        pedagogyTip: "Chanter le débit de croches à voix haute pendant que vos pieds jouent facilite la mémorisation musculaire."
      },
      {
        id: "dma-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Testez vos connaissances théoriques et techniques pour valider ce cursus de fondation.",
        quiz: {
          question: "Quelle technique de tenue de baguettes utilise les pouces face à face sur le dessus ?",
          options: ["La pince française (French Grip)", "La pince allemande (German Grip)", "La tenue traditionnelle (Traditional Grip)"],
          correctIndex: 1
        }
      }
    ]
  },
  "gospel": {
    id: "gospel",
    title: "Masterclass Gospel Pro",
    category: "Gospel Chops & Grooves",
    level: "Avancé",
    badge: "Masterclass",
    desc: "Maîtrisez les rudiments avancés, les fills linéaires et la dynamique émotionnelle propre au Gospel moderne.",
    img: "assets/images/gospel-pro-thumbnail.png",
    lessons: [
      {
        id: "gospel-fondations",
        title: "1. Fondations & Toucher de caisse claire",
        duration: "15 min",
        videoUrl: "dZ94f1kLq5E",
        description: "Comment obtenir un rimshot tranchant et constant, et maîtriser le niveau dynamique bas propre au worship.",
        pedagogyTip: "Le son de caisse claire doit chanter sans jamais écraser le reste du set."
      },
      {
        id: "gospel-worship",
        title: "2. Worship Dynamics & Build-Up",
        duration: "20 min",
        videoUrl: "1ZlT5aT_dZ9",
        description: "L'art d'accompagner les moments intenses. Créez des montées en puissance épiques à la cymbale ride.",
        pedagogyTip: "Augmentez le volume en utilisant le poids du bras, et non en crispant le poignet."
      },
      {
        id: "gospel-chops",
        title: "3. Langage des Chops & Fills Linéaires",
        duration: "25 min",
        videoUrl: "4K7uT3_PszV",
        description: "Introduction aux fills linéaires rapides combinant les mains et les pieds en sextolets.",
        pedagogyTip: "Assurez-vous que le coup de grosse caisse au milieu du fill soit aussi fort que vos coups de mains."
      },
      {
        id: "gospel-shout",
        title: "4. Shout & Praise Drumming",
        duration: "18 min",
        videoUrl: "aAksW_K7uP6",
        description: "Entraînez-vous sur les tempos ultra-rapides du Shout Music. Maîtrisez le groove de basse continu.",
        pedagogyTip: "Détendez vos épaules. La vitesse dans le shout vient de la souplesse de vos chevilles."
      },
      {
        id: "gospel-quiz",
        title: "5. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Validez votre compréhension des fills linéaires et de l'orchestration worship.",
        quiz: {
          question: "Dans un fill linéaire typique de Gospel, que signifie le terme 'linéaire' ?",
          options: ["Que toutes les notes sont jouées en ligne droite sur la caisse claire", "Qu'aucun coup n'est joué simultanément sur deux éléments", "Que le tempo accélère de manière constante"],
          correctIndex: 1
        }
      }
    ]
  },
  "afro": {
    id: "afro",
    title: "Spécialisation Afro Fusion",
    category: "Rythmes du Monde",
    level: "Intermédiaire à Avancé",
    desc: "Intégrez les polyrythmies ouest-africaines et les grooves Afrobeats dans un contexte de batterie moderne.",
    img: "assets/images/josue_2.jpg",
    lessons: [
      {
        id: "afro-polyrythmie",
        title: "1. Polyrythmie 6/8 & 12/8",
        duration: "14 min",
        videoUrl: "9f24eT3_Psz",
        description: "Comprenez la superposition du rythme ternaire sur un ressenti binaire, typique des musiques traditionnelles d'Afrique de l'Ouest.",
        pedagogyTip: "Tapez la pulsation au pied gauche sur le charleston pendant que votre main droite joue le 6/8."
      },
      {
        id: "afro-grooves",
        title: "2. Grooves Afrobeats Modernes",
        duration: "16 min",
        videoUrl: "W_K7uT3_dZ9",
        description: "Comment appliquer les patterns de caisse claire syncopeurs et les lignes de basse sur l'Afrobeats nigérian moderne.",
        pedagogyTip: "Gardez le charleston très serré et percutant pour simuler le son sec des programmations de boîte à rythmes."
      },
      {
        id: "afro-technique",
        title: "3. Technique de Caisse Claire Appliquée",
        duration: "15 min",
        videoUrl: "1ZlT3js_Psz",
        description: "Utilisation créative des rimclicks et ghost notes pour donner vie aux grooves Afro Fusion.",
        pedagogyTip: "Le rimclick doit être parfaitement net. Trouvez le point d'équilibre de votre baguette."
      },
      {
        id: "afro-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Vérifiez vos acquis sur la métrique 12/8 et les motifs Afro syncopés.",
        quiz: {
          question: "Quelle subdivision est le pilier des polyrythmies traditionnelles ouest-africaines ?",
          options: ["Le format Binaire (4/4)", "Le format Ternaire (6/8 ou 12/8)", "Le format Asymétrique (5/4)"],
          correctIndex: 1
        }
      }
    ]
  },
  "jazz": {
    id: "jazz",
    title: "Jazz Moderne & Studio",
    category: "Technique Pro",
    level: "Avancé",
    desc: "Développez votre vocabulaire jazz, l'indépendance de vos membres et l'art d'enregistrer en studio professionnel.",
    img: "assets/images/josue_3.jpg",
    lessons: [
      {
        id: "jazz-swing",
        title: "1. Swing & Bebop Vocabulaire",
        duration: "20 min",
        videoUrl: "dZ94f_W_K7u",
        description: "Apprenez le chabada classique, le comping de la main gauche sur la caisse claire, et l'intégration de la grosse caisse légère.",
        pedagogyTip: "La cymbale ride doit porter le swing. Ne la jouez pas de façon saccadée, laissez-la respirer."
      },
      {
        id: "jazz-studio",
        title: "2. Recording en Studio Pro",
        duration: "22 min",
        videoUrl: "dZ94f1k_Psz",
        description: "Les astuces techniques pour accorder vos peaux pour le studio, le choix des cymbales et la gestion du métronome en cabine.",
        pedagogyTip: "Enregistrez-vous souvent. Le micro de studio ne ment jamais sur la régularité de vos frappes."
      },
      {
        id: "jazz-impro",
        title: "3. Improvisation & Solo",
        duration: "18 min",
        videoUrl: "4K7uT3j_W_K",
        description: "Comment structurer un solo de batterie jazz en vous basant sur la mélodie d'un thème standard.",
        pedagogyTip: "Pensez comme un chanteur. Laissez des silences entre vos phrases de solo."
      },
      {
        id: "jazz-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Testez votre culture et technique du Jazz Comping.",
        quiz: {
          question: "Comment appelle-t-on le fait de jouer la cymbale ride en triolets caractéristiques du jazz ?",
          options: ["Le Paradiddle", "Le Chabada (ou Ride Pattern)", "Le Rimshot"],
          correctIndex: 1
        }
      }
    ]
  },
  "rythmes": {
    id: "rythmes",
    title: "Étude des Rythmes",
    category: "Rythmes & Technique",
    level: "Tous Niveaux",
    desc: "Explorez les fondamentaux rythmiques à travers la Salsa, le Merengue, l'Afro-Cuban, le Jazz Swing et le Funk.",
    img: "assets/images/etudes_rythmes.jpg",
    lessons: [
      {
        id: "rythmes-latin",
        title: "1. Latin Salsa & Merengue",
        duration: "18 min",
        videoUrl: "W_K7uP6_dZ9",
        description: "Apprenez les grooves Cascara, le motif de cloche Mambo et l'indépendance pied gauche sur la clave.",
        pedagogyTip: "Le secret du latin groove est la régularité absolue de la cloche."
      },
      {
        id: "rythmes-clave",
        title: "2. Afro-Cuban Clave (3:2 & 2:3)",
        duration: "15 min",
        videoUrl: "dZ94f1k_T3j",
        description: "Comprenez la structure fondamentale de la clave cubaine et comment orchestrer vos patterns autour de celle-ci.",
        pedagogyTip: "Sentez la direction de la clave. Est-elle en tension (3 coups) ou en résolution (2 coups) ?"
      },
      {
        id: "rythmes-subdivisions",
        title: "3. Subdivisions & Tempo Control",
        duration: "16 min",
        videoUrl: "PszV3Q3_T3j",
        description: "Exercices avancés pour passer de la noire, croche, triolet de croches, double-croche sans dériver.",
        pedagogyTip: "Faites cet exercice avec le métronome DMA réglé sur 70 BPM en tapant sur un pad d'entraînement."
      },
      {
        id: "rythmes-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Vérifiez vos connaissances sur les motifs de clave et subdivisions.",
        quiz: {
          question: "Quel motif rythmique sert de guide structurel absolu dans la musique Afro-Cubaine ?",
          options: ["La Clave", "Le Paradiddle", "Le Shuffle"],
          correctIndex: 0
        }
      }
    ]
  },
  "rudiments": {
    id: "rudiments",
    title: "40 Drum Basic Rudiments",
    category: "Fondations Essentielles",
    level: "Tous Niveaux",
    badge: "INDISPENSABLE",
    desc: "Maîtrisez le lexique international de la batterie. Un parcours structuré couvrant les 40 rudiments officiels (PAS).",
    img: "assets/images/rudiments-pro-thumbnail.png",
    lessons: [
      {
        id: "rudiments-roules",
        title: "1. Roulés (Double Strokes) & Frisés (Single Strokes)",
        duration: "16 min",
        videoUrl: "T3j31Zl_W_K",
        description: "Développez la propreté absolue de vos frisés et utilisez le rebond de la peau pour vos roulés à haute vitesse.",
        pedagogyTip: "Ne forcez pas le second coup du roulé. Laissez la baguette rebondir et resserrez légèrement les doigts."
      },
      {
        id: "rudiments-paradiddles",
        title: "2. Les Paradiddles & Flams",
        duration: "18 min",
        videoUrl: "dZ94f1k_W_K",
        description: "Comment articuler vos coups simples et doubles combinés, et exécuter de beaux Flams amples.",
        pedagogyTip: "Accentuez toujours le premier coup de chaque paradiddle pour le faire ressortir."
      },
      {
        id: "rudiments-moeller",
        title: "3. Technique Moeller & Contrôle de rebond",
        duration: "20 min",
        videoUrl: "4K7uT3j_Psz",
        description: "Intégrez le mouvement de fouet Moeller pour jouer plus vite, plus fort, avec un minimum d'efforts.",
        pedagogyTip: "Détendez vos poignets. Le mouvement Moeller doit être fluide comme une vague."
      },
      {
        id: "rudiments-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Testez votre maîtrise du phrasé des rudiments.",
        quiz: {
          question: "Quel mouvement technique permet d'utiliser un effet de 'fouet' pour libérer la vitesse et la puissance sans fatigue ?",
          options: ["La technique Moeller", "Le Traditional Grip", "Le Rimclick"],
          correctIndex: 0
        }
      }
    ]
  }
};

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, updateCourseProgress } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom interactive quiz states inside player
  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      showToast("Vous devez être connecté pour accéder à la zone de cours.", "info");
      navigate('/login');
      return;
    }

    if (courseId && COURSES_DATABASE[courseId]) {
      const cData = COURSES_DATABASE[courseId];
      setCourse(cData);
      setCurrentLesson(cData.lessons[0]);
    } else {
      showToast("Cursus non trouvé.", "error");
      navigate('/courses');
    }
  }, [courseId, user, navigate, showToast]);

  if (!course || !currentLesson) return null;

  const completedLessons = user?.courseProgress[course.id]?.completedLessons || [];

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSelectedQuizAns(null);
    setQuizCompleted(false);
    setQuizCorrect(null);
    setSidebarOpen(false);
  };

  const handleMarkAsCompleted = async () => {
    await updateCourseProgress(course.id, currentLesson.id);
    showToast("Leçon validée avec succès ! 🎉", "success");
    
    // Auto-advance to next lesson if available
    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      setTimeout(() => {
        handleLessonClick(course.lessons[currentIndex + 1]);
      }, 1000);
    }
  };

  const handleQuizSubmit = async () => {
    if (selectedQuizAns === null || !currentLesson.quiz) return;

    const isCorrect = selectedQuizAns === currentLesson.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizCompleted(true);

    if (isCorrect) {
      showToast("Félicitations ! Réponse correcte !", "success");
      await updateCourseProgress(course.id, currentLesson.id);
    } else {
      showToast("Oups ! Mauvaise réponse. Réessayez !", "error");
    }
  };

  return (
    <PageTransition>
    <div className="flex min-h-[92vh] bg-zinc-950 text-zinc-100 relative">
      {/* Sidebar navigation button for mobile */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden absolute top-4 left-4 z-40 bg-zinc-900 border border-white/5 p-2 rounded-lg text-gold-400 hover:text-white"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar syllabus navigation */}
      <aside 
        className={`w-[280px] sm:w-[320px] shrink-0 bg-zinc-900/90 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between fixed lg:static top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 pt-14 lg:pt-0">
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-gold-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tous les cursus</span>
          </Link>
          
          <div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block mb-1">
              {course.category}
            </span>
            <h3 className="text-base font-bold text-white leading-snug">{course.title}</h3>
          </div>

          <nav className="space-y-1 pt-4 border-t border-white/5">
            {course.lessons.map((les) => {
              const isCurrent = currentLesson.id === les.id;
              const isDone = completedLessons.includes(les.id);
              return (
                <button
                  key={les.id}
                  onClick={() => handleLessonClick(les)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? "border-gold-500/40 bg-gold-500/5 text-white"
                      : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <BookOpen className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-gold-400' : 'text-zinc-500'}`} />
                    <span className="text-xs sm:text-sm font-semibold truncate pr-2">{les.title}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-zinc-600 shrink-0 font-medium">{les.duration}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 text-[11px] text-zinc-500">
          DMA Course Player © 2026. Entraînez-vous chaque jour !
        </div>
      </aside>

      {/* Main content display area */}
      <main className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto max-w-5xl mx-auto w-full pt-16 lg:pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLesson.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={springTransition}
            className="space-y-8"
          >
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 uppercase">
                  {course.level}
                </span>
                {course.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-400/10 border border-gold-400/20 text-gold-400 uppercase">
                    {course.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">{currentLesson.title}</h2>
            </div>

            {/* Video or Quiz Box */}
            {currentLesson.quiz ? (
              <div className="border border-gold-500/20 bg-zinc-900/60 rounded-2xl p-6 sm:p-10 shadow-gold-glow/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 to-gold-400" />
                <div className="flex items-center gap-2 text-gold-400 mb-6">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Quiz de Graduation</span>
                </div>

                <div className="space-y-6">
                  <p className="text-sm sm:text-base font-bold text-zinc-200 leading-relaxed bg-zinc-950/60 p-4 border border-white/5 rounded-xl">
                    {currentLesson.quiz.question}
                  </p>

                  <div className="space-y-3">
                    {currentLesson.quiz.options.map((opt, i) => (
                      <button
                        key={i}
                        disabled={quizCompleted}
                        onClick={() => setSelectedQuizAns(i)}
                        className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm border transition-all flex items-center justify-between gap-4 ${
                          selectedQuizAns === i
                            ? 'border-gold-500 bg-gold-500/5 text-white'
                            : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10 hover:bg-zinc-950/60'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedQuizAns === i && <Check className="w-4 h-4 text-gold-400 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {!quizCompleted ? (
                    <button
                      onClick={handleQuizSubmit}
                      className="w-full btn-gold py-3 rounded-lg text-sm font-bold mt-4"
                    >
                      Valider ma réponse
                    </button>
                  ) : (
                    <div className="pt-4 space-y-4">
                      {quizCorrect ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs sm:text-sm flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span>Félicitations ! Vous avez répondu correctement. Cursus officiellement validé ! 🎉</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs sm:text-sm flex items-center gap-3">
                            <X className="w-5 h-5 shrink-0" />
                            <span>Réponse incorrecte. Prenez le temps de revoir les leçons précédentes et réessayez.</span>
                          </div>
                          <button
                            onClick={() => {
                              setQuizCompleted(false);
                              setQuizCorrect(null);
                              setSelectedQuizAns(null);
                            }}
                            className="w-full py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-xs font-semibold text-white rounded-lg"
                          >
                            Réessayer le quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Beautiful custom HTML5 Video placeholder that triggers play overlay or real embed */}
                <div className="aspect-video w-full rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 relative shadow-2xl group">
                  {currentLesson.videoUrl ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${currentLesson.videoUrl}?autoplay=0&rel=0&modestbranding=1`}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: `url('${course.img}')` }}>
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[1]" />
                      <button className="z-10 w-16 h-16 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
                        <Play className="w-6 h-6 text-obsidian fill-current translate-x-0.5" />
                      </button>
                      <span className="z-10 mt-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">Vidéo de formation</span>
                    </div>
                  )}
                </div>

                {/* Lesson info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-8 space-y-4">
                    <h3 className="text-lg font-bold text-white">À propos de la leçon</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      {currentLesson.description}
                    </p>
                  </div>
                  <div className="md:col-span-4 space-y-4">
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={completedLessons.includes(currentLesson.id)}
                      className={`w-full py-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        completedLessons.includes(currentLesson.id)
                          ? "bg-green-500/10 border border-green-500/20 text-green-400 cursor-default"
                          : "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow"
                      }`}
                    >
                      {completedLessons.includes(currentLesson.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Leçon Validée !</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider la leçon</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Pedagogy tip */}
                {currentLesson.pedagogyTip && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-gold-500/10 to-transparent border-l-4 border-gold-500 mt-6 flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-1">Conseil du Coach Josué</h4>
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{currentLesson.pedagogyTip}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </PageTransition>
  );
};
