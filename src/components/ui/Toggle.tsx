import React from 'react';
import { motion } from 'framer-motion';
import { springTransition } from '../../lib/motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  id,
  disabled = false,
}) => {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        aria-checked={checked}
        id={toggleId}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          checked
            ? 'bg-gradient-to-r from-gold-600 to-gold-400 shadow-gold-glow'
            : 'bg-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          layout
          transition={springTransition}
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
      {label && (
        <label
          htmlFor={toggleId}
          className="text-sm text-zinc-300 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};
