import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Image as ImageIcon, Shield, Target, Database, Save, 
  Trash2, KeyRound 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition } from '../lib/motion';

export const Settings: React.FC = () => {
  const { 
    user, updateProfile, updateAvatar, changePassword, 
    supabaseConnected, purgeAllData 
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'goals' | 'security' | 'database'>('profile');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [level, setLevel] = useState(user?.level || 'beginner');
  const [equipment, setEquipment] = useState(user?.equipment || 'acoustic');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Practice Goal States
  const [weeklyGoal, setWeeklyGoal] = useState(user?.weeklyGoal || 120);
  const [savingGoal, setSavingGoal] = useState(false);

  // Avatar Canvas States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Database / Connection Stats
  const [simulatedMode, setSimulatedMode] = useState(!supabaseConnected);
  const [dbStats, setDbStats] = useState({ users: 0, posts: 0 });

  useEffect(() => {
    // Load statistics from localStorage
    const localUsers = localStorage.getItem('dma_users_db');
    const localPosts = localStorage.getItem('dma_community_posts');
    setDbStats({
      users: localUsers ? JSON.parse(localUsers).length : 0,
      posts: localPosts ? JSON.parse(localPosts).length : 0
    });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await updateProfile(name, level, interests, { bio, equipment });
      if (res.success) {
        showToast("Profil mis à jour avec succès !", "success");
      } else {
        showToast(res.message || "Erreur de mise à jour.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur inattendue lors de la sauvegarde.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(prev => prev.filter(i => i !== interest));
    } else {
      setInterests(prev => [...prev, interest]);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Les nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Le mot de passe doit faire au moins 6 caractères.", "error");
      return;
    }

    setChangingPass(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast("Mot de passe modifié avec succès !", "success");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || "Erreur lors de la modification.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur inattendue est survenue.", "error");
    } finally {
      setChangingPass(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const res = await updateProfile(undefined, undefined, undefined, { weeklyGoal });
      if (res.success) {
        showToast(`Votre objectif hebdomadaire a été fixé à ${weeklyGoal} minutes !`, "success");
      } else {
        showToast("Erreur d'enregistrement.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGoal(false);
    }
  };

  // HTML5 Image Cropper Canvas engine
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawImageSrc(event.target?.result as string);
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (rawImageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Center-crop calculations
          const size = Math.min(img.width, img.height);
          const sourceX = (img.width - size) / 2;
          const sourceY = (img.height - size) / 2;

          ctx.save();
          // Draw round cropping frame
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
          ctx.clip();

          // Render zoomed image
          const dSize = canvas.width * zoom;
          const offset = (canvas.width - dSize) / 2;

          ctx.drawImage(
            img, 
            sourceX, sourceY, size, size, // Source rect
            offset, offset, dSize, dSize  // Dest rect
          );
          ctx.restore();
        };
        img.src = rawImageSrc;
      }
    }
  }, [rawImageSrc, zoom]);

  const saveCroppedAvatar = async () => {
    if (!canvasRef.current) return;
    setSavingAvatar(true);

    try {
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
      const res = await updateAvatar(base64);
      if (res.success) {
        showToast("Votre avatar étudiant a été mis à jour !", "success");
        setRawImageSrc(null);
      } else {
        showToast("Erreur d'enregistrement.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handlePurge = () => {
    if (window.confirm("Êtes-vous absolument sûr ? Cette action réinitialisera toute votre progression locale, vos posts et vos identifiants.")) {
      purgeAllData();
      showToast("Cache vidé et base de données purgée !", "info");
      window.location.reload();
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen text-zinc-100 font-sans pb-24">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-8">
          Paramètres du <span className="text-gold-400">Compte</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tabs menu Column */}
          <div className="lg:col-span-3 glass-card border border-white/5 bg-zinc-900/40 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profil d'Apprentissage</span>
            </button>
            
            <button
              onClick={() => setActiveTab('avatar')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'avatar'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Avatar & Studio Cadrage</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span>Objectifs Hebdomadaires</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Sécurité & Accès</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'database'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 font-bold'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Resilience & Dev Console</span>
            </button>

            <div className="pt-6 mt-4 border-t border-white/5 text-center">
              <button 
                onClick={() => navigate('/delete-account')} 
                className="text-[11px] text-red-500/70 hover:text-red-400 transition-colors"
              >
                Supprimer le compte étudiant
              </button>
            </div>
          </div>

          {/* Form Content Column */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={springTransition}
                  onSubmit={handleProfileSubmit}
                  className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-white">Profil d'Apprentissage</h2>
                    <p className="text-xs text-zinc-400">Présentez-vous aux autres batteurs de la Drum Master Academy</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nom Complet</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Matériel Principal</label>
                      <select
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                      >
                        <option value="acoustic">Batterie Acoustique</option>
                        <option value="electronic">Batterie Électronique (E-Drums)</option>
                        <option value="hybrid">Kit Hybride</option>
                        <option value="practice_pad">Pad d'Entraînement uniquement</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Biographie</label>
                      <textarea
                        value={bio}
                        rows={3}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Parlez-nous de vos inspirations, de vos batteurs favoris..."
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg p-4 text-white focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Niveau de Batterie Actuel</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setLevel(lvl)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              level === lvl
                                ? 'border-gold-500 bg-gold-500/5'
                                : 'border-white/5 bg-zinc-950/20 hover:border-white/10'
                            }`}
                          >
                            <h4 className="text-xs font-bold uppercase text-white mb-1">
                              {lvl === 'beginner' ? 'Débutant' : lvl === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                            </h4>
                            <p className="text-[10px] text-zinc-500">
                              {lvl === 'beginner' && "Je commence la batterie et les rudiments."}
                              {lvl === 'intermediate' && "Je joue des morceaux simples et maîtrise les tempos."}
                              {lvl === 'advanced' && "Je maîtrise les linear chops, polyrythmies."}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">Vos Styles Favoris</label>
                      <div className="flex flex-wrap gap-2">
                        {['Gospel', 'Jazz', 'Afro-beat', 'Funk', 'Rock', 'Fusion', 'Latin'].map((style) => {
                          const active = interests.includes(style);
                          return (
                            <button
                              key={style}
                              type="button"
                              onClick={() => handleInterestToggle(style)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                active
                                  ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                                  : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10'
                              }`}
                            >
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-gold py-2.5 px-6 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Enregistrer les modifications</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'avatar' && (
                <motion.div
                  key="avatar"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-white">Avatar & Studio Cadrage</h2>
                    <p className="text-xs text-zinc-400">Importez, cadrez et compressez votre photo d'élève.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex flex-col items-center justify-center">
                      <div className="w-40 h-40 rounded-full border-2 border-gold-500/40 bg-zinc-950 overflow-hidden relative shadow-2xl flex items-center justify-center">
                        {user?.photo && !rawImageSrc ? (
                          <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : rawImageSrc ? (
                          <canvas ref={canvasRef} width={200} height={200} className="w-full h-full" />
                        ) : (
                          <User className="w-16 h-16 text-zinc-700" />
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-2 w-full max-w-[200px]">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2 px-4 rounded-lg bg-zinc-900 border border-white/10 hover:border-gold-500 text-xs font-semibold text-center text-zinc-300 hover:text-white transition-all"
                        >
                          Choisir un fichier
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-6">
                      {rawImageSrc ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-400 font-semibold uppercase">
                              <span>Zoom</span>
                              <span>{Math.round(zoom * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="3"
                              step="0.05"
                              value={zoom}
                              onChange={(e) => setZoom(parseFloat(e.target.value))}
                              className="w-full accent-gold-500 bg-zinc-800"
                            />
                          </div>

                          <button
                            onClick={saveCroppedAvatar}
                            disabled={savingAvatar}
                            className="w-full btn-gold py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                          >
                            {savingAvatar && <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />}
                            <span>Valider et Recadrer l'Avatar 📷</span>
                          </button>
                        </>
                      ) : (
                        <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5 text-xs text-zinc-500 leading-relaxed text-center">
                          Sélectionnez une image sur votre appareil pour lancer le Studio de Cadrage interactif.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'goals' && (
                <motion.form
                  key="goals"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleGoalSubmit}
                  className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-white">Objectifs Hebdomadaires</h2>
                    <p className="text-xs text-zinc-400">Configurez votre temps d'entraînement idéal sur la batterie.</p>
                  </div>

                  <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pratique hebdomadaire</span>
                      <span className="text-2xl font-black text-gold-400">{weeklyGoal} min</span>
                    </div>

                    <input
                      type="range"
                      min="30"
                      max="480"
                      step="15"
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                      className="w-full accent-gold-500 h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                      <span>30 min (Loisir)</span>
                      <span>120 min (Sérieux)</span>
                      <span>480 min (D'élite)</span>
                    </div>

                    <div className="p-4 bg-gold-400/5 border border-gold-500/10 rounded-xl text-xs leading-relaxed text-zinc-300 flex items-start gap-3">
                      <Target className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                      <span>
                        S'entraîner {Math.round(weeklyGoal / 7)} minutes par jour régulièrement produit 10x plus de résultats que de jouer 3 heures en une seule fois.
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingGoal}
                      className="btn-gold py-2.5 px-6 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingGoal && <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />}
                      <span>Enregistrer mon Objectif 🚀</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'security' && (
                <motion.form
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handlePasswordSubmit}
                  className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-white">Sécurité & Accès</h2>
                    <p className="text-xs text-zinc-400">Modifiez votre mot de passe d'accès étudiant.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Mot de passe actuel</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nouveau mot de passe</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPass}
                      className="btn-gold py-2.5 px-6 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {changingPass && <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />}
                      <KeyRound className="w-4 h-4" />
                      <span>Modifier mon mot de passe</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'database' && (
                <motion.div
                  key="database"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-white">Console Resilience & Diagnostics</h2>
                    <p className="text-xs text-zinc-400">Vérifiez les paramètres réseau, la base de données et purgez le cache local.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mode card */}
                    <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/40 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Statut de Connexion</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${supabaseConnected ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                        <span className="text-sm font-bold text-white">
                          {supabaseConnected ? 'ONLINE (Supabase)' : 'OFFLINE (Simulé)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Si Supabase est connecté, vos données sont synchronisées dans le cloud. Sinon, le site utilise une base de données cryptée locale résiliente.
                      </p>
                    </div>

                    {/* Table statistics */}
                    <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/40 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Statistiques LocalStorage</h4>
                      <div className="text-xs text-zinc-300 space-y-1">
                        <div>👥 Comptes étudiants stockés : <strong className="text-white">{dbStats.users}</strong></div>
                        <div>💬 Publications communauté : <strong className="text-white">{dbStats.posts}</strong></div>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Fichiers et données sauvegardés localement pour permettre un chargement instantané.
                      </p>
                    </div>
                  </div>

                  {/* Force toggle simulated mode */}
                  <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">Tester le mode Hors-Connexion</h4>
                      <p className="text-[10px] text-zinc-500">Basculez manuellement en mode simulation locale pour tester l'absence de réseau.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSimulatedMode(!simulatedMode);
                        showToast(`Mode ${!simulatedMode ? 'hors-ligne' : 'en-ligne'} forcé avec succès !`, 'info');
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        simulatedMode
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                    >
                      {simulatedMode ? 'Activer le mode cloud' : 'Forcer le hors-connexion 🔌'}
                    </button>
                  </div>

                  {/* Purge Cache Card */}
                  <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-4">
                    <div className="flex gap-3">
                      <Trash2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Réinitialisation d'Urgence</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-normal">
                          Supprimez toutes les données d'exercice, profils, cours rejoints et historique du navigateur. Utile pour repartir à zéro.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handlePurge}
                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purger toutes les données locales</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};
