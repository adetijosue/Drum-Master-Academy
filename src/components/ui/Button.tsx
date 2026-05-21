import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { snappySpring } from '../../lib/motion';

interface ButtonProps {
  variant?: 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
}

const variantStyles: Record<string, string> = {
  gold: 'bg-gradient-to-r from-gold-600 to-gold-400 text-obsidian font-bold shadow-gold-glow hover:shadow-gold-glow-intense hover:from-gold-500 hover:to-gold-300',
  outline: 'bg-transparent border border-gold-500 text-gold-400 hover:bg-gold-500/10',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5',
  danger: 'bg-transparent border border-rose-500/30 text-rose-400 hover:bg-rose-500/10',
};

const sizeStyles: Record<string, string> = {
  sm: 'py-2 px-4 text-xs gap-1.5',
  md: 'py-3 px-6 text-sm gap-2',
  lg: 'py-4 px-8 text-base gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  type,
  onClick,
  'aria-label': ariaLabel,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={snappySpring}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </motion.button>
  );
};
