import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, User, Home, Mail } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { fadeInUp, springTransition } from '../lib/motion';

export const MentionsLegales: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24 relative overflow-hidden">
        {/* Background radial highlights */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="text-center space-y-4 mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <Shield className="w-3.5 h-3.5" /> Légal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white uppercase">
              Mentions <span className="text-gold-400">Légales</span>
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
            {/* Section 1: Éditeur */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <User className="w-5 h-5 text-gold-400" />
                1. Éditeur du Site
              </h2>
              <div className="text-zinc-300 text-sm leading-relaxed space-y-2">
                <p>
                  Le site internet <strong>Drum Master Academy</strong> est édité par :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong>Nom de l'entreprise</strong> : JABE PRODUCTION</li>
                  <li><strong>Directeur de la publication</strong> : Josué ADETI</li>
                  <li><strong>Siège social</strong> : Lomé, Togo</li>
                  <li><strong>Contact mail</strong> : <a href="mailto:contact@drummasteracademy.com" className="text-gold-400 hover:underline">contact@drummasteracademy.com</a></li>
                </ul>
              </div>
            </motion.div>

            {/* Section 2: Hébergeur */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Home className="w-5 h-5 text-gold-400" />
                2. Hébergement
              </h2>
              <div className="text-zinc-300 text-sm leading-relaxed space-y-2">
                <p>
                  Le site internet est hébergé par :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong>Hébergeur</strong> : Vercel Inc.</li>
                  <li><strong>Adresse</strong> : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
                  <li><strong>Site web</strong> : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">vercel.com</a></li>
                </ul>
              </div>
            </motion.div>

            {/* Section 3: Propriété Intellectuelle */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <FileText className="w-5 h-5 text-gold-400" />
                3. Propriété Intellectuelle
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                L'ensemble du contenu présent sur le site Drum Master Academy, incluant, de façon non limitative, les graphismes, images, textes, vidéos, animations, sons, logos, icônes, cours et partitions de batterie, est la propriété exclusive de JABE PRODUCTION ou de ses partenaires. 
                Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord écrit exprès de Josué ADETI.
              </p>
            </motion.div>

            {/* Section 4: Limitation de responsabilité */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Mail className="w-5 h-5 text-gold-400" />
                4. Nous contacter
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pour toute question relative aux mentions légales ou pour signaler un contenu illicite, vous pouvez nous contacter par email à l'adresse suivante : 
                <a href="mailto:contact@drummasteracademy.com" className="text-gold-400 hover:underline ml-1 font-semibold">contact@drummasteracademy.com</a>.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
