import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ResetPassword: React.FC = () => {
  const { changePassword, user, supabaseConnected } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // If no email param found and not logged in, warn and redirect
      showToast("Accès non autorisé. Paramètre e-mail manquant.", "error");
      navigate('/login');
    }
  }, [searchParams, user, navigate, showToast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      if (supabaseConnected) {
        // Direct Supabase password update
        const res = await changePassword('', password);
        if (!res.success) {
          const errMsg = res.message || "Une erreur est survenue.";
          setError(errMsg);
          showToast(errMsg, "error");
        } else {
          setSuccess(true);
          showToast("Mot de passe mis à jour avec succès !", "success");
        }
      } else {
        // Simulated local database sync update
        const usersData = localStorage.getItem('dma_users_db');
        if (usersData) {
          const users = JSON.parse(usersData);
          const encoder = new TextEncoder();
          const data = encoder.encode(password);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashedNew = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (idx !== -1) {
            users[idx].password = hashedNew;
            localStorage.setItem('dma_users_db', JSON.stringify(users));
            
            // Check if current session belongs to this user, sync session too
            const currentSession = localStorage.getItem('dma_current_session');
            if (currentSession) {
              const sessionObj = JSON.parse(currentSession);
              if (sessionObj.email.toLowerCase() === email.toLowerCase()) {
                sessionObj.password = hashedNew;
                localStorage.setItem('dma_current_session', JSON.stringify(sessionObj));
              }
            }

            setSuccess(true);
            showToast("Simulation locale : Mot de passe réinitialisé !", "success");
          } else {
            setError("Compte étudiant introuvable.");
          }
        } else {
          setError("Aucun utilisateur enregistré localement.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 border border-white/5 bg-zinc-900/40 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          {!success ? (
            <>
              <div className="text-center mb-8">
                <span className="text-lg font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-gold-600 to-gold-300">
                  DRUM MASTER
                </span>
                <h2 className="text-2xl font-bold text-white mt-4">
                  Nouveau <span className="text-gold-400">Mot de passe</span>
                </h2>
                <p className="text-zinc-400 text-xs mt-2">
                  Compte associé : <span className="text-zinc-300 font-medium">{email}</span>
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 pl-10 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ressaisir le mot de passe"
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold py-3 rounded-lg text-sm font-bold disabled:opacity-50 mt-6"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe 🔒'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Mot de passe sécurisé !</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                  Votre mot de passe a été modifié avec succès. Vous pouvez maintenant accéder à votre tableau de bord.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-gold py-3 rounded-lg text-sm font-bold mt-4"
              >
                Se connecter maintenant 🚀
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
