import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { springTransition } from '../lib/motion';

export const NotFound: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gold-500/3 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-center max-w-md space-y-8"
        >
          {/* 404 Number */}
          <div className="relative">
            <span className="text-[120px] sm:text-[160px] font-black text-white/[0.03] leading-none select-none block">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <Compass className="w-16 h-16 text-gold-400" />
              </motion.div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Page introuvable
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
              Cette page n'existe pas ou a été déplacée. Retournez à l'accueil ou explorez nos cours.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 btn-gold py-3 px-6 rounded-lg text-sm font-bold"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/10 text-zinc-300 hover:bg-white/5 py-3 px-6 rounded-lg text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir les cours
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
