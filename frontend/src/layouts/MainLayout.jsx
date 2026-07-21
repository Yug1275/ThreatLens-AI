import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="glass m-4 p-3 d-flex justify-content-between align-items-center" style={{ zIndex: 50 }}>
        <div className="fs-5 fw-bold text-white d-flex align-items-center gap-2">
          <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <span className="text-white small">TL</span>
          </div>
          ThreatLens AI
        </div>
        <nav className="d-flex gap-3 align-items-center">
          <Link to="/" className="text-decoration-none text-slate-300 hover-text-white transition">Home</Link>
          <Link to="/dashboard" className="text-decoration-none text-slate-300 hover-text-white transition">Dashboard</Link>
          <Link to="/investigations" className="text-decoration-none text-slate-300 hover-text-white transition">Investigations</Link>
          <Link to="/reports" className="text-decoration-none text-slate-300 hover-text-white transition">Reports</Link>
          <Link to="/history" className="text-decoration-none text-slate-300 hover-text-white transition">History</Link>
          <Link to="/profile" className="text-decoration-none text-slate-300 hover-text-white transition">Profile</Link>
          <Link to="/settings" className="text-decoration-none text-slate-300 hover-text-white transition">Settings</Link>
          <Link to="/login" className="btn text-primary-custom bg-primary-transparent border-0 px-3 py-2 rounded-3 hover-bg-white-5">Login</Link>
        </nav>
      </header>
      <main className="flex-grow-1 p-3 p-md-5">
        <Outlet />
      </main>
    </div>
  );
}
