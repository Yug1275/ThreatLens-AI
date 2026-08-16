import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Globe, Mail, Phone, ScanLine, QrCode,
  ShieldAlert, Activity, Clock, CheckCircle, AlertTriangle, XCircle, X,
  Database, FileText, Link as LinkIcon, Download, Printer, Star, Edit3, Archive, Tag, MessageSquare, Brain
} from 'lucide-react';
import investigationService from '../services/investigationService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import UrlReportView from '../components/investigation/UrlReportView';
import AIInsightsModal from '../components/investigation/AIInsightsModal';

// ── Helpers ───────────────────────────────────────────────────────────── //

const Skeleton = ({ h = '20px', w = '100%' }) => (
  <div className="tl-skeleton" style={{ height: h, width: w }} />
);

const TYPE_META = {
  URL:   { icon: <Globe size={20} />, label: 'URL Investigation', color: '--tl-primary-light' },
  OCR:   { icon: <ScanLine size={20} />, label: 'OCR Screenshot', color: '--tl-info' },
  QR:    { icon: <QrCode size={20} />, label: 'QR Code Analysis', color: '--tl-warning' },
  EMAIL: { icon: <Mail size={20} />, label: 'Email Investigation', color: '--tl-success' },
  PHONE: { icon: <Phone size={20} />, label: 'Phone Intelligence', color: '--tl-accent' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Threat Gauge ─────────────────────────────────────────────────────── //

const ThreatGauge = ({ score }) => {
  let color = 'var(--tl-success)';
  let label = 'Safe';
  if (score > 40) { color = 'var(--tl-warning)'; label = 'Suspicious'; }
  if (score > 75) { color = 'var(--tl-danger)'; label = 'Malicious'; }

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score ?? 0) * 2.83} 283`} strokeLinecap="round"
            initial={{ strokeDasharray: '0 283' }}
            animate={{ strokeDasharray: `${(score ?? 0) * 2.83} 283` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1 }}>{score ?? '—'}</div>
        </div>
      </div>
      <Badge variant={score > 75 ? 'danger' : score > 40 ? 'warning' : 'success'} className="mt-3">
        {label}
      </Badge>
    </div>
  );
};

// ── Generic report sections shared across types ───────────────────────── //

const InfoRow = ({ label, value }) => (
  <div className="d-flex justify-content-between align-items-start py-2" style={{ borderBottom: '1px solid var(--tl-border)' }}>
    <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', flexShrink: 0, minWidth: 120 }}>{label}</span>
    <span style={{ color: 'var(--tl-text-primary)', fontSize: '0.8125rem', textAlign: 'right', wordBreak: 'break-all' }}>{value ?? 'N/A'}</span>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="tl-card p-4">
    <div className="d-flex align-items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--tl-border)', paddingBottom: '0.75rem' }}>
      {icon}
      <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>{title}</h6>
    </div>
    {children}
  </div>
);


// ── Email-specific result sections ────────────────────────────────────── //

const EmailReportSections = ({ data }) => (
  <>
    <SectionCard title="Email Details" icon={<Mail size={16} color="var(--tl-primary-light)" />}>
      <InfoRow label="Sender" value={data?.sender} />
      <InfoRow label="Recipient" value={data?.recipient} />
      <InfoRow label="Subject" value={data?.subject} />
      <InfoRow label="Date" value={data?.date} />
      <InfoRow label="Reply-To" value={data?.reply_to} />
      <InfoRow label="Return-Path" value={data?.return_path} />
    </SectionCard>

    {data?.input_mode === 'Raw Headers' && (data?.mailed_by !== 'Not Provided' || data?.signed_by !== 'Not Provided' || data?.security_tls !== 'Not Provided') && (
      <SectionCard title="Mail Infrastructure" icon={<Globe size={16} color="var(--tl-primary-light)" />}>
        <InfoRow label="Mailed By" value={data?.mailed_by} />
        <InfoRow label="Signed By" value={data?.signed_by} />
        <InfoRow label="Connection Security" value={data?.security_tls} />
      </SectionCard>
    )}

    {data?.input_mode === 'Raw Headers' && data?.spf !== 'Not Provided' ? (
      <SectionCard title="Domain Authentication" icon={<ShieldAlert size={16} color="var(--tl-primary-light)" />}>
        {['spf', 'dkim', 'dmarc'].map(key => (
          <div key={key} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--tl-border)' }}>
            <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem' }}>{key.toUpperCase()}</span>
            {data?.[key]?.toLowerCase() === 'pass'
              ? <Badge variant="success">Pass</Badge>
              : data?.[key]?.toLowerCase() === 'fail'
              ? <Badge variant="danger">Fail</Badge>
              : <Badge variant="outline">{data?.[key] ?? 'Unavailable'}</Badge>}
          </div>
        ))}
      </SectionCard>
    ) : (
      <SectionCard title="Authentication Analysis" icon={<ShieldAlert size={16} color="var(--tl-primary-light)" />}>
        <div className="d-flex align-items-center gap-2 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>
            <AlertTriangle size={16} />
            <span><strong>Unavailable:</strong> Complete SMTP headers were not supplied. Authentication checks (SPF, DKIM, and DMARC) require complete original headers.</span>
        </div>
      </SectionCard>
    )}

    <SectionCard title="Detection Indicators" icon={<ShieldAlert size={16} color="var(--tl-primary-light)" />}>
      {data?.matched_rules?.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {data.matched_rules.map((ind, i) => {
            const isWarning = ind.includes("Not Available") || ind.includes("missing") || ind.includes("skipped");
            return (
              <div key={i} className="d-flex align-items-start gap-2 p-2 rounded" style={{ background: isWarning ? 'rgba(var(--tl-warning-rgb), 0.1)' : 'rgba(var(--tl-danger-rgb), 0.1)', color: isWarning ? 'var(--tl-warning)' : 'var(--tl-danger)', fontSize: '0.8125rem' }}>
                {isWarning ? <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} /> : <XCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />}
                <span>{ind}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
          <CheckCircle size={14} />
          <span>No high-risk indicators detected.</span>
        </div>
      )}
    </SectionCard>

    <SectionCard title="Extracted Entities (IOCs)" icon={<Database size={16} color="var(--tl-primary-light)" />}>
      {data?.extracted_iocs?.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
            <thead>
              <tr>
                <th style={{ color: 'var(--tl-text-muted)', borderBottom: '1px solid var(--tl-border)' }}>Type</th>
                <th style={{ color: 'var(--tl-text-muted)', borderBottom: '1px solid var(--tl-border)' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.extracted_iocs.map((ioc, i) => (
                <tr key={i} style={{ verticalAlign: 'middle' }}>
                  <td style={{ borderColor: 'var(--tl-border)', color: 'var(--tl-text-primary)' }}>{ioc.type}</td>
                  <td style={{ borderColor: 'var(--tl-border)', fontFamily: 'var(--tl-font-mono)', color: 'var(--tl-primary-light)' }}>{ioc.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-3 text-center rounded" style={{ background: 'var(--tl-bg-surface)', color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>
          No identifiable entities extracted.
        </div>
      )}
    </SectionCard>
  </>
);

// ── Phone-specific result sections ────────────────────────────────────── //

const PhoneReportSections = ({ data }) => (
  <SectionCard title="Phone Intelligence" icon={<Phone size={16} color="var(--tl-primary-light)" />}>
    <InfoRow label="Number" value={data?.normalized_number} />
    <InfoRow label="Country" value={data?.country_name} />
    <InfoRow label="Country Code" value={data?.country_code} />
    <InfoRow label="Region" value={data?.region} />
    <InfoRow label="Carrier" value={data?.carrier} />
    <InfoRow label="Line Type" value={data?.line_type} />
    <InfoRow label="Risk Level" value={data?.risk_level} />
    <InfoRow label="Threat Score" value={data?.threat_score} />
  </SectionCard>
);

// ── Generic JSON fallback ─────────────────────────────────────────────── //

const GenericReport = ({ data }) => (
  <SectionCard title="Raw Result Data" icon={<Database size={16} color="var(--tl-primary-light)" />}>
    <pre style={{
      background: 'var(--tl-bg-surface)', borderRadius: 8, padding: '1rem',
      fontSize: '0.75rem', color: 'var(--tl-text-secondary)',
      overflow: 'auto', maxHeight: 400, margin: 0,
      fontFamily: 'var(--tl-font-mono)',
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  </SectionCard>
);

// ── Main Page ─────────────────────────────────────────────────────────── //

export default function InvestigationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inv, setInv]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  // Edit Modal State
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    setLoading(true);
    investigationService.getById(id)
      .then(data => { 
        setInv(data); 
        setEditName(data.name || '');
        setEditNotes(data.notes || '');
        setEditTags(data.tags ? data.tags.join(', ') : '');
        setLoading(false); 
      })
      .catch(e => {
        setError(e.response?.status === 404 ? 'Investigation not found.' : 'Failed to load investigation.');
        setLoading(false);
      });
  };

  const meta = inv ? (TYPE_META[inv.type] || TYPE_META.URL) : null;

  const handleExportJson = () => {
    if (!inv) return;
    const blob = new Blob([JSON.stringify(inv, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `investigation_${inv.id}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFavorite = async () => {
    try {
      const updated = await investigationService.updateInvestigation(inv.id, { is_favorite: !inv.is_favorite });
      setInv(updated);
    } catch(e) {
      console.error(e);
    }
  };

  const toggleArchive = async () => {
    try {
      const updated = await investigationService.updateInvestigation(inv.id, { is_archived: !inv.is_archived });
      setInv(updated);
    } catch(e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const tagsArray = editTags.split(',').map(s => s.trim()).filter(Boolean);
      const updated = await investigationService.updateInvestigation(inv.id, {
        name: editName,
        notes: editNotes,
        tags: tagsArray
      });
      setInv(updated);
      setShowEdit(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-5">
      {/* Back link & Export */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <button
          className="tl-btn tl-btn-ghost tl-btn-sm"
          onClick={() => navigate('/history')}
          style={{ paddingLeft: 0 }}
        >
          <ChevronLeft size={16} /> Back to History
        </button>
        <div className="d-flex gap-2">
          {inv && (
            <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={toggleFavorite} title="Toggle Favorite">
              <Star size={16} color={inv.is_favorite ? "var(--tl-warning)" : "var(--tl-text-muted)"} fill={inv.is_favorite ? "var(--tl-warning)" : "none"} />
            </button>
          )}
          <button className="tl-btn tl-btn-secondary tl-btn-sm" onClick={handleExportJson}>
            <Download size={14} /> Export JSON
          </button>
          <button className="tl-btn tl-btn-secondary tl-btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-4">
          <div className="tl-card p-4"><Skeleton h="32px" w="40%" /><div className="mt-2"><Skeleton h="16px" w="60%" /></div></div>
          <div className="row g-4">
            <div className="col-md-4"><div className="tl-card p-4"><Skeleton h="160px" /></div></div>
            <div className="col-md-8"><div className="tl-card p-4"><Skeleton h="160px" /></div></div>
          </div>
        </div>
      ) : error ? (
        <div className="tl-card p-5 text-center">
          <AlertTriangle size={36} color="var(--tl-danger)" className="mb-3" />
          <h5 style={{ color: 'var(--tl-text-primary)' }}>{error}</h5>
          <button className="tl-btn tl-btn-secondary mt-3" onClick={() => navigate('/history')}>← History</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Page header */}
          <div className="tl-card p-4 mb-4" style={{ borderLeft: inv.is_archived ? '4px solid var(--tl-text-muted)' : '4px solid transparent' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div className="d-flex align-items-start gap-3 flex-wrap flex-grow-1">
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: `rgba(var(--tl-primary-rgb), 0.1)`,
                  color: `var(${meta?.color || '--tl-primary-light'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {meta?.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontWeight: 700, color: 'var(--tl-text-primary)', margin: 0, fontSize: '1.125rem' }}>
                      {inv.name || meta?.label}
                    </h4>
                    <Badge variant={inv.threat_score > 75 ? 'danger' : inv.threat_score > 40 ? 'warning' : 'success'}>
                      {inv.threat_score > 75 ? 'Malicious' : inv.threat_score > 40 ? 'Suspicious' : 'Safe'}
                    </Badge>
                    {inv.is_archived && <Badge variant="outline">Archived</Badge>}
                  </div>
                  <p style={{ color: 'var(--tl-text-muted)', margin: '4px 0 0', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                    {inv.target}
                  </p>
                  
                  {inv.tags && inv.tags.length > 0 && (
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {inv.tags.map(t => (
                        <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(var(--tl-info-rgb),0.1)', color: 'var(--tl-info)', padding: '2px 8px', borderRadius: 12 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="d-flex gap-3 mt-2 flex-wrap" style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>
                    <span><Clock size={11} style={{ marginRight: 4 }} />{formatDate(inv.created_at)}</span>
                    <span style={{ fontFamily: 'var(--tl-font-mono)', opacity: 0.7 }}>{inv.id}</span>
                  </div>
                </div>
              </div>

              {/* Edit/Archive/AI Actions */}
              <div className="d-flex gap-2 flex-shrink-0 no-print">
                <button 
                  className="tl-btn tl-btn-primary tl-btn-sm" 
                  onClick={() => setShowAIModal(true)}
                >
                  <Brain size={14} /> AI Analysis
                </button>
                <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => setShowEdit(true)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={toggleArchive}>
                  <Archive size={14} /> {inv.is_archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
            
            {/* Notes Section embedded in Header */}
            {inv.notes && (
              <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', border: '1px solid var(--tl-border)' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: 'var(--tl-text-secondary)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <MessageSquare size={14} /> Analyst Notes
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {inv.notes}
                </div>
              </div>
            )}
          </div>

          {/* Report body */}
          {inv.type === 'URL' ? (
            <div className="mt-4 d-flex flex-column gap-4">
              <UrlReportView result={inv.result_data} />
            </div>
          ) : (
            <div className="row g-4">
              {/* Threat gauge (Legacy layout for non-URL) */}
              <div className="col-12 col-md-4 col-xl-3">
                <div className="tl-card p-4 text-center">
                  <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', textAlign: 'left', marginBottom: '1.5rem' }}>Risk Assessment</h6>
                  <ThreatGauge score={inv.threat_score ?? 0} />
                  {inv.result_data?.summary && (
                    <div className="mt-4 p-3 rounded text-start" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', lineHeight: 1.6 }}>
                      {inv.result_data.summary}
                    </div>
                  )}
                </div>
              </div>

              {/* Type-specific sections */}
              <div className="col-12 col-md-8 col-xl-9 d-flex flex-column gap-4">
                {inv.type === 'EMAIL' && <EmailReportSections data={inv.result_data} />}
                {inv.type === 'PHONE' && <PhoneReportSections data={inv.result_data} />}
                {!['URL', 'EMAIL', 'PHONE'].includes(inv.type) && <GenericReport data={inv.result_data} />}

                {/* AI recommendations */}
                {inv.result_data?.recommendations && (
                  <SectionCard title="Recommendations" icon={<FileText size={16} color="var(--tl-primary-light)" />}>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      {Array.isArray(inv.result_data.recommendations)
                        ? inv.result_data.recommendations.map((r, i) => (
                            <li key={i} style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>{r}</li>
                          ))
                        : <li style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>{inv.result_data.recommendations}</li>
                      }
                    </ul>
                  </SectionCard>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEdit && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="tl-card p-4"
              style={{ maxWidth: 500, width: '100%' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div style={{ fontWeight: 700, color: 'var(--tl-text-primary)', fontSize: '1.125rem' }}>Edit Metadata</div>
                <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="mb-3">
                <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Name (Optional)</label>
                <input 
                  type="text" 
                  className="tl-input w-100" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="e.g., Phishing attempt Q3..."
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>
                  <Tag size={13} /> Tags (Comma separated)
                </label>
                <input 
                  type="text" 
                  className="tl-input w-100" 
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="e.g., malware, urgent, credential-harvesting"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', fontWeight: 500 }}>Analyst Notes</label>
                <textarea 
                  className="tl-input w-100" 
                  rows={5}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add your findings, IOCs, or thoughts..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="d-flex gap-3 justify-content-end">
                <Button variant="ghost" onClick={() => setShowEdit(false)} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIInsightsModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        aiAnalysis={inv?.result_data?.ai_analysis}
        investigationId={inv?.id}
        investigationType={inv?.type}
      />
    </div>
  );
}
