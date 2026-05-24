export interface Lesson {
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

export interface CourseData {
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
