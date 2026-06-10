import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Sparkles, CheckCircle } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { useToast } from '../context/ToastContext';
import { springTransition, snappySpring } from '../lib/motion';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    showToast("Votre message a été envoyé avec succès ! 🥁", "success");
    
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-100 font-sans pb-24 relative overflow-hidden">
        {/* Background radial highlights */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="text-center space-y-4 mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-gold-400 bg-gold-400/10 border border-gold-400/20 uppercase">
              <Mail className="w-3.5 h-3.5" /> Support
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white uppercase">
              Nous <span className="text-gold-400">Contacter</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Une question sur nos cursus, un problème de connexion ou besoin d'un conseil ? Notre équipe pédagogique vous répond dans les meilleurs délais.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left side: Contact Info (Lg: 5 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springTransition}
              className="lg:col-span-5 flex flex-col justify-between gap-8"
            >
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                  Drum Master Academy
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  L'académie d'élite pour batteurs connectés. Josué ADETI et JABE PRODUCTION sont à votre service pour vous guider dans votre apprentissage de la batterie.
                </p>

                {/* Contact Detail Cards */}
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 p-4 rounded-xl hover:border-gold-500/20 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Email de contact</span>
                      <a href="mailto:contact@drummasteracademy.com" className="text-sm text-zinc-200 hover:text-gold-400 font-semibold transition-colors">
                        contact@drummasteracademy.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 p-4 rounded-xl hover:border-gold-500/20 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Téléphone / WhatsApp</span>
                      <span className="text-sm text-zinc-200 font-semibold">
                        +228 90 00 00 00
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 p-4 rounded-xl hover:border-gold-500/20 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Siège social</span>
                      <span className="text-sm text-zinc-200 font-semibold">
                        Lomé, Togo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative block */}
              <div className="p-5 bg-gold-400/5 border border-gold-500/10 rounded-2xl hidden lg:block text-xs leading-relaxed text-zinc-400">
                💡 <strong>Conseil d'entraînement</strong> : N'hésitez pas à poser vos questions sur l'utilisation du séquenceur et de la batterie virtuelle du tableau de bord !
              </div>
            </motion.div>

            {/* Right side: Form (Lg: 7 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springTransition}
              className="lg:col-span-7"
            >
              <div className="glass-card border border-white/5 bg-zinc-900/30 p-6 sm:p-8 rounded-2xl h-full flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.form
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nom Complet</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
                            className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Adresse Email</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nom@exemple.com"
                            className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sujet de votre demande</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-zinc-950/80 border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 text-sm"
                        >
                          <option value="general">Question Générale</option>
                          <option value="billing">Facturation &amp; Inscription</option>
                          <option value="technical">Problème Technique sur la Plateforme</option>
                          <option value="coaching">Demande de Coaching Spécifique</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Message</label>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Écrivez votre message ici..."
                          className="w-full bg-zinc-950/80 border border-white/5 rounded-lg p-4 text-white focus:outline-none focus:border-gold-500 text-sm"
                        />
                      </div>

                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={snappySpring}
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full btn-gold py-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Envoyer le Message</span>
                        </motion.button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={springTransition}
                      className="text-center py-12 space-y-6 flex flex-col items-center justify-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Message Envoyé !</h3>
                        <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                          Merci pour votre message. Notre équipe d'assistance pédagogique va l'étudier avec attention et vous répondra sous 24 à 48 heures.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="btn-gold-outline px-6 py-2.5 text-xs font-bold"
                      >
                        Envoyer un autre message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
};
