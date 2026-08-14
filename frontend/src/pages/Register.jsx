import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (!validatePassword(formData.password)) return setError('Password must be 8+ chars with uppercase, lowercase, number, and special character.');
    setLoading(true);
    try {
      await register({
        email: formData.email, username: formData.username, password: formData.password,
        first_name: formData.firstName, last_name: formData.lastName
      });
      navigate('/dashboard');
    } catch (err) { setError(err); } finally { setLoading(false); }
  };

  const InputField = ({ label, name, type = 'text', required = false, placeholder, autoComplete }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label className="tl-label">
        {label} {required && <span style={{ color: 'var(--tl-danger)' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        className="tl-input"
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );

  return (
    <div className="tl-auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="tl-auth-card tl-auth-card-wide">
          <div className="tl-auth-logo">
            <img src="/logo.png" alt="ThreatLens AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 className="tl-auth-title">Create your account</h2>
          <p className="tl-auth-subtitle">Join ThreatLens AI and start protecting your assets</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(var(--tl-danger-rgb), 0.1)',
                border: '1px solid rgba(var(--tl-danger-rgb), 0.2)',
                borderRadius: 'var(--tl-radius-sm)',
                padding: '0.75rem 1rem', marginBottom: '1.25rem',
                color: 'var(--tl-danger)', fontSize: '0.8125rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-6">
                <InputField label="First Name" name="firstName" placeholder="John" autoComplete="given-name" />
              </div>
              <div className="col-6">
                <InputField label="Last Name" name="lastName" placeholder="Doe" autoComplete="family-name" />
              </div>
            </div>

            <InputField label="Username" name="username" required placeholder="johndoe" autoComplete="username" />
            <InputField label="Email Address" name="email" type="email" required placeholder="john@company.com" autoComplete="email" />

            <div style={{ marginBottom: '1rem' }}>
              <label className="tl-label">Password <span style={{ color: 'var(--tl-danger)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="tl-input"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--tl-text-faint)', cursor: 'pointer', padding: 0, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="tl-label">Confirm Password <span style={{ color: 'var(--tl-danger)' }}>*</span></label>
              <input
                type="password"
                name="confirmPassword"
                className="tl-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <motion.button 
              type="submit"
              className="tl-btn tl-btn-primary w-100"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '0.75rem', fontSize: '0.9375rem' }}
            >
              {loading ? (
                <><Loader2 size={18} className="spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--tl-text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--tl-primary-light)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
