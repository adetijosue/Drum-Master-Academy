import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition, snappySpring } from '../lib/motion';
import { 
  Home, 
  BookOpen, 
  Users, 
  Sliders, 
  Settings as SettingsIcon, 
  Trash2, 
  LogOut, 
  FileDown, 
  MessageSquare, 
  Send,
  ShieldAlert,
  Play,
  Square
} from 'lucide-react';

interface Post {
  id: string;
  userName: string;
  userPhoto?: string;
  isOfficial?: boolean;
  category: string;
  text: string;
  media?: string;
  timestamp: string;
  reactions: { like: number; clap: number; fire: number; rocket: number };
  userReactions: Record<string, string>;
  comments: Array<{ userName: string; userPhoto?: string; text: string; timestamp: string }>;
}

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
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'community' | 'tools'>(() => {
    if (location.pathname === '/community') return 'community';
    if (location.pathname === '/tools') return 'tools';
    return 'dashboard';
  });

  useEffect(() => {
    if (location.pathname === '/community') {
      setActiveTab('community');
    } else if (location.pathname === '/tools') {
      setActiveTab('tools');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Metronome state
  const [bpm, setBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0.0);
  const currentBeatRef = useRef(0);
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds
  const bpmRef = useRef(120);
  const tapTimesRef = useRef<number[]>([]);
  const [tapActive, setTapActive] = useState(false);

  // Social feed states
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('partage');
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Auth Protection redirect
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Metronome scheduler & cleanups
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

  // Metronome audio logic
  const playClick = (time: number, isAccent: boolean) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const envelope = audioCtx.createGain();

    osc.connect(envelope);
    envelope.connect(audioCtx.destination);

    osc.frequency.value = isAccent ? 1200.0 : 800.0;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  const nextNote = () => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatRef.current++;
    if (currentBeatRef.current === 4) {
      currentBeatRef.current = 0;
    }
  };

  const scheduler = () => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      playClick(nextNoteTimeRef.current, currentBeatRef.current === 0);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(() => scheduler(), lookahead);
  };

  const toggleMetronome = () => {
    if (metronomePlaying) {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      setMetronomePlaying(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setMetronomePlaying(true);
      currentBeatRef.current = 0;
      nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
      
      // Start scheduling loop
      const schedulerLoop = () => {
        while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
          playClick(nextNoteTimeRef.current, currentBeatRef.current === 0);
          nextNote();
        }
        timerIDRef.current = window.setTimeout(() => schedulerLoop(), lookahead);
      };
      schedulerLoop();
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    const tapTimes = [...tapTimesRef.current, now];

    // Keep only last 4 taps
    if (tapTimes.length > 4) {
      tapTimes.shift();
    }
    tapTimesRef.current = tapTimes;

    if (tapTimes.length >= 2) {
      let sum = 0;
      for (let i = 1; i < tapTimes.length; i++) {
        sum += tapTimes[i] - tapTimes[i - 1];
      }
      const avgDiff = sum / (tapTimes.length - 1);
      const calculatedBpm = Math.round(60000 / avgDiff);
      
      const limitedBpm = Math.max(40, Math.min(240, calculatedBpm));
      setBpm(limitedBpm);
    }

    setTapActive(true);
    setTimeout(() => setTapActive(false), 100);
  };

  // Social feed loading
  useEffect(() => {
    const loadedPosts = localStorage.getItem('dma_community_posts');
    if (loadedPosts) {
      setPosts(JSON.parse(loadedPosts));
    } else {
      const defaultPosts: Post[] = [
        {
          id: 'seed-1',
          userName: 'Josué ADETI',
          userPhoto: 'assets/images/josue_1.jpg',
          isOfficial: true,
          category: 'partage',
          text: "Bienvenue à tous les nouveaux batteurs de la Drum Master Academy ! C'est un honneur de vous accompagner dans votre voyage rythmique. N'oubliez pas d'utiliser le métronome quotidiennement pour ancrer votre tempo de manière parfaite ! 🥁🔥",
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          reactions: { like: 12, clap: 8, fire: 15, rocket: 6 },
          userReactions: {},
          comments: [
            {
              userName: 'Marc D.',
              text: 'Merci coach Josué ! Toujours au top 🚀',
              timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
            }
          ]
        }
      ];
      setPosts(defaultPosts);
      localStorage.setItem('dma_community_posts', JSON.stringify(defaultPosts));
    }
  }, []);

  const savePostsToLocalStorage = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('dma_community_posts', JSON.stringify(newPosts));
  };

  const handleCreatePost = () => {
    if (!user || !newPostText.trim()) return;

    const newPost: Post = {
      id: Math.random().toString(36).substring(2, 9),
      userName: user.name,
      userPhoto: user.photo || undefined,
      category: newPostCategory,
      text: newPostText,
      media: newPostMedia || undefined,
      timestamp: new Date().toISOString(),
      reactions: { like: 0, clap: 0, fire: 0, rocket: 0 },
      userReactions: {},
      comments: []
    };

    const updated = [newPost, ...posts];
    savePostsToLocalStorage(updated);
    setNewPostText('');
    setNewPostMedia(null);
    showToast("Votre publication a été partagée avec succès ! 🚀", "success");
  };

  const handleReact = (postId: string, type: 'like' | 'clap' | 'fire' | 'rocket') => {
    if (!user) return;
    
    const updated = posts.map(post => {
      if (post.id === postId) {
        const reactions = { ...post.reactions };
        const userReactions = { ...post.userReactions };
        const currentReaction = userReactions[user.email];

        if (currentReaction === type) {
          reactions[type]--;
          delete userReactions[user.email];
        } else {
          if (currentReaction) {
            reactions[currentReaction as 'like' | 'clap' | 'fire' | 'rocket']--;
          }
          reactions[type]++;
          userReactions[user.email] = type;
        }
        return { ...post, reactions, userReactions };
      }
      return post;
    });

    savePostsToLocalStorage(updated);
  };

  const handleAddComment = (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;

    const updated = posts.map(post => {
      if (post.id === postId) {
        const comments = [
          ...post.comments,
          {
            userName: user.name,
            userPhoto: user.photo || undefined,
            text: commentInputs[postId],
            timestamp: new Date().toISOString()
          }
        ];
        return { ...post, comments };
      }
      return post;
    });

    savePostsToLocalStorage(updated);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

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

  const formatPostDate = (isoStr: string) => {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins < 60) return `Il y a ${Math.max(1, diffMins)} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return new Date(isoStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Saison Active</span>
              <strong className="text-sm text-gold-300 font-bold uppercase tracking-wider">Académie 2026</strong>
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

            {/* TAB 2: COMMUNITY HUB */}
            {activeTab === 'community' && (
              <motion.div
                key="community-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={springTransition}
                className="space-y-6"
              >
                {/* Publish Box */}
                <div className="glass-card bg-obsidian-card/45 border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-gold-400 font-extrabold text-sm uppercase tracking-wider">✍️ Partager avec l'Académie</h4>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full border border-gold-500/50 bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center font-bold text-obsidian text-sm shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Partagez vos victoires du jour, posez une question technique, ou motivez les autres élèves..."
                        className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-gold-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none min-h-[90px] resize-none"
                      />
                      
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
                          >
                            <option value="partage">🔥 Progression</option>
                            <option value="aide">🆘 Demande d'aide</option>
                            <option value="materiel">⚙️ Matériel</option>
                            <option value="offtopic">☕ Lounge</option>
                          </select>
                        </div>
                        
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPostText.trim()}
                          className="btn-gold flex items-center gap-2 py-2 px-5 text-xs font-semibold disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" /> Publier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-5">
                  <h4 className="text-zinc-400 font-semibold text-xs uppercase tracking-widest border-b border-white/5 pb-2">
                    Publications Récentes
                  </h4>
                  {posts.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {posts.map(post => {
                        const isLiked = post.userReactions?.[user.email] === 'like';
                        const isClap = post.userReactions?.[user.email] === 'clap';
                        const isFire = post.userReactions?.[user.email] === 'fire';
                        const isRocket = post.userReactions?.[user.email] === 'rocket';
                        
                        return (
                          <div
                            key={post.id}
                            className="glass-card bg-obsidian-card/30 border border-white/5 p-5 rounded-2xl flex flex-col gap-4"
                          >
                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <div className="flex items-center gap-3">
                                {post.userPhoto ? (
                                  <img
                                    src={post.userPhoto}
                                    alt={post.userName}
                                    className="w-10 h-10 rounded-full border border-gold-500/30 object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full border border-gold-500/30 bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                                    {getInitials(post.userName)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-white text-sm font-bold flex items-center gap-1.5">
                                    {post.userName} {post.isOfficial && <span className="text-[10px] bg-gold-400/20 text-gold-400 border border-gold-400/30 px-1.5 py-0.5 rounded font-extrabold uppercase">COACH</span>}
                                  </h4>
                                  <span className="text-[10px] text-zinc-500">{formatPostDate(post.timestamp)}</span>
                                </div>
                              </div>
                              <span className="text-[10px] bg-white/5 text-zinc-400 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                                {post.category}
                              </span>
                            </div>

                            {/* Card Body */}
                            <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {post.text}
                            </p>

                            {/* Multi-Reactions & Comments count */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-wrap gap-3">
                              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                                <button
                                  onClick={() => handleReact(post.id, 'like')}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                    isLiked 
                                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' 
                                      : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  ❤️ {post.reactions.like}
                                </button>
                                <button
                                  onClick={() => handleReact(post.id, 'clap')}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                    isClap
                                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 font-bold'
                                      : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  👏 {post.reactions.clap}
                                </button>
                                <button
                                  onClick={() => handleReact(post.id, 'fire')}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                    isFire
                                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold'
                                      : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  🔥 {post.reactions.fire}
                                </button>
                                <button
                                  onClick={() => handleReact(post.id, 'rocket')}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                    isRocket
                                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold'
                                      : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  🚀 {post.reactions.rocket}
                                </button>
                              </div>

                              <button
                                onClick={() => toggleComments(post.id)}
                                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {post.comments.length} {post.comments.length > 1 ? 'commentaires' : 'commentaire'}
                              </button>
                            </div>

                            {/* Comments Section Drawer */}
                            {openComments[post.id] && (
                              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                                  {post.comments.map((comment, commentIdx) => (
                                    <div
                                      key={`${comment.userName}-${commentIdx}`}
                                      className="flex items-start gap-2.5"
                                    >
                                      {comment.userPhoto ? (
                                        <img
                                          src={comment.userPhoto}
                                          alt={comment.userName}
                                          className="w-8 h-8 rounded-full border border-white/5 object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-[10px]">
                                          {getInitials(comment.userName)}
                                        </div>
                                      )}
                                      
                                      <div className="bg-zinc-950/70 border border-white/5 p-2.5 rounded-xl text-xs flex-1">
                                        <strong className="text-gold-400 font-bold block mb-0.5">
                                          {comment.userName}
                                        </strong>
                                        <span className="text-zinc-200 leading-normal">{comment.text}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Écrire un commentaire..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(post.id);
                                      }
                                    }}
                                    className="flex-1 bg-zinc-950 border border-white/5 focus:border-gold-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id)}
                                    className="btn-gold py-2 px-4 text-xs font-bold"
                                  >
                                    Envoyer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-white/5 rounded-xl">
                      <p className="text-zinc-500 text-xs">Aucune publication pour le moment. Soyez le premier à poster !</p>
                    </div>
                  )}
                </div>
              </motion.div>
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
                <div className="glass-card bg-obsidian-card/45 border border-white/5 p-8 rounded-2xl text-center max-w-[420px] w-full space-y-6">
                  <div>
                    <h3 className="text-white font-extrabold text-lg">Métronome Professionnel</h3>
                    <p className="text-zinc-500 text-xs mt-1">L'outil indispensable pour solidifier votre time-feel.</p>
                  </div>
                  
                  <div className="py-4 space-y-1 bg-black/30 rounded-2xl border border-white/5 relative overflow-hidden">
                    <h2 className="text-6xl font-extrabold tracking-tighter text-white font-mono leading-none">
                      {bpm}
                    </h2>
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest">BPM</span>
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-white/5">
                      <div className="h-full bg-gold-400 w-1/4 animate-pulse" />
                    </div>
                  </div>

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
                      <span>240 Max</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setBpm(prev => Math.max(40, prev - 1))}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 flex items-center justify-center font-bold text-white text-lg transition-transform"
                    >
                      -1
                    </button>
                    <button
                      onClick={toggleMetronome}
                      className={`h-14 px-8 rounded-xl font-bold tracking-wider text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        metronomePlaying
                          ? 'border border-rose-500/40 bg-rose-500/10 text-rose-400'
                          : 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian hover:from-gold-500 hover:to-gold-300 shadow-gold-glow'
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
                      onClick={() => setBpm(prev => Math.min(240, prev + 1))}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 flex items-center justify-center font-bold text-white text-lg transition-transform"
                    >
                      +1
                    </button>
                  </div>

                  <button
                    onClick={handleTapTempo}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      tapActive
                        ? 'bg-gold-500 border-gold-500 text-obsidian font-extrabold'
                        : 'border-zinc-800 hover:border-gold-500/30 text-zinc-400 hover:text-gold-400'
                    }`}
                  >
                    Tap Tempo 🥁
                  </button>
                </div>
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
    </div>
    </PageTransition>
  );
};
