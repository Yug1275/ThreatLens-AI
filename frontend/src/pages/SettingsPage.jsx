import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Save, Shield, Clock, LogOut, Laptop, Monitor, Smartphone, Globe } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';
import securityService from '../services/securityService';
import { formatDistanceToNow } from 'date-fns';

export default function SettingsPage() {
    const { preferences, setPreferences, addToast } = useContext(NotificationContext);
    const [localPrefs, setLocalPrefs] = useState({
        email_alerts: true,
        browser_alerts: true,
        background_monitoring: true,
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications');
    const [sessions, setSessions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        if (preferences) {
            setLocalPrefs({
                email_alerts: preferences.email_alerts,
                browser_alerts: preferences.browser_alerts,
                background_monitoring: preferences.background_monitoring,
            });
        }
    }, [preferences]);

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const fetchSessions = async () => {
        try {
            const data = await securityService.getSessions();
            setSessions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const data = await securityService.getAuditLogs();
            setAuditLogs(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggle = (key) => {
        setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await notificationService.updatePreferences(localPrefs);
            setPreferences(updated);
            addToast('Settings Saved', 'Your notification preferences have been updated.', 'success');
        } catch (error) {
            console.error("Failed to save preferences:", error);
            addToast('Error', 'Failed to save preferences.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (id) => {
        try {
            await securityService.revokeSession(id);
            addToast('Session Revoked', 'The selected session has been terminated.', 'success');
            fetchSessions();
        } catch (e) {
            addToast('Error', 'Failed to revoke session.', 'error');
        }
    };

    const getDeviceIcon = (userAgent) => {
        const ua = (userAgent || '').toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return <Smartphone size={16} />;
        if (ua.includes('macintosh') || ua.includes('windows') || ua.includes('linux')) return <Laptop size={16} />;
        return <Globe size={16} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
        >
            <div className="tl-page-header">
                <h1 className="tl-page-title">Settings</h1>
                <p className="tl-page-subtitle">Manage your account and preferences.</p>
            </div>

            <div className="row">
                <div className="col-md-3 mb-4">
                    <div className="list-group tl-nav-group">
                        <button 
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                            style={{ background: activeTab === 'notifications' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: activeTab === 'notifications' ? 'var(--tl-text-primary)' : 'var(--tl-text-muted)' }}
                        >
                            <Bell size={16} /> Notifications
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'sessions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sessions')}
                            style={{ background: activeTab === 'sessions' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: activeTab === 'sessions' ? 'var(--tl-text-primary)' : 'var(--tl-text-muted)' }}
                        >
                            <Shield size={16} /> Active Sessions
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'audit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('audit')}
                            style={{ background: activeTab === 'audit' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: activeTab === 'audit' ? 'var(--tl-text-primary)' : 'var(--tl-text-muted)' }}
                        >
                            <Clock size={16} /> Activity History
                        </button>
                    </div>
                </div>

                <div className="col-md-9">
                    <AnimatePresence mode="wait">
                        {activeTab === 'notifications' && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="tl-card p-4"
                            >
                                <div className="d-flex align-items-center gap-2 mb-4" style={{ color: 'var(--tl-primary)' }}>
                                    <Bell size={20} />
                                    <h5 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Notification Preferences</h5>
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { key: 'email_alerts', label: 'Email Alerts', desc: 'Receive critical alerts and reports via email' },
                                        { key: 'browser_alerts', label: 'Browser Alerts', desc: 'Show toast notifications while in the app' },
                                        { key: 'background_monitoring', label: 'Background Monitoring', desc: 'Periodically check for new threats and intel' },
                                    ].map((item) => (
                                        <div key={item.key} className="d-flex justify-content-between align-items-center p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--tl-radius-md)', border: '1px solid var(--tl-border)' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--tl-text-muted)' }}>{item.desc}</div>
                                            </div>
                                            <div className="form-check form-switch" style={{ margin: 0 }}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={localPrefs[item.key]}
                                                    onChange={() => handleToggle(item.key)}
                                                    style={{ cursor: 'pointer', width: '2.5rem', height: '1.25rem' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-top text-end" style={{ borderColor: 'var(--tl-border) !important' }}>
                                    <button
                                        className="tl-btn tl-btn-primary"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : <><Save size={16} /> Save Preferences</>}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'sessions' && (
                            <motion.div
                                key="sessions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="tl-card p-4"
                            >
                                <div className="d-flex align-items-center gap-2 mb-4" style={{ color: 'var(--tl-primary)' }}>
                                    <Shield size={20} />
                                    <h5 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Active Sessions</h5>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>These devices are currently logged into your account. Revoke any sessions you do not recognize.</p>
                                
                                <div className="d-flex flex-column gap-3 mt-4">
                                    {sessions.length === 0 ? (
                                        <div className="text-center p-4 text-muted">No active sessions found.</div>
                                    ) : sessions.map((sess) => (
                                        <div key={sess.id} className="d-flex justify-content-between align-items-center p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--tl-radius-md)', border: '1px solid var(--tl-border)' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--tl-text-primary)' }}>
                                                    {getDeviceIcon(sess.user_agent)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)', fontSize: '0.95rem' }}>
                                                        {sess.ip_address}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--tl-text-muted)' }}>
                                                        Last active: {formatDistanceToNow(new Date(sess.created_at), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                className="tl-btn" 
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                onClick={() => handleRevokeSession(sess.id)}
                                            >
                                                <LogOut size={14} /> Revoke
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'audit' && (
                            <motion.div
                                key="audit"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="tl-card p-4"
                            >
                                <div className="d-flex align-items-center gap-2 mb-4" style={{ color: 'var(--tl-primary)' }}>
                                    <Clock size={20} />
                                    <h5 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Activity History</h5>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>A complete audit log of your recent actions within ThreatLens AI.</p>
                                
                                <div className="mt-4 tl-table-container">
                                    <table className="tl-table w-100">
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Resource</th>
                                                <th>IP Address</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center p-4 text-muted">No recent activity.</td>
                                                </tr>
                                            ) : auditLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--tl-text-primary)' }}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td>{log.resource_type || '-'}</td>
                                                    <td style={{ color: 'var(--tl-text-muted)' }}>{log.ip_address || '-'}</td>
                                                    <td style={{ color: 'var(--tl-text-muted)' }}>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
