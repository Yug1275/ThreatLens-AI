import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Globe, Mail, Phone, ScanLine, QrCode,
  ShieldAlert, Activity, Clock, CheckCircle, AlertTriangle, XCircle,
  Database, FileText, Link as LinkIcon
} from 'lucide-react';
import investigationService from '../services/investigationService';
import { Badge } from '../components/ui/Badge';

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

// ── URL-specific result sections ──────────────────────────────────────── //

const UrlReportSections = ({ data }) => {
  const di = data?.domain_info || {};
  const si = data?.ssl_info || {};

  const fmtDate = (iso) => {
    if (!iso) return null;
    try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <>
      <SectionCard title="Domain Identity" icon={<Globe size={16} color="var(--tl-primary-light)" />}>
        <InfoRow label="Root Domain" value={di.root_domain} />
        <InfoRow label="TLD" value={di.tld} />
        {di.subdomain && <InfoRow label="Subdomain" value={di.subdomain} />}
        <InfoRow label="Registrar" value={di.registrar} />
        <InfoRow label="Created" value={fmtDate(di.creation_date)} />
        <InfoRow label="Domain Age" value={di.domain_age_label} />
        <InfoRow label="Country" value={di.registrant_country} />
        {di.whois_error && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--tl-warning)' }}>
            WHOIS: {di.whois_error}
          </div>
        )}
      </SectionCard>

      <SectionCard title="SSL Certificate" icon={<ShieldAlert size={16} color="var(--tl-primary-light)" />}>
        <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--tl-border)' }}>
          <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem' }}>Status</span>
          {si.valid ? <Badge variant="success">Valid</Badge> : <Badge variant="danger">Invalid</Badge>}
        </div>
        <InfoRow label="Issuer" value={si.issuer} />
        <InfoRow label="Common Name" value={si.common_name} />
        <InfoRow label="Expires" value={fmtDate(si.expiration_date)} />
        <InfoRow label="Days Left" value={si.days_remaining != null ? `${si.days_remaining} days` : null} />
        {si.ssl_error && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--tl-danger)' }}>
            {si.ssl_error}
          </div>
        )}
      </SectionCard>

      {data?.iocs?.length > 0 && (
        <SectionCard title="IOCs Extracted" icon={<Activity size={16} color="var(--tl-primary-light)" />}>
          <div className="d-flex flex-wrap gap-2">
            {data.iocs.map((ioc, i) => (
              <Badge key={i} variant="outline">
                <span style={{ color: 'var(--tl-primary-light)' }}>{ioc?.type}:</span> {ioc?.value}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}

      {data?.redirect_chain?.length > 0 && (
        <SectionCard title="Redirect Chain" icon={<LinkIcon size={16} color="var(--tl-primary-light)" />}>
          <div className="d-flex flex-column gap-2">
            {data.redirect_chain.map((r, i) => (
              <div key={i} className="d-flex align-items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--tl-text-faint)' }}>{i + 1}.</span>
                <Badge variant={r.status_code === 200 ? 'success' : 'warning'}>{r.status_code ?? '?'}</Badge>
                <span style={{ color: 'var(--tl-text-secondary)', fontFamily: 'var(--tl-font-mono)', wordBreak: 'break-all' }}>{r.url}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
};

// ── Email-specific result sections ────────────────────────────────────── //

const EmailReportSections = ({ data }) => (
  <>
    <SectionCard title="Sender Analysis" icon={<Mail size={16} color="var(--tl-primary-light)" />}>
      <InfoRow label="From" value={data?.sender} />
      <InfoRow label="Domain" value={data?.sender_domain} />
      <InfoRow label="Subject" value={data?.subject} />
    </SectionCard>

    <SectionCard title="Authentication" icon={<ShieldAlert size={16} color="var(--tl-primary-light)" />}>
      {['spf', 'dkim', 'dmarc'].map(key => (
        <div key={key} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--tl-border)' }}>
          <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem' }}>{key.toUpperCase()}</span>
          {data?.[key] === 'pass'
            ? <Badge variant="success">Pass</Badge>
            : data?.[key] === 'fail'
            ? <Badge variant="danger">Fail</Badge>
            : <Badge variant="outline">{data?.[key] ?? 'N/A'}</Badge>}
        </div>
      ))}
    </SectionCard>
  </>
);

// ── Phone-specific result sections ────────────────────────────────────── //

const PhoneReportSections = ({ data }) => (
  <SectionCard title="Phone Intelligence" icon={<Phone size={16} color="var(--tl-primary-light)" />}>
    <InfoRow label="Number" value={data?.phone_number} />
    <InfoRow label="Country" value={data?.country} />
    <InfoRow label="Carrier" value={data?.carrier} />
    <InfoRow label="Line Type" value={data?.line_type} />
    <InfoRow label="Risk Level" value={data?.risk_level} />
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

  useEffect(() => {
    setLoading(true);
    investigationService.getById(id)
      .then(data => { setInv(data); setLoading(false); })
      .catch(e => {
        setError(e.response?.status === 404 ? 'Investigation not found.' : 'Failed to load investigation.');
        setLoading(false);
      });
  }, [id]);

  const meta = inv ? (TYPE_META[inv.type] || TYPE_META.URL) : null;

  return (
    <div className="pb-5">
      {/* Back link */}
      <div className="mb-4">
        <button
          className="tl-btn tl-btn-ghost tl-btn-sm"
          onClick={() => navigate('/history')}
          style={{ paddingLeft: 0 }}
        >
          <ChevronLeft size={16} /> Back to History
        </button>
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
          <div className="tl-card p-4 mb-4">
            <div className="d-flex align-items-start gap-3 flex-wrap">
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
                    {meta?.label}
                  </h4>
                  <Badge variant={inv.threat_score > 75 ? 'danger' : inv.threat_score > 40 ? 'warning' : 'success'}>
                    {inv.threat_score > 75 ? 'Malicious' : inv.threat_score > 40 ? 'Suspicious' : 'Safe'}
                  </Badge>
                </div>
                <p style={{ color: 'var(--tl-text-muted)', margin: '4px 0 0', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                  {inv.target}
                </p>
                <div className="d-flex gap-3 mt-2 flex-wrap" style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>
                  <span><Clock size={11} style={{ marginRight: 4 }} />{formatDate(inv.created_at)}</span>
                  <span style={{ fontFamily: 'var(--tl-font-mono)', opacity: 0.7 }}>{inv.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report body */}
          <div className="row g-4">
            {/* Threat gauge */}
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
              {inv.type === 'URL'   && <UrlReportSections   data={inv.result_data} />}
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
        </motion.div>
      )}
    </div>
  );
}
