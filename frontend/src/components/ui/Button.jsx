import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon = null,
  fullWidth = false,
  ...props 
}) => {
  let variantClass = '';
  
  switch (variant) {
    case 'primary':
      variantClass = 'bg-primary-custom border-0';
      break;
    case 'secondary':
      variantClass = 'bg-dark-800 border-slate-700 text-slate-200 hover-bg-slate-800';
      break;
    case 'danger':
      variantClass = 'btn-danger';
      break;
    case 'ghost':
      variantClass = 'bg-transparent border-0 text-slate-300 hover-text-white hover-bg-slate-800';
      break;
    default:
      variantClass = `btn-${variant}`;
  }

  const classes = `d-flex align-items-center justify-content-center gap-2 ${fullWidth ? 'w-100' : ''} ${variantClass} ${className}`;

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <BootstrapButton className={classes} {...props}>
        {icon && <span className="d-flex align-items-center">{icon}</span>}
        {children}
      </BootstrapButton>
    </motion.div>
  );
};
