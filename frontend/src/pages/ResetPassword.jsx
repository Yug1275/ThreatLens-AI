import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const validatePassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!token) return setError('Invalid or missing reset token.');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!validatePassword(password)) return setError('Password must be 8+ chars with uppercase, lowercase, number, and special character.');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', { token, new_password: password });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="tl-auth-container">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="tl-auth-card">
          <div className="tl-auth-logo"><img src="/logo.png" alt="ThreatLens AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <h2 className="tl-auth-title">Reset password</h2>
          <p className="tl-auth-subtitle">Enter your new secure password</p>

          {error && (
            <div style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', border: '1px solid rgba(var(--tl-danger-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>{error}</div>
          )}
          {message && (
            <div style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', border: '1px solid rgba(var(--tl-success-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="tl-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="tl-input" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!!message} style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tl-text-faint)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="tl-label">Confirm Password</label>
              <input type="password" className="tl-input" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={!!message} />
            </div>

            <motion.button type="submit" className="tl-btn tl-btn-primary w-100" disabled={loading || !!message} whileTap={{ scale: 0.98 }} style={{ padding: '0.75rem' }}>
              {loading ? <><Loader2 size={18} className="spin" /> Resetting...</> : <>Reset Password <ArrowRight size={16} /></>}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
