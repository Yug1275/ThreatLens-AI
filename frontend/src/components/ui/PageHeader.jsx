import React from 'react';

export const PageHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`tl-page-header ${className}`}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div>
          <h1 className="tl-page-title">{title}</h1>
          {subtitle && <p className="tl-page-subtitle">{subtitle}</p>}
        </div>
        {action && (
          <div className="mt-3 mt-md-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
