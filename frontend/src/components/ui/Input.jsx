import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      {label && <label className="tl-label">{label}</label>}
      <input 
        ref={ref}
        className={`tl-input ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div style={{ color: 'var(--tl-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
