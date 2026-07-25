import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Globe, ShieldAlert, Activity, FileText, ChevronRight, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon, Database, Clock } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import InvestigationProgress from '../components/investigation/InvestigationProgress';

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

export default function UrlInvestigation() {
  const location = useLocation();
  const [url, setUrl] = useState(location.state?.target || '');
  
  // Animation System States
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const URL_STEPS = [
      "Investigation Initialized", "Validating URL Format", "Extracting Domain",
      "Checking Domain Structure", "WHOIS Lookup", "DNS Record Analysis",
      "SSL Certificate Inspection", "Redirect Chain Analysis", "IOC Extraction",
      "Rule-Based Threat Detection", "Threat Score Calculation", 
      "Generating Investigation Report", "Investigation Completed"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);
    
    try {
      const res = await api.post('/api/v1/investigation/url', { url });
      setResult(res.data.result_data);
      setIsBackendComplete(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during URL analysis.');
      setIsInvestigating(false);
    }
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="URL Investigation Engine" 
        subtitle="Perform deep static analysis, WHOIS lookups, and threat intelligence scoring on any URL or domain."
      />

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <form onSubmit={handleSubmit} className="tl-card p-4">
          <div className="row g-3">
            <div className="col-md-9">
                <label className="mb-2" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>Target URL</label>
                <div style={{ position: 'relative' }}>
                    <Globe size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
                    <input 
                      type="url" 
                      className="tl-input w-100" 
                      placeholder="https://example.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{ paddingLeft: '3rem', height: 48, fontSize: '1rem' }}
                      required
                    />
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end">
                <Button type="submit" size="lg" disabled={!url || isInvestigating} className="w-100" icon={(isInvestigating && !showReport) ? undefined : <Search size={18} />}>
                    {(isInvestigating && !showReport) ? 'Analyzing...' : 'Investigate URL'}
                </Button>
            </div>
          </div>
        </form>
        {error && <div className="mt-3 text-danger text-center" style={{ fontSize: '0.875rem' }}>{error}</div>}
      </motion.div>

      {/* Animation System */}
      {isInvestigating && !showReport && !error && (
        <div className="mb-5">
            <InvestigationProgress 
                steps={URL_STEPS} 
                target={url}
                isBackendComplete={isBackendComplete} 
                onRevealReport={() => setShowReport(true)} 
            />
        </div>
      )}

      {/* Results Dashboard */}
      {showReport && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="d-flex gap-3 mb-4 border-bottom pb-3" style={{ borderColor: 'var(--tl-border)' }}>
              <button className={`btn btn-link text-decoration-none ${activeTab === 'overview' ? 'text-primary' : 'text-muted'}`} onClick={() => setActiveTab('overview')} style={{ fontWeight: activeTab === 'overview' ? 600 : 400 }}>Overview</button>
              <button className={`btn btn-link text-decoration-none ${activeTab === 'technical' ? 'text-primary' : 'text-muted'}`} onClick={() => setActiveTab('technical')} style={{ fontWeight: activeTab === 'technical' ? 600 : 400 }}>Technical Details</button>
              <button className={`btn btn-link text-decoration-none ${activeTab === 'timeline' ? 'text-primary' : 'text-muted'}`} onClick={() => setActiveTab('timeline')} style={{ fontWeight: activeTab === 'timeline' ? 600 : 400 }}>Timeline</button>
            </div>

            {activeTab === 'overview' && (
              <div className="row g-4">
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                  <div className="tl-card p-4 text-center">
                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                    <ThreatGauge score={result.threat_score} />
                    <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left', lineHeight: 1.6 }}>
                      {result.summary}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                  <div className="row g-4">
                    <div className="col-sm-6">
                      <div className="tl-card p-4 h-100">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Globe size={18} color="var(--tl-primary-light)" />
                          <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Domain Identity</h6>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between"><span style={{ color: 'var(--tl-text-muted)' }}>Registrar</span><span style={{ color: 'var(--tl-text-primary)' }}>{result.domain_info.registrar}</span></div>
                          <div className="d-flex justify-content-between"><span style={{ color: 'var(--tl-text-muted)' }}>Creation Date</span><span style={{ color: 'var(--tl-text-primary)' }}>{result.domain_info.creation_date}</span></div>
                          <div className="d-flex justify-content-between"><span style={{ color: 'var(--tl-text-muted)' }}>Age</span><span style={{ color: 'var(--tl-text-primary)' }}>{result.domain_info.domain_age_days} days</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="tl-card p-4 h-100">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <ShieldAlert size={18} color="var(--tl-primary-light)" />
                          <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Security Status</h6>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between"><span style={{ color: 'var(--tl-text-muted)' }}>SSL Certificate</span>
                            {result.ssl_info.valid ? <Badge variant="success">Valid</Badge> : <Badge variant="danger">Invalid</Badge>}
                          </div>
                          <div className="d-flex justify-content-between"><span style={{ color: 'var(--tl-text-muted)' }}>Issuer</span><span style={{ color: 'var(--tl-text-primary)' }}>{result.ssl_info.issuer}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tl-card p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Activity size={18} color="var(--tl-primary-light)" />
                      <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>IOCs Extracted</h6>
                    </div>
                    {result.iocs && result.iocs.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {result.iocs.map((ioc, i) => (
                          <Badge key={i} variant="outline" className="d-flex align-items-center gap-2">
                            <span style={{ color: 'var(--tl-primary-light)' }}>{ioc.type}:</span> {ioc.value}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>No specific IOCs detected in this URL.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="tl-card p-4">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Redirect Chain</h6>
                {result.redirect_chain.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {result.redirect_chain.map((url, i) => (
                      <div key={i} className="d-flex align-items-center gap-2" style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>
                        <span>{i + 1}.</span> <span style={{ fontFamily: 'var(--tl-font-mono)' }}>{url}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>No redirects detected.</span>
                )}
              </div>
            )}
            
            {activeTab === 'timeline' && (
              <div className="tl-card p-4">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Investigation Log</h6>
                <div className="d-flex flex-column gap-3">
                  {result.timeline.map((event, i) => (
                    <div key={i} className="d-flex align-items-center gap-3">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--tl-primary-light)' }}></div>
                      <span style={{ color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </motion.div>
      )}
    </div>
  );
}
