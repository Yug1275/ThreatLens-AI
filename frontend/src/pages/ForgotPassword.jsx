import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Loader2, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="tl-auth-container">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="tl-auth-card">
          <div className="tl-auth-logo"><Shield size={22} color="#fff" /></div>
          <h2 className="tl-auth-title">Forgot password</h2>
          <p className="tl-auth-subtitle">Enter your email to receive a reset link</p>

          {error && (
            <div style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', border: '1px solid rgba(var(--tl-danger-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', border: '1px solid rgba(var(--tl-success-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="tl-label">Email Address</label>
              <input type="email" className="tl-input" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <motion.button type="submit" className="tl-btn tl-btn-primary w-100" disabled={loading} whileTap={{ scale: 0.98 }} style={{ padding: '0.75rem' }}>
              {loading ? <><Loader2 size={18} className="spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
            <Link to="/login" style={{ color: 'var(--tl-primary-light)', fontWeight: 500 }}>← Back to Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
