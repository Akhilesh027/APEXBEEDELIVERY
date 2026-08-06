import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  heightClass?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  heightClass = 'h-24'
}) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`w-full bg-neutral-200/80 rounded-2xl ${heightClass}`} />
      ))}
    </div>
  );
};
