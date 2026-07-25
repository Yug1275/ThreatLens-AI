import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  const classes = `tl-badge tl-badge-${variant} ${className}`;
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};
