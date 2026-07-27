import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, Filter, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, Globe, Mail, Phone, ScanLine, QrCode,
  X, TriangleAlert, Star, MoreVertical, Edit3, Archive, RefreshCw, CheckSquare, Square, Tag, MessageSquare
} from 'lucide-react';
import investigationService from '../services/investigationService';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────── //

const TYPE_ICONS = {
  URL:   <Globe size={14} />,
  OCR:   <ScanLine size={14} />,
  QR:    <QrCode size={14} />,
  EMAIL: <Mail size={14} />,
  PHONE: <Phone size={14} />,
};

const TYPE_COLORS = {
  URL:   '--tl-primary-light',
  OCR:   '--tl-info',
  QR:    '--tl-warning',
  EMAIL: '--tl-success',
  PHONE: '--tl-accent',
};

function scoreVariant(score) {
  if (score == null) return 'outline';
  if (score > 75) return 'danger';
  if (score > 40) return 'warning';
  return 'success';
}

function scoreLabel(score) {
  if (score == null) return 'N/A';
  if (score > 75) return 'Malicious';
  if (score > 40) return 'Suspicious';
  return 'Safe';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const Skeleton = ({ h = '20px', w = '100%', rounded = false }) => (
  <div className="tl-skeleton" style={{ height: h, width: w, borderRadius: rounded ? 9999 : undefined }} />
);

// ── Modals ────────────────────────────────────────────────────────────── //

const ActionModal = ({ title, description, children, onConfirm, onCancel, confirmText, confirmVariant = 'primary', loading }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      onClick={e => e.stopPropagation()}
      className="tl-card p-4"
      style={{ maxWidth: 440, width: '100%' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div style={{ fontWeight: 700, color: 'var(--tl-text-primary)', fontSize: '1.125rem' }}>{title}</div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
      {description && <p style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{description}</p>}
      
      <div className="mb-4">
        {children}
      </div>

      <div className="d-flex gap-3 justify-content-end">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? 'Saving…' : confirmText}
        </Button>
      </div>
    </motion.div>
  </div>
);

// ── Dropdown Menu ─────────────────────────────────────────────────────── //

const RowMenu = ({ inv, onRename, onArchive, onDelete, onRerun }) => {
  const [open, setOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const hide = () => setOpen(false);
    document.addEventListener('click', hide);
    return () => document.removeEventListener('click', hide);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="tl-btn tl-btn-ghost tl-btn-sm" 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <MoreVertical size={16} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 50,
              background: 'var(--tl-bg-elevated)', border: '1px solid var(--tl-border)', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', padding: '0.5rem', minWidth: 160
            }}
          >
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onRename(inv)}>
              <Edit3 size={14} /> Rename / Notes
            </button>
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onArchive(inv)}>
              <Archive size={14} /> {inv.is_archived ? 'Unarchive' : 'Archive'}
            </button>
            <button className="dropdown-item d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-text-primary)' }} onClick={() => onRerun(inv)}>
              <RefreshCw size={14} /> Re-run
            </button>
            <div style={{ height: 1, background: 'var(--tl-border)', margin: '4px 0' }} />
            <button className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: '0.8125rem', padding: '6px 12px', borderRadius: 4, color: 'var(--tl-danger)' }} onClick={() => onDelete(inv)}>
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ── Main Page ─────────────────────────────────────────────────────────── //

const TYPES = ['', 'URL', 'OCR', 'QR', 'EMAIL', 'PHONE'];
const STATUSES = ['', 'COMPLETED', 'FAILED', 'PENDING'];

export default function InvestigationHistory() {
  const navigate = useNavigate();

  // Data state
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filters + pagination
  const [page, setPage]         = useState(1);
  const [typeFilter, setType]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy]     = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [viewFavorites, setViewFavorites] = useState(false);
  const [viewArchived, setViewArchived]   = useState(false);
  
  const LIMIT = 15;

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // single delete { id, target }
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editTarget, setEditTarget]     = useState(null); // { id, name, notes }
  const [submitting, setSubmitting]     = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // ── Fetch ── //
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investigationService.getAll({
        page,
        limit: LIMIT,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        is_favorite: viewFavorites ? true : undefined,
        is_archived: viewArchived ? true : false,
      });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      
      // Filter out selected IDs that are no longer in the list (optional)
      setSelectedIds(new Set());
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load investigation history.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder, viewFavorites, viewArchived]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters or search change
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder, viewFavorites, viewArchived]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // ── Selections ── //
  const toggleSelection = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  
  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  // ── Actions ── //
  const toggleFavorite = async (inv) => {
    try {
      await investigationService.updateInvestigation(inv.id, { is_favorite: !inv.is_favorite });
      fetchData(); // refresh list
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (inv) => {
    try {
      await investigationService.updateInvestigation(inv.id, { is_archived: !inv.is_archived });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await investigationService.deleteInvestigation(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} investigations?`)) return;
    setBulkDeleting(true);
    try {
      await investigationService.bulkDelete(Array.from(selectedIds));
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await investigationService.updateInvestigation(editTarget.id, {
        name: editTarget.name,
        notes: editTarget.notes
      });
      setEditTarget(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRerun = (inv) => {
    // A rerun is essentially starting a new investigation with the same target.
    // We can navigate to the respective page and pass the target in state.
    navigate(`/investigations/${inv.type.toLowerCase()}`, { state: { target: inv.target } });
  };

  return (
    <div className="pb-5">
      <PageHeader
        title="Investigation History"
        subtitle="Browse, filter, and manage all your past threat investigations."
      />

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tl-card p-4 mb-4">
        <div className="row g-3 align-items-end">
          {/* Search */}
          <div className="col-md-3">
            <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Search Target / Name</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
              <input
                className="tl-input w-100"
                placeholder="Target or name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Type */}
          <div className="col-md-2">
            <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Type</label>
            <div style={{ position: 'relative' }}>
              <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)', pointerEvents: 'none' }} />
              <select className="tl-input w-100" value={typeFilter} onChange={e => setType(e.target.value)} style={{ paddingLeft: '2.25rem' }}>
                <option value="">All Types</option>
                {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="col-md-2">
            <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Status</label>
            <select className="tl-input w-100" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Toggles */}
          <div className="col-md-4 d-flex align-items-center gap-3">
            <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--tl-text-primary)' }}>
              <input type="checkbox" checked={viewFavorites} onChange={e => setViewFavorites(e.target.checked)} style={{ accentColor: 'var(--tl-primary)' }} />
              <Star size={14} color={viewFavorites ? "var(--tl-warning)" : "var(--tl-text-muted)"} fill={viewFavorites ? "var(--tl-warning)" : "none"} /> Favorites Only
            </label>
            <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--tl-text-primary)' }}>
              <input type="checkbox" checked={viewArchived} onChange={e => setViewArchived(e.target.checked)} style={{ accentColor: 'var(--tl-primary)' }} />
              <Archive size={14} /> Show Archived
            </label>
          </div>

          {/* Clear */}
          <div className="col-md-1 d-flex align-items-end justify-content-end">
            {(typeFilter || statusFilter || search || viewFavorites || viewArchived) && (
              <button
                className="tl-btn tl-btn-ghost tl-btn-sm"
                onClick={() => { setType(''); setStatus(''); setSearch(''); setViewFavorites(false); setViewArchived(false); }}
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Bulk Actions Bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="tl-card p-3 mb-4 d-flex justify-content-between align-items-center" style={{ background: 'rgba(var(--tl-primary-rgb), 0.1)', borderColor: 'var(--tl-primary-light)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tl-text-primary)' }}>
                {selectedIds.size} item{selectedIds.size !== 1 && 's'} selected
              </span>
              <div className="d-flex gap-2">
                <Button variant="ghost" onClick={() => setSelectedIds(new Set())} size="sm">Cancel</Button>
                <Button variant="danger" onClick={handleBulkDelete} size="sm" disabled={bulkDeleting}>
                  <Trash2 size={14} /> {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="tl-card">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
          <div>
            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>
              {total > 0 ? `${total} Investigation${total !== 1 ? 's' : ''}` : 'Investigations'}
            </h6>
          </div>
        </div>

        {/* Body */}
        {error ? (
          <div className="p-5 text-center">
            <AlertTriangle size={32} color="var(--tl-danger)" className="mb-3" />
            <p style={{ color: 'var(--tl-text-muted)' }}>{error}</p>
            <Button onClick={fetchData} size="sm">Retry</Button>
          </div>
        ) : loading ? (
          <div className="p-4 d-flex flex-column gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="d-flex gap-3 align-items-center">
                <Skeleton w="28px" h="28px" rounded />
                <div style={{ flex: 1 }}><Skeleton h="14px" w="60%" /></div>
                <Skeleton h="14px" w="80px" />
                <Skeleton h="22px" w="70px" />
                <Skeleton h="14px" w="120px" />
                <Skeleton h="28px" w="60px" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-5 text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <History size={24} color="var(--tl-primary-light)" />
            </div>
            <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>No investigations yet</h6>
            <p style={{ color: 'var(--tl-text-muted)', maxWidth: 340, margin: '0 auto 1.25rem' }}>
              {search || typeFilter || statusFilter || viewFavorites || viewArchived
                ? 'No results match your current filters. Try clearing them.'
                : 'Run your first investigation to see it here.'}
            </p>
            {!(search || typeFilter || statusFilter || viewFavorites || viewArchived) && (
              <Button onClick={() => navigate('/investigations/url')}>
                Start Investigation
              </Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tl-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>
                    <button className="tl-btn-ghost p-1" onClick={toggleAll} style={{ background: 'none', border: 'none', color: 'var(--tl-text-muted)' }}>
                      {selectedIds.size === items.length && items.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th style={{ width: 40, textAlign: 'center' }}></th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                    Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('target')}>
                    Target {sortBy === 'target' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('threat_score')}>
                    Score {sortBy === 'threat_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('created_at')}>
                    Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((inv, i) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ background: selectedIds.has(inv.id) ? 'rgba(var(--tl-primary-rgb), 0.05)' : undefined }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <button className="tl-btn-ghost p-1" onClick={() => toggleSelection(inv.id)} style={{ background: 'none', border: 'none', color: selectedIds.has(inv.id) ? 'var(--tl-primary)' : 'var(--tl-text-muted)' }}>
                          {selectedIds.has(inv.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                      
                      {/* Favorite */}
                      <td style={{ textAlign: 'center' }}>
                        <button className="tl-btn-ghost p-1" onClick={() => toggleFavorite(inv)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Star size={16} color={inv.is_favorite ? 'var(--tl-warning)' : 'var(--tl-border)'} fill={inv.is_favorite ? 'var(--tl-warning)' : 'none'} />
                        </button>
                      </td>

                      {/* Type */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '3px 10px', borderRadius: 6,
                          background: 'rgba(var(--tl-primary-rgb),0.08)',
                          color: `var(${TYPE_COLORS[inv.type] || '--tl-primary-light'})`,
                          fontSize: '0.75rem', fontWeight: 600,
                        }}>
                          {TYPE_ICONS[inv.type] || null}
                          {inv.type}
                        </span>
                      </td>

                      {/* Target */}
                      <td style={{ maxWidth: 240 }}>
                        {inv.name ? (
                          <div style={{ color: 'var(--tl-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{inv.name}</div>
                        ) : null}
                        <span style={{
                          color: inv.name ? 'var(--tl-text-secondary)' : 'var(--tl-text-primary)', 
                          fontWeight: inv.name ? 400 : 500, fontSize: '0.875rem',
                          display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={inv.target}>
                          {inv.target}
                        </span>
                        
                        <div className="d-flex gap-2 mt-1">
                          {inv.is_archived && <span style={{ fontSize: '0.65rem', background: 'var(--tl-border)', padding: '2px 6px', borderRadius: 4, color: 'var(--tl-text-muted)' }}>ARCHIVED</span>}
                          {inv.tags && inv.tags.map(t => (
                            <span key={t} style={{ fontSize: '0.65rem', background: 'rgba(var(--tl-info-rgb),0.1)', color: 'var(--tl-info)', padding: '2px 6px', borderRadius: 4 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          padding: '3px 8px', borderRadius: 4,
                          background: inv.status === 'COMPLETED' ? 'rgba(var(--tl-success-rgb), 0.1)' : inv.status === 'FAILED' ? 'rgba(var(--tl-danger-rgb), 0.1)' : 'rgba(var(--tl-warning-rgb), 0.1)',
                          color: inv.status === 'COMPLETED' ? 'var(--tl-success)' : inv.status === 'FAILED' ? 'var(--tl-danger)' : 'var(--tl-warning)'
                        }}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Score */}
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: '0.9375rem',
                          color: inv.threat_score > 75 ? 'var(--tl-danger)' : inv.threat_score > 40 ? 'var(--tl-warning)' : 'var(--tl-success)',
                        }}>
                          {inv.threat_score ?? '—'}
                        </span>
                        {inv.threat_score != null && <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem' }}>/100</span>}
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} style={{ opacity: 0.5 }} />
                          {formatDate(inv.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div className="d-flex justify-content-end align-items-center gap-1">
                          <button
                            className="tl-btn tl-btn-ghost tl-btn-sm px-2"
                            onClick={() => navigate(`/investigations/detail/${inv.id}`)}
                            title="View report"
                          >
                            <ExternalLink size={14} />
                          </button>
                          
                          <RowMenu 
                            inv={inv}
                            onRename={(inv) => setEditTarget({ id: inv.id, name: inv.name || '', notes: inv.notes || '' })}
                            onArchive={handleArchive}
                            onDelete={(inv) => setDeleteTarget({ id: inv.id, target: inv.name || inv.target })}
                            onRerun={handleRerun}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-4" style={{ borderTop: '1px solid var(--tl-border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
              Page {page} of {pages} · {total} total
            </span>
            <div className="d-flex gap-2">
              <button
                className="tl-btn tl-btn-secondary tl-btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="tl-btn tl-btn-secondary tl-btn-sm"
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editTarget && (
          <ActionModal
            title="Edit Investigation"
            onConfirm={handleEditSave}
            onCancel={() => setEditTarget(null)}
            confirmText="Save Changes"
            loading={submitting}
          >
            <div className="mb-3">
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Name (Optional)</label>
              <input 
                type="text" 
                className="tl-input w-100" 
                value={editTarget.name}
                onChange={e => setEditTarget({...editTarget, name: e.target.value})}
                placeholder="Give this investigation a friendly name..."
              />
            </div>
            <div>
              <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Notes</label>
              <textarea 
                className="tl-input w-100" 
                rows={4}
                value={editTarget.notes}
                onChange={e => setEditTarget({...editTarget, notes: e.target.value})}
                placeholder="Add some notes about your findings..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </ActionModal>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <ActionModal
            title="Delete Investigation"
            description={`Are you sure you want to delete the investigation for ${deleteTarget.target}? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            confirmText="Delete"
            confirmVariant="danger"
            loading={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
