import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Facebook } from 'lucide-react';
import { staggerContainer, staggerChild, snappySpring } from '../lib/motion';

const FooterLinkGroup: React.FC<{
  title: string;
  links: { label: string; to: string; external?: boolean }[];
}> = ({ title, links }) => (
  <motion.div variants={staggerChild}>
    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">{title}</h4>
    <ul className="space-y-2" aria-label={title}>
      {links.map((link) => (
        <li key={link.to}>
          {link.external ? (
            <a
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link to={link.to} className="text-sm text-zinc-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </motion.div>
);

const SocialIcon: React.FC<{
  href: string;
  label: string;
  children: React.ReactNode;
}> = ({ href, label, children }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    whileHover={{ scale: 1.15, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
    transition={snappySpring}
    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/5 transition-colors"
  >
    {children}
  </motion.a>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const academyLinks = [
    { label: 'Toutes les Formations', to: '/courses' },
    { label: 'Gospel Drumming', to: '/courses?category=gospel' },
    { label: 'Afro Fusion', to: '/courses?category=afro' },
    { label: 'Rudiments & Technique', to: '/courses?category=rudiments' },
  ];

  const legalLinks = [
    { label: 'Mentions Légales', to: '/mentions-legales' },
    { label: 'Conditions Générales (CGV)', to: '/cgv' },
    { label: 'Confidentialité', to: '/confidentialite' },
    { label: 'Nous Contacter', to: '/contact' },
  ];

  return (
    <motion.footer 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      className="bg-obsidian border-t border-white/5 pt-12 pb-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <motion.div variants={staggerChild} className="space-y-4 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.img
                src="/assets/images/logo.jpg"
                alt="DMA Logo"
                whileHover={{ rotate: 15 }}
                transition={snappySpring}
                className="w-8 h-8 rounded-full border border-gold-500/40 shadow-gold-glow object-cover"
              />
              <span className="text-lg font-bold tracking-wider font-sans text-white">
                DMA.
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              L'école de batterie d'élite en ligne. Formez-vous auprès de batteurs internationaux de Gospel, Afro Fusion, Jazz et Studio.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href="https://www.youtube.com/@josueadeti" label="YouTube">
                <Youtube className="w-4 h-4" />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <Instagram className="w-4 h-4" />
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <Facebook className="w-4 h-4" />
              </SocialIcon>
            </div>
          </motion.div>

          {/* Links Col */}
          <FooterLinkGroup title="Académie" links={academyLinks} />

          {/* Legal Col */}
          <FooterLinkGroup title="Informations" links={legalLinks} />
        </div>

        <motion.div 
          variants={staggerChild}
          className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500"
        >
          <p>© {currentYear} Drum Master Academy. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Développé par <span className="text-gold-400 font-semibold">JABE PRODUCTION</span>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};
