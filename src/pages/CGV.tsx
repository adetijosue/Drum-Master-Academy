import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CreditCard, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { fadeInUp, springTransition } from '../lib/motion';

export const CGV: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24 relative overflow-hidden">
        {/* Background radial highlights */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-600/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="text-center space-y-4 mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <FileText className="w-3.5 h-3.5" /> Vente
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white uppercase">
              Conditions Générales <span className="text-gold-400">de Vente</span>
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium">
              Dernière mise à jour : 10 Juin 2026
            </p>
          </motion.div>

          {/* Content Sections */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-8"
          >
            {/* Objet */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-5 h-5 text-gold-400" />
                1. Objet des Services
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent l'accès et l'inscription aux cours de batterie en ligne dispensés sur la plateforme Drum Master Academy. Ces formations comprennent des leçons vidéo, l'accès à des métronomes professionnels interactifs, et des documents pédagogiques de support (partitions PDF, etc.).
              </p>
            </motion.div>

            {/* Inscription et Accès */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <CreditCard className="w-5 h-5 text-gold-400" />
                2. Modalités d'Inscription &amp; Tarifs
              </h2>
              <div className="text-zinc-400 text-sm leading-relaxed space-y-2">
                <p>
                  L'inscription aux cursus de batterie de la Drum Master Academy se fait directement sur la plateforme :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Les tarifs des formations premium sont indiqués clairement sur la page de chaque cours.</li>
                  <li>Le paiement s'effectue en ligne via des serveurs sécurisés.</li>
                  <li>L'accès au cours est instantané dès la validation du paiement par notre système d'authentification Supabase.</li>
                </ul>
              </div>
            </motion.div>

            {/* Rétractation et Remboursement */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <RefreshCw className="w-5 h-5 text-gold-400" />
                3. Droit de Rétractation &amp; Remboursement
              </h2>
              <div className="text-zinc-400 text-sm leading-relaxed space-y-2">
                <p>
                  En raison de la nature numérique des contenus de formation de batterie (leçons en accès immédiat, téléchargement de fichiers PDF de partitions) :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Tout début de visionnage des cours vidéo ou téléchargement des ressources exclusives vaut renonciation expresse au droit de rétractation.</li>
                  <li>Aucun remboursement ne pourra être accordé après l'activation de la consommation des ressources du cursus, sauf accord commercial exceptionnel de JABE PRODUCTION.</li>
                </ul>
              </div>
            </motion.div>

            {/* Garanties et support */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <AlertTriangle className="w-5 h-5 text-gold-400" />
                4. Support Technique &amp; Réclamations
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pour toute réclamation, difficulté d'accès technique aux leçons vidéo ou aux outils rythmiques, notre équipe d'assistance se tient à votre entière disposition à l'adresse 
                <a href="mailto:support@drummasteracademy.com" className="text-gold-400 hover:underline ml-1 font-semibold">support@drummasteracademy.com</a>.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
