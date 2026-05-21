import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabase';
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
  Square,
  VolumeX,
  Music,
  Image as ImageIcon,
  TrendingUp
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
  const { user, logout, supabaseConnected } = useAuth();
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

  // Metronome State & Ref Matrix
  const [bpm, setBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [soundStyle, setSoundStyle] = useState<'digital' | 'woodblock' | 'stick' | 'cowbell'>('woodblock');
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  
  // Speed Trainer
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [speedTrainerStep, setSpeedTrainerStep] = useState(2);
  const [speedTrainerInterval, setSpeedTrainerInterval] = useState(4); // every 4 measures
  const [measuresCount, setMeasuresCount] = useState(0);

  // Gap Click (Mute Coach)
  const [gapClick, setGapClick] = useState(false);
  const [gapClickPlay, setGapClickPlay] = useState(3);
  const [gapClickMute, setGapClickMute] = useState(1);
  const [isMutedMeasure, setIsMutedMeasure] = useState(false);

  // Visuals
  const [activeBeatVisual, setActiveBeatVisual] = useState(-1);
  const [activeSubdivisionVisual, setActiveSubdivisionVisual] = useState(-1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0.0);
  const currentBeatRef = useRef(0);
  const currentSubdivisionBeatRef = useRef(0);
  const measuresPlayedRef = useRef(0);
  
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds
  
  const bpmRef = useRef(120);
  const beatsPerMeasureRef = useRef(4);
  const subdivisionRef = useRef(1);
  const soundStyleRef = useRef<'digital' | 'woodblock' | 'stick' | 'cowbell'>('woodblock');
  const accentFirstBeatRef = useRef(true);
  const speedTrainerRef = useRef(false);
  const speedTrainerStepRef = useRef(2);
  const speedTrainerIntervalRef = useRef(4);
  const metronomePlayingRef = useRef(false);

  const gapClickRef = useRef(false);
  const gapClickPlayRef = useRef(3);
  const gapClickMuteRef = useRef(1);

  const tapTimesRef = useRef<number[]>([]);
  const [tapActive, setTapActive] = useState(false);

  // Social feed states
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('partage');
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  // Sync state to refs for standard async scheduling thread access
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);
  useEffect(() => { subdivisionRef.current = subdivision; }, [subdivision]);
  useEffect(() => { soundStyleRef.current = soundStyle; }, [soundStyle]);
  useEffect(() => { accentFirstBeatRef.current = accentFirstBeat; }, [accentFirstBeat]);
  useEffect(() => { speedTrainerRef.current = speedTrainer; }, [speedTrainer]);
  useEffect(() => { speedTrainerStepRef.current = speedTrainerStep; }, [speedTrainerStep]);
  useEffect(() => { speedTrainerIntervalRef.current = speedTrainerInterval; }, [speedTrainerInterval]);
  useEffect(() => { metronomePlayingRef.current = metronomePlaying; }, [metronomePlaying]);
  useEffect(() => { gapClickRef.current = gapClick; }, [gapClick]);
  useEffect(() => { gapClickPlayRef.current = gapClickPlay; }, [gapClickPlay]);
  useEffect(() => { gapClickMuteRef.current = gapClickMute; }, [gapClickMute]);

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

  // Professional acoustic timbre synthesis engines (Web Audio API synthesis)
  const playClick = (time: number, isAccent: boolean, isMainBeat: boolean) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const style = soundStyleRef.current;
    
    if (style === 'digital') {
      osc.type = 'sine';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1200, time);
        gainNode.gain.setValueAtTime(1.0, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(800, time);
        gainNode.gain.setValueAtTime(0.7, time);
      } else {
        osc.frequency.setValueAtTime(600, time);
        gainNode.gain.setValueAtTime(0.35, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);
    } 
    else if (style === 'woodblock') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.03);
        gainNode.gain.setValueAtTime(1.0, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(1000, time);
        osc.frequency.exponentialRampToValueAtTime(700, time + 0.03);
        gainNode.gain.setValueAtTime(0.7, time);
      } else {
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(550, time + 0.03);
        gainNode.gain.setValueAtTime(0.3, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      osc.start(time);
      osc.stop(time + 0.05);
    }
    else if (style === 'stick') {
      osc.type = 'triangle';
      if (isAccent && accentFirstBeatRef.current) {
        osc.frequency.setValueAtTime(2800, time);
        gainNode.gain.setValueAtTime(1.0, time);
      } else if (isMainBeat) {
        osc.frequency.setValueAtTime(2000, time);
        gainNode.gain.setValueAtTime(0.65, time);
      } else {
        osc.frequency.setValueAtTime(1600, time);
        gainNode.gain.setValueAtTime(0.25, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      osc.start(time);
      osc.stop(time + 0.02);
    }
    else if (style === 'cowbell') {
      const osc2 = audioCtx.createOscillator();
      osc.type = 'square';
      osc2.type = 'square';
      
      const f1 = isAccent && accentFirstBeatRef.current ? 840 : isMainBeat ? 800 : 760;
      const f2 = isAccent && accentFirstBeatRef.current ? 565 : isMainBeat ? 540 : 515;
      
      osc.frequency.setValueAtTime(f1, time);
      osc2.frequency.setValueAtTime(f2, time);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isAccent && accentFirstBeatRef.current ? 1000 : 800, time);
      filter.Q.setValueAtTime(1.5, time);
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      
      if (isAccent && accentFirstBeatRef.current) {
        gainNode.gain.setValueAtTime(0.8, time);
      } else if (isMainBeat) {
        gainNode.gain.setValueAtTime(0.5, time);
      } else {
        gainNode.gain.setValueAtTime(0.2, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      
      osc.start(time);
      osc.stop(time + 0.1);
      osc2.start(time);
      osc2.stop(time + 0.1);
    }
  };

  const scheduler = () => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    while (nextNoteTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      const isMainBeat = currentSubdivisionBeatRef.current === 0;
      const isFirstBeat = isMainBeat && currentBeatRef.current === 0;

      // Calculate Gap Click Muting
      let shouldMute = false;
      if (gapClickRef.current) {
        const totalCycle = gapClickPlayRef.current + gapClickMuteRef.current;
        const currentCycleMeasure = measuresPlayedRef.current % totalCycle;
        if (currentCycleMeasure >= gapClickPlayRef.current) {
          shouldMute = true;
        }
      }

      if (!shouldMute) {
        playClick(nextNoteTimeRef.current, isFirstBeat, isMainBeat);
      }

      const timeToPlay = nextNoteTimeRef.current - audioCtx.currentTime;
      const beatIndex = currentBeatRef.current;
      const subIndex = currentSubdivisionBeatRef.current;
      const currentMuteState = shouldMute;

      setTimeout(() => {
        if (metronomePlayingRef.current) {
          setActiveBeatVisual(beatIndex);
          setActiveSubdivisionVisual(subIndex);
          setIsMutedMeasure(currentMuteState);
        }
      }, Math.max(0, timeToPlay * 1000));

      const secondsPerSubdivision = (60.0 / bpmRef.current) / subdivisionRef.current;
      nextNoteTimeRef.current += secondsPerSubdivision;

      currentSubdivisionBeatRef.current++;
      if (currentSubdivisionBeatRef.current >= subdivisionRef.current) {
        currentSubdivisionBeatRef.current = 0;
        currentBeatRef.current++;
        if (currentBeatRef.current >= beatsPerMeasureRef.current) {
          currentBeatRef.current = 0;
          
          measuresPlayedRef.current++;
          const curMeasures = measuresPlayedRef.current;
          setTimeout(() => setMeasuresCount(curMeasures), 0);

          if (
            speedTrainerRef.current && 
            speedTrainerIntervalRef.current > 0 && 
            curMeasures % speedTrainerIntervalRef.current === 0
          ) {
            const nextBpm = Math.min(240, bpmRef.current + speedTrainerStepRef.current);
            setTimeout(() => {
              setBpm(nextBpm);
              showToast(`Time trainer: vitesse accélérée à ${nextBpm} BPM ! ⚡`, "info");
            }, 0);
          }
        }
      }
    }
    timerIDRef.current = window.setTimeout(() => scheduler(), lookahead);
  };

  const toggleMetronome = () => {
    if (metronomePlaying) {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      setMetronomePlaying(false);
      setActiveBeatVisual(-1);
      setActiveSubdivisionVisual(-1);
      setIsMutedMeasure(false);
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
      currentSubdivisionBeatRef.current = 0;
      measuresPlayedRef.current = 0;
      setMeasuresCount(0);
      setIsMutedMeasure(false);
      nextNoteTimeRef.current = audioCtx.currentTime + 0.05;
      
      scheduler();
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    const tapTimes = [...tapTimesRef.current, now];

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

  // Load and subscribe to community feed from Supabase
  const fetchPostsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const mapped: Post[] = data.map((row: any) => ({
          id: row.id,
          userName: row.user_name || 'Élève Anonyme',
          userPhoto: row.user_photo || undefined,
          isOfficial: row.user_name === 'Josué ADETI' || row.user_name?.toLowerCase().includes('josue') || row.user_name?.toLowerCase().includes('coach'),
          category: row.category || 'partage',
          text: row.text || '',
          media: row.media || undefined,
          timestamp: row.timestamp || new Date().toISOString(),
          reactions: row.reactions || { like: 0, clap: 0, fire: 0, rocket: 0 },
          userReactions: row.user_reactions || {},
          comments: row.comments || []
        }));
        
        setPosts(mapped);
        localStorage.setItem('dma_community_posts', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('[DMA Feed] Error fetching posts from Supabase:', err);
      const loadedPosts = localStorage.getItem('dma_community_posts');
      if (loadedPosts) {
        setPosts(JSON.parse(loadedPosts));
      }
    }
  };

  useEffect(() => {
    if (supabaseConnected) {
      fetchPostsFromSupabase();
      
      const channel = supabase
        .channel('public-community-posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'community_posts' },
          () => {
            fetchPostsFromSupabase();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
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
      return () => {};
    }
  }, [supabaseConnected]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("Le média est trop volumineux. La limite est fixée à 15 Mo.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPostMedia(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!user || (!newPostText.trim() && !newPostMedia)) return;

    const postUuid = crypto.randomUUID();
    const timestampStr = new Date().toISOString();

    const newPostData = {
      id: postUuid,
      user_id: user.id,
      user_name: user.name,
      user_photo: user.photo || null,
      category: newPostCategory,
      text: newPostText,
      media: newPostMedia || null,
      timestamp: timestampStr,
      reactions: { like: 0, clap: 0, fire: 0, rocket: 0 },
      user_reactions: {},
      comments: []
    };

    const optimisticPost: Post = {
      id: postUuid,
      userName: user.name,
      userPhoto: user.photo || undefined,
      category: newPostCategory,
      text: newPostText,
      media: newPostMedia || undefined,
      timestamp: timestampStr,
      reactions: { like: 0, clap: 0, fire: 0, rocket: 0 },
      userReactions: {},
      comments: []
    };

    setPosts(prev => [optimisticPost, ...prev]);
    setNewPostText('');
    setNewPostMedia(null);
    showToast("Votre publication a été partagée ! 🚀", "success");

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('community_posts')
          .insert([newPostData]);
        if (error) throw error;
        fetchPostsFromSupabase();
      } catch (err) {
        console.error('[DMA Feed] Error uploading post to Supabase:', err);
        const loaded = JSON.parse(localStorage.getItem('dma_community_posts') || '[]');
        localStorage.setItem('dma_community_posts', JSON.stringify([optimisticPost, ...loaded]));
      }
    } else {
      const loaded = JSON.parse(localStorage.getItem('dma_community_posts') || '[]');
      localStorage.setItem('dma_community_posts', JSON.stringify([optimisticPost, ...loaded]));
    }
  };

  const handleReact = async (postId: string, type: 'like' | 'clap' | 'fire' | 'rocket') => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

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

    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, reactions, userReactions };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem('dma_community_posts', JSON.stringify(updated));

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('community_posts')
          .update({
            reactions,
            user_reactions: userReactions
          })
          .eq('id', postId);
        
        if (error) throw error;
      } catch (err) {
        console.error('[DMA Feed] Error syncing reaction with Supabase:', err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;

    const commentText = commentInputs[postId];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
      userName: user.name,
      userPhoto: user.photo || undefined,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...post.comments, newComment];

    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: updatedComments };
      }
      return p;
    });

    setPosts(updated);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    localStorage.setItem('dma_community_posts', JSON.stringify(updated));

    if (supabaseConnected) {
      try {
        const { error } = await supabase
          .from('community_posts')
          .update({
            comments: updatedComments
          })
          .eq('id', postId);
        
        if (error) throw error;
      } catch (err) {
        console.error('[DMA Feed] Error syncing comment with Supabase:', err);
      }
    }
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
                      
                      {/* Attached Media Preview */}
                      {newPostMedia && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-[220px] flex items-center justify-center group">
                          {newPostMedia.startsWith('data:image/') ? (
                            <img src={newPostMedia} alt="Preview" className="max-h-[220px] object-contain w-full" />
                          ) : (
                            <video src={newPostMedia} controls className="max-h-[220px] object-contain w-full" />
                          )}
                          <button
                            onClick={() => setNewPostMedia(null)}
                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 active:scale-95 transition-all shadow-md"
                            title="Supprimer le média"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-gold-500/30"
                          >
                            <option value="partage">🔥 Progression</option>
                            <option value="aide">🆘 Demande d'aide</option>
                            <option value="materiel">⚙️ Matériel</option>
                            <option value="offtopic">☕ Lounge</option>
                          </select>

                          {/* Media Picker */}
                          <input
                            type="file"
                            accept="image/*,video/*"
                            id="community-media-picker"
                            className="hidden"
                            onChange={handleMediaChange}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('community-media-picker')?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-zinc-300 hover:text-white border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
                            <span>Photo / Vidéo</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPostText.trim() && !newPostMedia}
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

                            {/* Attached Media Display */}
                            {post.media && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-white/5 max-h-[400px] flex items-center justify-center bg-black/40">
                                {post.media.startsWith('data:image/') || post.media.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img 
                                    src={post.media} 
                                    alt="Publication media" 
                                    className="max-h-[400px] w-full object-contain"
                                  />
                                ) : post.media.startsWith('data:video/') || post.media.match(/\.(mp4|webm|ogg|mov)/i) ? (
                                  <video 
                                    src={post.media} 
                                    controls 
                                    className="max-h-[400px] w-full object-contain"
                                  />
                                ) : (
                                  <a href={post.media} target="_blank" rel="noreferrer" className="text-gold-400 hover:underline p-4 text-xs block">
                                    Voir le média joint
                                  </a>
                                )}
                              </div>
                            )}

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
                    <div className="grid grid-cols-4 gap-2">
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
                      <div className="grid grid-cols-4 gap-2">
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
