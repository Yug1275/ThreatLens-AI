import React from 'react';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pb-3 border-bottom border-slate-800">
      <div>
        <h1 className="h3 fw-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-slate-400 mb-0">{subtitle}</p>}
      </div>
      {action && (
        <div className="mt-3 mt-md-0">
          {action}
        </div>
      )}
    </div>
  );
};
