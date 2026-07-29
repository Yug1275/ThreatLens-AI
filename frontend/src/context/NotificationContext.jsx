import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const NotificationContext = createContext();

const Toast = ({ id, type, title, message, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-success" size={20} />,
        warning: <AlertTriangle className="text-warning" size={20} />,
        error: <XCircle className="text-danger" size={20} />,
        info: <Info className="text-info" size={20} />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="tl-toast"
            style={{
                background: 'var(--tl-bg-elevated)',
                border: '1px solid var(--tl-border)',
                borderRadius: 'var(--tl-radius-md)',
                padding: '1rem',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                position: 'relative',
                width: '320px',
                zIndex: 9999
            }}
        >
            <div className="flex-shrink-0 mt-1">{icons[type] || icons.info}</div>
            <div className="flex-grow-1">
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--tl-text-primary)' }}>{title}</div>
                {message && <div style={{ fontSize: '0.85rem', color: 'var(--tl-text-faint)', marginTop: '0.25rem' }}>{message}</div>}
            </div>
            <button
                onClick={() => onClose(id)}
                style={{ background: 'none', border: 'none', color: 'var(--tl-text-faint)', padding: '0.25rem', cursor: 'pointer' }}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState(null);
    const [toasts, setToasts] = useState([]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, [user]);

    const fetchPreferences = useCallback(async () => {
        if (!user) return;
        try {
            const data = await notificationService.getPreferences();
            setPreferences(data);
        } catch (error) {
            console.error("Failed to fetch preferences:", error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();

        // Background monitoring polling if preferences allow
        let interval;
        if (user && preferences?.background_monitoring) {
            interval = setInterval(fetchNotifications, 30000); // poll every 30s
        }
        return () => clearInterval(interval);
    }, [user, preferences?.background_monitoring, fetchNotifications, fetchPreferences]);

    const addToast = (title, message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            preferences,
            setPreferences,
            fetchNotifications,
            fetchPreferences,
            markAsRead,
            markAllAsRead,
            addToast
        }}>
            {children}
            {/* Global Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none' /* let clicks pass through the container itself */
            }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                            <Toast {...toast} onClose={removeToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
