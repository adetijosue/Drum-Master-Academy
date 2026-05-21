import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, BookOpen, Award, CheckCircle2, Menu, X, 
  ArrowLeft, Check, Sparkles, Clock, Music, Trophy, 
  Square, Save, ShieldCheck, TrendingUp, BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition, snappySpring } from '../lib/motion';

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
  metronomePreset?: { bpm: number; beats: number; subdivision: number; sound: 'digital' | 'woodblock' | 'stick' | 'cowbell' };
  tablature?: string; // monospaced drum tabs representation
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

export const COURSES_DATABASE: Record<string, CourseData> = {
  "dma-special": {
    id: "dma-special",
    title: "Spécial Drum Master Academy",
    category: "Fondation Complète",
    level: "Débutant à Intermédiaire",
    badge: "Recommandé",
    desc: "Le programme idéal pour débuter. Apprenez les bases solides et progressez jusqu'au niveau intermédiaire.",
    img: "/assets/images/josue_1.jpg",
    lessons: [
      {
        id: "dma-bases",
        title: "1. Posture & Tenue de baguettes",
        duration: "12 min",
        videoUrl: "PszV3Q3T1jI",
        description: "Maîtrisez la posture anatomique parfaite derrière le kit, la technique traditionnelle contre la pince appairée, et évitez les blessures courantes.",
        pedagogyTip: "Entraînez-vous devant un miroir pour vérifier l'alignement de vos coudes et la symétrie de vos frappes.",
        metronomePreset: { bpm: 60, beats: 4, subdivision: 1, sound: 'woodblock' },
        tablature: "POSTURE TECHNIQUE & PIECE REBOND\n\nPosture : Pieds plats sur les pédales à 90°, dos parfaitement droit.\nTenue : Utiliser le point pivot (rebond naturel libre) à 1/3 de la baguette.\n\nExercice de rebond (M = Main droite, m = Main gauche) :\nDébit : Croches\nM - M - M - M | m - m - m - m\nM - m - M - m | M - m - M - m"
      },
      {
        id: "dma-grooves",
        title: "2. Premiers Grooves & Coordination",
        duration: "18 min",
        videoUrl: "W_K7uP6aAks",
        description: "Entrez dans l'application pratique en apprenant des rythmes de base en 4/4 à la charleston, caisse claire et grosse caisse.",
        pedagogyTip: "Travaillez d'abord le motif mains/pieds lentement à 60 BPM avant d'accélérer.",
        metronomePreset: { bpm: 80, beats: 4, subdivision: 2, sound: 'digital' },
        tablature: "PREMIER GROOVE BINAIRE (4/4)\n\nLégende : H = Charleston, S = Caisse Claire, B = Grosse Caisse\nTempo de base recommandé : 80 BPM\n\nH | x - x - x - x - x - x - x - x |\nS | - - - - o - - - - - - - o - - - |\nB | o - - - - - - - o - - - - - - - |\n    1   &   2   &   3   &   4   &  "
      },
      {
        id: "dma-independance",
        title: "3. Indépendance & Lecture",
        duration: "15 min",
        videoUrl: "T3j31ZlT3ks",
        description: "Apprenez à séparer les mouvements de vos 4 membres tout en lisant une partition de batterie standard.",
        pedagogyTip: "Chanter le débit de croches à voix haute pendant que vos pieds jouent facilite la mémorisation musculaire.",
        metronomePreset: { bpm: 75, beats: 4, subdivision: 2, sound: 'stick' },
        tablature: "INDÉPENDANCE 3 VOIX (CAISSE CLAIRE SYNCOPÉE)\n\nH | x - x - x - x - x - x - x - x |\nS | - - - - o - - - o - - - o - - - |\nB | o - - o - - - - - - o - - - - - |\n    1   &   2   &   3   &   4   &  "
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
    img: "/assets/images/gospel-pro-thumbnail.png",
    lessons: [
      {
        id: "gospel-fondations",
        title: "1. Fondations & Toucher de caisse claire",
        duration: "15 min",
        videoUrl: "dZ94f1kLq5E",
        description: "Comment obtenir un rimshot tranchant et constant, et maîtriser le niveau dynamique bas propre au worship (Ghost Notes).",
        pedagogyTip: "Le son de caisse claire doit chanter sans jamais écraser le reste du set.",
        metronomePreset: { bpm: 65, beats: 4, subdivision: 2, sound: 'digital' },
        tablature: "GHOST NOTES PRACTICE (DYNAMIQUE ACCENT/FAIBLE)\n\nJouer les notes accentuées (O) fortes et les notes minuscules (o) extrêmement faibles.\n\nH | x - x - x - x - x - x - x - x |\nS | o - o - O - o - o - O - o - o |\nB | o - - - - - - - o - - - - - - - |"
      },
      {
        id: "gospel-worship",
        title: "2. Worship Dynamics & Build-Up",
        duration: "20 min",
        videoUrl: "1ZlT5aT_dZ9",
        description: "L'art d'accompagner les moments intenses. Créez des montées en puissance épiques à la cymbale ride.",
        pedagogyTip: "Augmentez le volume en utilisant le poids du bras, et non en crispant le poignet.",
        metronomePreset: { bpm: 72, beats: 4, subdivision: 1, sound: 'woodblock' },
        tablature: "RIDE BUILD-UP SWEEP\n\nRide | x - x - x - x - x - x - x - x | (Augmenter graduellement du dôme au bord)\nS    | - - - - o - - - - - - - o - - - |\nB    | o - o - o - o - o - o - o - o - | (Four on the floor continu)"
      },
      {
        id: "gospel-chops",
        title: "3. Langage des Chops & Fills Linéaires",
        duration: "25 min",
        videoUrl: "4K7uT3_PszV",
        description: "Introduction aux fills linéaires rapides combinant les mains et les pieds en sextolets.",
        pedagogyTip: "Assurez-vous que le coup de grosse caisse au milieu du fill soit aussi fort que vos coups de mains.",
        metronomePreset: { bpm: 90, beats: 4, subdivision: 3, sound: 'cowbell' },
        tablature: "LINEAR SIXTUPLET FILL (RLK)\n\nFills linéaires en sextolets (6 notes par temps). R=M.Droite, L=M.Gauche, K=Grosse Caisse.\nPattern : R L K R L K\n\n1er temps : [ R L K R L K ] (mains sur les toms, kick rapide)\n2e temps :  [ R L K R L K ] (accélérer sur la caisse claire)\n3e temps :  [ R L R L K K ]\n4e temps :  Coup de cymbale Crash + Grosse Caisse !"
      },
      {
        id: "gospel-shout",
        title: "4. Shout & Praise Drumming",
        duration: "18 min",
        videoUrl: "aAksW_K7uP6",
        description: "Entraînez-vous sur les tempos ultra-rapides du Shout Music. Maîtrisez le groove de basse continu.",
        pedagogyTip: "Détendez vos épaules. La vitesse dans le shout vient de la souplesse de vos chevilles.",
        metronomePreset: { bpm: 135, beats: 4, subdivision: 2, sound: 'woodblock' },
        tablature: "SHOUT MUSIC UPTEMPO GROOVE\n\nH | x - x - x - x - x - x - x - x |\nS | - - o - - - o - - o - - o - - - |\nB | o - - o - - o - - o - - o - - o |\n    1   &   2   &   3   &   4   &  "
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
    img: "/assets/images/josue_2.jpg",
    lessons: [
      {
        id: "afro-polyrythmie",
        title: "1. Polyrythmie 6/8 & 12/8",
        duration: "14 min",
        videoUrl: "9f24eT3_Psz",
        description: "Comprenez la superposition du rythme ternaire sur un ressenti binaire, typique des musiques traditionnelles d'Afrique de l'Ouest.",
        pedagogyTip: "Tapez la pulsation au pied gauche sur le charleston pendant que votre main droite joue le 6/8.",
        metronomePreset: { bpm: 110, beats: 6, subdivision: 1, sound: 'woodblock' },
        tablature: "TEMPO TERNATAIRE 6/8 POLYRYTHME\n\nH | x - x - x - x - x - x |\nS | - - - - - - o - - - - - |\nB | o - - o - - - - - - - - |\n    1   2   3   4   5   6  "
      },
      {
        id: "afro-grooves",
        title: "2. Grooves Afrobeats Modernes",
        duration: "16 min",
        videoUrl: "W_K7uT3_dZ9",
        description: "Comment appliquer les patterns de caisse claire syncopeurs et les lignes de basse sur l'Afrobeats nigérian moderne.",
        pedagogyTip: "Gardez le charleston très serré et percutant pour simuler le son sec des programmations de boîte à rythmes.",
        metronomePreset: { bpm: 95, beats: 4, subdivision: 4, sound: 'cowbell' },
        tablature: "AFROBEATS SYNCOPATED GROOVE\n\nH | x - x - x - x - x - x - x - x |\nS | - - o - - - o - - o - - o - - - |\nB | o - - - o - - - - - o - - - - - |"
      },
      {
        id: "afro-technique",
        title: "3. Technique de Caisse Claire Appliquée",
        duration: "15 min",
        videoUrl: "1ZlT3js_Psz",
        description: "Utilisation créative des rimclicks et ghost notes pour donner vie aux grooves Afro Fusion.",
        pedagogyTip: "Le rimclick doit être parfaitement net. Trouvez le point d'équilibre de votre baguette.",
        metronomePreset: { bpm: 90, beats: 4, subdivision: 2, sound: 'stick' },
        tablature: "RIMCLICK AFRO-FUSION MOTIF\n\nH | x - x - x - x - x - x - x - x |\nS | (x) - o - (x) - (x) - o - (x) - o | (Notez : (x) est un Rimclick sec)\nB | o - - - - o - - - o - - - - - - |"
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
    img: "/assets/images/josue_3.jpg",
    lessons: [
      {
        id: "jazz-swing",
        title: "1. Swing & Bebop Vocabulaire",
        duration: "20 min",
        videoUrl: "dZ94f_W_K7u",
        description: "Apprenez le chabada classique, le comping de la main gauche sur la caisse claire, et l'intégration de la grosse caisse légère.",
        pedagogyTip: "La cymbale ride doit porter le swing. Ne la jouez pas de façon saccadée, laissez-la respirer.",
        metronomePreset: { bpm: 120, beats: 4, subdivision: 3, sound: 'woodblock' },
        tablature: "LE CHABADA CLASSIQUE (SWING PATTERN)\n\nRide | x - - x - x - - x - x |\nCharl | - - x - - - - - x - - - | (Pied gauche sur 2 et 4)\nKick  | o - - - - - - - o - - - | (Feathering très léger, presque inaudible)\n\nComping caisse claire (exemples de syncope) :\nS    | - - - - - o - - - - - - |"
      },
      {
        id: "jazz-studio",
        title: "2. Recording en Studio Pro",
        duration: "22 min",
        videoUrl: "dZ94f1k_Psz",
        description: "Les astuces techniques pour accorder vos peaux pour le studio, le choix des cymbales et la gestion du métronome en cabine.",
        pedagogyTip: "Enregistrez-vous souvent. Le micro de studio ne ment jamais sur la régularité de vos frappes.",
        metronomePreset: { bpm: 100, beats: 4, subdivision: 1, sound: 'digital' },
        tablature: "STUDIO RECORDING CLICK PRACTICE\n\nJouer un groove 4/4 standard et s'assurer que chaque coup de kick et caisse claire\nest parfaitement aligné sur le signal du métronome.\n\nObjectif : 'Enterrer le click' (faire disparaître le métronome derrière la régularité)."
      },
      {
        id: "jazz-impro",
        title: "3. Improvisation & Solo",
        duration: "18 min",
        videoUrl: "4K7uT3j_W_K",
        description: "Comment structurer un solo de batterie jazz en vous basant sur la mélodie d'un thème standard.",
        pedagogyTip: "Pensez comme un chanteur. Laissez des silences entre vos phrases de solo.",
        metronomePreset: { bpm: 130, beats: 4, subdivision: 3, sound: 'stick' },
        tablature: "IMPROVISATION PHRASING (MELODIC DRUMMING)\n\nJouer le thème en alternant caisse claire et toms pour chanter la mélodie.\n\nStructure : Question (8 mesures) -> Réponse (8 mesures) -> Tom solo (16 mesures)"
      },
      {
        id: "jazz-quiz",
        title: "4. Quiz de Validation Final",
        duration: "5 min",
        videoUrl: "",
        description: "Testez votre maîtrise du Jazz Comping.",
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
    img: "/assets/images/etudes_rythmes.jpg",
    lessons: [
      {
        id: "rythmes-latin",
        title: "1. Latin Salsa & Merengue",
        duration: "18 min",
        videoUrl: "W_K7uP6_dZ9",
        description: "Apprenez les grooves Cascara, le motif de cloche Mambo et l'indépendance pied gauche sur la clave.",
        pedagogyTip: "Le secret du latin groove est la régularité absolue de la cloche.",
        metronomePreset: { bpm: 105, beats: 4, subdivision: 4, sound: 'cowbell' },
        tablature: "CASCARA & CLAVE LATIN GROOVE\n\nClave| o - - o - - o - - - o - o - - - |\nCasc | x - x - x - x - x - x - x - x - | (Main droite sur la cloche ou flanc)\nS    | - - - - o - - - - - - - o - - - |\nB    | o - - - - - - - o - - - - - - - |"
      },
      {
        id: "rythmes-clave",
        title: "2. Afro-Cuban Clave (3:2 & 2:3)",
        duration: "15 min",
        videoUrl: "dZ94f1k_T3j",
        description: "Comprenez la structure fondamentale de la clave cubaine et comment orchestrer vos patterns autour de celle-ci.",
        pedagogyTip: "Sentez la direction de la clave. Est-elle en tension (3 coups) ou en résolution (2 coups) ?",
        metronomePreset: { bpm: 100, beats: 4, subdivision: 4, sound: 'woodblock' },
        tablature: "CLAVE 3:2 ET 2:3 PATTERNS\n\nClave Son 3:2 :\n[ o - - o - - o - | - - o - o - - - ]\n\nClave Son 2:3 :\n[ - - o - o - - - | o - - o - - o - ]"
      },
      {
        id: "rythmes-subdivisions",
        title: "3. Subdivisions & Tempo Control",
        duration: "16 min",
        videoUrl: "PszV3Q3_T3j",
        description: "Exercices avancés pour passer de la noire, croche, triolet de croches, double-croche sans dériver.",
        pedagogyTip: "Faites cet exercice avec le métronome DMA réglé sur 70 BPM en tapant sur un pad d'entraînement.",
        metronomePreset: { bpm: 70, beats: 4, subdivision: 2, sound: 'digital' },
        tablature: "SUBDIVISION PYRAMID PRACTICE\n\nMesure 1 : Noires        (1   2   3   4  )\nMesure 2 : Croches       (1 & 2 & 3 & 4 &)\nMesure 3 : Triolets      (1-o-o 2-o-o 3-o-o 4-o-o)\nMesure 4 : Doubles       (1-e-&-a 2-e-&-a 3-e-&-a 4-e-&-a)"
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
    img: "/assets/images/rudiments-pro-thumbnail.png",
    lessons: [
      {
        id: "rudiments-roules",
        title: "1. Roulés (Double Strokes) & Frisés (Single Strokes)",
        duration: "16 min",
        videoUrl: "T3j31Zl_W_K",
        description: "Développez la propreté absolue de vos frisés et utilisez le rebond de la peau pour vos roulés à haute vitesse.",
        pedagogyTip: "Ne forcez pas le second coup du roulé. Laissez la baguette rebondir et resserrez légèrement les doigts.",
        metronomePreset: { bpm: 90, beats: 4, subdivision: 2, sound: 'woodblock' },
        tablature: "FRISÉS & ROULÉS (SINGLE & DOUBLE STROKES)\n\nFrisé (Single Stroke Roll) :\nR L R L R L R L | R L R L R L R L\n\nRoulé (Double Stroke Roll) :\nR R L L R R L L | R R L L R R L L"
      },
      {
        id: "rudiments-paradiddles",
        title: "2. Les Paradiddles & Flams",
        duration: "18 min",
        videoUrl: "dZ94f1k_W_K",
        description: "Comment articuler vos coups simples et doubles combinés, et exécuter de beaux Flams amples.",
        pedagogyTip: "Accentuez toujours le premier coup de chaque paradiddle pour le faire ressortir.",
        metronomePreset: { bpm: 85, beats: 4, subdivision: 4, sound: 'stick' },
        tablature: "PARADIDDLE & ACCENTS PRACTICE\n\nSingle Paradiddle (Accenter le premier coup) :\n R l r r L r l l | R l r r L r l l\n(O l r r O r l l)"
      },
      {
        id: "rudiments-moeller",
        title: "3. Technique Moeller & Contrôle de rebond",
        duration: "20 min",
        videoUrl: "4K7uT3j_Psz",
        description: "Intégrez le mouvement de fouet Moeller pour jouer plus vite, plus fort, avec un minimum d'efforts.",
        pedagogyTip: "Détendez vos poignets. Le mouvement Moeller doit être fluide comme une vague.",
        metronomePreset: { bpm: 75, beats: 4, subdivision: 3, sound: 'woodblock' },
        tablature: "TECHNIQUE MOELLER (UP-DOWN-TAP STROKES)\n\nAccentuation en triolets :\nDown Tap Up | Down Tap Up | Down Tap Up | Down Tap Up\n R    l   r  |  L    r   l  |  R    l   r  |  L    r   l"
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
  const [activePlayerTab, setActivePlayerTab] = useState<'video' | 'metronome' | 'technique' | 'notes' | 'tabs'>('video');
  
  // Custom interactive quiz states inside player
  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  // Student notepad states
  const [noteText, setNoteText] = useState('');

  // Gamified achievements states
  const [showGraduationCelebration, setShowGraduationCelebration] = useState(false);

  // Batteur Pro Player state hooks
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [, setCurrentTime] = useState(0);

  // Metronome State & Ref Matrix
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [soundStyle, setSoundStyle] = useState<'digital' | 'woodblock' | 'stick' | 'cowbell'>('digital');
  const [accentFirstBeat] = useState(true);
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [speedTrainerStep, setSpeedTrainerStep] = useState(5);
  const [speedTrainerInterval, setSpeedTrainerInterval] = useState(4); // measures
  const [gapClick, setGapClick] = useState(false);
  const [gapClickPlay, setGapClickPlay] = useState(2); // play 2 measures
  const [gapClickMute, setGapClickMute] = useState(2); // mute 2 measures

  const [activeBeatVisual, setActiveBeatVisual] = useState(-1);
  const [activeSubdivisionVisual, setActiveSubdivisionVisual] = useState(-1);
  const [isMutedMeasure, setIsMutedMeasure] = useState(false);
  const [measuresCount, setMeasuresCount] = useState(0);
  const [tapActive, setTapActive] = useState(false);
  const [rhythmPreset, setRhythmPreset] = useState<'standard' | 'shuffle' | 'clave32' | 'clave23' | 'afrobeats'>('standard');

  // Metronome scheduler refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0.0);
  const currentBeatRef = useRef(0);
  const currentSubdivisionBeatRef = useRef(0);
  const measuresPlayedRef = useRef(0);

  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const subdivisionRef = useRef(subdivision);
  const soundStyleRef = useRef(soundStyle);
  const accentFirstBeatRef = useRef(accentFirstBeat);
  const speedTrainerRef = useRef(speedTrainer);
  const speedTrainerStepRef = useRef(speedTrainerStep);
  const speedTrainerIntervalRef = useRef(speedTrainerInterval);
  const metronomePlayingRef = useRef(metronomePlaying);
  const gapClickRef = useRef(gapClick);
  const gapClickPlayRef = useRef(gapClickPlay);
  const gapClickMuteRef = useRef(gapClickMute);
  const rhythmPresetRef = useRef(rhythmPreset);

  const lastTapRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);

  // Sync metronome refs to prevent closure locks
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);
  useEffect(() => { subdivisionRef.current = subdivision; }, [subdivision]);
  useEffect(() => { soundStyleRef.current = soundStyle; }, [soundStyle]);
  useEffect(() => { accentFirstBeatRef.current = accentFirstBeat; }, [accentFirstBeat]);
  useEffect(() => { speedTrainerRef.current = speedTrainer; }, [speedTrainer]);
  useEffect(() => { speedTrainerStepRef.current = speedTrainerStep; }, [speedTrainerStep]);
  useEffect(() => { speedTrainerIntervalRef.current = speedTrainerInterval; }, [speedTrainerInterval]);
  useEffect(() => { metronomePlayingRef.current = metronomePlaying; }, [metronomePlaying]);
  useEffect(() => { gapClickRef.current = gapClick; }, [gapClick]);
  useEffect(() => { gapClickPlayRef.current = gapClickPlay; }, [gapClickPlay]);
  useEffect(() => { gapClickMuteRef.current = gapClickMute; }, [gapClickMute]);
  useEffect(() => { rhythmPresetRef.current = rhythmPreset; }, [rhythmPreset]);

  // Load student personal notes for the current lesson
  useEffect(() => {
    if (currentLesson) {
      const savedNotes = localStorage.getItem(`dma-notes-${currentLesson.id}`);
      setNoteText(savedNotes || '');
    }
  }, [currentLesson]);

  // Auto-configure Metronome settings based on lesson presets
  useEffect(() => {
    if (currentLesson?.metronomePreset) {
      const preset = currentLesson.metronomePreset;
      setBpm(preset.bpm);
      setBeatsPerMeasure(preset.beats);
      setSubdivision(preset.subdivision);
      setSoundStyle(preset.sound);
      setRhythmPreset('standard');
    }
  }, [currentLesson]);

  // Save notes handler
  const handleSaveNotes = () => {
    if (currentLesson) {
      localStorage.setItem(`dma-notes-${currentLesson.id}`, noteText);
      showToast("Notes enregistrées localement dans votre journal ! 📝", "success");
    }
  };

  // Dynamic YouTube Player API logic
  useEffect(() => {
    if (!currentLesson?.videoUrl || currentLesson.quiz) return;

    const initYTPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
      }

      playerRef.current = new (window as any).YT.Player('dma-youtube-player', {
        videoId: currentLesson.videoUrl,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          controls: 1,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setPlaybackSpeed(1);
            setLoopStart(null);
            setLoopEnd(null);
            setIsLooping(false);
          },
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    } else {
      if ((window as any).YT.Player) {
        initYTPlayer();
      } else {
        const checkInterval = setInterval(() => {
          if ((window as any).YT && (window as any).YT.Player) {
            clearInterval(checkInterval);
            initYTPlayer();
          }
        }, 100);
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
          setPlayerReady(false);
        } catch (e) {}
      }
    };
  }, [currentLesson?.videoUrl, currentLesson?.quiz]);

  // A-B Looper Interval logic
  useEffect(() => {
    let interval: number;

    if (isLooping && loopStart !== null && loopEnd !== null && playerReady && playerRef.current) {
      interval = window.setInterval(() => {
        try {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);
          if (current >= loopEnd) {
            playerRef.current.seekTo(loopStart);
          }
        } catch (e) {}
      }, 150);
    } else if (playerReady && playerRef.current) {
      interval = window.setInterval(() => {
        try {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);
        } catch (e) {}
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLooping, loopStart, loopEnd, playerReady]);

  // Metronome Timings & Scheduling Engine
  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = (time: number, isAccent: boolean, isMainBeat: boolean) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const style = soundStyleRef.current;
    
    if (style === 'digital') {
      osc.type = 'sine';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1200, time);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(800, time);
        gainNode.gain.setValueAtTime(0.55, time);
      } else {
        osc.frequency.setValueAtTime(600, time);
        gainNode.gain.setValueAtTime(0.25, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);
    } 
    else if (style === 'woodblock') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.03);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(1000, time);
        osc.frequency.exponentialRampToValueAtTime(700, time + 0.03);
        gainNode.gain.setValueAtTime(0.5, time);
      } else {
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(550, time + 0.03);
        gainNode.gain.setValueAtTime(0.2, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      osc.start(time);
      osc.stop(time + 0.05);
    }
    else if (style === 'stick') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(2800, time);
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(2000, time);
        gainNode.gain.setValueAtTime(0.5, time);
      } else {
        osc.frequency.setValueAtTime(1600, time);
        gainNode.gain.setValueAtTime(0.2, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      osc.start(time);
      osc.stop(time + 0.02);
    }
    else if (style === 'cowbell') {
      const osc2 = audioCtx.createOscillator();
      osc.type = 'square';
      osc2.type = 'square';
      
      const f1 = isAccent && accentFirstBeatRef.current ? 840 : isMainBeat ? 800 : 760;
      const f2 = isAccent && accentFirstBeatRef.current ? 565 : isMainBeat ? 540 : 515;
      
      osc.frequency.setValueAtTime(f1, time);
      osc2.frequency.setValueAtTime(f2, time);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isAccent && accentFirstBeatRef.current ? 1000 : 800, time);
      filter.Q.setValueAtTime(1.5, time);
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      
      if (isAccent && accentFirstBeatRef.current) {
        gainNode.gain.setValueAtTime(0.7, time);
      } else if (isMainBeat) {
        gainNode.gain.setValueAtTime(0.4, time);
      } else {
        gainNode.gain.setValueAtTime(0.15, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      
      osc.start(time);
      osc.stop(time + 0.1);
      osc2.start(time);
      osc2.stop(time + 0.1);
    }
  };

  const scheduler = () => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const scheduleAheadTime = 0.1;
    const lookahead = 25.0;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      const isMainBeat = currentSubdivisionBeatRef.current === 0;
      const isFirstBeat = isMainBeat && currentBeatRef.current === 0;
      
      const stepInMeasure = currentBeatRef.current * subdivisionRef.current + currentSubdivisionBeatRef.current;

      // Calculate Rhythm Presets
      let playThisStep = true;
      const activePreset = rhythmPresetRef.current;
      
      if (activePreset === 'shuffle') {
        if (subdivisionRef.current === 3) {
          playThisStep = currentSubdivisionBeatRef.current !== 1;
        }
      } else if (activePreset === 'clave32') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [0, 3, 6, 10, 12].includes(stepInMeasure);
        }
      } else if (activePreset === 'clave23') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [2, 5, 8, 11, 14].includes(stepInMeasure);
        }
      } else if (activePreset === 'afrobeats') {
        if (beatsPerMeasureRef.current === 4 && subdivisionRef.current === 4) {
          playThisStep = [0, 3, 6, 8, 11, 14].includes(stepInMeasure);
        }
      }

      // Calculate Gap Click Muting
      let shouldMute = false;
      if (gapClickRef.current) {
        const totalCycle = gapClickPlayRef.current + gapClickMuteRef.current;
        const currentCycleMeasure = measuresPlayedRef.current % totalCycle;
        if (currentCycleMeasure >= gapClickPlayRef.current) {
          shouldMute = true;
        }
      }

      if (!shouldMute && playThisStep) {
        playClick(nextNoteTimeRef.current, isFirstBeat, isMainBeat);
      }

      const timeToPlay = nextNoteTimeRef.current - audioCtx.currentTime;
      const beatIndex = currentBeatRef.current;
      const subIndex = currentSubdivisionBeatRef.current;
      const currentMuteState = shouldMute;

      setTimeout(() => {
        if (metronomePlayingRef.current) {
          setActiveBeatVisual(beatIndex);
          setActiveSubdivisionVisual(subIndex);
          setIsMutedMeasure(currentMuteState);
        }
      }, Math.max(0, timeToPlay * 1000));

      const secondsPerSubdivision = (60.0 / bpmRef.current) / subdivisionRef.current;
      nextNoteTimeRef.current += secondsPerSubdivision;

      currentSubdivisionBeatRef.current++;
      if (currentSubdivisionBeatRef.current >= subdivisionRef.current) {
        currentSubdivisionBeatRef.current = 0;
        currentBeatRef.current++;
        if (currentBeatRef.current >= beatsPerMeasureRef.current) {
          currentBeatRef.current = 0;
          
          measuresPlayedRef.current++;
          const curMeasures = measuresPlayedRef.current;
          setTimeout(() => setMeasuresCount(curMeasures), 0);

          if (
            speedTrainerRef.current && 
            speedTrainerIntervalRef.current > 0 && 
            curMeasures % speedTrainerIntervalRef.current === 0
          ) {
            const nextBpm = Math.min(240, bpmRef.current + speedTrainerStepRef.current);
            setTimeout(() => {
              setBpm(nextBpm);
              showToast(`Speed trainer : tempo accéléré à ${nextBpm} BPM ! ⚡`, "info");
            }, 0);
          }
        }
      }
    }
    timerIDRef.current = window.setTimeout(() => scheduler(), lookahead);
  };

  const toggleMetronome = () => {
    if (metronomePlaying) {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      setMetronomePlaying(false);
      setActiveBeatVisual(-1);
      setActiveSubdivisionVisual(-1);
      setIsMutedMeasure(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setMetronomePlaying(true);
      currentBeatRef.current = 0;
      currentSubdivisionBeatRef.current = 0;
      measuresPlayedRef.current = 0;
      setMeasuresCount(0);
      setIsMutedMeasure(false);
      nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
      
      scheduler();
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    setTapActive(true);
    setTimeout(() => setTapActive(false), 150);

    if (lastTapRef.current === 0) {
      lastTapRef.current = now;
      return;
    }

    const diff = now - lastTapRef.current;
    lastTapRef.current = now;

    const times = [...tapTimesRef.current, diff].slice(-4);
    tapTimesRef.current = times;

    const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
    const computedBpm = Math.round(60000 / avg);

    if (computedBpm >= 40 && computedBpm <= 240) {
      setBpm(computedBpm);
      showToast(`Tempo détecté : ${computedBpm} BPM 🥁`, "info");
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
      showToast(`Vitesse de lecture réglée à ${speed}x ⚡`, "info");
    } else {
      showToast("Lecteur en cours de chargement...", "warning");
    }
  };

  const setPointA = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const current = playerRef.current.getCurrentTime();
      setLoopStart(current);
      showToast(`Point A défini à ${formatTime(current)} 📌`, "success");
      if (loopEnd !== null && current >= loopEnd) {
        setLoopEnd(null);
        setIsLooping(false);
      }
    } else {
      showToast("Lecteur non prêt.", "warning");
    }
  };

  const setPointB = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const current = playerRef.current.getCurrentTime();
      if (loopStart !== null && current <= loopStart) {
        showToast("Le point B doit être après le point A !", "error");
        return;
      }
      setLoopEnd(current);
      showToast(`Point B défini à ${formatTime(current)} 📌`, "success");
    } else {
      showToast("Lecteur non prêt.", "warning");
    }
  };

  const toggleLoop = () => {
    if (loopStart === null || loopEnd === null) {
      showToast("Veuillez définir les points A et B d'abord !", "warning");
      return;
    }
    const nextLooping = !isLooping;
    setIsLooping(nextLooping);
    if (nextLooping) {
      playerRef.current.seekTo(loopStart);
      playerRef.current.playVideo();
      showToast("Boucle A-B activée ! 🔄", "success");
    } else {
      showToast("Boucle A-B désactivée.", "info");
    }
  };

  const resetLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
    showToast("Boucle A-B réinitialisée.", "info");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  const completedLessons = user?.courseProgress?.[course.id]?.completedLessons || [];

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSelectedQuizAns(null);
    setQuizCompleted(false);
    setQuizCorrect(null);
    setSidebarOpen(false);
    setActivePlayerTab('video');
  };

  const handleMarkAsCompleted = async () => {
    await updateCourseProgress(course.id, currentLesson.id);
    showToast("Leçon validée avec succès ! 🎉", "success");
    setShowGraduationCelebration(true); // Trigger celebratory modal
  };

  const handleQuizSubmit = async () => {
    if (selectedQuizAns === null || !currentLesson.quiz) return;

    const isCorrect = selectedQuizAns === currentLesson.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizCompleted(true);

    if (isCorrect) {
      showToast("Félicitations ! Réponse correcte ! 🎉", "success");
      setShowGraduationCelebration(true);
      await updateCourseProgress(course.id, currentLesson.id);
    } else {
      showToast("Oups, ce n'est pas la bonne réponse. Retentez !", "error");
    }
  };

  return (
    <PageTransition>
      <div className="flex min-h-[92vh] bg-obsidian text-zinc-100 relative">
        
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden absolute top-4 left-4 z-40 bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-gold-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile backdrop shadow */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-20"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Syllabus Sidebar */}
        <aside 
          className={`w-[300px] shrink-0 bg-zinc-950/95 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col justify-between fixed lg:static top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-6 pt-14 lg:pt-0">
            <Link to="/courses" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-gold-400 transition-colors uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au catalogue</span>
            </Link>
            
            <div>
              <span className="text-[9px] text-gold-400 font-extrabold uppercase tracking-widest block mb-1">
                {course.category}
              </span>
              <h3 className="text-lg font-black text-white leading-snug tracking-tight">{course.title}</h3>
            </div>

            {/* Dynamic syllabus progress widget */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-500">Cursus accompli</span>
                <span className="text-gold-400 font-mono">
                  {Math.round((completedLessons.length / course.lessons.length) * 100)}%
                </span>
              </div>
              
              <div className="h-1.5 bg-zinc-950 rounded-full border border-white/5 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((completedLessons.length / course.lessons.length) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                />
              </div>
              
              <div className="text-[9px] text-zinc-500 font-bold flex justify-between uppercase">
                <span>{completedLessons.length} validée{completedLessons.length > 1 ? 's' : ''}</span>
                <span>{course.lessons.length} leçons</span>
              </div>
            </div>
   
            {/* Syllabus Navigation Panel */}
            <nav className="space-y-2 pt-4 border-t border-white/5 overflow-y-auto max-h-[45vh] pr-1">
              {course.lessons.map((les, idx) => {
                const isCurrent = currentLesson.id === les.id;
                const isDone = completedLessons.includes(les.id);
                
                return (
                  <button
                    key={les.id}
                    onClick={() => handleLessonClick(les)}
                    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? "border-gold-500 bg-gold-500/10 text-white shadow-[0_4px_20px_rgba(212,175,55,0.08)]"
                        : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex items-center justify-center shrink-0">
                        {isDone ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-400 font-bold" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-gold-500/15 border border-gold-500 flex items-center justify-center relative">
                            <span className="absolute w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-xs font-bold truncate pr-2 ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>
                          {les.title.replace(/^\d+\.\s*/, '')}
                        </span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 font-semibold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {les.duration}
                        </span>
                      </div>
                    </div>
                    
                    {isDone && (
                      <span className="text-[8px] text-green-400 font-black uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 shrink-0">
                        Fait
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
   
          <div className="pt-6 border-t border-white/5 text-[9px] text-zinc-500 font-bold tracking-wide uppercase">
            DMA Studio Workspace © 2026.<br />
            Le travail engendre la gloire.
          </div>
        </aside>

        {/* Main interactive display */}
        <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full pt-16 lg:pt-12 relative">
          
          <div className="space-y-6">
            
            {/* Header Title Board */}
            <div className="space-y-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-extrabold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-400 uppercase tracking-wider">
                  {course.level}
                </span>
                {course.badge && (
                  <span className="text-[9px] font-extrabold px-2.5 py-1 rounded bg-gold-400/10 border border-gold-400/20 text-gold-400 uppercase tracking-wider">
                    {course.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">{currentLesson.title}</h2>
            </div>

            {/* Premium Educational Workspace Menu */}
            <div className="flex gap-1.5 p-1 bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto">
              {[
                { id: 'video', label: '📺 Cours & Slow-Mo', disabled: !!currentLesson.quiz },
                { id: 'metronome', label: '🥁 Métronome Studio', disabled: !!currentLesson.quiz },
                { id: 'tabs', label: '🎼 Partitions / Tabs', disabled: !currentLesson.tablature || !!currentLesson.quiz },
                { id: 'technique', label: '✨ Conseils Techniques', disabled: !currentLesson.pedagogyTip },
                { id: 'notes', label: '📝 Bloc-notes Journal', disabled: !!currentLesson.quiz },
              ].map((tab) => (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => setActivePlayerTab(tab.id as any)}
                  className={`relative flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap disabled:opacity-20 disabled:cursor-not-allowed ${
                    activePlayerTab === tab.id
                      ? 'text-gold-400 font-extrabold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {activePlayerTab === tab.id && (
                    <motion.div
                      layoutId="player-tab-glow"
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                      transition={springTransition}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Main Interactive Screen */}
            <div className="min-h-[50vh]">
              <AnimatePresence mode="wait">
                
                {/* QUIZ STATE OVERRIDE - always displays on quiz lessons */}
                {currentLesson.quiz ? (
                  <motion.div 
                    key="quiz-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springTransition}
                    className="border border-gold-500/20 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-gold-400/5 rounded-full blur-3xl" />
                    
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-2 text-gold-400">
                        <Award className="w-5 h-5 text-gold-400 animate-bounce" />
                        <span className="text-xs font-black uppercase tracking-widest">Graduation Académique DMA</span>
                      </div>
                      <span className="text-[9px] bg-gold-400/10 border border-gold-400/20 text-gold-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        Validation finale
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Question Technique</span>
                        <p className="text-sm sm:text-base font-bold text-white leading-relaxed bg-zinc-950/80 border border-white/5 p-5 rounded-2xl shadow-inner font-sans">
                          {currentLesson.quiz.question}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {currentLesson.quiz.options.map((opt, i) => {
                          const isSelected = selectedQuizAns === i;
                          return (
                            <motion.button
                              key={i}
                              disabled={quizCompleted}
                              whileHover={!quizCompleted ? { scale: 1.01, x: 4 } : {}}
                              whileTap={!quizCompleted ? { scale: 0.99 } : {}}
                              onClick={() => setSelectedQuizAns(i)}
                              className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm border transition-all flex items-center justify-between gap-4 relative overflow-hidden ${
                                isSelected
                                  ? 'border-gold-500 bg-gold-500/5 text-white shadow-gold-glow-subtle'
                                  : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/15'
                              }`}
                            >
                              <span className="font-semibold z-10">{opt}</span>
                              
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 z-10 ${
                                isSelected ? 'border-gold-400 bg-gold-400/20' : 'border-white/10 bg-zinc-900'
                              }`}>
                                {isSelected && (
                                  <motion.span 
                                    layoutId="active-quiz-dot"
                                    className="w-2.5 h-2.5 rounded-full bg-gold-400 shadow-gold-glow"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  />
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {!quizCompleted ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={snappySpring}
                          disabled={selectedQuizAns === null}
                          onClick={handleQuizSubmit}
                          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Valider ma réponse
                        </motion.button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-4 space-y-4"
                        >
                          {quizCorrect ? (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
                                <Award className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div className="space-y-1 text-center sm:text-left">
                                <h4 className="font-black uppercase tracking-wider text-emerald-300">Cursus validé !</h4>
                                <p className="text-zinc-300 text-xs leading-relaxed">
                                  Félicitations, vous avez répondu correctement. Votre maîtrise technique de ce cursus est validée par l'académie DMA ! 🎉
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                  <X className="w-6 h-6 text-rose-400" />
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                  <h4 className="font-black uppercase tracking-wider text-rose-300">Oups, c'est raté !</h4>
                                  <p className="text-zinc-300 text-xs leading-relaxed">
                                    Ne vous découragez pas. Prenez le temps de réviser les vidéos précédentes en utilisant nos outils de bouclage A-B et de lecture ralentie avant de retenter.
                                  </p>
                                </div>
                              </div>
                              
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setQuizCompleted(false);
                                  setQuizCorrect(null);
                                  setSelectedQuizAns(null);
                                }}
                                className="w-full py-3.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-gold-500/20 text-xs font-bold text-white rounded-xl transition-all"
                              >
                                Retenter l'épreuve
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* TAB 1: VIDEO PLAYER & PRACTICE SPEED CONTROL */}
                    {activePlayerTab === 'video' && (
                      <motion.div
                        key="video-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="aspect-video w-full rounded-3xl border border-white/10 overflow-hidden bg-zinc-950 relative shadow-2xl group">
                          {currentLesson.videoUrl ? (
                            <div id="dma-youtube-player" className="w-full h-full border-none" />
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

                        {/* Speed controller & Looper Controls */}
                        {currentLesson.videoUrl && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Slow-mo Speed Board */}
                            <div className="glass-card bg-zinc-900/40 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-600 to-transparent opacity-30" />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-gold-400 font-extrabold uppercase tracking-wider block">
                                    Chronométrage & Pratique
                                  </span>
                                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Slow-Mo Practice Tool</h4>
                                </div>
                                <span className="text-xs font-mono font-bold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                                  {playbackSpeed}x
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                Ralentissez le tempo de visionnage pour décortiquer les fills et breaks de Josué au millième de seconde près.
                              </p>

                              <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-white/5 w-full justify-between">
                                {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                                  <motion.button
                                    key={speed}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                      playbackSpeed === speed
                                        ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian shadow-gold-glow font-black'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    {speed === 1.0 ? 'Normal' : `${speed}x`}
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Loop controller board */}
                            <div className="glass-card bg-zinc-900/40 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-gold-400 opacity-30" />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-gold-400 font-extrabold uppercase tracking-wider block">
                                    Entraînement Répétitif
                                  </span>
                                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Lecteur Boucle A-B</h4>
                                </div>
                                {isLooping && (
                                  <span className="flex items-center gap-1.5 text-[9px] text-rose-400 font-extrabold uppercase tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Actif
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-white/5 text-center">
                                <div className="space-y-0.5 border-r border-white/5">
                                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Point A (Début)</span>
                                  <span className={`text-xs font-mono font-black ${loopStart !== null ? 'text-gold-400' : 'text-zinc-600'}`}>
                                    {loopStart !== null ? formatTime(loopStart) : '--:--'}
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Point B (Fin)</span>
                                  <span className={`text-xs font-mono font-black ${loopEnd !== null ? 'text-gold-400' : 'text-zinc-600'}`}>
                                    {loopEnd !== null ? formatTime(loopEnd) : '--:--'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={setPointA}
                                  className="py-2.5 rounded-xl bg-zinc-950 border border-white/5 hover:border-gold-500/30 text-zinc-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5"
                                >
                                  <span className="text-gold-400 text-[10px] font-black">[ A ]</span>
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Début</span>
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={setPointB}
                                  className="py-2.5 rounded-xl bg-zinc-950 border border-white/5 hover:border-gold-500/30 text-zinc-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5"
                                >
                                  <span className="text-gold-400 text-[10px] font-black">[ B ]</span>
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Fin</span>
                                </motion.button>

                                <motion.button
                                  whileHover={loopStart !== null && loopEnd !== null ? { scale: 1.05 } : {}}
                                  whileTap={loopStart !== null && loopEnd !== null ? { scale: 0.95 } : {}}
                                  onClick={toggleLoop}
                                  disabled={loopStart === null || loopEnd === null}
                                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-20 disabled:cursor-not-allowed ${
                                    isLooping
                                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-black'
                                      : 'bg-zinc-950 border-white/5 hover:border-gold-500/30 text-zinc-300 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[10px]">{isLooping ? '⏹' : '🔄'}</span>
                                  <span className="text-[8px] uppercase font-bold">{isLooping ? 'Stop' : 'Boucle'}</span>
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={resetLoop}
                                  className="py-2.5 rounded-xl bg-zinc-950 border border-white/5 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5"
                                >
                                  <span className="text-[10px]">✕</span>
                                  <span className="text-[8px] uppercase font-bold">Reset</span>
                                </motion.button>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* About the lesson & Validation */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-zinc-900/20 border border-white/5 p-6 rounded-2xl shadow-inner">
                          <div className="md:col-span-8 space-y-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Description de la leçon</h3>
                            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                              {currentLesson.description}
                            </p>
                          </div>
                          <div className="md:col-span-4 w-full">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleMarkAsCompleted}
                              disabled={completedLessons.includes(currentLesson.id)}
                              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
                                completedLessons.includes(currentLesson.id)
                                  ? "bg-green-500/10 border-green-500/25 text-green-400 cursor-default"
                                  : "bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow border-transparent"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>{completedLessons.includes(currentLesson.id) ? "Leçon Déjà Validée ✓" : "Valider la leçon"}</span>
                            </motion.button>
                          </div>
                        </div>

                      </motion.div>
                    )}

                    {/* TAB 2: PRO METRONOME ENGINE */}
                    {activePlayerTab === 'metronome' && (
                      <motion.div
                        key="metronome-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-xl mx-auto w-full glass-card border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
                        
                        <div className="text-center">
                          <h3 className="text-white font-extrabold text-base flex items-center justify-center gap-2">
                            <Music className="w-5 h-5 text-gold-400 animate-spin-slow" />
                            <span>DMA STUDIO METRONOME</span>
                          </h3>
                          <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1 tracking-wider">
                            Régularité & Rigueur Académique
                          </p>
                        </div>

                        {/* Interactive Beat Visualizer Grid */}
                        <div className="flex flex-col gap-2 p-4 bg-zinc-950/80 rounded-2xl border border-white/5">
                          <div className="flex justify-center gap-2">
                            {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                              const isActive = activeBeatVisual === idx;
                              return (
                                <motion.div
                                  key={idx}
                                  animate={{
                                    scale: isActive ? 1.2 : 1.0,
                                    backgroundColor: isActive 
                                      ? isMutedMeasure
                                        ? '#3F3F46' 
                                        : idx === 0 ? '#F59E0B' : '#D4AF37' 
                                      : '#18181B',
                                    borderColor: isActive ? isMutedMeasure ? '#3F3F46' : '#D4AF37' : '#27272A',
                                    boxShadow: isActive && !isMutedMeasure ? '0 0 15px rgba(212, 175, 55, 0.45)' : 'none',
                                  }}
                                  transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                                  className="w-10 h-10 rounded-full border flex flex-col items-center justify-center font-mono text-xs font-black text-zinc-300 select-none relative"
                                >
                                  <span>{idx + 1}</span>
                                  {isActive && subdivision > 1 && (
                                    <div className="absolute -bottom-2.5 flex gap-1 justify-center">
                                      {Array.from({ length: subdivision }).map((_, sIdx) => (
                                        <div 
                                          key={sIdx}
                                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                                            activeSubdivisionVisual === sIdx ? 'bg-white scale-125 shadow-sm' : 'bg-white/35'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* BPM Dial Panel */}
                        <div className="py-4 space-y-1 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center shadow-inner">
                          <h2 className="text-5xl font-black tracking-tighter text-white font-mono leading-none flex items-baseline">
                            {bpm}
                            <span className="text-xs text-gold-400 font-bold ml-1 uppercase">BPM</span>
                          </h2>
                          
                          {speedTrainer && metronomePlaying && (
                            <div className="flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-[9px] text-gold-400 font-black uppercase tracking-wider animate-pulse">
                              <TrendingUp className="w-3 h-3" />
                              <span>Train : Mesure {measuresCount} / {speedTrainerInterval}</span>
                            </div>
                          )}
                        </div>

                        {/* Slider control */}
                        <div className="space-y-2">
                          <input
                            type="range"
                            min={40}
                            max={240}
                            value={bpm}
                            onChange={(e) => setBpm(parseInt(e.target.value))}
                            className="w-full cursor-pointer accent-gold-400 h-1.5 bg-zinc-950 rounded-lg appearance-none border border-white/5"
                          />
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 font-extrabold uppercase px-1">
                            <span>40 grave</span>
                            <span>120 modéré</span>
                            <span>240 rapide</span>
                          </div>
                        </div>

                        {/* Fine tuning Buttons */}
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => setBpm(prev => Math.max(40, prev - 5))}
                            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => setBpm(prev => Math.max(40, prev - 1))}
                            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => setBpm(120)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95 animate-pulse"
                          >
                            Std (120)
                          </button>
                          <button
                            onClick={() => setBpm(prev => Math.min(240, prev + 1))}
                            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => setBpm(prev => Math.min(240, prev + 5))}
                            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-[10px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                          >
                            +5
                          </button>
                        </div>

                        {/* Presets and rhythms panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          
                          {/* Left: Signature & Subdivision dropdowns */}
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-extrabold uppercase block">Métrique</label>
                              <select
                                value={beatsPerMeasure}
                                onChange={(e) => setBeatsPerMeasure(parseInt(e.target.value))}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40 font-semibold"
                              >
                                <option value={4}>4/4 (Standard)</option>
                                <option value={3}>3/4 (Valse)</option>
                                <option value={5}>5/4 (Asymétrique chop)</option>
                                <option value={6}>6/8 (Ternaire)</option>
                                <option value={7}>7/8 (Odd subdivisions)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-extrabold uppercase block">Subdivision</label>
                              <select
                                value={subdivision}
                                onChange={(e) => {
                                  setSubdivision(parseInt(e.target.value));
                                  setRhythmPreset('standard');
                                }}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40 font-semibold"
                              >
                                <option value={1}>Noires (1)</option>
                                <option value={2}>Croches (2)</option>
                                <option value={3}>Triolets (3)</option>
                                <option value={4}>Double croches (4)</option>
                              </select>
                            </div>
                          </div>

                          {/* Right: Sound style & presets */}
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-extrabold uppercase block">Timbre Acoustique</label>
                              <select
                                value={soundStyle}
                                onChange={(e) => setSoundStyle(e.target.value as any)}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40 font-semibold"
                              >
                                <option value="digital">Digital Synth</option>
                                <option value="woodblock">Woodblock Naturel</option>
                                <option value="stick">Baguettes (Clicks)</option>
                                <option value="cowbell">Cloche (Cowbell Pro)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-extrabold uppercase block">Style & Presets</label>
                              <select
                                value={rhythmPreset}
                                onChange={(e) => {
                                  const pres = e.target.value as any;
                                  setRhythmPreset(pres);
                                  if (pres === 'shuffle') {
                                    setSubdivision(3);
                                    setBeatsPerMeasure(4);
                                  } else if (['clave32', 'clave23', 'afrobeats'].includes(pres)) {
                                    setSubdivision(4);
                                    setBeatsPerMeasure(4);
                                  }
                                }}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40 font-semibold"
                              >
                                <option value="standard">Aucun Preset (Std)</option>
                                <option value="shuffle">Shuffle / Triolets</option>
                                <option value="clave32">Clave Salsa (3:2)</option>
                                <option value="clave23">Clave Son (2:3)</option>
                                <option value="afrobeats">Afrobeats syncopé</option>
                              </select>
                            </div>
                          </div>

                        </div>

                        {/* Gap Click (Silent measures trainer) & Speed Trainer setup */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          
                          {/* Speed Trainer Toggle */}
                          <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Speed Trainer</span>
                              <input 
                                type="checkbox" 
                                checked={speedTrainer} 
                                onChange={(e) => setSpeedTrainer(e.target.checked)}
                                className="accent-gold-400 cursor-pointer"
                              />
                            </div>
                            <p className="text-[9px] text-zinc-500">Accélère le tempo à chaque intervalle de mesures.</p>
                            
                            {speedTrainer && (
                              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Mesures</span>
                                  <input 
                                    type="number" 
                                    value={speedTrainerInterval} 
                                    onChange={(e) => setSpeedTrainerInterval(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-white text-center"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">+ BPM</span>
                                  <input 
                                    type="number" 
                                    value={speedTrainerStep} 
                                    onChange={(e) => setSpeedTrainerStep(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-white text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Gap Click (Internal Timing) */}
                          <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">Gap Click</span>
                              <input 
                                type="checkbox" 
                                checked={gapClick} 
                                onChange={(e) => setGapClick(e.target.checked)}
                                className="accent-gold-400 cursor-pointer"
                              />
                            </div>
                            <p className="text-[9px] text-zinc-500">Mute le métronome pour tester votre régularité interne.</p>
                            
                            {gapClick && (
                              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Joué</span>
                                  <input 
                                    type="number" 
                                    value={gapClickPlay} 
                                    onChange={(e) => setGapClickPlay(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-white text-center"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Muet</span>
                                  <input 
                                    type="number" 
                                    value={gapClickMute} 
                                    onChange={(e) => setGapClickMute(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-white text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* PLAY & TAP CONTROLS */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={toggleMetronome}
                            className={`h-14 rounded-2xl font-bold tracking-wider text-sm transition-all flex items-center justify-center gap-2 active:scale-95 border uppercase ${
                              metronomePlaying
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow border-transparent font-black'
                            }`}
                          >
                            {metronomePlaying ? (
                              <>
                                <Square className="w-4 h-4 fill-current shrink-0" /> STOP
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current shrink-0" /> PLAY
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={handleTapTempo}
                            className={`h-14 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                              tapActive
                                ? 'bg-gold-500 border-gold-500 text-obsidian font-extrabold'
                                : 'border-zinc-800 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 hover:bg-white/5'
                            }`}
                          >
                            Tap Tempo 🥁
                          </button>
                        </div>

                      </motion.div>
                    )}

                    {/* TAB 3: MONOSPACED DRUM TABS & SCORES */}
                    {activePlayerTab === 'tabs' && currentLesson.tablature && (
                      <motion.div
                        key="tabs-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="glass-card border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-600 to-transparent" />
                          <div className="flex items-center gap-2 mb-4 text-gold-400">
                            <BookOpen className="w-5 h-5 shrink-0" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Partition & Tablature de Batterie</h3>
                          </div>
                          
                          <p className="text-[10px] text-zinc-500 mb-6 font-medium leading-relaxed">
                            Suivez la tablature ci-dessous en synchronisant vos frappes. Configurez le métronome DMA dans l'onglet dédié pour vous caler sur la vitesse recommandée.
                          </p>

                          {/* Render Tab Sheet Monospace */}
                          <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-5 overflow-x-auto shadow-inner relative group/tab">
                            <div className="absolute top-2 right-2 text-[8px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded border border-white/5 font-mono uppercase">
                              Monospace Drum notation
                            </div>
                            <pre className="font-mono text-xs text-gold-400 leading-relaxed overflow-x-auto whitespace-pre font-bold select-all">
                              {currentLesson.tablature}
                            </pre>
                          </div>

                          {/* Key notations guide */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-[10px] font-medium text-zinc-500">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-xs font-bold border border-white/5">H</span>
                              <span>Hi-Hat (Charleston)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-xs font-bold border border-white/5">S</span>
                              <span>Snare (Caisse Claire)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-xs font-bold border border-white/5">B</span>
                              <span>Bass Drum (Grosse Caisse)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center font-mono text-gold-400 text-xs font-bold border border-white/5">Ride</span>
                              <span>Cymbale Ride / Dôme</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 4: PEDAGOGY TIPS & COACH ADVICE */}
                    {activePlayerTab === 'technique' && currentLesson.pedagogyTip && (
                      <motion.div
                        key="technique-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-gold-950/20 via-zinc-900/40 to-transparent border border-gold-500/10 border-l-4 border-l-gold-500 shadow-[0_4px_25px_rgba(212,175,55,0.02)] flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden">
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-400/5 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center shrink-0 shadow-gold-glow-subtle mt-0.5 border border-gold-400/20">
                            <Sparkles className="w-5 h-5 text-obsidian" />
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                              Conseil Pédagogique de Josué ADETI
                            </h4>
                            <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-semibold font-sans">
                              "{currentLesson.pedagogyTip}"
                            </p>
                          </div>
                        </div>

                        {/* Technical checklist */}
                        <div className="glass-card border border-white/10 p-6 rounded-3xl space-y-4">
                          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-gold-400" />
                            <span>Checklist technique pour cette leçon</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-medium">Cochez les concepts validés lors de vos répétitions.</p>
                          
                          <ul className="space-y-3 mt-4">
                            {[
                              "Régularité rythmique avec le click DMA",
                              "Posture du buste et épaules détendues",
                              "Nuance dynamique (équilibre fort/faible)",
                              "Clarté des impacts mains / pieds",
                            ].map((checkItem, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-xs text-zinc-300 font-semibold bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                                <input type="checkbox" className="accent-gold-400 w-4 h-4 cursor-pointer mt-0.5 rounded" />
                                <span>{checkItem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 5: STUDENT PERSISTENT NOTEPAD */}
                    {activePlayerTab === 'notes' && (
                      <motion.div
                        key="notes-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="glass-card border border-white/10 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookMarked className="w-5 h-5 text-gold-400 shrink-0" />
                              <h3 className="text-xs font-black uppercase tracking-widest text-white">Journal de Notes Personnel</h3>
                            </div>
                            <span className="text-[8px] bg-zinc-900 text-zinc-500 font-bold px-2 py-0.5 rounded border border-white/5">
                              Persistant local
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                            Consignez vos remarques de travail, vos tempos max, vos objectifs de pratique hebdomadaires ou vos blocages. Vos notes sont sauvegardées automatiquement pour chaque leçon sur votre appareil.
                          </p>

                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Exemple : Travaillé le paradiddle à 95 BPM aujourd'hui. Attention à bien accenter la première note et à garder la pince Moeller souple..."
                            rows={6}
                            className="w-full bg-zinc-950/90 text-zinc-200 placeholder-zinc-600 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-gold-500/40 leading-relaxed font-sans shadow-inner"
                          />

                          <div className="flex justify-end pt-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSaveNotes}
                              className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-gold-glow border-none"
                            >
                              <Save className="w-4 h-4 shrink-0" />
                              <span>Enregistrer ma note</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* Celebration Achievement Overlay */}
          <AnimatePresence>
            {showGraduationCelebration && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 30, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: -30, opacity: 0 }}
                  transition={springTransition}
                  className="glass-card max-w-md w-full p-8 text-center border border-gold-500/40 shadow-gold-glow flex flex-col items-center gap-6 relative overflow-hidden"
                >
                  {/* Decorative shines */}
                  <div className="absolute -top-16 -left-16 w-36 h-36 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center border border-gold-400/30 shadow-gold-glow animate-bounce shrink-0">
                    <Trophy className="w-10 h-10 text-obsidian" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-widest block">SUCCÈS DÉVERROUILLÉ</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">FÉLICITATIONS !</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                      Vous avez validé avec succès l'étape de cours de <strong>{currentLesson.title}</strong>. Josué est fier de votre persévérance rythmique !
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowGraduationCelebration(false);
                      // Auto-advance to next lesson if available
                      const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
                      if (currentIndex < course.lessons.length - 1) {
                        handleLessonClick(course.lessons[currentIndex + 1]);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-black uppercase tracking-wider text-xs py-3.5 rounded-xl shadow-gold-glow border-none"
                  >
                    Continuer le cursus ➔
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </PageTransition>
  );
};
