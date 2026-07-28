import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ExternalLink, Activity, Database, Calendar, Search, Crosshair, MapPin, Mail, Globe, Phone, FileText
} from 'lucide-react';
import api from '../utils/axios';
import { Badge } from '../components/ui/Badge';

const TYPE_ICONS = {
  URL:   <Globe size={18} />,
  OCR:   <FileText size={18} />,
  QR:    <Search size={18} />,
  EMAIL: <Mail size={18} />,
  PHONE: <Phone size={18} />,
};

function scoreVariant(s) {
  if (s == null) return 'outline';
  return s > 75 ? 'danger' : s > 40 ? 'warning' : 'success';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function IocDetail() {
  const { target } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIoc = async () => {
      try {
        const res = await api.get(`/api/v1/iocs/${encodeURIComponent(target)}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load IOC details.');
      } finally {
        setLoading(false);
      }
    };
    fetchIoc();
  }, [target]);

  if (loading) {
    return <div className="p-5 text-center" style={{ color: 'var(--tl-text-muted)' }}>Analyzing intelligence...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-5 text-center">
        <h4 style={{ color: 'var(--tl-danger)', marginBottom: '1rem' }}>{error}</h4>
        <button className="tl-btn tl-btn-secondary" onClick={() => navigate('/iocs')}>Return to Repository</button>
      </div>
    );
  }

  const { ioc, investigations } = data;

  return (
    <div className="pb-5">
      {/* Header */}
      <div className="mb-4">
        <button
          className="tl-btn tl-btn-ghost tl-btn-sm px-0 mb-3"
          onClick={() => navigate('/iocs')}
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          <ChevronLeft size={16} /> Back to Repository
        </button>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">
          <div>
            <h2 style={{ fontWeight: 800, color: 'var(--tl-text-primary)', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
              {ioc.target}
            </h2>
            <div className="d-flex align-items-center gap-3" style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>
              <span className="d-flex align-items-center gap-2">
                {TYPE_ICONS[ioc.type]} {ioc.type}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-2">
                <Database size={14} /> IOC Intelligence Record
              </span>
            </div>
          </div>
          <div>
            <button className="tl-btn tl-btn-primary" onClick={() => navigate(`/investigations/${ioc.type.toLowerCase()}`)}>
              <Crosshair size={16} /> Re-scan Target
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tl-card p-4 h-100">
            <div style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Max Threat Score
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: `var(--tl-${scoreVariant(ioc.max_threat_score)})` }}>
                {ioc.max_threat_score ?? 'N/A'}
              </span>
              <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.875rem' }}>/ 100</span>
            </div>
            <Badge variant={scoreVariant(ioc.max_threat_score)} className="mt-2">
              {ioc.max_threat_score > 75 ? 'MALICIOUS' : ioc.max_threat_score > 40 ? 'SUSPICIOUS' : 'SAFE'}
            </Badge>
          </motion.div>
        </div>

        <div className="col-12 col-md-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="tl-card p-4 h-100">
            <div style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Total Occurrences
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--tl-text-primary)' }}>
              {ioc.occurrence_count}
            </div>
            <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
              Times investigated by your team
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-md-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="tl-card p-4 h-100 d-flex flex-column justify-content-center">
            <div className="mb-3">
              <div style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                First Seen
              </div>
              <div className="d-flex align-items-center gap-2" style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>
                <Calendar size={14} style={{ color: 'var(--tl-primary-light)' }} /> {formatDate(ioc.first_seen)}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Last Seen
              </div>
              <div className="d-flex align-items-center gap-2" style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>
                <Calendar size={14} style={{ color: 'var(--tl-primary-light)' }} /> {formatDate(ioc.last_seen)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Linked Investigations */}
      <h5 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem', marginTop: '2rem' }}>
        Linked Investigations
      </h5>
      <div className="tl-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="tl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Threat Score</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((inv, idx) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.8125rem', color: 'var(--tl-text-faint)' }}>
                    {inv.id}
                  </td>
                  <td>
                    <Badge variant={inv.status === 'COMPLETED' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </td>
                  <td>
                    <Badge variant={scoreVariant(inv.threat_score)}>
                      {inv.threat_score ?? 'N/A'}
                    </Badge>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>
                    {formatDate(inv.created_at)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="tl-btn tl-btn-ghost tl-btn-sm"
                      onClick={() => navigate(`/investigations/detail/${inv.id}`)}
                    >
                      View Report <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
