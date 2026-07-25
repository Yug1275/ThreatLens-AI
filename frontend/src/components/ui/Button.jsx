import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  fullWidth = false,
  as: Component = 'button',
  ...props
}) => {
  let variantClass = '';
  switch (variant) {
    case 'primary': variantClass = 'tl-btn-primary'; break;
    case 'secondary': variantClass = 'tl-btn-secondary'; break;
    case 'danger': variantClass = 'tl-btn-danger'; break;
    case 'ghost': variantClass = 'tl-btn-ghost'; break;
    default: variantClass = `tl-btn-${variant}`;
  }

  let sizeClass = '';
  if (size === 'sm') sizeClass = 'tl-btn-sm';
  if (size === 'lg') sizeClass = 'tl-btn-lg';

  const classes = `tl-btn ${variantClass} ${sizeClass} ${fullWidth ? 'w-100' : ''} ${className}`;

  const content = (
    <>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </>
  );

  if (Component !== 'button') {
    return (
      <motion.div whileTap={{ scale: 0.98 }} style={{ display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
        <Component className={classes} {...props}>
          {content}
        </Component>
      </motion.div>
    );
  }

  return (
    <motion.button whileTap={{ scale: 0.98 }} className={classes} {...props}>
      {content}
    </motion.button>
  );
};
