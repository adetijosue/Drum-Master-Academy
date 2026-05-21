import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Trash2, KeyRound, ChevronLeft, ChevronRight, 
  ShieldAlert, Award, BookOpen, BarChart3 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DeleteAccount: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [deleteReason, setDeleteReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [acceptConsequences, setAcceptConsequences] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // User metrics calculation
  const [metrics, setMetrics] = useState({
    activeCourses: 0,
    progressAvg: 0,
    lessonsCount: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate metrics based on user session
    let activeCourses = user.enrolledCourses?.length || 0;
    let totalProgressSum = 0;
    let totalLessonsCompleted = 0;

    if (user.courseProgress) {
      const courses = Object.keys(user.courseProgress);
      activeCourses = Math.max(activeCourses, courses.length);
      courses.forEach(cId => {
        const progress = user.courseProgress[cId];
        const completedCount = progress?.completedLessons?.length || 0;
        totalLessonsCompleted += completedCount;
        
        // Estimate progress percent (6 lessons per course on average)
        const totalLessonsForCourse = 6;
        const pct = Math.min(100, Math.round((completedCount / totalLessonsForCourse) * 100));
        totalProgressSum += pct;
      });
    }

    const avgProgress = activeCourses > 0 ? Math.round(totalProgressSum / activeCourses) : 0;

    setMetrics({
      activeCourses,
      progressAvg: avgProgress,
      lessonsCount: totalLessonsCompleted
    });
  }, [user, navigate]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmKeyword.trim().toUpperCase() !== 'SUPPRIMER') {
      showToast("Le mot clé saisi est incorrect.", "error");
      return;
    }

    if (!password) {
      showToast("Veuillez saisir votre mot de passe actuel.", "error");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount(password);
      if (res.success) {
        setCurrentStep(4);
        showToast("Votre compte a été définitivement supprimé. Adieu !", "info");
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 4000);
      } else {
        showToast(res.message || "Erreur de mot de passe ou de serveur.", "error");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur inattendue est survenue.", "error");
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  const pct = currentStep === 1 ? 33 : currentStep === 2 ? 66 : currentStep === 3 ? 90 : 100;
  const stepTitles = [
    "Raison du départ",
    "Conséquences",
    "Validation finale",
    "Adieu Batteur"
  ];

  return (
    <div className="min-h-screen text-zinc-100 font-sans pb-24 relative overflow-hidden flex flex-col justify-center">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 w-full pt-12 relative z-10">
        
        {/* Navigation back and logo */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mb-8">
            <Link to="/settings" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span>Retourner aux Paramètres</span>
            </Link>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white select-none">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span>DMA.</span>
            </div>
          </div>
        )}

        <div className="glass-card border border-red-500/10 bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          
          {/* Top Progress bar */}
          {currentStep < 4 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span>Étape {currentStep} sur 3 : {stepTitles[currentStep - 1]}</span>
                <span className="text-red-400 font-extrabold">{pct}% complété</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                    Pourquoi souhaitez-vous nous quitter ? 🥁
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Vos remarques nous aident à nous améliorer de jour en jour. Dites-nous ce qui vous pousse à partir.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'time', label: "Je manque de temps pour pratiquer", desc: "L'apprentissage de la batterie demande un investissement de temps que je ne peux plus fournir." },
                    { id: 'budget', label: "Les tarifs ne correspondent pas à mon budget", desc: "Je cherche des cours ou solutions gratuites ou moins onéreuses." },
                    { id: 'difficulty', label: "Les cours sont trop difficiles / pas assez guidés", desc: "J'ai du mal à progresser seul devant mon écran sans accompagnateur physique." },
                    { id: 'other', label: "Autre raison", desc: "Mon motif ne figure pas parmi les options ci-dessus." }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setDeleteReason(option.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                        deleteReason === option.id
                          ? 'border-red-500 bg-red-500/5'
                          : 'border-white/5 bg-zinc-950/20 hover:border-white/10'
                      }`}
                    >
                      <div className="mt-1 flex items-center justify-center shrink-0">
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                          deleteReason === option.id ? 'border-red-500 text-red-500' : 'border-zinc-700'
                        }`}>
                          {deleteReason === option.id && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-semibold text-white">{option.label}</h4>
                        <p className="text-[11px] text-zinc-500 leading-normal">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {deleteReason === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                      Pouvez-vous nous en dire plus ? (Facultatif)
                    </label>
                    <textarea
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      rows={3}
                      placeholder="Décrivez votre expérience ou suggestion..."
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-sm resize-none"
                    />
                  </motion.div>
                )}

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!deleteReason}
                    className="btn-gold py-2.5 px-6 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
                  >
                    <span>Continuer</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-red-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <span>Attention aux données perdues !</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Si vous supprimez votre compte aujourd'hui, vous perdrez instantanément et définitivement l'ensemble de votre parcours d'apprentissage.
                  </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center font-extrabold text-lg text-white">
                      {(user.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">{user.name || "Étudiant DMA"}</h3>
                      <p className="text-zinc-500 text-xs">{user.email}</p>
                    </div>
                  </div>

                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Votre bilan d'apprentissage actuel :</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3.5 text-center">
                      <BookOpen className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                      <span className="text-base font-extrabold text-white block">{metrics.activeCourses}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Formations rejointes</span>
                    </div>

                    <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3.5 text-center">
                      <BarChart3 className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                      <span className="text-base font-extrabold text-white block">{metrics.progressAvg}%</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Progression moyenne</span>
                    </div>

                    <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3.5 text-center col-span-2">
                      <Award className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                      <span className="text-base font-extrabold text-white block">{metrics.lessonsCount}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Modules & leçons validées</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-zinc-500">
                    ⚠️ Les messages et publications postés sur la communauté seront également anonymisés ou purgés.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="accept-consequences"
                    checked={acceptConsequences}
                    onChange={(e) => setAcceptConsequences(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor="accept-consequences" className="text-zinc-400 text-xs leading-relaxed cursor-pointer select-none">
                    Je certifie avoir pris connaissance des conséquences irréversibles de cette suppression de compte et j'accepte de perdre définitivement toute ma progression et mes accès à la Drum Master Academy.
                  </label>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs font-bold border border-white/5 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    disabled={!acceptConsequences}
                    className="py-2.5 px-6 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Continuer</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <span>Validation de Sécurité 🔒</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Confirmez votre mot de passe et recopiez la clé de sécurité pour valider la suppression définitive de votre compte.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Saisissez votre mot de passe actuel :
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-red-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Pour confirmer l'irrévocabilité, saisissez le mot clé <span className="text-red-500 font-extrabold">SUPPRIMER</span> :
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmKeyword}
                      onChange={(e) => setConfirmKeyword(e.target.value)}
                      placeholder="SUPPRIMER"
                      className="w-full bg-zinc-950/80 border border-red-500/20 rounded-xl px-4 py-3.5 text-center font-bold tracking-widest text-red-500 placeholder-red-900/40 focus:outline-none focus:border-red-500 text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-4 items-center justify-between">
                  <button
                    onClick={handlePrevStep}
                    disabled={isDeleting}
                    className="px-5 py-2.5 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-xs font-bold border border-white/5 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>

                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || !password || confirmKeyword.trim().toUpperCase() !== 'SUPPRIMER'}
                    className="flex-grow py-3.5 px-6 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white disabled:from-zinc-900 disabled:to-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 border border-red-500/20 shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>SUPPRESSION DU COMPTE...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Confirmer la suppression définitive</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl"
                >
                  🥁
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-gold-400">Adieu, Batteur !</h2>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Votre compte a été supprimé avec succès. Merci d'avoir partagé votre passion du groove avec la <strong className="text-white">Drum Master Academy</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-10 h-10 border-2 border-zinc-800 border-t-gold-500 rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Redirection vers la page d'accueil...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
