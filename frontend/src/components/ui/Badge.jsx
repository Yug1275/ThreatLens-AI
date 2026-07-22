import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  let colorStyles = '';
  
  switch (variant) {
    case 'success':
      colorStyles = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      break;
    case 'warning':
      colorStyles = 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
      break;
    case 'danger':
      colorStyles = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      break;
    case 'info':
      colorStyles = 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      break;
    default:
      colorStyles = 'bg-primary bg-opacity-10 text-primary-custom border border-primary border-opacity-25';
  }

  return (
    <span className={`badge rounded-pill fw-normal px-3 py-2 ${colorStyles} ${className}`}>
      {children}
    </span>
  );
};
