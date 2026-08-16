import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ScanLine, ShieldAlert, Download, QrCode, ShieldCheck, AlertTriangle, Link as LinkIcon, Mail, PhoneCall, Wifi, User, CheckCircle, XCircle, FileJson, ChevronDown, ChevronRight, Activity, Brain } from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import InvestigationProgress from '../components/investigation/InvestigationProgress';
import AIInsightsModal from '../components/investigation/AIInsightsModal';

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

const QR_STEPS = [
    "QR Uploaded", "Validating QR Image", "Decoding QR Code",
    "Detecting QR Type", "Extracting Embedded Content", "Validating Extracted Content",
    "Launching Appropriate Investigation", "Threat Analysis", 
    "Threat Score Calculation", "Generating Investigation Report", "Investigation Completed"
];

export default function QrInvestigation() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Animation System States
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  const [result, setResult] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };
  
  const handleFileSelection = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
    setResult(null);
    setIsInvestigating(false);
    setShowReport(false);
    setShowRawPayload(false);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);
    setInvestigation(null);
    setShowRawPayload(false);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await api.post('/api/v1/investigation/qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.result_data);
      setInvestigation(res.data);
      setIsBackendComplete(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during QR analysis.');
      setIsInvestigating(false);
    }
  };

  const handleExport = () => {
    if (!investigation) return;
    const blob = new Blob([JSON.stringify(investigation, null, 2)], { type: 'application/json' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `investigation_${investigation.id || 'qr'}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleDeepInvestigate = (typeOverride, targetOverride) => {
      if (!result) return;
      const t = typeOverride || result.type;
      const content = targetOverride || result.content;
      
      if (t === 'URL') {
          navigate('/investigations/url', { state: { target: content } });
      } else if (t === 'Email') {
          const email = content.replace('mailto:', '').split('?')[0];
          navigate('/investigations/email', { state: { target: email } });
      } else if (t === 'Phone' || t === 'SMS') {
          const phone = content.replace('tel:', '').replace('sms:', '').split(/[?:]/)[0];
          navigate('/investigations/phone', { state: { target: phone } });
      }
  };
  
  const getQrIcon = (type) => {
      switch(type) {
          case 'URL': return <LinkIcon size={24} color="var(--tl-primary-light)" />;
          case 'Email': return <Mail size={24} color="var(--tl-primary-light)" />;
          case 'Phone': return <PhoneCall size={24} color="var(--tl-primary-light)" />;
          case 'SMS': return <PhoneCall size={24} color="var(--tl-primary-light)" />;
          case 'WiFi': return <Wifi size={24} color="var(--tl-primary-light)" />;
          case 'Contact Card': return <User size={24} color="var(--tl-primary-light)" />;
          case 'JSON': return <FileJson size={24} color="var(--tl-primary-light)" />;
          default: return <ScanLine size={24} color="var(--tl-primary-light)" />;
      }
  };

  const qrType = result?.type || 'Unknown';
  const qrContent = result?.content || 'No data extracted';
  const canDeepInvestigatePrimary = result && ['URL', 'Email', 'Phone', 'SMS'].includes(qrType);
  
  // Logic for JSON nested deep investigation
  const nestedUrl = result?.metadata?.extracted_fields?.url;
  const nestedEmail = result?.metadata?.extracted_fields?.email;
  const nestedPhone = result?.metadata?.extracted_fields?.phone;
  const hasNestedInvestigatable = qrType === 'JSON' && (nestedUrl || nestedEmail || nestedPhone);

  return (
    <div className="pb-5">
      <PageHeader 
        title="QR Investigation Engine" 
        subtitle="Securely decode and analyze QR codes without risking device compromise."
      />

      <div className="row g-4 mb-5">
        <div className="col-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100">
                <div 
                    className={`tl-card p-5 text-center d-flex flex-column justify-content-center ${dragActive ? 'border-primary' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{ 
                        borderStyle: 'dashed', 
                        borderWidth: '2px',
                        borderColor: dragActive ? 'var(--tl-primary)' : 'var(--tl-border)',
                        transition: 'all 0.2s ease',
                        minHeight: '250px'
                    }}
                >
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleChange} 
                        style={{ display: 'none' }} 
                    />
                    
                    {!file ? (
                        <>
                            <div className="mx-auto mb-4" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb), 0.1)', color: 'var(--tl-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <QrCode size={32} />
                            </div>
                            <h5 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>Upload QR Code</h5>
                            <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>Drag & drop or browse (PNG, JPG, WEBP)</p>
                            <Button variant="secondary" className="mt-3 mx-auto" onClick={() => fileInputRef.current.click()}>
                                Select File
                            </Button>
                        </>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <div style={{ height: 160, width: 160, borderRadius: 'var(--tl-radius-md)', overflow: 'hidden', border: '1px solid var(--tl-border)', marginBottom: '1.5rem', background: 'var(--tl-bg-deep)' }}>
                                <img src={previewUrl} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                            </div>
                            <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>{file.name}</h6>
                            <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                            
                            {(!isInvestigating || showReport) && (
                                <div className="d-flex justify-content-center gap-3 mt-2">
                                    <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); setShowReport(false); setIsInvestigating(false); }}>Clear</Button>
                                    <Button size="sm" onClick={handleSubmit} icon={<ScanLine size={16} />}>
                                        Decode & Analyze
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {error && <div className="mt-4 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
                </div>
            </motion.div>
        </div>

        {/* Animation System */}
        {isInvestigating && !showReport && !error && (
            <div className="col-12">
                <InvestigationProgress 
                    steps={QR_STEPS} 
                    target={file?.name}
                    isBackendComplete={isBackendComplete} 
                    onRevealReport={() => { setShowReport(true); setIsInvestigating(false); }} 
                />
            </div>
        )}

        {/* Results Dashboard */}
        {showReport && result && (
            <div className="col-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <h5 style={{ color: 'var(--tl-text-primary)', margin: 0, fontWeight: 600 }}>Investigation Report</h5>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button variant="primary" size="sm" icon={<Brain size={16} />} onClick={() => setShowAIModal(true)}>AI Analysis</Button>
                            <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={handleExport}>Export Report</Button>
                        </div>
                    </div>
                    
                    <div className="row g-4 mb-4">
                        
                        {/* Threat Score & Type */}
                        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                            <div className="tl-card p-4 text-center">
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                                <ThreatGauge score={result?.threat_score || 0} />
                                
                                <div className="mt-4 p-3 rounded d-flex align-items-center justify-content-center gap-3" style={{ background: 'var(--tl-bg-surface)', border: '1px solid var(--tl-border)' }}>
                                    <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)' }}>
                                        {getQrIcon(qrType)}
                                    </div>
                                    <div className="text-start">
                                        <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Payload Type</div>
                                        <div style={{ fontSize: '1.125rem', color: 'var(--tl-text-primary)', fontWeight: 600 }}>{qrType}</div>
                                    </div>
                                </div>
                                
                                {result.metadata?.application && result.metadata?.application !== "Unknown" && (
                                    <div className="mt-3 p-3 rounded text-start" style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>Detected Application</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.metadata.application}</div>
                                        {result.metadata?.purpose && result.metadata?.purpose !== "Unknown" && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--tl-text-muted)', marginTop: '0.25rem' }}>Purpose: {result.metadata.purpose}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Actions */}
                            {canDeepInvestigatePrimary && (
                                <div className="tl-card p-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Further Investigation</h6>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: '1rem' }}>
                                        This QR code contains a <strong>{qrType}</strong>. You can run a deep analysis on the extracted target using the dedicated investigation module.
                                    </p>
                                    <Button className="w-100" onClick={() => handleDeepInvestigate(qrType, qrContent)}>
                                        Open in {qrType} Investigation
                                    </Button>
                                </div>
                            )}
                            
                            {hasNestedInvestigatable && (
                                <div className="tl-card p-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Deep Investigation Options</h6>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: '1rem' }}>
                                        Nested investigatable fields were discovered inside the JSON payload.
                                    </p>
                                    <div className="d-flex flex-column gap-2">
                                        {nestedUrl && (
                                            <Button variant="secondary" className="w-100 text-start d-flex justify-content-between" onClick={() => handleDeepInvestigate('URL', nestedUrl)}>
                                                <span>Investigate URL</span> <LinkIcon size={14} />
                                            </Button>
                                        )}
                                        {nestedEmail && (
                                            <Button variant="secondary" className="w-100 text-start d-flex justify-content-between" onClick={() => handleDeepInvestigate('Email', nestedEmail)}>
                                                <span>Investigate Email</span> <Mail size={14} />
                                            </Button>
                                        )}
                                        {nestedPhone && (
                                            <Button variant="secondary" className="w-100 text-start d-flex justify-content-between" onClick={() => handleDeepInvestigate('Phone', nestedPhone)}>
                                                <span>Investigate Phone</span> <PhoneCall size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Evidence Panels */}
                        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                            
                            {/* Decoded Content */}
                            <div className="tl-card p-4 flex-grow-1">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <ScanLine size={18} color="var(--tl-primary-light)" />
                                        <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Decoded Payload Intelligence</h6>
                                    </div>
                                </div>
                                
                                {qrType === 'JSON' && result?.metadata?.extracted_fields ? (
                                    <>
                                        <div className="table-responsive rounded border mb-4" style={{ borderColor: 'var(--tl-border)' }}>
                                            <table className="table table-borderless table-hover mb-0" style={{ '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--tl-text-primary)' }}>
                                                <thead style={{ background: 'var(--tl-bg-surface)', borderBottom: '1px solid var(--tl-border)' }}>
                                                    <tr>
                                                        <th style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 600, width: '30%' }}>EXTRACTED FIELD</th>
                                                        <th style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', fontWeight: 600 }}>VALUE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.keys(result.metadata.extracted_fields).length > 0 ? (
                                                        Object.entries(result.metadata.extracted_fields).map(([key, value]) => (
                                                            <tr key={key} style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                                                                <td style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{key}</td>
                                                                <td style={{ fontSize: '0.875rem', fontFamily: 'var(--tl-font-mono)', color: 'var(--tl-primary-light)', wordBreak: 'break-all' }}>{String(value)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="2" className="text-center py-4" style={{ fontSize: '0.875rem', color: 'var(--tl-text-muted)' }}>
                                                                No standardized fields found in JSON.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 rounded mb-4" style={{ background: '#020617', border: '1px solid var(--tl-border)' }}>
                                        <div style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-primary-light)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                            {qrContent}
                                        </div>
                                    </div>
                                )}
                                
                                {qrType === 'JSON' && (
                                    <div className="mb-4">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setShowRawPayload(!showRawPayload)}
                                            className="d-flex align-items-center gap-1 p-0 text-muted hover-text-primary"
                                        >
                                            {showRawPayload ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            <span style={{ fontSize: '0.8125rem' }}>View Raw JSON Payload</span>
                                        </Button>
                                        
                                        <AnimatePresence>
                                            {showRawPayload && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div className="p-3 mt-2 rounded" style={{ background: '#020617', border: '1px solid var(--tl-border)' }}>
                                                        <pre style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.75rem', color: 'var(--tl-primary-light)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                            {JSON.stringify(result.metadata?.parsed, null, 2)}
                                                        </pre>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                
                                <div className="mt-auto p-3 rounded" style={{ background: 'rgba(var(--tl-primary-rgb), 0.1)', fontSize: '0.8125rem', color: 'var(--tl-primary-light)', textAlign: 'left', lineHeight: 1.6, border: '1px solid rgba(var(--tl-primary-rgb), 0.2)' }}>
                                    {result?.summary || 'No summary available.'}
                                </div>
                            </div>
                            
                            {/* Threat Indicators & Recommendations */}
                            <div className="row g-4">
                                <div className="col-12 col-md-6">
                                    <div className="tl-card p-4 h-100">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <ShieldAlert size={18} color={result?.indicators?.length > 0 ? "var(--tl-danger)" : "var(--tl-success)"} />
                                            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Threat Indicators</h6>
                                        </div>
                                        {result?.indicators && result.indicators.length > 0 ? (
                                            <div className="d-flex flex-column gap-2">
                                                {result.indicators.map((ind, i) => (
                                                    <div key={i} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>
                                                        <AlertTriangle size={14} />
                                                        <span>{ind}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-success-rgb), 0.1)', color: 'var(--tl-success)', fontSize: '0.8125rem' }}>
                                                <CheckCircle size={14} />
                                                <span>No high-risk indicators detected in the payload structure.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="tl-card p-4 h-100">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <Activity size={18} color="var(--tl-primary-light)" />
                                            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Recommendations</h6>
                                        </div>
                                        {result?.recommendations && result.recommendations.length > 0 ? (
                                            <div className="d-flex flex-column gap-2">
                                                {result.recommendations.map((rec, i) => (
                                                    <div key={i} className="d-flex align-items-start gap-2 p-2 rounded" style={{ background: 'rgba(148,163,184,0.05)', color: 'var(--tl-text-primary)', fontSize: '0.8125rem' }}>
                                                        <span style={{ color: 'var(--tl-primary-light)', marginTop: '2px' }}>•</span>
                                                        <span>{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-2" style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>
                                                No specific recommendations available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    
                    <AIInsightsModal
                        isOpen={showAIModal}
                        onClose={() => setShowAIModal(false)}
                        aiAnalysis={result?.ai_analysis}
                        investigationId={investigation?.id}
                        investigationType={investigation?.type}
                    />
                </motion.div>
            </div>
        )}
      </div>
    </div>
  );
}
