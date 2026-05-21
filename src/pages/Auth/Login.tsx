import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        showToast("Ravi de vous revoir sur la Drum Master Academy ! 🥁", "success");
        navigate('/dashboard');
      } else {
        setErrorMsg(res.message || "Identifiants incorrects. Veuillez réessayer.");
        showToast(res.message || "Échec de l'authentification.", "error");
      }
    } catch (err: any) {
      setErrorMsg("Une erreur s'est produite lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setErrorMsg(null);
    const demoEmail = 'demo@dma.com';
    const demoPass = 'password123';

    try {
      // Simulate/Trigger auto register for demo if not exist
      const localUsersData = localStorage.getItem('dma_users_db');
      const localUsers = localUsersData ? JSON.parse(localUsersData) : [];
      const demoExists = localUsers.some((u: any) => u.email.toLowerCase() === demoEmail.toLowerCase());

      if (!demoExists) {
        // Create demo user locally first
        await register('Batteur Passionné', demoEmail, demoPass);
        
        // Mark onboarding complete for this demo user immediately
        const freshUsersData = localStorage.getItem('dma_users_db');
        const freshUsers = freshUsersData ? JSON.parse(freshUsersData) : [];
        const idx = freshUsers.findIndex((u: any) => u.email.toLowerCase() === demoEmail.toLowerCase());
        if (idx !== -1) {
          freshUsers[idx].setupCompleted = true;
          freshUsers[idx].enrolledCourses = ['gospel', 'rythmes', 'rudiments'];
          freshUsers[idx].level = 'intermediate';
          freshUsers[idx].interests = ['Gospel', 'Funk', 'Fusion'];
          localStorage.setItem('dma_users_db', JSON.stringify(freshUsers));
        }
      }

      const res = await login(demoEmail, demoPass);
      if (res.success) {
        showToast("⚡ Connexion démo activée avec succès !", "success");
        navigate('/dashboard');
      } else {
        setErrorMsg("Erreur lors de l'accès démo rapide.");
      }
    } catch (err) {
      setErrorMsg("Une erreur s'est produite avec l'accès Démo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(212, 175, 55, 0.04) 0px, transparent 65%) pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('assets/images/josue_5.jpg')" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="glass-card bg-obsidian-card/75 border border-white/5 hover:border-gold-500/20 p-8 sm:p-10 rounded-2xl relative shadow-2xl overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-gold-600 before:to-gold-400">
          
          <div className="text-center space-y-4 mb-8">
            <Link to="/" className="inline-block relative group">
              <img 
                src="/assets/images/logo.jpg" 
                alt="DMA Logo" 
                className="w-16 h-16 rounded-full border-2 border-gold-500 shadow-lg group-hover:scale-105 transition-transform" 
              />
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full p-1 border border-obsidian text-obsidian">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </Link>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Connexion <span className="text-gold-400">Étudiant</span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">Accédez à votre espace d'apprentissage d'élite</p>
            </div>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 mb-6"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Adresse Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder="votre@email.com"
                  className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-gold-500/40 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-gold-500/40 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded bg-zinc-950 border-white/10 text-gold-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4" 
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
              
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="btn-gold-outline w-full border-gold-500/40 text-gold-400 hover:bg-gold-500/5 py-3 px-4 text-sm font-semibold transition-all"
              >
                ⚡ Connexion Rapide Démo
              </button>
            </div>
          </form>

          <div className="auth-footer mt-8 text-center text-xs text-zinc-500 border-t border-white/5 pt-6">
            Pas encore étudiant ?{" "}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-bold transition-colors">
              Rejoindre l'Académie
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
