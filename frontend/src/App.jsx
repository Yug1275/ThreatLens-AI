import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Lock, Globe, Search, BarChart3, Brain } from 'lucide-react';

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UrlInvestigation = React.lazy(() => import('./pages/UrlInvestigation'));
const OcrInvestigation = React.lazy(() => import('./pages/OcrInvestigation'));
const QrInvestigation = React.lazy(() => import('./pages/QrInvestigation'));
const EmailInvestigation = React.lazy(() => import('./pages/EmailInvestigation'));
const PhoneInvestigation = React.lazy(() => import('./pages/PhoneInvestigation'));
const InvestigationHistory = React.lazy(() => import('./pages/InvestigationHistory'));
const InvestigationDetail = React.lazy(() => import('./pages/InvestigationDetail'));
const Reports = React.lazy(() => import('./pages/Reports'));
const MonitoringDashboard = React.lazy(() => import('./pages/MonitoringDashboard'));

const IocRepository = React.lazy(() => import('./pages/IocRepository'));
const IocDetail = React.lazy(() => import('./pages/IocDetail'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));


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
        <NotificationProvider>
          <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'var(--tl-bg-base)' }}><div className="spinner-border text-primary" role="status"></div></div>}>
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
                <Route path="investigations/url" element={<UrlInvestigation />} />
                <Route path="investigations/ocr" element={<OcrInvestigation />} />
                <Route path="investigations/qr" element={<QrInvestigation />} />
                <Route path="investigations/email" element={<EmailInvestigation />} />
                <Route path="investigations/phone" element={<PhoneInvestigation />} />
                <Route path="investigations/detail/:id" element={<InvestigationDetail />} />
                <Route path="history" element={<InvestigationHistory />} />
                <Route path="reports" element={<Reports />} />
                <Route path="iocs" element={<IocRepository />} />
                <Route path="iocs/:target" element={<IocDetail />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="monitoring" element={<MonitoringDashboard />} />
              </Route>
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
