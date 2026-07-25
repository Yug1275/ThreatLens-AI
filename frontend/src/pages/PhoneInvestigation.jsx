import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneCall, Search, AlertTriangle, ShieldCheck, Download, MapPin, Signal, Activity, AlertCircle } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';

const ThreatGauge = ({ score }) => {
  let color = 'var(--tl-success)';
  let label = 'Safe';
  if (score > 40) { color = 'var(--tl-warning)'; label = 'Suspicious'; }
  if (score > 75) { color = 'var(--tl-danger)'; label = 'Malicious'; }

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1 }}>{score}</div>
        </div>
      </div>
      <Badge variant={score > 75 ? 'danger' : score > 40 ? 'warning' : 'success'} className="mt-3">
        {label}
      </Badge>
    </div>
  );
};

export default function PhoneInvestigation() {
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState(location.state?.target || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await api.post('/api/v1/investigation/phone', { phone_number: phoneNumber });
      setResult(res.data.result_data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during phone analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="Phone Investigation" 
        subtitle="Analyze phone numbers to uncover origin, carrier information, and associated spam or fraud reputation."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <form onSubmit={handleSubmit} className="tl-card p-4 d-flex flex-column flex-md-row gap-3">
          <div className="flex-grow-1" style={{ position: 'relative' }}>
            <PhoneCall size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--tl-text-muted)' }} />
            <input 
              type="tel" 
              className="tl-input w-100" 
              placeholder="+1 (555) 019-8472" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ paddingLeft: '3rem', height: 48, fontSize: '1rem' }}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} icon={loading ? undefined : <Search size={18} />}>
            {loading ? 'Analyzing...' : 'Analyze Number'}
          </Button>
        </form>
        {error && <div className="mt-3 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="tl-card p-4 h-100 d-flex flex-column align-items-center gap-4">
              <Skeleton w="100px" h="100px" r />
              <Skeleton w="60%" h="20px" />
            </div>
          </div>
          <div className="col-12 col-lg-8">
            <div className="tl-card p-4 h-100 d-flex flex-column gap-3">
              <Skeleton w="30%" h="24px" className="mb-4" />
              <div className="row g-3">
                  <div className="col-md-6"><Skeleton h="60px" /></div>
                  <div className="col-md-6"><Skeleton h="60px" /></div>
                  <div className="col-md-6"><Skeleton h="60px" /></div>
                  <div className="col-md-6"><Skeleton h="60px" /></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ color: 'var(--tl-text-primary)', margin: 0, fontWeight: 600 }}>Investigation Report</h5>
              <Button variant="secondary" size="sm" icon={<Download size={16} />}>Export Report</Button>
          </div>
          
          <div className="row g-4">
            
            {/* Risk Assessment */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              <div className="tl-card p-4 text-center h-100 d-flex flex-column">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <ThreatGauge score={result.threat_score} />
                </div>
                
                {/* AI Summary */}
                <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left', lineHeight: 1.6 }}>
                    {result.summary}
                </div>
              </div>
            </div>

            {/* Evidence Panels */}
            <div className="col-12 col-xl-8">
                <div className="row g-4 h-100">
                    
                    {/* Location Panel */}
                    <div className="col-md-6">
                        <div className="tl-card p-4 h-100">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <MapPin size={20} color="var(--tl-primary-light)" />
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Origin Location</h6>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Country</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.location.country}</div>
                                </div>
                                <div className="p-3 rounded mt-2" style={{ background: 'var(--tl-bg-surface)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Registered City / Region</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.location.city}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Technical / Carrier Panel */}
                    <div className="col-md-6">
                        <div className="tl-card p-4 h-100">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <Signal size={20} color="var(--tl-primary-light)" />
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Technical Details</h6>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Carrier</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.carrier_info.name}</div>
                                </div>
                                <div className="row g-2 mt-2">
                                    <div className="col-6">
                                        <div className="p-2 rounded h-100" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Line Type</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>
                                                {result.carrier_info.line_type}
                                                {result.carrier_info.line_type === 'VoIP' && <AlertTriangle size={12} color="var(--tl-warning)" className="ms-1 mb-1" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2 rounded h-100" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Format</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--tl-success)', fontWeight: 500 }}>{result.carrier_info.valid}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Spam Reputation Panel */}
                    <div className="col-12">
                        <div className="tl-card p-4" style={{ borderLeft: `4px solid ${result.is_suspicious ? 'var(--tl-danger)' : 'var(--tl-success)'}` }}>
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Activity size={20} color={result.is_suspicious ? "var(--tl-danger)" : "var(--tl-success)"} />
                                        <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Spam & Fraud Reputation</h6>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-secondary)', margin: 0 }}>
                                        {result.is_suspicious 
                                            ? "This number has been flagged in multiple community databases for telemarketing and spam."
                                            : "No community reports or known malicious activity associated with this number."}
                                    </p>
                                </div>
                                <div className="text-start text-sm-end flex-shrink-0">
                                    <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Risk Level</div>
                                    <Badge variant={result.is_suspicious ? "danger" : "success"} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                        {result.spam_reputation}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </div>
          
        </motion.div>
      )}
    </div>
  );
}
