import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertTriangle, Download, Server, ShieldAlert, XCircle, Search, FileText, Code, ShieldCheck, Link as LinkIcon, Database, PhoneCall } from 'lucide-react';
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

const BASE_EMAIL_STEPS = [
    "Email Submitted", "Parsing Email", "Extracting Sender",
    "Extracting Subject", "Extracting Body", "Extracting URLs",
    "Extracting Email Addresses", "Extracting Phone Numbers", "Typosquatting Detection",
    "Brand Impersonation Detection", "Keyword Analysis", "Credential Request Detection",
    "Threat Rule Evaluation", "Threat Score Calculation", 
    "Generating Investigation Report", "Investigation Completed"
];

const RAW_EMAIL_STEPS = [
    "Email Submitted", "Parsing Email", "Header Analysis", "SPF Validation", "DKIM Validation", "DMARC Validation", "Originating IP Analysis", "Extracting Sender",
    "Extracting Subject", "Extracting Body", "Extracting URLs",
    "Extracting Email Addresses", "Extracting Phone Numbers", "Typosquatting Detection",
    "Brand Impersonation Detection", "Keyword Analysis", "Credential Request Detection",
    "Threat Rule Evaluation", "Threat Score Calculation", 
    "Generating Investigation Report", "Investigation Completed"
];

export default function EmailInvestigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('raw'); // 'raw' or 'structured'
  const [headers, setHeaders] = useState(location.state?.target || '');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // Animation System States
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (mode === 'raw' && !headers.trim()) return;
    if (mode === 'structured' && (!senderEmail.trim() || !body.trim())) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);
    
    try {
      const payload = mode === 'raw' 
        ? { raw_headers: headers }
        : { sender_email: senderEmail, subject: subject, body: body };
        
      const res = await api.post('/api/v1/investigation/email', payload);
      setResult(res.data.result_data);
      setIsBackendComplete(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during email analysis.');
      setIsInvestigating(false);
    }
  };
  
  const renderAuthBadge = (statusText) => {
      if (statusText === 'Not Available') {
          return <Badge variant="outline" style={{ color: 'var(--tl-text-muted)' }}>Not Available</Badge>;
      }
      const isPass = statusText.toLowerCase().includes('pass');
      return (
          <Badge variant={isPass ? 'success' : 'danger'}>
              {statusText}
          </Badge>
      );
  };
  
  const handleInvestigate = (ioc) => {
      if (ioc.type === 'URL') {
          navigate('/investigations/url', { state: { target: ioc.value } });
      }
  };
  
  const getIocIcon = (type) => {
      switch(type) {
          case 'URL': return <LinkIcon size={14} />;
          case 'Email': return <Mail size={14} />;
          case 'Phone': return <PhoneCall size={14} />;
          case 'IP': return <Server size={14} />;
          case 'Domain': return <Server size={14} />;
          case 'Crypto Wallet': return <Database size={14} />;
          default: return <FileText size={14} />;
      }
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="Email Investigation Engine" 
        subtitle="Parse raw headers or structured emails to uncover spoofing, typosquatting, and hidden IOCs."
      />

      <div className="row g-4 mb-5">
        <div className="col-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tl-card p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3" style={{ borderColor: 'var(--tl-border)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <Mail size={20} color="var(--tl-primary-light)" />
                        <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600, margin: 0 }}>Input Source</h6>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant={mode === 'raw' ? 'primary' : 'outline'} size="sm" onClick={() => setMode('raw')}>
                            Raw Email Headers
                        </Button>
                        <Button variant={mode === 'structured' ? 'primary' : 'outline'} size="sm" onClick={() => setMode('structured')}>
                            Structured Email
                        </Button>
                    </div>
                </div>
                
                {mode === 'raw' ? (
                    <div>
                        <textarea 
                            className="tl-input w-100" 
                            rows={8}
                            placeholder="Received: from mail.example.com (mail.example.com [192.0.2.1])&#10;by mx.google.com with ESMTPS id...&#10;Authentication-Results: mx.google.com; spf=pass...&#10;From: sender@example.com&#10;To: receiver@example.com&#10;Subject: Urgent Update"
                            value={headers}
                            onChange={(e) => setHeaders(e.target.value)}
                            style={{ 
                                fontFamily: 'var(--tl-font-mono)', 
                                fontSize: '0.875rem', 
                                background: 'rgba(15, 23, 42, 0.4)',
                                resize: 'vertical',
                                padding: '1rem'
                            }}
                        />
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: 4 }}>Sender Email (From)</label>
                                <input type="email" className="tl-input w-100" placeholder="support@amaz0n-security.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
                            </div>
                            <div className="col-md-6">
                                <label style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: 4 }}>Subject</label>
                                <input type="text" className="tl-input w-100" placeholder="Action Required: Verify Account" value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: 4 }}>Email Body</label>
                            <textarea 
                                className="tl-input w-100" 
                                rows={6}
                                placeholder="Dear user, your account has been locked. Click here to verify: https://amaz0n-security.com/login"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--tl-border)' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
                        {mode === 'raw' 
                            ? "Paste the complete raw headers to enable full SPF/DKIM/DMARC authentication analysis." 
                            : "Authentication checks (SPF/DKIM) are not possible in Structured Mode."}
                    </div>
                    <div className="d-flex gap-3">
                        <Button variant="ghost" onClick={() => { setHeaders(''); setSenderEmail(''); setSubject(''); setBody(''); setResult(null); setShowReport(false); setIsInvestigating(false); }}>Clear</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isInvestigating || (mode === 'raw' && !headers) || (mode === 'structured' && (!senderEmail || !body))} 
                            icon={(isInvestigating && !showReport) ? undefined : <Search size={16} />}
                        >
                            {(isInvestigating && !showReport) ? 'Analyzing...' : 'Extract & Analyze'}
                        </Button>
                    </div>
                </div>
                
                {error && <div className="mt-3 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
            </motion.div>
        </div>

        {/* Animation System */}
        {isInvestigating && !showReport && !error && (
            <div className="col-12">
                <InvestigationProgress 
                    steps={mode === 'raw' ? RAW_EMAIL_STEPS : BASE_EMAIL_STEPS} 
                    target={mode === 'raw' ? 'Raw Email Headers' : senderEmail}
                    isBackendComplete={isBackendComplete} 
                    onRevealReport={() => { setShowReport(true); setIsInvestigating(false); }} 
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
                            
                            {/* Phishing Indicators */}
                            <div className="tl-card p-4 flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <ShieldAlert size={18} color={result.indicators.length > 0 ? "var(--tl-danger)" : "var(--tl-success)"} />
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Detection Indicators</h6>
                                </div>
                                {result.matched_rules.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                        {result.matched_rules.map((ind, i) => {
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
                                        <span>No high-risk phishing indicators detected in headers.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Evidence Panels */}
                        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                            
                            {/* Email Authentication */}
                            {result.input_mode === 'Raw Headers' ? (
                                <div className="tl-card p-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Domain Authentication</h6>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 8 }}>SPF</div>
                                                {renderAuthBadge(result.spf)}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 8 }}>DKIM</div>
                                                {renderAuthBadge(result.dkim)}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 8 }}>DMARC</div>
                                                {renderAuthBadge(result.dmarc)}
                                            </div>
                                        </div>
                                    </div>
                                    {result.spf === 'Not Available' && (
                                        <div className="mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
                                            * Authentication results are not available.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="tl-card p-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Authentication Analysis</h6>
                                    <div className="d-flex align-items-center gap-2 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', color: 'var(--tl-text-secondary)', fontSize: '0.875rem' }}>
                                        <AlertTriangle size={16} />
                                        <span><strong>Unavailable:</strong> Raw email headers were not provided. Authentication checks (SPF, DKIM, and DMARC) require complete SMTP headers.</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Email Details */}
                            <div className="tl-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Email Details</h6>
                                </div>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Sender</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.sender}</span>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Recipient</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.recipient}</span>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Subject</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.subject}</span>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Date</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.date}</span>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Reply-To</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.reply_to}</span>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                        <span style={{ color: 'var(--tl-text-faint)' }}>Envelope From (Return-Path)</span>
                                        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.return_path}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mail Infrastructure */}
                            {result.input_mode === 'Raw Headers' && (result.mailed_by !== 'Not Provided' || result.signed_by !== 'Not Provided' || result.security_tls !== 'Not Provided') && (
                                <div className="tl-card p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Mail Infrastructure</h6>
                                    </div>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <span style={{ color: 'var(--tl-text-faint)' }}>Mailed By</span>
                                            <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.mailed_by}</span>
                                        </div>
                                        <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <span style={{ color: 'var(--tl-text-faint)' }}>Signed By</span>
                                            <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.signed_by}</span>
                                        </div>
                                        <div className="d-flex flex-column flex-sm-row justify-content-between p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                            <span style={{ color: 'var(--tl-text-faint)' }}>Connection Security</span>
                                            <span style={{ color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.security_tls}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                    
                    {/* IOCs */}
                    <div className="row">
                        <div className="col-12">
                            <div className="tl-card p-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <Server size={18} color="var(--tl-primary-light)" />
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Extracted Entities (IOCs)</h6>
                                </div>
                                {result.extracted_iocs.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ color: 'var(--tl-text-muted)', borderBottom: '1px solid var(--tl-border)' }}>Type</th>
                                                    <th style={{ color: 'var(--tl-text-muted)', borderBottom: '1px solid var(--tl-border)' }}>Value</th>
                                                    <th style={{ color: 'var(--tl-text-muted)', borderBottom: '1px solid var(--tl-border)', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.extracted_iocs.map((ioc, i) => (
                                                    <tr key={i} style={{ verticalAlign: 'middle' }}>
                                                        <td style={{ borderColor: 'var(--tl-border)', color: 'var(--tl-text-primary)' }}>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span style={{ color: 'var(--tl-text-muted)' }}>{getIocIcon(ioc.type)}</span>
                                                                <span>{ioc.type}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ borderColor: 'var(--tl-border)', fontFamily: 'var(--tl-font-mono)', color: 'var(--tl-primary-light)' }}>
                                                            {ioc.value}
                                                        </td>
                                                        <td style={{ borderColor: 'var(--tl-border)', textAlign: 'right' }}>
                                                            {ioc.type === 'URL' ? (
                                                                <Button variant="outline" size="sm" onClick={() => handleInvestigate(ioc)}>
                                                                    Investigate URL
                                                                </Button>
                                                            ) : (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)' }}>Recorded</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center rounded" style={{ background: 'var(--tl-bg-surface)', color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>
                                        No identifiable entities (URLs, Emails, Phones, Crypto, IPs, Domains) were extracted from the email.
                                    </div>
                                )}
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
