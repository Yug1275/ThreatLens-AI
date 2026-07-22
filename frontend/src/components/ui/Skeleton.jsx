import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', className = '', circle = false }) => {
  const style = {
    width,
    height,
    borderRadius: circle ? '50%' : '4px',
  };

  return (
    <div 
      className={`skeleton ${className}`} 
      style={style}
    />
  );
};

export const SkeletonCard = () => (
  <div className="premium-card p-4">
    <Skeleton width="40%" height="24px" className="mb-3" />
    <Skeleton width="100%" height="60px" />
  </div>
);
