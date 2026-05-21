import React from 'react';
import { motion } from 'framer-motion';
import { snappySpring } from '../../lib/motion';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline';
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={snappySpring}
      className={`relative inline-flex ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full border border-gold-500/50 object-cover`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full border border-gold-500/50 bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center font-bold text-obsidian`}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-obsidian ${
            status === 'online' ? 'bg-emerald-400' : 'bg-zinc-500'
          }`}
        />
      )}
    </motion.div>
  );
};
