import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Sparkles, AlertCircle, CheckCircle, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Register: React.FC = () => {
  const { register, supabaseConnected } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await register(name, email, password);
      if (res.success) {
        if (supabaseConnected) {
          setSuccessMsg("Un e-mail de confirmation a été envoyé à votre adresse ! Veuillez valider votre e-mail afin de vous connecter.");
          showToast("Inscription enregistrée ! Veuillez vérifier vos e-mails.", "success");
        } else {
          showToast("Inscription réussie en mode simulation ! Démarrez l'onboarding. 🥁", "success");
          navigate('/setup-profile');
        }
      } else {
        setErrorMsg(res.message || "Erreur lors de l'inscription. Veuillez réessayer.");
        showToast(res.message || "Échec de l'inscription.", "error");
      }
    } catch (err) {
      setErrorMsg("Une erreur s'est produite lors du processus d'inscription.");
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
                Devenir <span className="text-gold-400">Étudiant</span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">Rejoignez l'élite des batteurs internationaux</p>
            </div>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="alert"
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 mb-6"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-xs sm:text-sm space-y-4 text-center"
            >
              <CheckCircle className="w-8 h-8 shrink-0 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Validation requise</h3>
              <p className="leading-relaxed">{successMsg}</p>
              <Link
                to="/login"
                className="btn-gold py-2 px-6 text-xs inline-block"
              >
                Aller se connecter
              </Link>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Nom Complet
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-gold-500/40 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-colors"
                  />
                </div>
              </div>

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
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-gold-500/40 focus:outline-none rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? "Création du compte..." : "S'inscrire à l'Académie"}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer mt-8 text-center text-xs text-zinc-500 border-t border-white/5 pt-6">
            Déjà étudiant ?{" "}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-bold transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
