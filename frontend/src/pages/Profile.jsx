import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Loader2, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', bio: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        firstName: user.profile.first_name || '',
        lastName: user.profile.last_name || '',
        bio: user.profile.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      await api.put('/api/v1/auth/profile', {
        first_name: formData.firstName, last_name: formData.lastName, bio: formData.bio
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  const initials = user ? (user.username || 'U').slice(0, 2).toUpperCase() : 'U';

  return (
    <div>
      <div className="tl-page-header">
        <h1 className="tl-page-title">Profile</h1>
        <p className="tl-page-subtitle">Manage your personal information</p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-md-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="tl-card p-4 text-center">
              <div className="tl-avatar tl-avatar-lg mx-auto mb-3">{initials}</div>
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

        {/* Edit Form */}
        <div className="col-12 col-md-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="tl-card p-4">
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
