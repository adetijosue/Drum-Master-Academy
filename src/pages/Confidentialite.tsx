import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Database, ShieldAlert, FileText } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { fadeInUp, springTransition } from '../lib/motion';

export const Confidentialite: React.FC = () => {
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
              <Lock className="w-3.5 h-3.5" /> Sécurité
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white uppercase">
              Politique de <span className="text-gold-400">Confidentialité</span>
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
            {/* Collecte des données */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Eye className="w-5 h-5 text-gold-400" />
                1. Collecte des Données Personnelles
              </h2>
              <div className="text-zinc-400 text-sm leading-relaxed space-y-2">
                <p>
                  Dans le cadre de l'utilisation de Drum Master Academy, nous collectons des données nécessaires au bon fonctionnement de votre espace étudiant :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong>Informations de compte</strong> : Nom complet, adresse email, mot de passe (crypté).</li>
                  <li><strong>Profil d'apprentissage</strong> : Niveau de batterie, matériel utilisé, intérêts musicaux, et biographie.</li>
                  <li><strong>Progression académique</strong> : Liste des cours suivis, leçons validées, et temps passé à pratiquer.</li>
                  <li><strong>Journal d'entraînement</strong> : Historique de vos sessions d'entraînement de batterie enregistrées.</li>
                </ul>
              </div>
            </motion.div>

            {/* Utilisation des données */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Database className="w-5 h-5 text-gold-400" />
                2. Utilisation &amp; Stockage des Données
              </h2>
              <div className="text-zinc-400 text-sm leading-relaxed space-y-2">
                <p>
                  Vos données personnelles sont stockées de manière hautement sécurisée :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Notre plateforme utilise l'infrastructure sécurisée de <strong>Supabase</strong> pour héberger les bases de données et gérer l'authentification.</li>
                  <li>Vos informations ne sont jamais partagées, vendues ou louées à des tiers.</li>
                  <li>Elles servent exclusivement à personnaliser vos cours de batterie, synchroniser vos outils rythmiques et vos statistiques d'un appareil à l'autre.</li>
                </ul>
              </div>
            </motion.div>

            {/* Droits des utilisateurs */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <ShieldAlert className="w-5 h-5 text-gold-400" />
                3. Vos Droits d'Accès et de Suppression
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Conformément aux réglementations internationales en matière de protection des données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression totale de vos données. 
                Vous pouvez modifier votre profil à tout moment dans les <a href="/settings" className="text-gold-400 hover:underline">Paramètres</a> et procéder à la suppression irrévocable de votre compte étudiant et de l'ensemble de votre historique d'apprentissage via notre page dédiée de <a href="/delete-account" className="text-gold-400 hover:underline">Suppression de Compte</a>.
              </p>
            </motion.div>

            {/* Sécurité */}
            <motion.div 
              variants={fadeInUp}
              className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <FileText className="w-5 h-5 text-gold-400" />
                4. Contact RGPD
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pour toute question ou demande d'exercice de vos droits sur la confidentialité de vos données personnelles, vous pouvez écrire à 
                <a href="mailto:privacy@drummasteracademy.com" className="text-gold-400 hover:underline ml-1 font-semibold">privacy@drummasteracademy.com</a>.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
