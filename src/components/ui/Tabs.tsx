import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springTransition, tabContentVariants } from '../../lib/motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Navigation par onglets"
        className="flex gap-1 p-1 bg-obsidian-card/60 backdrop-blur-sm rounded-xl border border-white/5 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-gold-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg"
                transition={springTransition}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mt-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
