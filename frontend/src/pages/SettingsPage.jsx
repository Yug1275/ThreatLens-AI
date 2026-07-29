import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';

export default function SettingsPage() {
    const { preferences, setPreferences, addToast } = useContext(NotificationContext);
    const [localPrefs, setLocalPrefs] = useState({
        email_alerts: true,
        browser_alerts: true,
        background_monitoring: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (preferences) {
            setLocalPrefs({
                email_alerts: preferences.email_alerts,
                browser_alerts: preferences.browser_alerts,
                background_monitoring: preferences.background_monitoring,
            });
        }
    }, [preferences]);

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
                <div className="col-md-8 col-lg-6">
                    <div className="tl-card p-4">
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
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
