import React from 'react';

export const Skeleton = ({ w = '100%', h = '20px', r = false, className = '' }) => {
  return (
    <div 
      className={`tl-skeleton ${className}`} 
      style={{ 
        width: w, 
        height: h, 
        borderRadius: r ? '50%' : undefined 
      }} 
    />
  );
};
