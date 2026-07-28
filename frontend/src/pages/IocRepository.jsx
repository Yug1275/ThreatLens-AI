import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Database, Search, Filter, Globe, Mail, Phone, QrCode, ScanLine, Clock, ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import api from '../utils/axios';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';

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

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function IocRepository() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 20;

  const fetchIOCs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
      });
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      
      const res = await api.get(`/api/v1/iocs?${params.toString()}`);
      setItems(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      console.error("Failed to fetch IOCs", e);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchIOCs();
  }, [fetchIOCs]);

  // Handle Search Input (debounce in a real app, here we just use onKeyDown or onBlur)
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchIOCs();
    }
  };

  return (
    <div className="pb-5">
      <PageHeader
        title="IOC Intelligence Center"
        subtitle="Centralized repository of all investigated targets and Indicators of Compromise."
      />

      <div className="tl-card p-4 mb-4">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex gap-2 align-items-center" style={{ flex: '1 1 300px' }}>
            <div className="position-relative w-100">
              <Search className="position-absolute" size={16} style={{ left: 12, top: 10, color: 'var(--tl-text-faint)' }} />
              <input
                type="text"
                className="tl-input w-100"
                style={{ paddingLeft: 36 }}
                placeholder="Search domain, IP, email, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <select
              className="tl-input"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="URL">URL / Domain</option>
              <option value="EMAIL">Email Address</option>
              <option value="PHONE">Phone Number</option>
              <option value="OCR">Text/OCR</option>
              <option value="QR">QR Code</option>
            </select>
            <button className="tl-btn tl-btn-primary" onClick={fetchIOCs}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="tl-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="tl-table">
            <thead>
              <tr>
                <th>Target (IOC)</th>
                <th>Type</th>
                <th>Occurrences</th>
                <th>Max Threat Score</th>
                <th>Last Seen</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5" style={{ color: 'var(--tl-text-muted)' }}>
                    Loading IOCs...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5" style={{ color: 'var(--tl-text-muted)' }}>
                    No IOCs found matching your criteria.
                  </td>
                </tr>
              ) : (
                items.map((ioc, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>
                      {ioc.target}
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>
                        {TYPE_ICONS[ioc.type] || <Database size={14} />} {ioc.type}
                      </span>
                    </td>
                    <td>
                      <Badge variant="outline">{ioc.occurrence_count}</Badge>
                    </td>
                    <td>
                      <Badge variant={scoreVariant(ioc.max_threat_score)}>
                        {ioc.max_threat_score ?? 'N/A'} {ioc.max_threat_score > 75 ? '🔥' : ''}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--tl-text-faint)', fontSize: '0.8125rem' }}>
                      {timeAgo(ioc.last_seen)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="tl-btn tl-btn-ghost tl-btn-sm"
                        onClick={() => navigate(`/iocs/${encodeURIComponent(ioc.target)}`)}
                      >
                        Details <ArrowRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
            Page {page} of {pages} · {total} items
          </span>
          <div className="d-flex gap-2">
            <button className="tl-btn tl-btn-secondary tl-btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </button>
            <button className="tl-btn tl-btn-secondary tl-btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
