import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Platform', href: '#platform' },
    { name: 'Capabilities', href: '#capabilities' },
    { name: 'Intelligence', href: '#intelligence' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Security', href: '#security' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ═══ 5-Layer Animated Background ═══ */}
      <div className="tl-animated-bg" />
      <div className="tl-bg-network" />
      <div className="tl-bg-particles" />
      <div className="tl-bg-nodes" />

      {/* Floating Navbar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '0.5rem 1rem' : '1rem 2rem',
        transition: 'all 0.3s ease'
      }}>
        <nav 
          style={{
            maxWidth: '1400px', margin: '0 auto',
            borderRadius: 'var(--tl-radius-lg)',
            padding: '0.75rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: scrolled ? 'rgba(7, 11, 22, 0.9)' : 'rgba(7, 11, 22, 0.4)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${scrolled ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.05)'}`,
            boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="d-flex align-items-center gap-5">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--tl-text-primary)', letterSpacing: '-0.02em' }}>
                Threat<span className="text-gradient">Lens</span> AI
              </span>
            </Link>

            {/* Desktop Nav */}
            {isHome && (
              <div className="d-none d-lg-flex align-items-center gap-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className="text-decoration-none"
                    style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      color: 'var(--tl-text-muted)',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--tl-text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--tl-text-muted)'}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="d-none d-md-flex align-items-center gap-3">
            {!token ? (
              <>
                <Link to="/login" className="tl-btn tl-btn-ghost">Sign In</Link>
                <Link to="/register" className="tl-btn tl-btn-primary" style={{ padding: '0.5rem 1.25rem', fontWeight: 600 }}>
                  Start Investigation
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="tl-btn tl-btn-primary" style={{ padding: '0.5rem 1.25rem', fontWeight: 600 }}>
                Open Dashboard <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="d-md-none tl-btn tl-btn-ghost" 
            style={{ padding: '0.5rem' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute', top: '100%', left: '1rem', right: '1rem',
                background: 'rgba(7, 11, 22, 0.95)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: 'var(--tl-radius-lg)',
                padding: '1rem', marginTop: '0.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', gap: '1rem'
              }}
            >
              {isHome && navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-decoration-none"
                  style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--tl-text-primary)', padding: '0.5rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div style={{ height: 1, background: 'rgba(56, 189, 248, 0.1)' }} />
              {!token ? (
                <div className="d-flex flex-column gap-2">
                  <Link to="/login" className="tl-btn tl-btn-secondary w-100" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="tl-btn tl-btn-primary w-100" onClick={() => setMobileMenuOpen(false)}>Start Investigation</Link>
                </div>
              ) : (
                <Link to="/dashboard" className="tl-btn tl-btn-primary w-100" onClick={() => setMobileMenuOpen(false)}>Open Dashboard</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main style={{ position: 'relative', zIndex: 1, paddingTop: isHome ? '0' : '100px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}
