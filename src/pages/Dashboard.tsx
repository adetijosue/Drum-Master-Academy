import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition, snappySpring } from '../lib/motion';
import { CollaborationsGallery } from '../components/CollaborationsGallery';
import { InteractiveStudioSection } from '../components/studio/InteractiveStudio';
import { useMetronome } from '../hooks/useMetronome';
import { CommunityPanel } from '../components/dashboard/CommunityPanel';
import { PracticeLogger } from '../components/dashboard/PracticeLogger';
import { YoutubeChannelMiniature } from '../components/YoutubeChannelMiniature';
import { 
  Home, 
  BookOpen, 
  Users, 
  Sliders, 
  Settings as SettingsIcon, 
  LogOut, 
  FileDown, 
  ShieldAlert,
  Play,
  Square,
  VolumeX,
  Music,
  Calendar,
  Youtube,
  Sparkles,
  Trash2,
  TrendingUp,
  Mail,
  X,
  Inbox,
  CheckCheck,
  Clock
} from 'lucide-react';

const COURSES_DATA: Record<string, { title: string; img: string; link: string; totalLessons: number }> = {
  'dma-special': {
    title: 'Spécial Drum Master Academy',
    img: 'assets/images/josue_1.jpg',
    link: '/courses/dma-special',
    totalLessons: 6
  },
  'gospel': {
    title: 'Masterclass Gospel',
    img: 'assets/images/gospel-pro-thumbnail.png',
    link: '/courses/gospel',
    totalLessons: 6
  },
  'afro': {
    title: 'Spécialisation Afro Fusion',
    img: 'assets/images/josue_2.jpg',
    link: '/courses/afro',
    totalLessons: 6
  },
  'jazz': {
    title: 'Jazz Moderne & Studio',
    img: 'assets/images/josue_3.jpg',
    link: '/courses/jazz',
    totalLessons: 6
  },
  'rythmes': {
    title: 'Étude des Rythmes',
    img: 'assets/images/etudes_rythmes.jpg',
    link: '/courses/rythmes',
    totalLessons: 6
  },
  'rudiments': {
    title: '40 Drum Basic Rudiments',
    img: 'assets/images/rudiments-pro-thumbnail.png',
    link: '/courses/rudiments',
    totalLessons: 6
  }
};

export const Dashboard: React.FC = () => {
  const { user, logout, supabaseConnected } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [inbox, setInbox] = useState<any[]>([]);
  const [showMailbox, setShowMailbox] = useState(false);
  const [selectedMail, setSelectedMail] = useState<any>(null);

  // Load and subscribe to DMA inbox messages
  useEffect(() => {
    if (!user) return;
    
    const loadInbox = () => {
      try {
        const inboxKey = `dma_inbox_${user.id}`;
        const stored = localStorage.getItem(inboxKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setInbox(parsed);
          if (selectedMail) {
            const updatedSelected = parsed.find((m: any) => m.id === selectedMail.id);
            if (updatedSelected) {
              setSelectedMail(updatedSelected);
            }
          }
        } else {
          setInbox([]);
        }
      } catch (e) {
        console.error("Failed to load DMA inbox:", e);
      }
    };

    loadInbox();

    const handleInboxUpdate = () => {
      loadInbox();
    };

    window.addEventListener('dma-inbox-updated', handleInboxUpdate);
    return () => {
      window.removeEventListener('dma-inbox-updated', handleInboxUpdate);
    };
  }, [user, selectedMail?.id]);

  const markAsRead = (mailId: string) => {
    if (!user) return;
    try {
      const inboxKey = `dma_inbox_${user.id}`;
      const stored = localStorage.getItem(inboxKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((m: any) => 
          m.id === mailId ? { ...m, read: true } : m
        );
        localStorage.setItem(inboxKey, JSON.stringify(updated));
        setInbox(updated);
        window.dispatchEvent(new CustomEvent('dma-inbox-updated'));
      }
    } catch (e) {
      console.error("Failed to mark mail as read:", e);
    }
  };

  const markAllAsRead = () => {
    if (!user || inbox.length === 0) return;
    try {
      const inboxKey = `dma_inbox_${user.id}`;
      const stored = localStorage.getItem(inboxKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((m: any) => ({ ...m, read: true }));
        localStorage.setItem(inboxKey, JSON.stringify(updated));
        setInbox(updated);
        window.dispatchEvent(new CustomEvent('dma-inbox-updated'));
        showToast("Tous les messages ont été marqués comme lus.", "success");
      }
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const deleteMail = (mailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const inboxKey = `dma_inbox_${user.id}`;
      const stored = localStorage.getItem(inboxKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.filter((m: any) => m.id !== mailId);
        localStorage.setItem(inboxKey, JSON.stringify(updated));
        setInbox(updated);
        if (selectedMail && selectedMail.id === mailId) {
          setSelectedMail(null);
        }
        window.dispatchEvent(new CustomEvent('dma-inbox-updated'));
        showToast("Message supprimé.", "success");
      }
    } catch (e) {
      console.error("Failed to delete mail:", e);
    }
  };

  const unreadCount = inbox.filter((m: any) => !m.read).length;
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'community' | 'tools' | 'practice' | 'collaborations' | 'studio'>(() => {
    if (location.pathname === '/community') return 'community';
    if (location.pathname === '/tools') return 'tools';
    if (location.pathname === '/practice') return 'practice';
    if (location.pathname === '/collaborations') return 'collaborations';
    if (location.pathname === '/studio') return 'studio';
    return 'dashboard';
  });

  useEffect(() => {
    if (location.pathname === '/community') {
      setActiveTab('community');
    } else if (location.pathname === '/tools') {
      setActiveTab('tools');
    } else if (location.pathname === '/practice') {
      setActiveTab('practice');
    } else if (location.pathname === '/collaborations') {
      setActiveTab('collaborations');
    } else if (location.pathname === '/studio') {
      setActiveTab('studio');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Metronome Hook call replacing duplicate state, scheduling loops, dynamic AudioContext lifecycle and Tap tempo logic
  const {
    bpm,
    setBpm,
    metronomePlaying,
    toggleMetronome,
    beatsPerMeasure,
    setBeatsPerMeasure,
    subdivision,
    setSubdivision,
    soundStyle,
    setSoundStyle,
    accentFirstBeat,
    setAccentFirstBeat,
    speedTrainer,
    setSpeedTrainer,
    speedTrainerStep,
    setSpeedTrainerStep,
    speedTrainerInterval,
    setSpeedTrainerInterval,
    measuresCount,
    gapClick,
    setGapClick,
    gapClickPlay,
    setGapClickPlay,
    gapClickMute,
    setGapClickMute,
    isMutedMeasure,
    activeBeatVisual,
    activeSubdivisionVisual,
    rhythmPreset,
    setRhythmPreset,
    handleTapTempo,
    tapActive
  } = useMetronome({
    showToast,
    onSetMetronomeCallback: (_newBpm, _newSub, title) => {
      setActiveTab('tools');
      showToast(`Métronome configuré pour : ${title} ! 🥁`, "success");
    }
  });

  // Smart AI Coach custom event dispatch listeners
  useEffect(() => {
    const handleLogPractice = () => {
      setActiveTab('practice');
    };

    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };

    const handleSharePattern = () => {
      setActiveTab('community');
    };

    window.addEventListener('dma-log-practice', handleLogPractice);
    window.addEventListener('dma-switch-tab', handleSwitchTab);
    window.addEventListener('dma-share-pattern', handleSharePattern);
    
    return () => {
      window.removeEventListener('dma-log-practice', handleLogPractice);
      window.removeEventListener('dma-switch-tab', handleSwitchTab);
      window.removeEventListener('dma-share-pattern', handleSharePattern);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Déconnexion réussie.", "success");
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (!user) return null;

  // Compute overall progress metrics
  const enrolledIds = user.enrolledCourses || [];
  const activeCount = enrolledIds.length;
  let totalLessonsEnrolled = 0;
  let completedLessonsEnrolled = 0;

  enrolledIds.forEach(id => {
    if (COURSES_DATA[id]) {
      totalLessonsEnrolled += COURSES_DATA[id].totalLessons;
      const progress = user.courseProgress?.[id]?.completedLessons || [];
      completedLessonsEnrolled += progress.length;
    }
  });

  const avgProgress = totalLessonsEnrolled > 0 
    ? Math.round((completedLessonsEnrolled / totalLessonsEnrolled) * 100) 
    : 0;

  return (
    <PageTransition>
    <div className="flex flex-col min-h-screen bg-obsidian text-zinc-100 font-sans">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Desktop Sidebar (Left Col) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 glass-card bg-obsidian-card/40 border border-white/5 p-6 h-fit sticky top-24">
          <div className="text-center pb-6 border-b border-white/5 space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-full h-full rounded-full border border-gold-500/50 object-cover shadow-2xl" 
                />
              ) : (
                <div className="w-full h-full rounded-full border border-gold-500/50 bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center font-extrabold text-obsidian text-2xl">
                  {getInitials(user.name)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{user.name}</h3>
              <span className="text-xs text-gold-400 font-semibold tracking-wider uppercase">Membre Premium</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 flex-1" role="tablist" aria-label="Navigation du tableau de bord">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              Tableau de bord
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'practice'}
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'practice'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Journal d'Entraînement
            </motion.button>
            <Link
              to="/courses"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Mes Formations
            </Link>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'community'}
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'community'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              Communauté Hub
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'studio'}
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'studio'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4" />
              Studio Virtuel DMA
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'tools'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Métronome Pro
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              role="tab"
              aria-selected={activeTab === 'collaborations'}
              onClick={() => setActiveTab('collaborations')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'collaborations'
                  ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400 shadow-inner'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Youtube className="w-4 h-4" />
              Collaborations &amp; Live
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={snappySpring}
              onClick={() => setShowMailbox(true)}
              className="flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left w-full animate-pulse-subtle"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Messagerie</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-obsidian text-[10px] font-extrabold shadow-gold-glow">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <SettingsIcon className="w-4 h-4" />
              Paramètres
            </Link>
          </nav>

          <div className="border-t border-white/5 pt-4 space-y-2">
            <Link
              to="/delete-account"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:bg-rose-500/5 transition-all rounded-lg text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer mon compte
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-zinc-500 hover:text-white transition-colors rounded-lg text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Main Content Area (Right Col) */}
        <main className="lg:col-span-9 space-y-8 min-h-[70vh]">
          {/* Welcome Banner */}
          <div className="glass-card bg-gradient-to-r from-gold-500/10 via-transparent to-transparent border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans leading-tight">
                Ravi de vous revoir, <span className="text-gold-400">{user.name.split(' ')[0]}</span> !
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Continuez votre progression vers l'excellence rythmique.</p>
            </div>
            <div className="flex items-center gap-4 text-left sm:text-right shrink-0">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Saison Active</span>
                <strong className="text-sm text-gold-300 font-bold uppercase tracking-wider">Académie 2026</strong>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMailbox(true)}
                className="relative p-3 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-gold-500/30 text-zinc-300 hover:text-gold-400 transition-all flex items-center justify-center cursor-pointer shadow-lg"
                title="Messagerie"
              >
                <Mail className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-gold-500 to-gold-400 text-obsidian font-bold text-[10px] rounded-full flex items-center justify-center shadow-gold-glow animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card bg-obsidian-card/30 border border-white/5 p-4 rounded-xl text-center space-y-1">
              <h4 className="text-gold-400 text-2xl font-extrabold">{activeCount}</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Cours Actifs</p>
            </div>
            <div className="glass-card bg-obsidian-card/30 border border-white/5 p-4 rounded-xl text-center space-y-1">
              <h4 className="text-gold-400 text-2xl font-extrabold">12h</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Temps d'étude</p>
            </div>
            <div className="glass-card bg-obsidian-card/30 border border-white/5 p-4 rounded-xl text-center space-y-1">
              <h4 className="text-gold-400 text-2xl font-extrabold">{avgProgress}%</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Progression Moyenne</p>
            </div>
            <div className="glass-card bg-obsidian-card/30 border border-white/5 p-4 rounded-xl text-center space-y-1">
              <h4 className="text-gold-400 text-2xl font-extrabold">2</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Badges acquis</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={springTransition}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Reprendre l'apprentissage</h2>
                  {activeCount > 0 ? (
                    <div className="flex flex-col gap-4">
                      {enrolledIds.map(courseId => {
                        const course = COURSES_DATA[courseId];
                        if (!course) return null;
                        
                        const completedCount = user.courseProgress?.[courseId]?.completedLessons?.length || 0;
                        const progressPercent = Math.round((completedCount / course.totalLessons) * 100);

                        return (
                          <div
                            key={courseId}
                            className="glass-card bg-obsidian-card/50 border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row items-center gap-6 hover:border-gold-500/20 group transition-all duration-300 hover:translate-x-1"
                          >
                            <img
                              src={course.img}
                              alt={course.title}
                              className="w-24 sm:w-28 aspect-[16/10] rounded-lg object-cover"
                            />
                            
                            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                              <h3 className="text-white font-bold group-hover:text-gold-400 transition-colors text-base">
                                {course.title}
                              </h3>
                              
                              <div className="w-full flex items-center justify-between text-xs text-zinc-400">
                                <span>{completedCount} / {course.totalLessons} Leçons</span>
                                <span>{progressPercent}% complété</span>
                              </div>
                              
                              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>

                            <Link
                              to={course.link}
                              className="btn-gold py-2 px-5 text-xs sm:text-sm shrink-0 whitespace-nowrap"
                            >
                              Continuer
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed border-white/10 bg-white/5 rounded-xl space-y-4">
                      <p className="text-zinc-400 text-sm">Vous n'êtes inscrit à aucun cours pour le moment.</p>
                      <Link to="/courses" className="btn-gold inline-block text-xs py-2 px-6">
                        Explorer le catalogue
                      </Link>
                    </div>
                  )}
                </div>

                {/* Collaborations & Live Session Banner */}
                <div className="glass-card bg-gradient-to-r from-obsidian-card via-gold-950/10 to-obsidian-card border border-gold-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-[0_0_30px_-15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.2)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-105 transition-transform duration-300">
                      <Youtube className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 bg-gold-400/10 border border-gold-400/20 text-gold-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Inspirations Lives &amp; Clips
                      </span>
                      <h3 className="text-white font-bold text-base">Sessions Studio &amp; Collaborations de votre Coach</h3>
                      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                        Visionnez directement les collaborations de Josué ADETI avec Blessing, Toto Patrick, Eugène Ablodevi et bien d'autres sans quitter votre espace !
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('collaborations')}
                    className="btn-gold py-2.5 px-6 text-xs shrink-0 flex items-center gap-2 relative z-10 cursor-pointer shadow-gold-glow group-hover:shadow-gold-glow-intense transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-obsidian" />
                    Regarder dans l'App
                  </button>
                </div>

                {/* Freebie PDF Banner */}
                <div className="glass-card bg-obsidian-card/75 border border-gold-500/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <img
                      src="assets/images/rudiments-pro-thumbnail.png"
                      alt="40 Drum Basic Rudiments"
                      className="w-20 rounded-lg object-cover shadow-2xl"
                    />
                    <div className="space-y-1.5">
                      <span className="inline-block bg-gold-400 text-obsidian font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                        Inclus Gratuitement
                      </span>
                      <h3 className="text-white font-bold text-base">40 Drum Basic Rudiments (PDF)</h3>
                      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                        Votre lexique de référence international pour acquérir une coordination rythmique parfaite. Livre d'exercice numérique complet avec partitions incluses.
                      </p>
                    </div>
                  </div>
                  <a
                    href="assets/documents/pdf/40%20Drum%20Basic%20Rudiments.pdf"
                    target="_blank"
                    rel="noreferrer"
                    download="40_Drum_Basic_Rudiments.pdf"
                    className="btn-gold-outline py-2.5 px-5 text-xs shrink-0 flex items-center gap-2 border-gold-500/40 text-gold-400 hover:bg-gold-500/10"
                  >
                    <FileDown className="w-4 h-4" />
                    Télécharger le PDF
                  </a>
                </div>

                {/* Account Actions danger zones shortcut */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-rose-400 font-bold text-sm mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Gestion du profil &amp; zone sensible
                  </h3>
                  <div className="glass-card bg-rose-500/5 border border-rose-500/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h4 className="text-white font-bold text-sm">Contrôle d'accès et options</h4>
                      <p className="text-zinc-400 text-xs leading-relaxed mt-1">
                        Mettez à jour vos intérêts, changez votre mot de passe, ou procédez à la suppression totale de vos leçons.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Link to="/settings" className="btn-gold-outline border-zinc-700 text-zinc-300 hover:bg-white/5 py-2 px-4 text-xs font-semibold">
                        Modifier le profil
                      </Link>
                      <Link to="/delete-account" className="btn-gold bg-rose-500 hover:bg-rose-400 hover:from-rose-500 hover:to-rose-400 text-white font-semibold py-2 px-4 text-xs shadow-none">
                        Supprimer mon compte
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: PRACTICE JOURNAL */}
            {activeTab === 'practice' && (
              <PracticeLogger supabaseConnected={supabaseConnected} />
            )}

            {/* TAB 2: COMMUNITY HUB */}
            {activeTab === 'community' && (
              <CommunityPanel supabaseConnected={supabaseConnected} />
            )}

            {/* TAB 3: TOOLS (PRO METRONOME) */}
            {activeTab === 'tools' && (
              <motion.div
                key="tools-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={springTransition}
                className="flex justify-center"
              >
                <div className="glass-card bg-obsidian-card/45 border border-white/5 p-6 sm:p-8 rounded-2xl text-center max-w-[500px] w-full space-y-6">
                  <div>
                    <h3 className="text-white font-extrabold text-lg flex items-center justify-center gap-2">
                      <Music className="w-5 h-5 text-gold-400" />
                      <span>Métronome Studio Pro</span>
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Conçu pour sculpter votre rigueur rythmique et vos rudiments.
                    </p>
                  </div>
                  
                  {/* Advanced Visual pulsing beat grid */}
                  <div className="flex flex-col gap-2 p-4 bg-zinc-950/60 rounded-2xl border border-white/5">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                        const isActive = activeBeatVisual === idx;
                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              scale: isActive ? 1.25 : 1.0,
                              backgroundColor: isActive 
                                ? isMutedMeasure
                                  ? '#4B5563' // Muted gray
                                  : idx === 0 ? '#F59E0B' : '#D4AF37' 
                                : '#18181B',
                              borderColor: isActive ? isMutedMeasure ? '#4B5563' : '#D4AF37' : '#3F3F46',
                              boxShadow: isActive && !isMutedMeasure ? '0 0 14px rgba(212, 175, 55, 0.55)' : 'none',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                            className="w-10 h-10 rounded-full border flex flex-col items-center justify-center font-mono text-xs font-bold text-zinc-300 select-none relative"
                          >
                            <span>{idx + 1}</span>
                            {isActive && subdivision > 1 && (
                              <div className="absolute -bottom-1.5 flex gap-1 justify-center">
                                {Array.from({ length: subdivision }).map((_, sIdx) => (
                                  <div 
                                    key={sIdx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      activeSubdivisionVisual === sIdx ? 'bg-white scale-125 shadow-sm' : 'bg-white/30'
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

                  {/* BPM Display & Dial Controls */}
                  <div className="py-4 space-y-1 bg-black/30 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center">
                    <h2 className="text-6xl font-black tracking-tighter text-white font-mono leading-none flex items-baseline">
                      {bpm}
                      <span className="text-xs text-gold-400 font-bold ml-1 uppercase">BPM</span>
                    </h2>
                    
                    {speedTrainer && metronomePlaying && (
                      <div className="flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-[10px] text-gold-400 font-bold uppercase tracking-wider animate-pulse">
                        <TrendingUp className="w-3 h-3" />
                        <span>Entraînement : Mesure {measuresCount} / {speedTrainerInterval}</span>
                      </div>
                    )}
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={40}
                      max={240}
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value))}
                      className="w-full cursor-pointer accent-gold-400 h-1.5 bg-zinc-900 rounded-lg appearance-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase px-1">
                      <span>40 Min</span>
                      <span>120 Grave</span>
                      <span>240 Max</span>
                    </div>
                  </div>

                  {/* Tempo Adjust Buttons */}
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setBpm(prev => Math.max(40, prev - 5))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => setBpm(prev => Math.max(40, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => setBpm(120)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                      Reset (120)
                    </button>
                    <button
                      onClick={() => setBpm(prev => Math.min(240, prev + 1))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => setBpm(prev => Math.min(240, prev + 5))}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                      +5
                    </button>
                  </div>

                  {/* Presets de BPM */}
                  <div className="space-y-1.5 text-left border-t border-white/5 pt-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block text-center">Presets BPM</span>
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                      {[
                        { val: 60, label: '60', desc: 'Échauffement' },
                        { val: 90, label: '90', desc: 'Groove' },
                        { val: 120, label: '120', desc: 'Standard' },
                        { val: 140, label: '140', desc: 'Chops' }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => setBpm(preset.val)}
                          className={`py-2 px-1 rounded-lg border transition-all text-center flex flex-col items-center justify-center ${
                            bpm === preset.val
                              ? 'bg-gold-500/10 border-gold-500 text-gold-400 font-extrabold'
                              : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xs font-black">{preset.label}</span>
                          <span className="text-[8px] text-zinc-500 font-semibold">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Presets Rythmiques & Claves */}
                  <div className="space-y-1.5 text-left border-t border-white/5 pt-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block text-center">Presets Rythmiques & Claves</span>
                    <div className="grid grid-cols-3 xs:grid-cols-5 gap-1.5">
                      {[
                        { id: 'standard', label: 'Std', desc: 'Standard', sub: 1, sig: 4 },
                        { id: 'shuffle', label: 'Shuffle', desc: 'Triolet', sub: 3, sig: 4 },
                        { id: 'clave32', label: '3:2', desc: 'Clave Salsa', sub: 4, sig: 4 },
                        { id: 'clave23', label: '2:3', desc: 'Clave Son', sub: 4, sig: 4 },
                        { id: 'afrobeats', label: 'Afro', desc: 'Groove', sub: 4, sig: 4 },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setRhythmPreset(preset.id as any);
                            setSubdivision(preset.sub);
                            setBeatsPerMeasure(preset.sig);
                          }}
                          className={`py-2 px-0.5 rounded-lg border transition-all text-center flex flex-col items-center justify-center ${
                            rhythmPreset === preset.id
                              ? 'bg-gold-500/10 border-gold-500 text-gold-400 font-extrabold'
                              : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-[10px] font-black">{preset.label}</span>
                          <span className="text-[8px] text-zinc-500 font-semibold">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>


                  {/* Play & Tap controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleMetronome}
                      className={`h-14 rounded-xl font-bold tracking-wider text-sm transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                        metronomePlaying
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow border-transparent'
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
                      className={`h-14 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                        tapActive
                          ? 'bg-gold-500 border-gold-500 text-obsidian font-extrabold'
                          : 'border-zinc-800 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 hover:bg-white/5'
                      }`}
                    >
                      Tap Tempo 🥁
                    </button>
                  </div>

                  {/* Advanced Controls Dropdowns */}
                  <div className="grid grid-cols-2 gap-4 text-left border-t border-white/5 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block">Signature rythmique</label>
                      <select
                        value={beatsPerMeasure}
                        onChange={(e) => setBeatsPerMeasure(parseInt(e.target.value))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40"
                      >
                        <option value={4}>4/4 (Standard)</option>
                        <option value={3}>3/4 (Valse / Blues)</option>
                        <option value={5}>5/4 (Odd Meter)</option>
                        <option value={6}>6/8 (Binaire syncopé)</option>
                        <option value={7}>7/8 (Asymétrique chop)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block">Subdivision</label>
                      <select
                        value={subdivision}
                        onChange={(e) => setSubdivision(parseInt(e.target.value))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500/40"
                      >
                        <option value={1}>Noires (1x)</option>
                        <option value={2}>Croches (2x)</option>
                        <option value={3}>Triolets (3x)</option>
                        <option value={4}>Double croches (4x)</option>
                      </select>
                    </div>
                  </div>

                  {/* Timbre & Accent options */}
                  <div className="border-t border-white/5 pt-4 text-left space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block">Timbre Acoustique</label>
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                        {(['woodblock', 'digital', 'stick', 'cowbell'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setSoundStyle(style)}
                            className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all text-center uppercase tracking-wider ${
                              soundStyle === style
                                ? 'bg-gold-500/10 border-gold-500 text-gold-400 font-extrabold'
                                : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            {style === 'woodblock' ? 'Wood' : style === 'digital' ? 'Digi' : style === 'stick' ? 'Stick' : 'Cowbell'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">Accentuer le premier temps</h4>
                        <p className="text-[10px] text-zinc-500">Marque le début de chaque mesure</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accentFirstBeat}
                        onChange={(e) => setAccentFirstBeat(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 text-gold-500 accent-gold-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Speed Trainer Setup */}
                  <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-gold-400" />
                          <span>Mode Entraîneur de Vitesse</span>
                        </h4>
                        <p className="text-[10px] text-zinc-500">Accélère le tempo automatiquement</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={speedTrainer}
                        onChange={(e) => setSpeedTrainer(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 text-gold-500 accent-gold-500 cursor-pointer"
                      />
                    </div>

                    {speedTrainer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400 font-semibold"
                      >
                        <div className="space-y-1">
                          <span>Accélérer de :</span>
                          <select
                            value={speedTrainerStep}
                            onChange={(e) => setSpeedTrainerStep(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-xs outline-none"
                          >
                            <option value={1}>+1 BPM</option>
                            <option value={2}>+2 BPM (Standard)</option>
                            <option value={5}>+5 BPM (Intense)</option>
                            <option value={10}>+10 BPM (Élite)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span>Toutes les :</span>
                          <select
                            value={speedTrainerInterval}
                            onChange={(e) => setSpeedTrainerInterval(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-xs outline-none"
                          >
                            <option value={2}>2 Mesures</option>
                            <option value={4}>4 Mesures (Recommandé)</option>
                            <option value={8}>8 Mesures</option>
                            <option value={16}>16 Mesures</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Gap Click (Mute Coach) Setup */}
                  <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <VolumeX className="w-3.5 h-3.5 text-gold-400" />
                          <span>Mute Coach (Gap Click)</span>
                        </h4>
                        <p className="text-[10px] text-zinc-500">Coupe le clic périodiquement pour tester votre tempo interne</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={gapClick}
                        onChange={(e) => setGapClick(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 text-gold-500 accent-gold-500 cursor-pointer"
                      />
                    </div>

                    {gapClick && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-[10px] text-zinc-400 font-semibold"
                      >
                        <div className="space-y-1">
                          <span>Mesures jouées :</span>
                          <select
                            value={gapClickPlay}
                            onChange={(e) => setGapClickPlay(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-xs outline-none"
                          >
                            <option value={1}>1 Mesure</option>
                            <option value={2}>2 Mesures</option>
                            <option value={3}>3 Mesures (Recommandé)</option>
                            <option value={4}>4 Mesures</option>
                            <option value={6}>6 Mesures</option>
                            <option value={8}>8 Mesures</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span>Mesures mutées :</span>
                          <select
                            value={gapClickMute}
                            onChange={(e) => setGapClickMute(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/5 rounded px-2 py-1 text-xs outline-none"
                          >
                            <option value={1}>1 Mesure (Standard)</option>
                            <option value={2}>2 Mesures (Challenger)</option>
                            <option value={3}>3 Mesures</option>
                            <option value={4}>4 Mesures (Expert)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: COLLABORATIONS & LIVE */}
            {activeTab === 'collaborations' && (
              <motion.div
                key="collaborations-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={springTransition}
                className="space-y-6"
              >
                <div className="glass-card bg-obsidian-card/45 border border-white/5 p-4 sm:p-6 rounded-2xl">
                  <CollaborationsGallery isDashboard={true} />
                </div>
                <div className="glass-card bg-obsidian-card/45 border border-white/5 p-4 sm:p-6 rounded-2xl">
                  <YoutubeChannelMiniature />
                </div>
              </motion.div>
            )}

            {/* TAB 6: STUDIO VIRTUEL DMA */}
            {activeTab === 'studio' && (
              <motion.div
                key="studio-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={springTransition}
                className="space-y-6"
              >
                <InteractiveStudioSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Premium Bottom Navigation Tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-lg border-t border-white/5 z-[90] flex items-center justify-around pb-safe">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'dashboard' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span>Espace</span>
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'practice' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span>Journal</span>
        </button>
        <Link
          to="/courses"
          className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Cours</span>
        </Link>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'community' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-5 h-5 shrink-0" />
          <span>Membres</span>
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'studio' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Music className="w-5 h-5 shrink-0" />
          <span>Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase transition-colors ${
            activeTab === 'tools' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sliders className="w-5 h-5 shrink-0" />
          <span>Outils</span>
        </button>
        <Link
          to="/settings"
          className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-bold uppercase text-zinc-500 hover:text-zinc-300"
        >
          <SettingsIcon className="w-5 h-5 shrink-0" />
          <span>Réglages</span>
        </Link>
      </nav>

      {/* Premium In-App Mailbox Modal */}
      <AnimatePresence>
        {showMailbox && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMailbox(false)}
              className="absolute inset-0 bg-obsidian/85 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-5xl h-[85vh] bg-obsidian-card/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-zinc-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base">Boîte de réception DMA</h3>
                    <p className="text-zinc-500 text-xs font-semibold">
                      {unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : 'Tous les messages sont lus'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tout marquer comme lu
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowMailbox(false)}
                    className="p-2 rounded-lg border border-white/10 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Area: Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Mail List Panel */}
                <div className={`w-full ${selectedMail ? 'hidden md:flex' : 'flex'} md:w-80 border-r border-white/10 flex-col bg-zinc-950/20 shrink-0`}>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {inbox.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                        <Inbox className="w-8 h-8 text-zinc-600" />
                        <p className="text-zinc-500 text-xs font-semibold">Votre boîte de réception est vide.</p>
                      </div>
                    ) : (
                      inbox.map((mail) => {
                        const isSelected = selectedMail?.id === mail.id;
                        return (
                          <div
                            key={mail.id}
                            onClick={() => {
                              setSelectedMail(mail);
                              if (!mail.read) markAsRead(mail.id);
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col gap-2 ${
                              isSelected
                                ? 'bg-gold-500/5 border-gold-500/30 shadow-inner'
                                : 'bg-obsidian-card/40 border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                          >
                            {/* Unread indicator */}
                            {!mail.read && (
                              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                            )}
                            
                            <div className="flex flex-col pr-4">
                              <span className={`text-xs font-bold ${!mail.read ? 'text-white' : 'text-zinc-400'}`}>
                                {mail.sender}
                              </span>
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(mail.date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <h4 className={`text-xs ${!mail.read ? 'font-extrabold text-gold-300' : 'font-medium text-zinc-300'} line-clamp-1`}>
                              {mail.subject}
                            </h4>
                            
                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              <button
                                onClick={(e) => deleteMail(mail.id, e)}
                                className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Mail Reader Panel */}
                <div className={`flex-1 flex flex-col overflow-hidden bg-obsidian-card/20 ${!selectedMail ? 'hidden md:flex' : 'flex'}`}>
                  {selectedMail ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Back button on mobile */}
                      <div className="md:hidden px-4 py-2 bg-zinc-950/40 border-b border-white/5 flex items-center">
                        <button
                          onClick={() => setSelectedMail(null)}
                          className="flex items-center gap-1 text-xs text-gold-400 font-bold"
                        >
                          &larr; Retour à la liste
                        </button>
                      </div>
                      
                      {/* Mail Header */}
                      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/20 shrink-0">
                        <div className="space-y-1">
                          <h2 className="text-base sm:text-lg font-extrabold text-white">{selectedMail.subject}</h2>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-400">De : <strong className="text-gold-400">{selectedMail.sender}</strong></span>
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-500">{new Date(selectedMail.date).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => deleteMail(selectedMail.id, e)}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer le message
                        </button>
                      </div>

                      {/* Mail HTML Body */}
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0B0C]">
                        <div 
                          className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl"
                          dangerouslySetInnerHTML={{ __html: selectedMail.html }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 shadow-inner">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">Consultez vos messages</h4>
                        <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto">
                          Sélectionnez un email dans le panneau latéral pour lire les instructions détaillées de votre Coach.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
};
