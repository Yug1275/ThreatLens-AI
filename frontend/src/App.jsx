import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Lock, Globe, Search, BarChart3, Brain } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import UrlInvestigation from './pages/UrlInvestigation';
import OcrInvestigation from './pages/OcrInvestigation';

/* ——————————————— Premium Landing Page ——————————————— */
const Home = () => (
  <div className="tl-hero">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
      <div className="tl-hero-badge">
        <Zap size={14} />
        AI-Powered Threat Intelligence Platform
      </div>
    </motion.div>

    <motion.h1 className="tl-hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
      Detect. Analyze.<br />
      <span className="gradient-text">Neutralize Threats.</span>
    </motion.h1>

    <motion.p className="tl-hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
      ThreatLens AI combines advanced artificial intelligence with comprehensive 
      cyber threat intelligence to protect your digital assets in real-time.
    </motion.p>

    <motion.div className="tl-hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
      <Link to="/register" className="tl-btn tl-btn-primary tl-btn-lg">
        Start Free Trial <ArrowRight size={18} />
      </Link>
      <Link to="/login" className="tl-btn tl-btn-secondary tl-btn-lg">
        Sign In
      </Link>
    </motion.div>

    <motion.div className="tl-hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>
      <div className="tl-hero-stat">
        <div className="tl-hero-stat-value">99.9%</div>
        <div className="tl-hero-stat-label">Detection Rate</div>
      </div>
      <div className="tl-hero-stat">
        <div className="tl-hero-stat-value">&lt;2s</div>
        <div className="tl-hero-stat-label">Avg Analysis Time</div>
      </div>
      <div className="tl-hero-stat">
        <div className="tl-hero-stat-value">50M+</div>
        <div className="tl-hero-stat-label">Threats Analyzed</div>
      </div>
    </motion.div>

    {/* Feature Cards */}
    <motion.div 
      className="row g-4 mt-5 w-100" style={{ maxWidth: '900px' }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
    >
      {[
        { icon: <Search size={24} />, title: 'URL Investigation', desc: 'Deep scan any URL for malware, phishing, and threats.' },
        { icon: <Brain size={24} />, title: 'AI Analysis', desc: 'Multi-model AI reasoning for comprehensive threat assessment.' },
        { icon: <Globe size={24} />, title: 'Real-time Intel', desc: 'Live threat feeds from global intelligence sources.' },
      ].map((f, i) => (
        <div key={i} className="col-md-4">
          <div className="tl-card tl-card-glow p-4 text-center h-100">
            <div className="tl-stat-icon mx-auto mb-3" style={{ background: 'rgba(var(--tl-primary-rgb), 0.1)', color: 'var(--tl-primary-light)' }}>
              {f.icon}
            </div>
            <h5 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '0.5rem' }}>{f.title}</h5>
            <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-muted)', marginBottom: 0 }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ——————————————— Placeholder Pages ——————————————— */
const PlaceholderPage = ({ title, description }) => (
  <div>
    <div className="tl-page-header">
      <h1 className="tl-page-title">{title}</h1>
      <p className="tl-page-subtitle">{description}</p>
    </div>
    <div className="tl-card p-5 text-center">
      <div className="tl-stat-icon mx-auto mb-3" style={{ width: 56, height: 56, background: 'rgba(var(--tl-primary-rgb), 0.1)', color: 'var(--tl-primary-light)', fontSize: '1.5rem' }}>
        <Lock size={24} />
      </div>
      <h5 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>Coming Soon</h5>
      <p style={{ color: 'var(--tl-text-muted)', maxWidth: 400, margin: '0 auto' }}>
        This module will be available in a future phase. Stay tuned for updates.
      </p>
    </div>
  </div>
);

const Investigations = () => <PlaceholderPage title="Investigations" description="Investigate URLs, files, IPs, and more." />;
const HistoryPage = () => <PlaceholderPage title="History" description="View past investigation history." />;
const Reports = () => <PlaceholderPage title="Reports" description="Generate and view threat reports." />;
const SettingsPage = () => <PlaceholderPage title="Settings" description="Manage your account preferences." />;
const NotFound = () => (
  <div className="tl-hero" style={{ minHeight: '80vh' }}>
    <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--tl-text-faint)' }}>404</h1>
    <p style={{ color: 'var(--tl-text-muted)', marginBottom: '1.5rem' }}>Page not found</p>
    <Link to="/" className="tl-btn tl-btn-primary">Go Home</Link>
  </div>
);

/* ——————————————— App Router ——————————————— */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="investigations" element={<Investigations />} />
            <Route path="investigations/url" element={<UrlInvestigation />} />
            <Route path="investigations/ocr" element={<OcrInvestigation />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
