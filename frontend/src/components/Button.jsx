export function Button({ className = '', variant = 'primary', size = 'default', ...props }) {
  const variants = {
    primary: 'btn btn-primary text-white bg-primary-custom border-0',
    secondary: 'btn btn-outline-light border-slate-600 text-white hover-bg-slate-800',
    ghost: 'btn text-slate-300 hover-text-white hover-bg-white-5 border-0',
    destructive: 'btn btn-danger text-white',
  };

  const sizes = {
    sm: 'btn-sm',
    default: '',
    lg: 'btn-lg',
    icon: 'p-2 d-flex align-items-center justify-content-center',
  };

  return (
    <button
      className={`d-inline-flex align-items-center justify-content-center rounded-3 fw-medium transition ${variants[variant] || variants.primary} ${sizes[size] || ''} ${className}`}
      {...props}
    />
  );
}
