export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`form-control bg-dark-800 border-slate-700 text-slate-200 shadow-none transition ${className}`}
      style={{ minHeight: '40px' }}
      {...props}
    />
  );
}
