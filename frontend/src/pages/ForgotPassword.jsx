import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Loader2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [phase, setPhase] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      setMessage(response.data.message || 'Verification code sent to your email.');
      setPhase('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await api.post('/api/v1/auth/reset-password', { 
        email, 
        otp, 
        new_password: newPassword 
      });
      setMessage(response.data.message || 'Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="tl-auth-container">
      <AnimatePresence mode="wait">
        {phase === 'request' ? (
          <motion.div key="request" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.3 }}>
            <div className="tl-auth-card">
              <div className="tl-auth-logo"><Shield size={22} color="#fff" /></div>
              <h2 className="tl-auth-title">Forgot password</h2>
              <p className="tl-auth-subtitle">Enter your email to receive a verification code</p>

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

              <form onSubmit={handleRequestOTP}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="tl-label">Email Address</label>
                  <input type="email" className="tl-input" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                <motion.button type="submit" className="tl-btn tl-btn-primary w-100" disabled={loading} whileTap={{ scale: 0.98 }} style={{ padding: '0.75rem' }}>
                  {loading ? <><Loader2 size={18} className="spin" /> Sending...</> : <>Send Verification Code <ArrowRight size={16} /></>}
                </motion.button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: 'var(--tl-primary-light)', fontWeight: 500 }}>← Back to Sign In</Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="reset" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.3 }}>
            <div className="tl-auth-card">
              <div className="tl-auth-logo" style={{ background: 'var(--tl-success)' }}><KeyRound size={22} color="#fff" /></div>
              <h2 className="tl-auth-title">Verify & Reset</h2>
              <p className="tl-auth-subtitle">Enter the 6-digit code sent to {email}</p>

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

              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="tl-label">Verification Code (OTP)</label>
                  <input type="text" className="tl-input" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem' }} />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="tl-label">New Password</label>
                  <input type="password" className="tl-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                </div>

                <motion.button type="submit" className="tl-btn tl-btn-primary w-100" disabled={loading} whileTap={{ scale: 0.98 }} style={{ padding: '0.75rem' }}>
                  {loading ? <><Loader2 size={18} className="spin" /> Verifying...</> : <>Reset Password <ArrowRight size={16} /></>}
                </motion.button>
              </form>
              
              <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
                <button onClick={() => { setPhase('request'); setError(''); setMessage(''); setOtp(''); setNewPassword(''); }} style={{ background: 'none', border: 'none', color: 'var(--tl-primary-light)', fontWeight: 500, cursor: 'pointer' }}>← Use a different email</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
