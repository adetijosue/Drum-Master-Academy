import React from 'react';

interface BadgeProps {
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  neutral: 'bg-white/5 text-zinc-400 border-white/10',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  size = 'sm',
  icon,
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
  >
    {icon}
    {children}
  </span>
);
