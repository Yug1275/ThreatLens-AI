import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false, glow = false, ...props }) => {
  const classes = `tl-card ${glow ? 'tl-card-glow' : ''} ${className}`;
  
  if (hover) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <div className={classes} {...props}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
