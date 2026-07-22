import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false, glass = false, ...props }) => {
  const cardClasses = `${glass ? 'glass' : 'premium-card'} ${className}`;
  
  if (hover) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <BootstrapCard className={cardClasses} {...props}>
          {children}
        </BootstrapCard>
      </motion.div>
    );
  }

  return (
    <BootstrapCard className={cardClasses} {...props}>
      {children}
    </BootstrapCard>
  );
};

export const CardBody = BootstrapCard.Body;
export const CardHeader = ({ children, className = '', ...props }) => (
  <BootstrapCard.Header className={`bg-transparent border-slate-700 ${className}`} {...props}>
    {children}
  </BootstrapCard.Header>
);
export const CardTitle = BootstrapCard.Title;
export const CardText = BootstrapCard.Text;
