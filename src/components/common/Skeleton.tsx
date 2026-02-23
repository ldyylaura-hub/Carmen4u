import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="30%" height={16} />
          <Skeleton width="100%" height={20} />
          <Skeleton width="80%" height={16} />
          <div className="flex gap-2 mt-3">
            <Skeleton width={60} height={24} />
            <Skeleton width={60} height={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlbumSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-pink-100">
      <Skeleton variant="rectangular" height={200} />
      <div className="p-4 space-y-2">
        <Skeleton width="70%" height={20} />
        <Skeleton width="50%" height={16} />
      </div>
    </div>
  );
}

export function CategoryColumnSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      <div className="p-3 border-b-2 border-gray-200">
        <Skeleton width="40%" height={20} />
      </div>
      <div className="flex-1 p-3 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circular" width={8} height={8} />
            <Skeleton className="flex-1" height={16} />
            <Skeleton width={40} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
