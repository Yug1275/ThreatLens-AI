import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Settings, X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-success" size={16} />;
            case 'warning': return <AlertTriangle className="text-warning" size={16} />;
            case 'error': return <XCircle className="text-danger" size={16} />;
            default: return <Info className="text-info" size={16} />;
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button 
                className={`tl-navbar-icon-btn ${isOpen ? 'active' : ''}`} 
                onClick={toggleDropdown}
                style={{ outline: 'none' }}
            >
                <Bell size={18} />
                {unreadCount > 0 && <span className="tl-notification-dot" style={{ position: 'absolute', top: 4, right: 6, background: 'var(--tl-danger)', width: 8, height: 8, borderRadius: '50%' }} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="tl-dropdown-menu"
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '0.75rem',
                            width: '420px',
                            background: 'var(--tl-bg-elevated)',
                            border: '1px solid var(--tl-border)',
                            borderRadius: 'var(--tl-radius-md)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            boxShadow: 'var(--tl-shadow-xl)'
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-between p-3" style={{ borderBottom: '1px solid var(--tl-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <h5 className="m-0" style={{ fontWeight: 600, color: 'var(--tl-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                                <Bell size={18} className="text-primary" /> Notifications
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsRead()}
                                        className="btn btn-sm btn-link text-decoration-none p-0"
                                        style={{ fontSize: '0.85rem', color: 'var(--tl-primary)' }}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                <Link to="/settings" onClick={() => setIsOpen(false)} style={{ color: 'var(--tl-text-faint)', display: 'flex' }}>
                                    <Settings size={18} />
                                </Link>
                            </div>
                        </div>

                        <div className="tl-notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div className="p-5 text-center d-flex flex-column align-items-center justify-content-center h-100">
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <Bell size={24} style={{ color: 'var(--tl-text-faint)' }} />
                                    </div>
                                    <div style={{ color: 'var(--tl-text-secondary)', fontWeight: 500 }}>No notifications</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--tl-text-faint)' }}>You're all caught up!</div>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`d-flex p-3 gap-3 ${!notif.is_read ? 'bg-light-opacity' : ''}`}
                                        style={{ borderBottom: '1px solid var(--tl-border)', background: !notif.is_read ? 'rgba(var(--tl-primary-rgb), 0.05)' : 'transparent' }}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div style={{ fontWeight: !notif.is_read ? 600 : 500, fontSize: '1rem', color: 'var(--tl-text-primary)' }}>
                                                    {notif.title}
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-end gap-2">
                                                <div style={{ fontSize: '0.9rem', color: 'var(--tl-text-muted)' }}>
                                                    {notif.message}
                                                </div>
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        title="Mark as read"
                                                        style={{ background: 'none', border: 'none', color: 'var(--tl-primary)', padding: 0 }}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
