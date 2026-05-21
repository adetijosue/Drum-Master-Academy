import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { springTransition } from '../../lib/motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {icon}
          </div>
        )}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 2px rgba(212, 175, 55, 0.3), 0 0 15px rgba(212, 175, 55, 0.1)'
              : error
              ? '0 0 0 2px rgba(244, 63, 94, 0.3)'
              : '0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
          transition={springTransition}
          className="rounded-lg"
        >
          <input
            id={inputId}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-obsidian-card/60 backdrop-blur-sm border-0 rounded-lg text-white placeholder-zinc-500 focus:outline-none transition-colors text-sm py-3 ${
              icon ? 'pl-10' : 'pl-4'
            } ${rightIcon ? 'pr-10' : 'pr-4'} ${className}`}
            {...props}
          />
        </motion.div>
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="text-xs text-rose-400 flex items-center gap-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
