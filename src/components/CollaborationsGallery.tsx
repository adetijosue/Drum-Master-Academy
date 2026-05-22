import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search, Youtube, Music, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { springTransition, snappySpring, fadeInUp, hoverLift, scaleFade } from '../lib/motion';
import collaborationsData from '../data/collaborations.json';

interface VideoItem {
  videoId: string;
  title: string;
  length: string;
  thumbnail: string;
  index: string;
}

interface CollaborationsGalleryProps {
  isDashboard?: boolean;
}

export const CollaborationsGallery: React.FC<CollaborationsGalleryProps> = ({ isDashboard = false }) => {
  const videos = collaborationsData as VideoItem[];
  
  // States
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0]);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const playlistContainerRef = useRef<HTMLDivElement>(null);

  // Categories definition
  const categories = useMemo(() => [
    { id: 'all', label: 'Tous les projets', count: videos.length },
    { id: 'blessing', label: 'Blessing', count: videos.filter(v => v.title.toLowerCase().includes('blessing')).length },
    { id: 'toto', label: 'Toto Patrick', count: videos.filter(v => v.title.toLowerCase().includes('toto')).length },
    { id: 'eugene', label: 'Eugène Ablodevi', count: videos.filter(v => v.title.toLowerCase().includes('eugène')).length },
    { id: 'ayawovi', label: 'Chantre Ayawovi', count: videos.filter(v => v.title.toLowerCase().includes('ayawov')).length },
    { id: 'gospel', label: 'Gospel & Live', count: videos.filter(v => 
      v.title.toLowerCase().includes('gospel') || 
      v.title.toLowerCase().includes('praise') || 
      v.title.toLowerCase().includes('worship') || 
      v.title.toLowerCase().includes('concert') ||
      v.title.toLowerCase().includes('chantre')
    ).length },
  ], [videos]);

  // Filtered videos based on category and search query
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const titleLower = video.title.toLowerCase();
      
      // Category filter
      let matchesCategory = true;
      if (activeCategory === 'blessing') {
        matchesCategory = titleLower.includes('blessing');
      } else if (activeCategory === 'toto') {
        matchesCategory = titleLower.includes('toto');
      } else if (activeCategory === 'eugene') {
        matchesCategory = titleLower.includes('eugène');
      } else if (activeCategory === 'ayawovi') {
        matchesCategory = titleLower.includes('ayawov');
      } else if (activeCategory === 'gospel') {
        matchesCategory = (
          titleLower.includes('gospel') || 
          titleLower.includes('praise') || 
          titleLower.includes('worship') || 
          titleLower.includes('concert') ||
          titleLower.includes('chantre')
        );
      }

      // Search filter
      const matchesSearch = titleLower.includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [videos, activeCategory, searchQuery]);

  // Update selected video if current one is filtered out
  useEffect(() => {
    if (filteredVideos.length > 0 && !filteredVideos.some(v => v.videoId === selectedVideo.videoId)) {
      setSelectedVideo(filteredVideos[0]);
    }
  }, [filteredVideos, selectedVideo]);

  // Scroll to top of list when filter changes
  useEffect(() => {
    if (playlistContainerRef.current) {
      playlistContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory, searchQuery]);

  const ContainerTag = isDashboard ? 'div' : 'section';

  return (
    <ContainerTag 
      className={isDashboard ? "w-full" : "py-14 sm:py-16 bg-gradient-to-b from-obsidian to-black relative"} 
      aria-label="Collaborations artistiques"
    >
      <div className={isDashboard ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        
        {/* Header Section */}
        {!isDashboard ? (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-4 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Scène &amp; Studio
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-sans">
                Collaborations de <span className="text-gold-400">Josué ADETI</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                Retrouvez en lecture directe les performances lives, enregistrements studios et clips officiels réalisés en collaboration avec des artistes de renom de la scène Gospel et Afro.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={springTransition}
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
            >
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Rechercher un artiste, titre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-white/10 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-500" />
                Collaborations &amp; Live
              </h2>
              <p className="text-zinc-400 text-xs">
                Performances et sessions d'enregistrement studio de votre coach Josué ADETI.
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-white/10 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {categories.map((cat) => (
            cat.count > 0 && (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap border flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian border-transparent shadow-gold-glow font-bold'
                    : 'bg-zinc-950/60 text-zinc-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'bg-black/20 text-black font-bold' : 'bg-white/5 text-zinc-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            )
          ))}
        </div>

        {/* Grid Player + Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* Left Column: Player (Lg: 8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {selectedVideo ? (
              <motion.div 
                key={selectedVideo.videoId}
                variants={scaleFade}
                initial="initial"
                animate="animate"
                className="w-full flex flex-col h-full"
              >
                {/* Embed Video Iframe with premium border and reflection glow */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black group shadow-[0_0_50px_-12px_rgba(212,175,55,0.15)] focus-within:shadow-[0_0_50px_-6px_rgba(212,175,55,0.3)] transition-shadow duration-500">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=${shouldAutoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&vq=hd1080`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>

                {/* Video Info under the player */}
                <div className="mt-4 p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Music className="w-3 h-3" />
                      Projet #{selectedVideo.index}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {selectedVideo.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Duration Badge */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 text-zinc-400 px-3 py-1.5 rounded-xl text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold-400/80" />
                      {selectedVideo.length || 'N/A'}
                    </div>

                    {/* YouTube redirect button */}
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}&list=PLB36tGFyJB5F-8DeUd1aZKQKng02tg9Z8`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/10 transition-colors"
                      title="Ouvrir sur YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="aspect-video w-full rounded-2xl border border-white/5 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Music className="w-12 h-12 text-zinc-700 animate-pulse" />
                <p className="text-sm">Aucune vidéo sélectionnée</p>
              </div>
            )}
          </div>

          {/* Right Column: Playlist index (Lg: 4 cols) */}
          <div className="lg:col-span-4 flex flex-col h-[380px] lg:h-[480px]">
            <div className="bg-zinc-950/60 border border-white/10 rounded-xl flex flex-col h-full overflow-hidden">
              
              {/* Header Playlist */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-bold text-white">Vidéos de la playlist</span>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/5 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                  {filteredVideos.length} / {videos.length}
                </span>
              </div>

              {/* Videos Scrollable List */}
              <div 
                ref={playlistContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                <AnimatePresence mode="popLayout">
                  {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => {
                      const isActive = video.videoId === selectedVideo.videoId;
                      return (
                        <motion.div
                          key={video.videoId}
                          layoutId={`playlist-item-${video.videoId}`}
                          variants={hoverLift as any}
                          whileHover="whileHover"
                          whileTap="whileTap"
                          transition={snappySpring}
                          onClick={() => {
                            setSelectedVideo(video);
                            setShouldAutoplay(true);
                          }}
                          className={`group cursor-pointer p-2 rounded-lg flex gap-2.5 items-center border transition-all duration-300 ${
                            isActive
                              ? 'bg-gold-500/10 border-gold-500/30 text-white shadow-inner shadow-gold-500/5'
                              : 'bg-zinc-950/40 border-white/5 hover:bg-white/5 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {/* Left thumbnail */}
                          <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/5">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            {/* Overlay icon */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="w-4 h-4 text-gold-400 fill-gold-400" />
                            </div>
                            {/* Length Badge */}
                            {video.length && (
                              <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/85 text-zinc-300 px-1 rounded">
                                {video.length}
                              </span>
                            )}
                          </div>

                          {/* Text info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-[9px] text-gold-400 font-bold uppercase tracking-wider mb-0.5">
                              Collaboration #{video.index}
                            </span>
                            <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${isActive ? 'text-gold-400' : 'text-zinc-200'}`}>
                              {video.title}
                            </h4>
                          </div>

                          {/* Play state indicator */}
                          {isActive && (
                            <motion.div 
                              layoutId="active-indicator"
                              className="shrink-0 flex items-center justify-center p-1 rounded-full bg-gold-500 text-obsidian"
                            >
                              <Play className="w-2.5 h-2.5 fill-obsidian text-obsidian" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2"
                    >
                      <Youtube className="w-8 h-8 text-zinc-700" />
                      <p className="text-xs">Aucun résultat pour cette recherche</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer View Playlist Link */}
              <div className="p-3 border-t border-white/5 bg-zinc-950/40 text-center">
                <a
                  href="https://youtube.com/playlist?list=PLB36tGFyJB5F-8DeUd1aZKQKng02tg9Z8&si=nUFl8UQncQJ8jSWp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors font-semibold"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  Voir la playlist complète sur YouTube
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
      
      {/* Dynamic bottom border divide line */}
      {!isDashboard && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </ContainerTag>
  );
};
