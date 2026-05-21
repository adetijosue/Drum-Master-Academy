import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Image as ImageIcon, CheckCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: { text: string; points: number }[];
}

export const SetupProfile: React.FC = () => {
  const { user, updateProfile, updateAvatar } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  
  // Quiz evaluation state
  const [currentQ, setCurrentQ] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  // Interests selection
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.setupCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Qu'est-ce qu'un \"Paradiddle\" ?",
      options: [
        { text: "Un type de cymbale", points: 0 },
        { text: "Un rudiment alternant coups simples et doubles (D-G-D-D / G-D-G-G)", points: 1 },
        { text: "Une technique de pédale de grosse caisse", points: 0 }
      ]
    },
    {
      id: 2,
      question: "Dans une mesure en 4/4, combien y a-t-il de croches ?",
      options: [
        { text: "4 croches", points: 0 },
        { text: "8 croches", points: 1 },
        { text: "16 croches", points: 0 }
      ]
    },
    {
      id: 3,
      question: "Qu'est-ce que le \"Ghost Note\" ?",
      options: [
        { text: "Une note jouée très doucement, presque inaudible, apportant de la texture", points: 1 },
        { text: "Une note qu'on oublie de jouer", points: 0 },
        { text: "Une technique de Jazz uniquement", points: 0 }
      ]
    },
    {
      id: 4,
      question: "Quelle partie de la batterie produit le son le plus grave ?",
      options: [
        { text: "Le Tom Basse", points: 0 },
        { text: "La Grosse Caisse (Bass Drum)", points: 1 },
        { text: "La Caisse Claire", points: 0 }
      ]
    },
    {
      id: 5,
      question: "Lequel de ces styles utilise le plus souvent la polyrythmie ?",
      options: [
        { text: "L'Afro-beat / Jazz Fusion", points: 1 },
        { text: "Le Punk Rock", points: 0 },
        { text: "La Variété française", points: 0 }
      ]
    }
  ];

  const availableStyles = ['Gospel', 'Jazz', 'Afro-beat', 'Funk', 'Rock', 'Fusion', 'Latin'];

  // Compress and process photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoBase64(base64);
          showToast("Photo importée et optimisée avec succès !", "success");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextQuiz = () => {
    if (selectedAns === null) {
      showToast("Veuillez sélectionner une réponse.", "error");
      return;
    }

    const currentPoints = quizQuestions[currentQ].options[selectedAns].points;
    setQuizScore(prev => prev + currentPoints);
    setSelectedAns(null);

    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Calculate level
      const finalScore = quizScore + currentPoints;
      let calculatedLevel = 'beginner';
      if (finalScore >= 4) calculatedLevel = 'advanced';
      else if (finalScore >= 2) calculatedLevel = 'intermediate';

      showToast(`Évaluation terminée ! Score : ${finalScore}/5. Niveau : ${calculatedLevel.toUpperCase()}`, "success");
      setStep(3);
    }
  };

  const toggleInterest = (style: string) => {
    if (interests.includes(style)) {
      setInterests(prev => prev.filter(i => i !== style));
    } else {
      setInterests(prev => [...prev, style]);
    }
  };

  const handlePostpone = async () => {
    if (window.confirm("Souhaitez-vous reporter la configuration ? Vous pourrez le faire plus tard depuis vos paramètres.")) {
      try {
        await updateProfile(undefined, undefined, undefined, { setupPostponed: true });
        showToast("Onboarding reporté. Bienvenue à la DMA !", "success");
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (photoBase64) {
        await updateAvatar(photoBase64);
      }

      let evaluatedLevel = 'beginner';
      if (quizScore >= 4) evaluatedLevel = 'advanced';
      else if (quizScore >= 2) evaluatedLevel = 'intermediate';

      const res = await updateProfile(user?.name, evaluatedLevel, interests, {
        setupCompleted: true
      });

      if (res.success) {
        showToast("Votre profil étudiant a été configuré avec succès !", "success");
        navigate('/dashboard');
      } else {
        showToast(res.message || "Erreur de configuration.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur inattendue lors de la configuration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="glass-card p-8 sm:p-10 border border-white/5 bg-zinc-900/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
          
          <div className="flex justify-center gap-1.5 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-gold-400' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-2">
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">Étape 1 sur 3</span>
                  <h2 className="text-2xl font-bold text-white">Personnalisez votre <span className="text-gold-400">Profil</span></h2>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    Une photo permet aux autres étudiants et au coach de vous reconnaître dans la communauté.
                  </p>
                </div>

                <div className="py-4">
                  <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-gold-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-28 h-28 rounded-full bg-zinc-950 border-2 border-gold-500/40 flex items-center justify-center overflow-hidden relative shadow-inner">
                      {photoBase64 ? (
                        <img src={photoBase64} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-zinc-600" />
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-gold-500 bg-zinc-900 text-zinc-300 hover:text-white transition-all text-xs font-semibold">
                      <ImageIcon className="w-4 h-4" />
                      <span>Parcourir une image</span>
                      <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </label>
                    <span className="text-[10px] text-zinc-500">Formats JPEG/PNG. Compression automatique.</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full btn-gold py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <span>Continuer vers le questionnaire</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePostpone}
                    className="text-xs text-zinc-500 hover:text-gold-400 transition-colors font-medium"
                  >
                    Plus tard, je le ferai depuis mes paramètres →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">Étape 2 sur 3</span>
                  <h2 className="text-2xl font-bold text-white">Évaluation <span className="text-gold-400">Technique</span></h2>
                  <p className="text-zinc-400 text-xs">
                    Question {currentQ + 1} sur 5. Évaluez votre niveau rythmique actuel.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-sm font-bold text-zinc-200 leading-relaxed bg-zinc-950/60 p-4 border border-white/5 rounded-xl">
                    {quizQuestions[currentQ].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQ].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAns(idx)}
                        className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm border transition-all flex items-center justify-between gap-4 ${
                          selectedAns === idx
                            ? 'border-gold-500 bg-gold-500/5 text-white'
                            : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10 hover:bg-zinc-950/60'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {selectedAns === idx && <CheckCircle className="w-4 h-4 text-gold-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button
                    onClick={() => {
                      if (currentQ > 0) {
                        setCurrentQ(prev => prev - 1);
                      } else {
                        setStep(1);
                      }
                    }}
                    className="flex-1 py-3 border border-white/10 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                  <button
                    onClick={handleNextQuiz}
                    className="flex-1 btn-gold py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {currentQ === quizQuestions.length - 1 ? 'Terminer le quiz' : 'Suivant'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">Étape 3 sur 3</span>
                  <h2 className="text-2xl font-bold text-white">Vos styles <span className="text-gold-400">Préférés</span></h2>
                  <p className="text-zinc-400 text-xs">
                    Sélectionnez les genres musicaux qui vous passionnent.
                  </p>
                </div>

                <div className="py-4 text-center">
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {availableStyles.map((style) => {
                      const isSelected = interests.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleInterest(style)}
                          className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian border-gold-500 font-bold shadow-gold-glow/10'
                              : 'bg-zinc-950/60 text-zinc-400 border-white/5 hover:border-white/10 hover:text-zinc-200'
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-white/10 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 btn-gold py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                        <span>Création du profil...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Terminer</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
