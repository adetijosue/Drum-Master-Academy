import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { springTransition } from '../../lib/motion';

interface CardProps extends MotionProps {
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'glass-card',
  elevated: 'glass-card shadow-xl',
  interactive: 'glass-card hover:border-gold-500/20 cursor-pointer',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...motionProps
}) => {
  const interactiveProps = variant === 'interactive' ? {
    whileHover: { y: -4, scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: springTransition,
  } : {};

  return (
    <motion.div
      className={`${variantStyles[variant]} ${className}`}
      {...interactiveProps}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
