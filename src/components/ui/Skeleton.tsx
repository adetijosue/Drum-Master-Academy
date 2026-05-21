import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-white/5 relative overflow-hidden';
  const variantClasses: Record<string, string> = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent animate-shimmer" />
    </div>
  );
};

// Pre-built skeleton compositions
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-card p-6 space-y-4 ${className}`}>
    <Skeleton variant="rectangular" className="w-full h-40" />
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <Skeleton variant="text" className="w-full h-3" />
    <Skeleton variant="text" className="w-2/3 h-3" />
  </div>
);

export const StatSkeleton: React.FC = () => (
  <div className="glass-card p-6 space-y-3">
    <Skeleton variant="circular" className="w-10 h-10" />
    <Skeleton variant="text" className="w-20 h-8" />
    <Skeleton variant="text" className="w-24 h-3" />
  </div>
);
