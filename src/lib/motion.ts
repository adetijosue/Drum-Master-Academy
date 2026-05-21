import { Variants, Transition } from 'framer-motion';

// Standard spring transition for all interactive elements
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
};

export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { ...gentleSpring, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Fade in from below for sections
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: gentleSpring },
};

// Fade in from left
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: gentleSpring },
};

// Fade in from right
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: gentleSpring },
};

// Scale fade for cards in grids
export const scaleFade: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

// Stagger container for lists/grids
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger child variant
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition },
};

// Micro-interactions
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: snappySpring,
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: springTransition,
};

export const hoverGlow = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: snappySpring,
};

// Tab content switch
export const tabContentVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};
