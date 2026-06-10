import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Send, 
  Image as ImageIcon, 
  MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';
import { springTransition } from '../../lib/motion';

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

interface CommunityPanelProps {
  supabaseConnected: boolean;
}

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ supabaseConnected }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('partage');
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleSharePatternEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const base64 = customEvent.detail?.base64;
      if (base64) {
        setNewPostText(prev => {
          const space = prev.trim() ? "\n\n" : "";
          return prev + space + `[PATTERN: ${base64}]`;
        });
        setNewPostCategory('partage');
        showToast("Rythme importé dans votre zone d'écriture ! Écrivez un message et publiez. 🥁", "info");
      }
    };

    window.addEventListener('dma-share-pattern', handleSharePatternEvent);
    return () => {
      window.removeEventListener('dma-share-pattern', handleSharePatternEvent);
    };
  }, [showToast]);

  const renderPostContent = (post: Post) => {
    const patternRegex = /\[PATTERN:\s*([A-Za-z0-9+/=]+)\]/gi;
    const match = patternRegex.exec(post.text);
    
    if (!match) {
      return (
        <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post.text}
        </p>
      );
    }

    const base64Code = match[1];
    const cleanText = post.text.replace(patternRegex, '').trim();

    let decodedData: any = null;
    try {
      const jsonStr = new TextDecoder().decode(Uint8Array.from(atob(base64Code), c => c.charCodeAt(0)));
      decodedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to decode pattern", e);
    }

    return (
      <div className="space-y-4">
        {cleanText && (
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
            {cleanText}
          </p>
        )}
        
        {decodedData && (
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-gold-500/20 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gold-500/10 blur-xl pointer-events-none" />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gold-400 font-extrabold uppercase tracking-widest">
                <span>🎵 Groove DMA Partagé</span>
              </div>
              <h5 className="font-extrabold text-white text-xs tracking-wide">
                Configuration : {decodedData.channels?.length || 0} Pistes
              </h5>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-gold-400 font-mono font-black">
                  {decodedData.bpm || 120} BPM
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold truncate max-w-[200px]">
                  Instruments : {decodedData.channels?.map((c: any) => c.name).join(', ')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('dma-load-shared-pattern', {
                  detail: { patternData: decodedData }
                }));
                window.dispatchEvent(new CustomEvent('dma-switch-tab', {
                  detail: { tab: 'studio' }
                }));
                showToast("Rythme chargé avec succès dans votre Studio Virtuel ! 🥁", "success");
              }}
              className="py-2 px-4 rounded-lg bg-gold-600 hover:bg-gold-500 text-obsidian font-extrabold text-[10px] tracking-wider uppercase text-center transition-all active:scale-95 shadow-md self-start sm:self-center"
            >
              📥 Importer le Groove
            </button>
          </div>
        )}
      </div>
    );
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

  if (!user) return null;

  return (
    <motion.div
      key="community-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={springTransition}
      className="space-y-6"
    >
      {/* Weekly Rhythms Challenge Card */}
      <div className="glass-card bg-gradient-to-r from-gold-500/10 via-purple-500/5 to-transparent border border-gold-500/20 p-5 rounded-2xl relative overflow-hidden group shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 bg-gold-400/15 border border-gold-400/30 text-gold-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              🏆 Défi de la Semaine
            </span>
            <h3 className="text-white font-extrabold text-base sm:text-lg">Groove Syncopé Gospel</h3>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
              Programmez, ajustez et domptez ce groove Gospel syncopé. Visez la précision à 115 BPM. Relevez le défi et partagez votre score ou votre version modifiée !
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2.5 py-0.5 rounded bg-zinc-950/80 border border-white/5 text-[10px] text-gold-400 font-black font-mono">
                115 BPM
              </span>
              <span className="px-2.5 py-0.5 rounded bg-zinc-950/80 border border-white/5 text-[10px] text-purple-400 font-bold font-mono">
                Gospel Fusion
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const challengePatternData = {
                bpm: 115,
                channels: [
                  {
                    name: "KICK",
                    instrumentId: "kick",
                    volume: 80,
                    pan: 0,
                    pitch: 0,
                    effects: { delay: false, reverb: false, distortion: false, filter: false },
                    patternSteps: {
                      pat1: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
                      pat2: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false],
                      pat3: [true, false, false, false, false, false, true, false, false, true, false, false, false, false, false, false]
                    }
                  },
                  {
                    name: "SNARE",
                    instrumentId: "snare",
                    volume: 75,
                    pan: 0,
                    pitch: 0,
                    effects: { delay: false, reverb: true, distortion: false, filter: false },
                    patternSteps: {
                      pat1: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                      pat2: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                      pat3: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]
                    }
                  },
                  {
                    name: "HI-HAT",
                    instrumentId: "hihat",
                    volume: 60,
                    pan: -0.1,
                    pitch: 0,
                    effects: { delay: false, reverb: false, distortion: false, filter: false },
                    patternSteps: {
                      pat1: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
                      pat2: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
                      pat3: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false]
                    }
                  }
                ]
              };

              // Dispatch the load shared pattern event
              window.dispatchEvent(new CustomEvent('dma-load-shared-pattern', {
                detail: { patternData: challengePatternData }
              }));

              // Switch to studio tab
              window.dispatchEvent(new CustomEvent('dma-switch-tab', {
                detail: { tab: 'studio' }
              }));

              showToast("Défi chargé dans le Studio Virtuel ! 🥁", "success");
            }}
            className="btn-gold py-2 px-4 text-xs font-bold shrink-0 self-start sm:self-center uppercase tracking-wider cursor-pointer shadow-gold-glow group-hover:scale-[1.03] transition-all"
          >
            🚀 Lancer le Défi
          </button>
        </div>
      </div>

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
                  {renderPostContent(post)}

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
  );
};
