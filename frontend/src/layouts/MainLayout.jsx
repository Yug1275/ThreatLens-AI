import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, ArrowRight } from 'lucide-react';

export default function MainLayout() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Animated Background */}
      <div className="tl-animated-bg">
        <div className="tl-orb tl-orb-1" />
        <div className="tl-orb tl-orb-2" />
        <div className="tl-orb tl-orb-3" />
      </div>

      {/* Floating Navbar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 2rem',
      }}>
        <nav className="tl-glass-heavy" style={{
          maxWidth: '1200px', margin: '0 auto',
          borderRadius: 'var(--tl-radius-lg)',
          padding: '0.75rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--tl-radius-sm)',
              background: 'var(--tl-gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(var(--tl-primary-rgb), 0.3)',
            }}>
              <Shield size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tl-text-primary)' }}>
              Threat<span className="text-gradient">Lens</span> AI
            </span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            {!token ? (
              <>
                <Link to="/login" className="tl-btn tl-btn-ghost">Sign in</Link>
                <Link to="/register" className="tl-btn tl-btn-primary">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="tl-btn tl-btn-primary">
                Dashboard <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '100px' }}>
        <Outlet />
      </main>
    </div>
  );
}
