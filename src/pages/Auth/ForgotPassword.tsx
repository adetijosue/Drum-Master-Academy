import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const { resetPassword, supabaseConnected } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [simulatedInbox, setSimulatedInbox] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setEmailSent(true);
        showToast(
          supabaseConnected 
            ? "Lien de réinitialisation envoyé par e-mail !" 
            : "Simulation locale activée pour la réinitialisation !", 
          'success'
        );
        
        // Show simulated inbox if Supabase is offline/not connected
        if (!supabaseConnected) {
          setTimeout(() => {
            setSimulatedInbox(true);
          }, 800);
        }
      } else {
        showToast(res.message || "Erreur lors de l'envoi de l'e-mail.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur inattendue est survenue.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 border border-white/5 bg-zinc-900/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
          
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-2 mb-6 group">
              <img 
                src="/assets/images/logo.jpg" 
                alt="DMA Logo" 
                className="w-14 h-14 rounded-full border border-gold-500/40 shadow-gold-glow group-hover:scale-105 transition-transform" 
              />
              <span className="text-xs font-bold tracking-widest font-sans text-zinc-300 group-hover:text-gold-400 transition-colors">
                DRUM MASTER ACADEMY
              </span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans">
              Mot de passe <span className="text-gold-400">oublié</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2">
              Saisissez votre e-mail pour réinitialiser vos accès
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!emailSent ? (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      spellCheck="false"
                      placeholder="votre@email.com"
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors text-sm sm:text-base"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] text-zinc-500 block leading-normal">
                    Nous vous enverrons un lien sécurisé de réinitialisation.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer le lien</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success-box"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="inline-flex p-3 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Vérifiez vos e-mails !</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Un lien de réinitialisation sécurisé a été généré pour <span className="text-zinc-200 font-semibold">{email}</span>.
                  </p>
                </div>

                {simulatedInbox && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-left border border-gold-500/30 bg-zinc-950 rounded-xl p-5 shadow-gold-glow/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gold-500/50" />
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gold-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Simulateur de Boîte Mail</span>
                      </div>
                      <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                        1 Nouveau Message
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[11px] text-zinc-500">
                        <div><strong className="text-zinc-400">De:</strong> support@drummasteracademy.com</div>
                        <div className="mt-0.5"><strong className="text-zinc-400">Objet:</strong> Réinitialisation de votre mot de passe</div>
                      </div>
                      <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg text-xs leading-relaxed text-zinc-300">
                        Bonjour,<br /><br />
                        Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe d'accès étudiant :
                        <Link
                          to={`/reset-password?email=${encodeURIComponent(email)}`}
                          className="mt-3 block w-full text-center bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-bold py-2 rounded-md hover:from-gold-500 hover:to-gold-300 transition-colors"
                        >
                          Réinitialiser mon mot de passe 🔑
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-gold-400 transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner à la connexion</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
