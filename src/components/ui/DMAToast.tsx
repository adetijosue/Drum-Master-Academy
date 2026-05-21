import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { springTransition } from '../../lib/motion';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface DMAToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const MAX_VISIBLE_TOASTS = 5;

export const DMAToast: React.FC<DMAToastProps> = ({ toasts, removeToast }) => {
  // Only show the latest N toasts
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);

  return (
    <div 
      className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="assertive"
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <DMAToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const DMAToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  const { id, message, type, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const config = {
    success: {
      bg: 'bg-zinc-950/85 backdrop-blur-xl border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      progressBg: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-zinc-950/85 backdrop-blur-xl border-rose-500/30 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      progressBg: 'bg-rose-500'
    },
    warning: {
      bg: 'bg-zinc-950/85 backdrop-blur-xl border-amber-500/30 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      progressBg: 'bg-amber-500'
    },
    info: {
      bg: 'bg-zinc-950/85 backdrop-blur-xl border-gold-500/30 text-gold-200',
      icon: <Info className="w-5 h-5 text-gold-400 shrink-0" />,
      progressBg: 'bg-gold-500'
    }
  };

  const itemConfig = config[type];

  return (
    <motion.div
      layout
      role="alert"
      initial={{ opacity: 0, x: -40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.85, transition: { duration: 0.2 } }}
      transition={springTransition}
      // Drag-to-dismiss: swipe left to remove
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_e, info) => {
        if (info.offset.x < -80) removeToast(id);
      }}
      className={`pointer-events-auto flex flex-col rounded-xl border shadow-glass-card overflow-hidden cursor-grab active:cursor-grabbing ${itemConfig.bg}`}
    >
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3">
          {itemConfig.icon}
          <span className="font-sans font-medium text-sm leading-relaxed">{message}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeToast(id)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-md hover:bg-white/5 shrink-0"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Visual countdown progress bar */}
      <div className="h-1 w-full bg-white/5">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-full ${itemConfig.progressBg}`}
        />
      </div>
    </motion.div>
  );
};
