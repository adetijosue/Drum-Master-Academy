import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Image as ImageIcon, Camera, X, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { fadeInUp, springTransition, snappySpring, scaleFade } from '../lib/motion';

interface EventPhoto {
  src: string;
  alt: string;
  caption: string;
  category: string;
}

interface UpcomingEvent {
  title: string;
  date: string;
  location: string;
  description: string;
  badge: string;
  badgeStyle: string;
}

const WORKSHOP_PHOTOS: EventPhoto[] = [
  {
    src: "/assets/images/workshop/IMG_1500.jpg",
    alt: "Drum Workshop 2026 - Session Collective",
    caption: "Introduction et explication de la posture devant les élèves attentifs.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1505.jpg",
    alt: "Drum Workshop 2026 - Coaching Caisse Claire",
    caption: "Focus sur le rebond et l'articulation des poignets lors des rudiments de caisse claire.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1511.jpg",
    alt: "Drum Workshop 2026 - Technique de Mains",
    caption: "Démonstration rapprochée des doigtés et de la technique Moeller.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1515.jpg",
    alt: "Drum Workshop 2026 - Pratique sur Pad",
    caption: "Exercice collectif d'échauffement sur pads d'entraînement pour synchroniser les frappes.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1520.jpg",
    alt: "Drum Workshop 2026 - Groove Acoustique",
    caption: "Josué ADETI illustrant un groove syncopé sur kit acoustique premium.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1525.jpg",
    alt: "Drum Workshop 2026 - Session Rythmique",
    caption: "Explication de la division du temps et de l'importance du clic au métronome.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1530.jpg",
    alt: "Drum Workshop 2026 - Travail Individualisé",
    caption: "Suivi et corrections personnalisés de la position de chaque élève derrière les fûts.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1550.jpg",
    alt: "Drum Workshop 2026 - Rythmes du Monde",
    caption: "Session spéciale sur les polyrythmies ouest-africaines appliquées à la batterie.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1573.jpg",
    alt: "Drum Workshop 2026 - Coordination",
    caption: "Exercices d'indépendance dissociant les pieds des mains sur des signatures asymétriques.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1580.jpg",
    alt: "Drum Workshop 2026 - Masterclass Live",
    caption: "Démonstration d'un solo Gospel Chops intégrant des rudiments linéaires complexes.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1601.jpg",
    alt: "Drum Workshop 2026 - Session Studio",
    caption: "Explications sur la gestion du son et l'acoustique de la pièce d'enregistrement.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1630.jpg",
    alt: "Drum Workshop 2026 - Échange Didactique",
    caption: "Temps de questions-réponses sur les carrières professionnelles de batteurs.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1656.jpg",
    alt: "Drum Workshop 2026 - Analyse Audio",
    caption: "Écoute comparative des prises de batterie enregistrées en studio.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1700.jpg",
    alt: "Drum Workshop 2026 - Certificats",
    caption: "Remise officielle des attestations de fin de stage de la Drum Master Academy.",
    category: "workshop2026"
  },
  {
    src: "/assets/images/workshop/IMG_1740.jpg",
    alt: "Drum Workshop 2026 - Clôture",
    caption: "Grande photo finale avec l'ensemble de la promotion Avril-Mai 2026.",
    category: "workshop2026"
  }
];

const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    title: "Drum Camp d'Été 2026",
    date: "15 - 18 Juillet 2026",
    location: "Lomé, Togo (Studio DMA)",
    description: "4 jours d'immersion totale avec Josué ADETI. Au programme : rudiments avancés, développement de la vitesse, fills linéaires et jeu en groupe.",
    badge: "Inscriptions Ouvertes",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
  },
  {
    title: "Masterclass Spéciale : Prise de son & Mixage",
    date: "12 Septembre 2026",
    location: "En ligne / Espace Étudiant",
    description: "Apprenez à accorder vos fûts pour le studio et à enregistrer des pistes de batterie professionnelles avec un traitement audio haut de gamme.",
    badge: "Bientôt Disponible",
    badgeStyle: "bg-gold-500/10 text-gold-400 border-gold-500/20 shadow-gold-500/5"
  },
  {
    title: "DMA West Africa Tour",
    date: "Décembre 2026",
    location: "Lomé, Cotonou, Abidjan",
    description: "Série de masterclasses et d'ateliers physiques pour aller à la rencontre des batteurs de l'Afrique de l'Ouest. Partages, démos et networking.",
    badge: "En Préparation",
    badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5"
  }
];

export const Gallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'past' | 'upcoming'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : WORKSHOP_PHOTOS.length - 1));
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(prev => (prev !== null && prev < WORKSHOP_PHOTOS.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="text-center space-y-4 mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <Camera className="w-3.5 h-3.5" /> Galerie Photos
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white uppercase">
              Événements &amp; <span className="text-gold-400">Workshops</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explorez les moments forts de nos ateliers de batterie et restez informés des prochaines rencontres d'élite de la Drum Master Academy.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2.5 mb-16" role="tablist" aria-label="Filtrer la galerie">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'past', label: 'Drum Workshop 2026 (Passé)' },
              { id: 'upcoming', label: 'Événements à Venir' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={snappySpring}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider border transition-colors ${
                  activeTab === tab.id
                    ? 'text-obsidian border-transparent shadow-[0_4px_20px_rgba(212,175,55,0.25)]'
                    : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:border-white/15 hover:text-white backdrop-blur-sm'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="gallery-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                    transition={springTransition}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* TAB 1: PASSÉ (ALL or PAST) */}
          {(activeTab === 'all' || activeTab === 'past') && (
            <motion.section 
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="space-y-10 mb-20"
              aria-label="Événements passés"
            >
              {/* Event Block Header */}
              <div className="border-l-4 border-gold-500 pl-4 space-y-1.5">
                <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Session Historique Récente
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Drum Workshop Session — Avril &amp; Mai 2026
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  Deux mois intensifs d'ateliers physiques à Lomé (Togo). Les élèves ont pu perfectionner leur tenue de baguettes, leur vitesse, et s'exercer en temps réel avec Josué ADETI sur des exercices d'indépendance complexes et de dynamiques de frappe.
                </p>
              </div>

              {/* Photos Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {WORKSHOP_PHOTOS.map((photo, index) => (
                  <motion.div
                    key={index}
                    variants={scaleFade}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={springTransition}
                    onClick={() => setLightboxIndex(index)}
                    className="glass-card border border-white/5 hover:border-gold-500/30 overflow-hidden bg-zinc-950/40 aspect-[4/3] rounded-2xl group cursor-pointer relative shadow-xl transition-all duration-300"
                  >
                    {/* Event Photo */}
                    <img 
                      src={photo.src} 
                      alt={photo.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Dark overlay showing caption on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="space-y-1">
                        <span className="text-[9px] text-gold-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Zoomer l'image
                        </span>
                        <p className="text-xs text-zinc-200 leading-normal font-semibold">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* TAB 2: À VENIR (ALL or UPCOMING) */}
          {(activeTab === 'all' || activeTab === 'upcoming') && (
            <motion.section 
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="space-y-10"
              aria-label="Événements futurs"
            >
              {/* Event Block Header */}
              <div className="border-l-4 border-red-500 pl-4 space-y-1.5">
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest">
                  Calendrier Académique
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Prochaines Sessions &amp; Masterclasses
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  Planifiez vos sessions d'entraînement et réservez vos places pour nos prochains événements physiques et en ligne.
                </p>
              </div>

              {/* Upcoming Events Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {UPCOMING_EVENTS.map((event, index) => (
                  <motion.div
                    key={index}
                    variants={scaleFade}
                    whileHover={{ y: -6 }}
                    transition={springTransition}
                    className="glass-card border border-white/5 bg-zinc-900/15 p-6 rounded-2xl flex flex-col justify-between gap-6 hover:border-gold-500/20 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="space-y-4">
                      {/* Badge and Title */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors leading-snug tracking-tight">
                          {event.title}
                        </h3>
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border whitespace-nowrap tracking-wider shadow-sm ${event.badgeStyle}`}>
                          {event.badge}
                        </span>
                      </div>

                      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Metadata footer details */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      
                      {event.badge === "Inscriptions Ouvertes" && (
                        <a 
                          href="/contact"
                          className="mt-2 w-full btn-gold py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          Réserver ma place
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

        </div>
      </div>

      {/* Lightbox Modal for Photo Viewer */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            {/* Lightbox body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-5xl h-fit max-h-[90vh] flex flex-col justify-center items-center gap-4 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Photo Frame */}
              <div className="relative w-full aspect-[4/3] max-h-[70vh] rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center shadow-2xl">
                <img
                  src={WORKSHOP_PHOTOS[lightboxIndex].src}
                  alt={WORKSHOP_PHOTOS[lightboxIndex].alt}
                  className="w-full h-full object-contain"
                />

                {/* Left Navigation Arrow */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 p-3 rounded-full bg-black/60 border border-white/5 text-zinc-300 hover:text-white hover:bg-black/85 transition-colors"
                  title="Photo précédente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 p-3 rounded-full bg-black/60 border border-white/5 text-zinc-300 hover:text-white hover:bg-black/85 transition-colors"
                  title="Photo suivante"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Caption details under lightbox */}
              <div className="w-full max-w-xl text-center space-y-1.5 p-4 bg-zinc-950/65 backdrop-blur border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-widest">
                  Photo {lightboxIndex + 1} / {WORKSHOP_PHOTOS.length}
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed font-semibold">
                  {WORKSHOP_PHOTOS[lightboxIndex].caption}
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};
