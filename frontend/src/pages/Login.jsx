import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tl-auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="tl-auth-card">
          {/* Logo */}
          <div className="tl-auth-logo">
            <img src="/logo.png" alt="ThreatLens AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h2 className="tl-auth-title">Welcome back</h2>
          <p className="tl-auth-subtitle">Sign in to your ThreatLens AI account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(var(--tl-danger-rgb), 0.1)',
                border: '1px solid rgba(var(--tl-danger-rgb), 0.2)',
                borderRadius: 'var(--tl-radius-sm)',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                color: 'var(--tl-danger)',
                fontSize: '0.8125rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="tl-label">Email or Username</label>
              <input
                type="text"
                className="tl-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '0.375rem' }}>
                <label className="tl-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--tl-primary-light)' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="tl-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--tl-text-faint)', cursor: 'pointer',
                    padding: 0, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="tl-btn tl-btn-primary w-100"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '0.75rem', fontSize: '0.9375rem' }}
            >
              {loading ? (
                <><Loader2 size={18} className="spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--tl-text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--tl-primary-light)', fontWeight: 500 }}>Sign up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
