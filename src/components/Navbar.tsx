import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Drum, LayoutDashboard, Compass, Settings, LogOut, MessageSquare, LogIn, UserPlus } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { snappySpring, staggerContainer, staggerChild } from '../lib/motion';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast("Déconnexion réussie. À bientôt derrière les fûts ! 🥁", "success");
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Accueil", path: "/", icon: <Compass className="w-4 h-4" /> },
    { name: "Formations", path: "/courses", icon: <Drum className="w-4 h-4" /> },
    ...(user
      ? [
          { name: "Mon Espace", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { name: "Communauté", path: "/community", icon: <MessageSquare className="w-4 h-4" /> },
          { name: "Paramètres", path: "/settings", icon: <Settings className="w-4 h-4" /> },
        ]
      : [])
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav role="navigation" aria-label="Navigation principale" className="sticky top-0 z-[100] w-full border-b border-white/5 bg-obsidian-card/45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.img
                src="/assets/images/logo.jpg"
                alt="DMA Logo"
                whileHover={{ rotate: 15, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-10 h-10 rounded-full border border-gold-500/50 shadow-gold-glow object-cover"
              />
              <span className="text-xl font-bold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-gold-400 group-hover:to-gold-300 transition-all duration-300">
                DMA.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={snappySpring}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? "text-gold-400 bg-white/5 shadow-inner border-b border-gold-500/30"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="h-6 w-px bg-white/10 mx-2" />

              {user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Summary */}
                  <Link to="/settings" className="flex items-center gap-2 group">
                    <Avatar src={user.photo} name={user.name} size="sm" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-gold-400 transition-colors hidden lg:inline">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={snappySpring}
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-zinc-400 hover:text-rose-400 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Déconnexion</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snappySpring}>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium px-3 py-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Connexion
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snappySpring}>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 btn-gold py-2 px-4 text-xs font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      S'inscrire
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              {user && (
                <Link to="/settings" className="mr-3 flex items-center">
                  <Avatar src={user.photo} name={user.name} size="sm" />
                </Link>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={snappySpring}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden border-t border-white/5 bg-obsidian/95 backdrop-blur-lg overflow-hidden"
            >
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="px-2 pt-2 pb-3 space-y-1 sm:px-3"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.path} variants={staggerChild}>
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                        isActive(link.path)
                          ? "text-gold-400 bg-white/5 border-l-2 border-gold-500"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-white/10 my-3" />

                {user ? (
                  <motion.div variants={staggerChild} className="px-3 py-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.photo} name={user.name} size="md" />
                      <div>
                        <div className="text-white font-medium text-sm">{user.name}</div>
                        <div className="text-zinc-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={snappySpring}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/5 transition-colors font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div variants={staggerChild} className="px-3 py-2 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-white/10 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 btn-gold py-3 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      S'inscrire
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
