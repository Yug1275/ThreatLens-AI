export function Card({ className = '', ...props }) {
  return (
    <div
      className={`glass p-4 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }) {
  return <div className={`d-flex flex-column mb-3 ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  return <h3 className={`fw-semibold m-0 text-white fs-5 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={`${className}`} {...props} />;
}
