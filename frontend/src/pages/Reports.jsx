import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ExternalLink, Filter, Globe, Mail, Phone, ScanLine, QrCode,
  ShieldAlert, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight, Clock, TrendingUp, Download, Brain
} from 'lucide-react';
import investigationService from '../services/investigationService';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ExecutiveReportModal from '../components/investigation/ExecutiveReportModal';
import api from '../utils/axios';

// ── Helpers ───────────────────────────────────────────────────────────── //

const TYPE_ICONS = {
  URL:   <Globe size={16} />,
  OCR:   <ScanLine size={16} />,
  QR:    <QrCode size={16} />,
  EMAIL: <Mail size={16} />,
  PHONE: <Phone size={16} />,
};

function scoreVariant(s) {
  if (s == null) return 'outline';
  return s > 75 ? 'danger' : s > 40 ? 'warning' : 'success';
}
function scoreLabel(s) {
  if (s == null) return 'N/A';
  return s > 75 ? 'Malicious' : s > 40 ? 'Suspicious' : 'Safe';
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const Skeleton = ({ h = '20px', w = '100%' }) => (
  <div className="tl-skeleton" style={{ height: h, width: w }} />
);

// ── Score Arc ─────────────────────────────────────────────────────────── //

const ScoreArc = ({ score }) => {
  const s = score ?? 0;
  let color = 'var(--tl-success)';
  if (s > 75) color = 'var(--tl-danger)';
  else if (s > 40) color = 'var(--tl-warning)';

  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="5" />
        <motion.circle
          cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${s * 1.634} 163.4`} strokeLinecap="round"
          initial={{ strokeDasharray: '0 163.4' }}
          animate={{ strokeDasharray: `${s * 1.634} 163.4` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.9375rem', color: 'var(--tl-text-primary)',
      }}>
        {score ?? '—'}
      </div>
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────── //

const StatsBar = ({ items }) => {
  const total     = items.length;
  const malicious = items.filter(i => (i.threat_score ?? 0) > 75).length;
  const suspicious = items.filter(i => { const s = i.threat_score ?? 0; return s > 40 && s <= 75; }).length;
  const safe      = items.filter(i => (i.threat_score ?? 0) <= 40).length;
  const avg       = total > 0 ? Math.round(items.reduce((a, b) => a + (b.threat_score ?? 0), 0) / total) : 0;

  const STATS = [
    { label: 'Total Reports', value: total, color: '--tl-primary-rgb', Icon: FileText },
    { label: 'Malicious',     value: malicious, color: '--tl-danger-rgb', Icon: ShieldAlert },
    { label: 'Suspicious',    value: suspicious, color: '--tl-warning-rgb', Icon: AlertTriangle },
    { label: 'Safe',          value: safe, color: '--tl-success-rgb', Icon: ShieldCheck },
    { label: 'Avg. Score',   value: avg, color: '--tl-info-rgb', Icon: TrendingUp },
  ];

  return (
    <div className="row g-3 mb-4">
      {STATS.map(({ label, value, color, Icon }) => (
        <div key={label} className="col-6 col-md-4 col-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="tl-stat-card"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
              <div className="tl-stat-icon" style={{ background: `rgba(var(${color}), 0.1)`, color: `rgb(var(${color}))`, width: 30, height: 30 }}>
                <Icon size={14} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1.2 }}>
              {value}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// ── Report Card ───────────────────────────────────────────────────────── //

const ReportCard = ({ inv, onView }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="tl-card p-4 h-100 d-flex flex-column"
    style={{ cursor: 'default' }}
  >
    {/* Top row */}
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div className="d-flex align-items-center gap-2">
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 6,
          background: 'rgba(var(--tl-primary-rgb),0.08)',
          color: 'var(--tl-primary-light)',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          {TYPE_ICONS[inv.type] || <FileText size={14} />}
          {inv.type}
        </span>
      </div>
      <ScoreArc score={inv.threat_score} />
    </div>

    {/* Target */}
    <p style={{
      color: 'var(--tl-text-primary)', fontWeight: 600, fontSize: '0.9rem',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      marginBottom: '0.25rem',
    }} title={inv.target}>
      {inv.target}
    </p>
    <p style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem', fontFamily: 'var(--tl-font-mono)', marginBottom: '1rem' }}>
      {inv.id.slice(0, 12)}…
    </p>

    {/* Summary */}
    {inv.result_data?.summary && (
      <p style={{
        color: 'var(--tl-text-muted)', fontSize: '0.8125rem', lineHeight: 1.6,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', flex: 1, marginBottom: '1rem',
      }}>
        {inv.result_data.summary}
      </p>
    )}

    {/* Footer */}
    <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--tl-border)' }}>
      <div className="d-flex gap-2 align-items-center">
        <Badge variant={scoreVariant(inv.threat_score)}>{scoreLabel(inv.threat_score)}</Badge>
        <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} />
          {formatDate(inv.created_at)}
        </span>
      </div>
      <button
        className="tl-btn tl-btn-ghost tl-btn-sm"
        onClick={() => onView(inv.id)}
      >
        <ExternalLink size={13} /> View
      </button>
    </div>
  </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────── //

const TYPES = ['', 'URL', 'OCR', 'QR', 'EMAIL', 'PHONE'];
const LIMIT = 12;

export default function Reports() {
  const navigate = useNavigate();

  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [typeFilter, setType] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investigationService.getAll({
        page, limit: LIMIT,
        type: typeFilter || undefined,
        status: 'COMPLETED',   // Reports page only shows completed investigations
      });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [typeFilter]);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/api/v1/investigation/export?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investigations_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="pb-5">
      <PageHeader
        title="Threat Reports"
        subtitle="View structured reports from all your completed investigations."
      />

      {/* Stats */}
      {!loading && !error && <StatsBar items={items} />}

      {/* Filters & Export */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="d-flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button
              key={t || 'all'}
              className={`tl-btn tl-btn-sm ${typeFilter === t ? 'tl-btn-primary' : 'tl-btn-secondary'}`}
              onClick={() => setType(t)}
            >
              {t ? <>{TYPE_ICONS[t]} {t}</> : 'All Types'}
            </button>
          ))}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="d-flex gap-2 flex-wrap justify-content-end">
          <button 
            className="tl-btn tl-btn-primary tl-btn-sm" 
            onClick={() => setShowReportModal(true)}
            disabled={items.length === 0}
          >
            <Brain size={14} /> Executive Report
          </button>
          <button 
            className="tl-btn tl-btn-secondary tl-btn-sm" 
            onClick={() => handleExport('csv')}
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            className="tl-btn tl-btn-secondary tl-btn-sm" 
            onClick={() => handleExport('json')}
          >
            <Download size={14} /> Export JSON
          </button>
        </motion.div>
      </div>

      {/* Content */}
      {error ? (
        <div className="tl-card p-5 text-center">
          <AlertTriangle size={32} color="var(--tl-danger)" className="mb-3" />
          <p style={{ color: 'var(--tl-text-muted)' }}>{error}</p>
          <Button onClick={fetchData} size="sm">Retry</Button>
        </div>
      ) : loading ? (
        <div className="row g-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-xl-4">
              <div className="tl-card p-4">
                <div className="d-flex justify-content-between mb-3">
                  <Skeleton h="22px" w="70px" />
                  <Skeleton h="72px" w="72px" />
                </div>
                <Skeleton h="16px" w="80%" />
                <div className="mt-2"><Skeleton h="12px" w="50%" /></div>
                <div className="mt-3"><Skeleton h="56px" /></div>
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--tl-border)' }}>
                  <Skeleton h="22px" w="120px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="tl-card p-5 text-center">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FileText size={24} color="var(--tl-primary-light)" />
          </div>
          <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>No reports yet</h6>
          <p style={{ color: 'var(--tl-text-muted)', maxWidth: 340, margin: '0 auto 1.25rem' }}>
            {typeFilter ? `No completed ${typeFilter} investigations found.` : 'Complete your first investigation to generate a report.'}
          </p>
          <Button onClick={() => navigate('/investigations/url')}>
            Start Investigation
          </Button>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {items.map((inv) => (
              <div key={inv.id} className="col-12 col-md-6 col-xl-4">
                <ReportCard inv={inv} onView={id => navigate(`/investigations/detail/${id}`)} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
                Page {page} of {pages} · {total} reports
              </span>
              <div className="d-flex gap-2">
                <button className="tl-btn tl-btn-secondary tl-btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button className="tl-btn tl-btn-secondary tl-btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        investigationIds={items.map(i => i.id)}
      />
    </div>
  );
}
