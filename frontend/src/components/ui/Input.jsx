import React from 'react';
import { Form } from 'react-bootstrap';

export const Input = ({ 
  label, 
  error, 
  icon = null,
  className = '', 
  ...props 
}) => {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      {label && <Form.Label className="text-slate-300 small fw-medium mb-1">{label}</Form.Label>}
      <div className="position-relative">
        {icon && (
          <span className="position-absolute top-50 translate-middle-y text-slate-500 ms-3">
            {icon}
          </span>
        )}
        <Form.Control 
          className={`form-control-dark ${icon ? 'ps-5' : ''} ${error ? 'is-invalid' : ''}`}
          {...props}
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      </div>
    </Form.Group>
  );
};
