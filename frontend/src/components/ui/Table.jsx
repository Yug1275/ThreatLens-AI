import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={`tl-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const Thead = ({ children, ...props }) => <thead {...props}>{children}</thead>;
export const Tbody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;
export const Tr = ({ children, ...props }) => <tr {...props}>{children}</tr>;
export const Th = ({ children, ...props }) => <th {...props}>{children}</th>;
export const Td = ({ children, ...props }) => <td {...props}>{children}</td>;
