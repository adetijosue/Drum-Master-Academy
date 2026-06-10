import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, ExternalLink, Play, Users, Video, Sparkles } from 'lucide-react';
import { hoverLift, springTransition } from '../lib/motion';

interface YoutubeVideo {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
}

const FEATURED_VIDEOS: YoutubeVideo[] = [
  {
    id: "IV2wYahKcdU",
    title: "EUGÈNE ABLODEVI - AKPÉ AKPÉ (Concert 2026)",
    duration: "8:01",
    views: "1.2k vues",
    thumbnail: "https://img.youtube.com/vi/IV2wYahKcdU/mqdefault.jpg"
  },
  {
    id: "0ptqslcKq3I",
    title: "Blessing - Ablode Vavan (Live performance)",
    duration: "5:31",
    views: "3.5k vues",
    thumbnail: "https://img.youtube.com/vi/0ptqslcKq3I/mqdefault.jpg"
  },
  {
    id: "LDMFm8myZE4",
    title: "Toto Patrick - Alon, Assou et Sèvi",
    duration: "7:29",
    views: "980 vues",
    thumbnail: "https://img.youtube.com/vi/LDMFm8myZE4/mqdefault.jpg"
  }
];

export const YoutubeChannelMiniature: React.FC = () => {
  const channelUrl = "https://youtube.com/@josueadeti?si=hwbMlIKTcFgoLRpW";

  return (
    <section className="py-12 bg-black relative overflow-hidden" aria-label="Chaîne YouTube Josué ADETI">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(220,38,38,0.08),transparent_60%)] pointer-events-none" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center md:text-left mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 uppercase">
            <Youtube className="w-3.5 h-3.5 fill-current" />
            Contenu Vidéo Exclusif
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans leading-tight">
            Explorez ma chaîne <span className="text-red-500">YouTube</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
            Retrouvez mes drum covers, analyses de grooves, astuces de coaching et collaborations lives sur ma chaîne officielle.
          </p>
        </div>

        {/* YouTube Channel Simulator Card */}
        <motion.div
          variants={hoverLift as any}
          whileHover="whileHover"
          transition={springTransition}
          className="w-full glass-card border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/40 shadow-2xl relative"
        >
          {/* Channel Banner Cover */}
          <div className="h-32 sm:h-48 w-full relative overflow-hidden">
            <img 
              src="/assets/images/josue_5.jpg" 
              alt="Bannière YouTube de Josué ADETI" 
              className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Officiel</span>
            </div>
          </div>

          {/* Profile & Info Section */}
          <div className="px-6 pb-6 pt-2 sm:pt-4 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            
            {/* Left: Avatar & Channel Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left -mt-16 sm:-mt-20 relative z-10">
              
              {/* Profile Photo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-900 shadow-xl shrink-0">
                <img 
                  src="/assets/images/josue_avatar.jpg" 
                  alt="Josué ADETI" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Info */}
              <div className="space-y-1 sm:pb-2">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-sans">
                    Josué ADETI
                  </h3>
                  {/* Verified Badge SVG */}
                  <span className="w-4 h-4 bg-zinc-400 rounded-full flex items-center justify-center" title="Validé par YouTube">
                    <svg className="w-2.5 h-2.5 text-zinc-950 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </span>
                </div>
                
                <p className="text-sm text-zinc-400 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                  <span>@josueadeti</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300">10,4 k abonnés</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300">164 vidéos</span>
                </p>

                <p className="text-xs text-zinc-500 max-w-md mt-1 leading-relaxed hidden sm:block">
                  Coaching professionnel, covers de batterie, live sessions, gospel chops et polyrythmies afro.
                </p>
              </div>

            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto pb-2 shrink-0">
              {/* YouTube Channel Button */}
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-black bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20 active:scale-95 whitespace-nowrap"
              >
                <Youtube className="w-4 h-4 fill-current" />
                S'abonner
              </a>

              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-all active:scale-95"
              >
                Visiter la chaîne
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Featured Content Subheader */}
          <div className="border-t border-white/5 mx-6 py-4 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Vidéos populaires de la chaîne
            </span>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-6">
            {FEATURED_VIDEOS.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-zinc-950/80 rounded-xl overflow-hidden border border-white/5 hover:border-red-500/25 transition-all duration-300"
              >
                {/* Thumbnail Frame */}
                <div className="relative aspect-video w-full overflow-hidden bg-black shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Time Badge */}
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-black/85 text-zinc-300 px-1 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Video Metadata */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-red-500 leading-snug line-clamp-2 transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium font-mono uppercase">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-red-500/80" /> {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-zinc-600" /> YouTube
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </motion.div>

      </div>
    </section>
  );
};
