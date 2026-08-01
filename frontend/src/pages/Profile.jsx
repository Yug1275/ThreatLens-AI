import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mail, Loader2, CheckCircle, Camera, Shield, KeyRound, ArrowRight } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  
  // Profile Form State
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', bio: '', avatarUrl: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Password Reset State
  const [pwdPhase, setPwdPhase] = useState('idle'); // 'idle', 'request', 'reset'
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile?.first_name || '',
        lastName: user.profile?.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        avatarUrl: user.profile?.avatar_url || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/api/v1/auth/avatar', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.secure_url) {
        setFormData(prev => ({ ...prev, avatarUrl: res.data.secure_url }));
        setMessage("Profile image updated successfully.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to upload image. Check your backend configuration.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      await api.put('/api/v1/auth/profile', {
        first_name: formData.firstName, 
        last_name: formData.lastName, 
        bio: formData.bio,
        email: formData.email !== user.email ? formData.email : undefined,
        avatar_url: formData.avatarUrl || undefined
      });
      setMessage('Profile details updated successfully. If you changed your email, it may require re-login depending on session settings.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    setPwdError(''); setPwdMessage(''); setPwdLoading(true);
    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email: user.email });
      setPwdMessage(response.data.message || 'Verification code sent to your email.');
      setPwdPhase('reset');
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'An error occurred.');
    } finally { setPwdLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdMessage(''); setPwdLoading(true);
    try {
      const response = await api.post('/api/v1/auth/reset-password', { 
        email: user.email, 
        otp, 
        new_password: newPassword 
      });
      setPwdMessage(response.data.message || 'Password updated successfully!');
      setTimeout(() => {
        setPwdPhase('idle');
        setOtp('');
        setNewPassword('');
        setPwdMessage('');
      }, 3000);
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'An error occurred.');
    } finally { setPwdLoading(false); }
  };

  const initials = user ? (user.username || 'U').slice(0, 2).toUpperCase() : 'U';

  return (
    <div>
      <div className="tl-page-header">
        <h1 className="tl-page-title">Profile</h1>
        <p className="tl-page-subtitle">Manage your personal information and security</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-12 col-md-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="tl-card p-4 text-center">
              
              {/* Interactive Avatar */}
              <div 
                className="tl-avatar mx-auto mb-3" 
                style={{ 
                  width: '100px', height: '100px', fontSize: '2.5rem', 
                  position: 'relative', cursor: 'pointer', overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <Loader2 size={32} className="spin" style={{ color: '#fff' }} />
                ) : formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
                <div 
                  className="tl-avatar-overlay"
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <Camera size={24} color="#fff" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#fff' }}>Change</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

              <h5 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '0.25rem' }}>
                {user?.username}
              </h5>
              <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {user?.email}
              </p>
              <span className="tl-badge tl-badge-primary">
                {user?.is_superuser ? 'Administrator' : 'Standard User'}
              </span>

              <div style={{ borderTop: '1px solid var(--tl-border)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--tl-text-muted)' }}>Status</span>
                  <span className="tl-badge tl-badge-success" style={{ padding: '0.125rem 0.5rem' }}>Active</span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--tl-text-muted)' }}>Plan</span>
                  <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>Pro</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Edit Form & Security */}
        <div className="col-12 col-md-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="tl-card p-4 mb-4">
              <h5 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--tl-border)' }}>
                Edit Details
              </h5>

              {error && (
                <div style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', border: '1px solid rgba(var(--tl-danger-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>
                  {error}
                </div>
              )}
              {message && (
                <div className="d-flex align-items-center gap-2" style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', border: '1px solid rgba(var(--tl-success-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
                  <CheckCircle size={16} /> {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="tl-label">First Name</label>
                    <input type="text" name="firstName" className="tl-input" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="tl-label">Last Name</label>
                    <input type="text" name="lastName" className="tl-input" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="tl-label">Email Address</label>
                  <input type="email" name="email" className="tl-input" value={formData.email} onChange={handleChange} required />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="tl-label">Bio</label>
                  <textarea
                    name="bio"
                    className="tl-input"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself"
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>

                <div className="d-flex justify-content-end">
                  <motion.button type="submit" className="tl-btn tl-btn-primary" disabled={loading} whileTap={{ scale: 0.98 }}>
                    {loading ? <><Loader2 size={16} className="spin" /> Saving...</> : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </div>
            
            {/* Security Card */}
            <div className="tl-card p-4">
              <h5 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--tl-border)' }}>
                Security
              </h5>

              {pwdError && (
                <div style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', border: '1px solid rgba(var(--tl-danger-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>
                  {pwdError}
                </div>
              )}
              {pwdMessage && (
                <div className="d-flex align-items-center gap-2" style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', border: '1px solid rgba(var(--tl-success-rgb), 0.2)', borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
                  <CheckCircle size={16} /> {pwdMessage}
                </div>
              )}

              <AnimatePresence mode="wait">
                {pwdPhase === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Change your password using email verification. We will send a 6-digit OTP to your registered email address ({user?.email}).
                    </p>
                    <motion.button 
                      onClick={handleRequestOTP} 
                      className="tl-btn" 
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--tl-border)' }}
                      disabled={pwdLoading}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pwdLoading ? <><Loader2 size={16} className="spin" /> Sending...</> : 'Reset Password via Email'}
                    </motion.button>
                  </motion.div>
                )}

                {pwdPhase === 'reset' && (
                  <motion.form key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={handleResetPassword}>
                    <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      Please check your email and enter the 6-digit verification code below, along with your new password.
                    </p>
                    
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="tl-label">Verification Code (OTP)</label>
                        <input type="text" className="tl-input" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '2px' }} />
                      </div>
                      <div className="col-md-6">
                        <label className="tl-label">New Password</label>
                        <input type="password" className="tl-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <motion.button type="button" onClick={() => { setPwdPhase('idle'); setPwdError(''); setPwdMessage(''); }} className="tl-btn" style={{ background: 'transparent', border: '1px solid var(--tl-border)' }}>
                        Cancel
                      </motion.button>
                      <motion.button type="submit" className="tl-btn tl-btn-primary" disabled={pwdLoading} whileTap={{ scale: 0.98 }}>
                        {pwdLoading ? <><Loader2 size={16} className="spin" /> Verifying...</> : 'Confirm Password Change'}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
