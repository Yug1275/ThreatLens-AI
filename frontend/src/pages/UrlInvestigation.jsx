import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ShieldAlert, Activity, FileText, ChevronRight, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon, Database, Clock } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';

const ThreatGauge = ({ score }) => {
  let color = 'var(--tl-success)';
  let label = 'Safe';
  if (score > 40) { color = 'var(--tl-warning)'; label = 'Suspicious'; }
  if (score > 75) { color = 'var(--tl-danger)'; label = 'Malicious'; }

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="10" 
            strokeDasharray={`${score * 2.83} 283`} strokeLinecap="round"
            initial={{ strokeDasharray: '0 283' }} animate={{ strokeDasharray: `${score * 2.83} 283` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Score</div>
        </div>
      </div>
      <Badge variant={score > 75 ? 'danger' : score > 40 ? 'warning' : 'success'} className="mt-3">
        {label}
      </Badge>
    </div>
  );
};

export default function UrlInvestigation() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await api.post('/api/v1/investigation/url', { url });
      setResult(res.data.result_data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="URL Investigation" 
        subtitle="Deep scan any URL for malware, phishing, and threat intelligence."
      />

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <form onSubmit={handleSubmit} className="tl-card p-4 d-flex gap-3">
          <div className="flex-grow-1" style={{ position: 'relative' }}>
            <Globe size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
            <input 
              type="url" 
              className="tl-input" 
              placeholder="https://example.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ paddingLeft: '3rem', height: 48, fontSize: '1rem' }}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} icon={loading ? undefined : <Search size={18} />}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
        {error && <div className="mt-3 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4">
          <div className="col-md-4">
            <div className="tl-card p-4 h-100 d-flex flex-column align-items-center justify-content-center gap-4">
              <Skeleton w="120px" h="120px" r />
              <Skeleton w="60%" h="20px" />
            </div>
          </div>
          <div className="col-md-8">
            <div className="tl-card p-4 h-100">
              <Skeleton w="30%" h="24px" className="mb-4" />
              <div className="d-flex flex-column gap-3">
                <Skeleton w="100%" h="60px" />
                <Skeleton w="100%" h="60px" />
                <Skeleton w="100%" h="60px" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="row g-4 mb-4">
            {/* Threat Score Card */}
            <div className="col-12 col-xl-4">
              <div className="tl-card p-4 h-100 d-flex flex-column align-items-center text-center">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '2rem', width: '100%', textAlign: 'left' }}>Risk Assessment</h6>
                <ThreatGauge score={result.threat_score} />
                
                <div className="mt-4 p-3" style={{ background: 'rgba(148,163,184,0.05)', borderRadius: 'var(--tl-radius-md)', width: '100%', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left' }}>
                  {result.summary}
                </div>
              </div>
            </div>

            {/* Overview / Tabs */}
            <div className="col-12 col-xl-8">
              <div className="tl-card d-flex flex-column h-100">
                <div className="d-flex gap-4 px-4 pt-4 border-bottom" style={{ borderColor: 'var(--tl-border)' }}>
                  {['overview', 'whois', 'dns', 'ssl'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{ 
                        background: 'none', border: 'none', padding: '0 0 1rem 0', cursor: 'pointer',
                        color: activeTab === tab ? 'var(--tl-primary-light)' : 'var(--tl-text-muted)',
                        fontWeight: activeTab === tab ? 600 : 500,
                        borderBottom: activeTab === tab ? '2px solid var(--tl-primary-light)' : '2px solid transparent',
                        textTransform: 'capitalize', fontSize: '0.875rem'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="p-4 flex-grow-1 overflow-auto">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      
                      {activeTab === 'overview' && (
                        <div className="row g-4">
                          <div className="col-sm-6">
                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                              <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Target Domain</div>
                              <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)' }}>{result.domain}</div>
                            </div>
                          </div>
                          <div className="col-sm-6">
                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                              <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>Registrar</div>
                              <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)' }}>{result.whois.registrar}</div>
                            </div>
                          </div>
                          <div className="col-12">
                            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginTop: '1rem', marginBottom: '1rem' }}>Redirect Chain</h6>
                            <div className="d-flex flex-column gap-2">
                              {result.redirect_chain.map((hop, i) => (
                                <div key={i} className="d-flex align-items-center gap-3 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem' }}>
                                  <Badge variant={hop.status_code === 200 ? 'success' : 'info'}>{hop.status_code}</Badge>
                                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--tl-text-secondary)' }}>{hop.url}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'whois' && (
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Creation Date</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.whois.creation_date}</span>
                          </div>
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Domain Age</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.whois.domain_age_days} days</span>
                          </div>
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Registrant Country</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.whois.registrant_country}</span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'dns' && (
                        <div>
                          {Object.entries(result.dns).map(([type, records]) => (
                            <div key={type} className="mb-4">
                              <h6 style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem' }}>{type} Records</h6>
                              {records.length > 0 ? records.map((rec, i) => (
                                <div key={i} className="p-2 mb-1 rounded" style={{ background: 'var(--tl-bg-surface)', fontFamily: 'var(--tl-font-mono)', fontSize: '0.8125rem', color: 'var(--tl-text-primary)' }}>
                                  {rec}
                                </div>
                              )) : <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.8125rem' }}>None found</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'ssl' && (
                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Issuer</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.ssl.issuer}</span>
                          </div>
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Valid From</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.ssl.valid_from}</span>
                          </div>
                          <div className="d-flex justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                            <span style={{ color: 'var(--tl-text-faint)' }}>Valid To</span>
                            <span style={{ color: 'var(--tl-text-primary)' }}>{result.ssl.valid_to}</span>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Timeline */}
            <div className="col-12 col-md-6">
              <div className="tl-card p-4 h-100">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Investigation Timeline</h6>
                <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <div style={{ position: 'absolute', top: 8, bottom: 8, left: 7, width: 2, background: 'var(--tl-border)' }} />
                  {result.timeline.map((item, i) => (
                    <div key={i} className="mb-4" style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.5rem', top: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--tl-bg-deep)', border: '2px solid var(--tl-primary-light)' }} />
                      <div style={{ fontSize: '0.8125rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{item.event}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* IOC Extraction */}
            <div className="col-12 col-md-6">
              <div className="tl-card p-4 h-100">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Extracted IOCs</h6>
                {result.iocs.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {result.iocs.map((ioc, i) => (
                      <div key={i} className="d-flex align-items-start gap-3 p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                        <div className="tl-stat-icon" style={{ width: 32, height: 32, background: 'rgba(var(--tl-danger-rgb), 0.1)', color: 'var(--tl-danger)' }}>
                          <AlertTriangle size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>{ioc.type}</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--tl-text-primary)', fontFamily: 'var(--tl-font-mono)' }}>{ioc.value}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', marginTop: 4 }}>{ioc.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center text-center h-100" style={{ opacity: 0.5 }}>
                    <CheckCircle size={32} className="mb-3" />
                    <div style={{ fontSize: '0.875rem' }}>No malicious indicators found.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
