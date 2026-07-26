import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, Filter, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  AlertTriangle, ShieldCheck, Clock, Globe, Mail, Phone, ScanLine, QrCode,
  X, TriangleAlert
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

// ── Delete Confirm Modal ──────────────────────────────────────────────── //

const DeleteModal = ({ target, onConfirm, onCancel, loading }) => (
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
      <div className="d-flex align-items-center gap-3 mb-3">
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TriangleAlert size={22} color="var(--tl-danger)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--tl-text-primary)', fontSize: '1rem' }}>Delete Investigation?</div>
          <div style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', marginTop: 2 }}>This action cannot be undone.</div>
        </div>
        <button onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
      <p style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Are you sure you want to delete the investigation for{' '}
        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 600, wordBreak: 'break-all' }}>{target}</span>?
      </p>
      <div className="d-flex gap-3 justify-content-end">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading} icon={<Trash2 size={15} />}>
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </motion.div>
  </div>
);

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
  const LIMIT = 15;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, target }
  const [deleting, setDeleting]         = useState(false);

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
      });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load investigation history.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters or search change
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, debouncedSearch, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // ── Delete flow ── //
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await investigationService.deleteInvestigation(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
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
          <div className="col-md-5">
            <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Search Target</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
              <input
                className="tl-input w-100"
                placeholder="Filter by target URL, filename…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Type */}
          <div className="col-md-3">
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
          <div className="col-md-3">
            <label className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Status</label>
            <select className="tl-input w-100" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Clear */}
          <div className="col-md-1 d-flex align-items-end">
            {(typeFilter || statusFilter || search) && (
              <button
                className="tl-btn tl-btn-ghost tl-btn-sm"
                onClick={() => { setType(''); setStatus(''); setSearch(''); }}
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="tl-card">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
          <div>
            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>
              {total > 0 ? `${total} Investigation${total !== 1 ? 's' : ''}` : 'Investigations'}
            </h6>
            {(typeFilter || statusFilter) && (
              <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                {[typeFilter, statusFilter].filter(Boolean).join(' · ')}
              </span>
            )}
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
              {search || typeFilter || statusFilter
                ? 'No results match your current filters. Try clearing them.'
                : 'Run your first investigation to see it here.'}
            </p>
            {!(search || typeFilter || statusFilter) && (
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
                  <th>Verdict</th>
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
                    >
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
                        <span style={{
                          color: 'var(--tl-text-primary)', fontWeight: 500, fontSize: '0.875rem',
                          display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={inv.target}>
                          {inv.target}
                        </span>
                        <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem', fontFamily: 'var(--tl-font-mono)' }}>
                          {inv.id.slice(0, 8)}…
                        </span>
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

                      {/* Verdict badge */}
                      <td>
                        <Badge variant={scoreVariant(inv.threat_score)}>
                          {scoreLabel(inv.threat_score)}
                        </Badge>
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
                        <button
                          className="tl-btn tl-btn-ghost tl-btn-sm"
                          onClick={() => navigate(`/investigations/detail/${inv.id}`)}
                          title="View report"
                        >
                          <ExternalLink size={13} /> View
                        </button>
                        <button
                          className="tl-btn tl-btn-ghost tl-btn-sm ms-1"
                          style={{ color: 'var(--tl-danger)' }}
                          onClick={() => setDeleteTarget({ id: inv.id, target: inv.target })}
                          title="Delete investigation"
                        >
                          <Trash2 size={13} />
                        </button>
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

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            target={deleteTarget.target}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
