import React, { useState, useContext, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Search, Shield, FileText, History, Settings, LogOut,
  Menu, ChevronRight, X, Crosshair, QrCode, Mail, PhoneCall, Database, Activity
} from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close mobile sidebar on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'URL Investigation', path: '/investigations/url', icon: Crosshair },
    { name: 'OCR Investigation', path: '/investigations/ocr', icon: FileText },
    { name: 'QR Investigation', path: '/investigations/qr', icon: QrCode },
    { name: 'Email Investigation', path: '/investigations/email', icon: Mail },
    { name: 'Phone Investigation', path: '/investigations/phone', icon: PhoneCall },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Analyst Workspace', path: '/history', icon: History },
  ];

  const secondaryNav = [
    { name: 'Threat Intel', path: '/reports', icon: Shield },
    { name: 'IOCs', path: '/iocs', icon: Database },
    { name: 'System Status', path: '/monitoring', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const pageName = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  const initials = user ? (user.username || 'U').slice(0, 2).toUpperCase() : 'U';

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || 
                     (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    return (
      <Link 
        to={item.path} 
        className={`tl-nav-item ${isActive ? 'active' : ''}`}
        title={!sidebarOpen ? item.name : undefined}
      >
        <Icon className="tl-nav-icon" size={20} />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <div className="tl-app">
      {/* Animated Background */}
      <div className="tl-animated-bg">
        <div className="tl-orb tl-orb-1" />
        <div className="tl-orb tl-orb-2" />
        <div className="tl-orb tl-orb-3" />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="tl-sidebar-overlay" style={{ display: 'block' }} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <motion.aside 
        ref={sidebarRef}
        className={`tl-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ width: sidebarOpen ? 264 : 76 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Sidebar Header */}
        <div className="tl-sidebar-header" style={{ justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="d-flex align-items-center gap-2"
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tl-text-primary)' }}>
                  Threat<span className="text-gradient">Lens</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(false); }} className="tl-navbar-icon-btn d-none d-lg-flex">
            <Menu size={18} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="tl-navbar-icon-btn d-lg-none">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="tl-sidebar-nav">
          {sidebarOpen && <div className="tl-nav-section">Main</div>}
          {mainNav.map(item => <NavItem key={item.name} item={item} />)}

          {sidebarOpen && <div className="tl-nav-section">System</div>}
          {secondaryNav.map(item => <NavItem key={item.name} item={item} />)}
        </div>

        {/* Sidebar Footer */}
        <div className="tl-sidebar-footer">
          <button onClick={handleLogout} className="tl-nav-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}>
            <LogOut size={20} className="tl-nav-icon" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div 
        className={`tl-main-content ${mobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ marginLeft: mobileOpen ? 0 : (sidebarOpen ? 264 : 76) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Navbar */}
        <header className="tl-navbar">
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="tl-navbar-icon-btn d-lg-none">
              <Menu size={20} />
            </button>
            <div className="tl-breadcrumb d-none d-md-flex">
              <span className="tl-breadcrumb-item">ThreatLens</span>
              <ChevronRight size={14} className="tl-breadcrumb-separator" />
              <span className="tl-breadcrumb-item active">{pageTitle}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="tl-search-bar d-none d-md-block">
              <Search className="search-icon" size={16} />
              <input type="text" placeholder="Search..." />
              <span className="search-shortcut">⌘K</span>
            </div>

            <NotificationCenter />

            <div style={{ width: 1, height: 24, background: 'var(--tl-border)', margin: '0 0.25rem' }} />

            <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none" style={{ padding: '0.375rem' }}>
              <div className="tl-avatar" style={{ overflow: 'hidden' }}>
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="tl-page-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
