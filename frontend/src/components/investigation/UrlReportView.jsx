import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, ShieldAlert, Activity, ChevronRight, CheckCircle, AlertTriangle,
  XCircle, Link as LinkIcon, Database, Server, Shield, Info, Lock, Clock
} from 'lucide-react';
import { Badge } from '../ui/Badge';

// ── Shared UI Elements ────────────────────────────────────────────────── //

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
            strokeDasharray={`${score * 2.83} 283`} strokeLinecap="round"
            initial={{ strokeDasharray: '0 283' }} animate={{ strokeDasharray: `${score * 2.83} 283` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1 }}>{score}</div>
        </div>
      </div>
      <Badge variant={score > 75 ? 'danger' : score > 40 ? 'warning' : 'success'} className="mt-3">
        {label}
      </Badge>
    </div>
  );
};

const val = (v, suffix = '') => {
  if (v === null || v === undefined || v === '') return <span style={{ color: 'var(--tl-text-faint)', fontStyle: 'italic' }}>Unavailable</span>;
  return <span style={{ color: 'var(--tl-text-primary)' }}>{String(v)}{suffix}</span>;
};

const InfoRow = ({ label, children }) => (
  <div className="d-flex justify-content-between align-items-start py-2" style={{ borderBottom: '1px solid var(--tl-border)', gap: '1rem' }}>
    <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', flexShrink: 0, minWidth: 120 }}>{label}</span>
    <span style={{ fontSize: '0.8125rem', textAlign: 'right', wordBreak: 'break-all', flex: 1 }}>{children}</span>
  </div>
);

const SectionCard = ({ title, icon, children, error }) => (
  <div className="tl-card p-4 h-100">
    <div className="d-flex align-items-center gap-2 mb-3">
      {icon}
      <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>{title}</h6>
    </div>
    {error ? (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.625rem', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={14} color="var(--tl-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: '0.8125rem', color: 'var(--tl-danger)', lineHeight: 1.5 }}>{error}</span>
      </div>
    ) : children}
  </div>
);

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
};

// ── UrlReportView ─────────────────────────────────────────────────────── //

export default function UrlReportView({ result }) {
  const [activeTab, setActiveTab] = useState('overview');

  const di = result?.domain_info || {};
  const si = result?.ssl_info || {};

  const tabStyle = (tab) => ({
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? 'var(--tl-primary-light)' : 'var(--tl-text-secondary)',
    background: 'none',
    border: 'none',
    padding: '0.25rem 0.75rem',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '2px solid var(--tl-primary-light)' : '2px solid transparent',
    fontSize: '0.9rem',
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Tab bar */}
      <div className="d-flex flex-wrap gap-1 mb-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
        {['overview', 'whois', 'ssl', 'technical', 'timeline'].map(tab => (
          <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
            <div className="tl-card p-4 text-center">
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
              <ThreatGauge score={result?.threat_score || 0} />
              <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left', lineHeight: 1.6 }}>
                {result?.summary || 'No summary available.'}
              </div>
            </div>
            {result?.rules_triggered?.length > 0 && (
              <div className="tl-card p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <ShieldAlert size={16} color="var(--tl-danger)" />
                  <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Triggered Rules</h6>
                </div>
                <div className="d-flex flex-column gap-2">
                  {result.rules_triggered.map((rule, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem' }}>
                      <AlertTriangle size={13} color="var(--tl-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: 'var(--tl-text-secondary)', lineHeight: 1.5 }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="col-12 col-xl-8 d-flex flex-column gap-4">
            <div className="row g-4">
              <div className="col-sm-6">
                <SectionCard title="Domain Identity" icon={<Globe size={16} color="var(--tl-primary-light)" />} error={di.whois_error}>
                  <InfoRow label="Root Domain">{val(di.root_domain)}</InfoRow>
                  <InfoRow label="TLD">{val(di.tld)}</InfoRow>
                  {di.subdomain && <InfoRow label="Subdomain">{val(di.subdomain)}</InfoRow>}
                  <InfoRow label="Registrar">{val(di.registrar)}</InfoRow>
                  <InfoRow label="Created">{val(formatDate(di.creation_date))}</InfoRow>
                  <InfoRow label="Domain Age">{val(di.domain_age_label)}</InfoRow>
                  <InfoRow label="Country">{val(di.registrant_country)}</InfoRow>
                </SectionCard>
              </div>
              <div className="col-sm-6">
                <SectionCard title="SSL Certificate" icon={<Shield size={16} color="var(--tl-primary-light)" />} error={si.ssl_error && !si.valid ? si.ssl_error : null}>
                  <InfoRow label="Status">
                    {si.valid ? <Badge variant="success"><CheckCircle size={11} style={{ marginRight: 4 }} />Valid</Badge> : <Badge variant="danger"><XCircle size={11} style={{ marginRight: 4 }} />Invalid</Badge>}
                  </InfoRow>
                  <InfoRow label="Issuer">{val(si.issuer)}</InfoRow>
                  <InfoRow label="Common Name">{val(si.common_name)}</InfoRow>
                  <InfoRow label="Expires">{val(formatDate(si.expiration_date))}</InfoRow>
                  <InfoRow label="Days Left">
                    {si.days_remaining != null ? <span style={{ color: si.days_remaining < 30 ? 'var(--tl-warning)' : 'var(--tl-success)', fontWeight: 600 }}>{si.days_remaining}d</span> : val(null)}
                  </InfoRow>
                </SectionCard>
              </div>
            </div>
            <div className="tl-card p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Activity size={16} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>IOCs Extracted</h6>
              </div>
              {result?.iocs?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {result.iocs.map((ioc, i) => (
                    <div key={i} title={ioc?.description} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(var(--tl-primary-rgb),0.08)', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--tl-primary-light)', fontWeight: 600 }}>{ioc?.type}:</span>
                      <span style={{ color: 'var(--tl-text-secondary)', wordBreak: 'break-all' }}>{ioc?.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>No specific IOCs detected in this URL.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WHOIS TAB ── */}
      {activeTab === 'whois' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <SectionCard title="Registration Details" icon={<Database size={16} color="var(--tl-primary-light)" />} error={di.whois_error}>
              <InfoRow label="Hostname">{val(di.hostname)}</InfoRow>
              <InfoRow label="Root Domain">{val(di.root_domain)}</InfoRow>
              <InfoRow label="Subdomain">{val(di.subdomain)}</InfoRow>
              <InfoRow label="TLD">{val(di.tld)}</InfoRow>
              <InfoRow label="Registrar">{val(di.registrar)}</InfoRow>
              <InfoRow label="Created">{val(formatDate(di.creation_date))}</InfoRow>
              <InfoRow label="Updated">{val(formatDate(di.updated_date))}</InfoRow>
              <InfoRow label="Expires">{val(formatDate(di.expiration_date))}</InfoRow>
              <InfoRow label="Domain Age">{val(di.domain_age_label)}</InfoRow>
              <InfoRow label="Country">{val(di.registrant_country)}</InfoRow>
              <InfoRow label="Privacy Enabled">
                {di.whois_privacy === true ? <Badge variant="warning">Yes</Badge> : di.whois_privacy === false ? <Badge variant="success">No</Badge> : val(null)}
              </InfoRow>
            </SectionCard>
          </div>
          <div className="col-12 col-lg-6">
            <div className="tl-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Server size={16} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Name Servers</h6>
              </div>
              {di.name_servers?.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {di.name_servers.map((ns, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: 'var(--tl-bg-surface)', fontFamily: 'var(--tl-font-mono)', fontSize: '0.8rem', color: 'var(--tl-text-secondary)' }}>
                      <ChevronRight size={12} color="var(--tl-primary-light)" />{ns}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--tl-text-faint)', fontSize: '0.875rem', fontStyle: 'italic' }}>{di.whois_error || 'No name servers found'}</span>
              )}
              {di.whois_status?.length > 0 && (
                <>
                  <div className="d-flex align-items-center gap-2 mt-4 mb-3">
                    <Info size={16} color="var(--tl-primary-light)" />
                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>WHOIS Status</h6>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {di.whois_status.slice(0, 5).map((s, i) => (
                      <Badge key={i} variant="outline" style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.7rem' }}>{s.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="tl-card p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Server size={16} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>DNS Resolution</h6>
              </div>
              {result?.dns?.error ? (
                <div style={{ color: 'var(--tl-danger)', fontSize: '0.875rem' }}><AlertTriangle size={14} style={{ marginRight: 6 }} />{result.dns.error}</div>
              ) : result?.dns?.A?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {result.dns.A.map((ip, i) => (
                    <code key={i} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(var(--tl-primary-rgb),0.08)', color: 'var(--tl-primary-light)', fontSize: '0.8125rem' }}>{ip}</code>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--tl-text-faint)', fontStyle: 'italic', fontSize: '0.875rem' }}>No A records resolved</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SSL TAB ── */}
      {activeTab === 'ssl' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <SectionCard title="Certificate Details" icon={<Lock size={16} color="var(--tl-primary-light)" />} error={!si.valid && si.ssl_error ? si.ssl_error : null}>
              <InfoRow label="Status">
                {si.valid ? <Badge variant="success"><CheckCircle size={11} style={{ marginRight: 4 }} />Valid</Badge> : <Badge variant="danger"><XCircle size={11} style={{ marginRight: 4 }} />Invalid</Badge>}
              </InfoRow>
              <InfoRow label="Common Name">{val(si.common_name)}</InfoRow>
              <InfoRow label="Subject / Org">{val(si.subject)}</InfoRow>
              <InfoRow label="Issuer">{val(si.issuer)}</InfoRow>
              <InfoRow label="Issued">{val(formatDate(si.issued_date))}</InfoRow>
              <InfoRow label="Expires">{val(formatDate(si.expiration_date))}</InfoRow>
              <InfoRow label="Days Remaining">
                {si.days_remaining != null ? <span style={{ fontWeight: 700, color: si.days_remaining < 30 ? 'var(--tl-danger)' : si.days_remaining < 90 ? 'var(--tl-warning)' : 'var(--tl-success)' }}>{si.days_remaining} days</span> : val(null)}
              </InfoRow>
              {si.signature_algorithm && <InfoRow label="Sig. Algorithm">{val(si.signature_algorithm)}</InfoRow>}
            </SectionCard>
          </div>
          <div className="col-12 col-lg-6">
            <div className="tl-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Globe size={16} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Subject Alternative Names (SANs)</h6>
              </div>
              {si.sans?.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {si.sans.map((san, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: 6, background: 'var(--tl-bg-surface)', fontFamily: 'var(--tl-font-mono)', fontSize: '0.78rem', color: 'var(--tl-text-secondary)' }}>
                      <ChevronRight size={12} color="var(--tl-primary-light)" />{san}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--tl-text-faint)', fontStyle: 'italic', fontSize: '0.875rem' }}>{si.ssl_error || 'No SANs available'}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TECHNICAL TAB ── */}
      {activeTab === 'technical' && (
        <div className="tl-card p-4">
          <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Redirect Chain</h6>
          {result?.redirect_chain?.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {result.redirect_chain.map((redirect, i) => (
                <div key={i} className="d-flex align-items-center gap-2" style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--tl-text-faint)', minWidth: 20 }}>{i + 1}.</span>
                  <Badge variant={redirect.status_code === 200 ? 'success' : redirect.status_code ? 'warning' : 'outline'}>{redirect.status_code ?? '?'}</Badge>
                  <span style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.8125rem', wordBreak: 'break-all' }}>{redirect.url}</span>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>No redirect chain data available.</span>
          )}
        </div>
      )}

      {/* ── TIMELINE TAB ── */}
      {activeTab === 'timeline' && (
        <div className="tl-card p-4">
          <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Investigation Timeline</h6>
          <div className="d-flex flex-column" style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 2, background: 'var(--tl-border)', borderRadius: 2 }} />
            {result?.timeline?.map((item, i) => (
              <div key={i} className="d-flex gap-3" style={{ marginBottom: '1.25rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: -19, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--tl-primary-light)', boxShadow: '0 0 0 3px rgba(var(--tl-primary-rgb),0.15)' }} />
                <div>
                  <div style={{ color: 'var(--tl-text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{item.event}</div>
                  <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', marginTop: 2 }}>{formatDate(item.time) || item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
