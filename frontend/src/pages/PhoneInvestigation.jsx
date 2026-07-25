import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneCall, Search, AlertTriangle, ShieldCheck, Download, MapPin, Signal, Activity, AlertCircle, Clock, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import InvestigationProgress from '../components/investigation/InvestigationProgress';

const ThreatGauge = ({ score }) => {
  let color = 'var(--tl-success)';
  let label = 'Safe';
  if (score > 20) { color = 'var(--tl-primary-light)'; label = 'Low Risk'; }
  if (score > 40) { color = 'var(--tl-warning)'; label = 'Medium Risk'; }
  if (score > 60) { color = 'var(--tl-danger)'; label = 'High Risk'; }
  if (score > 80) { color = '#ef4444'; label = 'Critical'; }

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
      <Badge variant={score > 60 ? 'danger' : score > 40 ? 'warning' : 'success'} className="mt-3">
        {label}
      </Badge>
    </div>
  );
};

export default function PhoneInvestigation() {
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState(location.state?.target || '');
  
  // Animation System States
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const PHONE_STEPS = [
      "Phone Submitted", "Validating Phone Number", "Normalizing Number",
      "Country Detection", "Region Detection", "Carrier Lookup",
      "Number Classification", "Pattern Analysis", "Threat Rule Evaluation",
      "Threat Score Calculation", "Generating Investigation Report", "Investigation Completed"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);
    
    try {
      const res = await api.post('/api/v1/investigation/phone', { phone_number: phoneNumber });
      setResult(res.data.result_data);
      setIsBackendComplete(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during phone analysis.');
      setIsInvestigating(false);
    }
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="Phone Investigation Engine" 
        subtitle="Validate and parse international numbers, identify carriers, and perform deterministic threat analysis."
      />

      <div className="row g-4 mb-5">
        <div className="col-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tl-card p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-9">
                            <label style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: 4 }}>Phone Number</label>
                            <div className="position-relative">
                                <div className="position-absolute top-50 translate-middle-y" style={{ left: '1rem', color: 'var(--tl-text-muted)' }}>
                                    <PhoneCall size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    className="tl-input w-100" 
                                    placeholder="+1 415-555-2671 or +91 9876543210" 
                                    style={{ paddingLeft: '2.75rem', fontFamily: 'var(--tl-font-mono)' }}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="mt-2" style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>
                                Include country code (+) for best results. Supports spaces, dashes, and brackets.
                            </div>
                        </div>
                        <div className="col-md-3 d-flex align-items-end pb-4">
                            <Button type="submit" disabled={!phoneNumber || isInvestigating} className="w-100" icon={(isInvestigating && !showReport) ? undefined : <Search size={16} />}>
                                {(isInvestigating && !showReport) ? 'Analyzing...' : 'Investigate Phone'}
                            </Button>
                        </div>
                    </div>
                </form>
                {error && <div className="mt-3 text-danger d-flex align-items-center gap-2" style={{ fontSize: '0.875rem' }}><AlertCircle size={16}/>{error}</div>}
            </motion.div>
        </div>

        {/* Animation System */}
        {isInvestigating && !showReport && !error && (
            <div className="col-12">
                <InvestigationProgress 
                    steps={PHONE_STEPS} 
                    target={phoneNumber}
                    isBackendComplete={isBackendComplete} 
                    onRevealReport={() => setShowReport(true)} 
                />
            </div>
        )}

        {/* Results Dashboard */}
        {showReport && result && (
            <div className="col-12">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 style={{ color: 'var(--tl-text-primary)', margin: 0, fontWeight: 600 }}>Investigation Report</h5>
                        <Button variant="secondary" size="sm" icon={<Download size={16} />}>Export Report</Button>
                    </div>
                    
                    <div className="row g-4 mb-4">
                        
                        {/* Threat Score & Summary */}
                        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                            <div className="tl-card p-4 text-center">
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                                <ThreatGauge score={result.threat_score} />
                                <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left', lineHeight: 1.6 }}>
                                    {result.summary}
                                </div>
                            </div>
                            
                            {/* Threat Indicators */}
                            <div className="tl-card p-4 flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <ShieldAlert size={18} color={result.indicators.length > 0 ? "var(--tl-warning)" : "var(--tl-success)"} />
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Detected Indicators</h6>
                                </div>
                                {result.indicators.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                        {result.indicators.map((ind, i) => (
                                            <div key={i} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-warning-rgb), 0.1)', color: 'var(--tl-warning)', fontSize: '0.8125rem' }}>
                                                <AlertTriangle size={14} />
                                                <span>{ind}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
                                        <CheckCircle size={14} />
                                        <span>No high-risk indicators detected.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Evidence Panels */}
                        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                            
                            {/* Phone Information */}
                            <div className="tl-card p-4">
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Phone Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)', color: 'var(--tl-primary-light)' }}>
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Number Type</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.phone_info.type}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)', color: 'var(--tl-primary-light)' }}>
                                                <Signal size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Carrier</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.phone_info.carrier}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)', color: 'var(--tl-primary-light)' }}>
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Geolocation</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.phone_info.country}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded d-flex align-items-center gap-3" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)', color: 'var(--tl-primary-light)' }}>
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Format Validity</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-success)', fontWeight: 500 }}>Valid Number</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-3 rounded d-flex flex-column gap-3" style={{ border: '1px solid var(--tl-border)' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>E.164 Format</span>
                                        <span style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-primary-light)' }}>{result.phone_info.e164}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>International Format</span>
                                        <span style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-text-primary)' }}>{result.phone_info.international}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>National Format</span>
                                        <span style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-text-primary)' }}>{result.phone_info.national}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Investigation Timeline */}
                            <div className="tl-card p-4">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <Clock size={18} color="var(--tl-primary-light)" />
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Investigation Timeline</h6>
                                </div>
                                
                                <div className="position-relative" style={{ paddingLeft: 20 }}>
                                    <div className="position-absolute" style={{ left: 5, top: 5, bottom: 5, width: 2, background: 'var(--tl-border)' }}></div>
                                    
                                    {result.timeline && result.timeline.map((event, index) => (
                                        <div key={index} className="position-relative mb-3 d-flex align-items-center">
                                            <div className="position-absolute" style={{ left: -19, width: 10, height: 10, borderRadius: '50%', background: index === result.timeline.length - 1 ? 'var(--tl-success)' : 'var(--tl-primary-light)', border: '2px solid var(--tl-bg-deep)' }}></div>
                                            <div style={{ fontSize: '0.8125rem', color: index === result.timeline.length - 1 ? 'var(--tl-text-primary)' : 'var(--tl-text-muted)' }}>
                                                {event}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </div>
    </div>
  );
}
