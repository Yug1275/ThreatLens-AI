import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="table-responsive">
      <BootstrapTable 
        className={`align-middle mb-0 text-slate-200 ${className}`} 
        borderless 
        hover
        variant="dark"
        style={{ '--bs-table-bg': 'transparent', '--bs-table-hover-bg': 'rgba(255,255,255,0.03)' }}
        {...props}
      >
        {children}
      </BootstrapTable>
    </div>
  );
};
