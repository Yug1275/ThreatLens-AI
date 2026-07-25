import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ScanLine, ShieldAlert, Download, QrCode, ShieldCheck, AlertTriangle, Link as LinkIcon, Mail, PhoneCall, Wifi, User, CheckCircle, XCircle } from 'lucide-react';
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

  const [result, setResult] = useState(null);
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
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await api.post('/api/v1/investigation/qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.result_data);
      setIsBackendComplete(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during QR analysis.');
      setIsInvestigating(false);
    }
  };

  const handleInvestigateDeep = () => {
      if (!result) return;
      if (result.qr_type === 'URL') {
          navigate('/investigations/url', { state: { target: result.extracted_data } });
      } else if (result.qr_type === 'Email') {
          // Extract email from mailto: if necessary
          const email = result.extracted_data.replace('mailto:', '').split('?')[0];
          navigate('/investigations/email', { state: { target: email } });
      } else if (result.qr_type === 'Phone' || result.qr_type === 'SMS') {
          // Extract phone from tel: or sms:
          const phone = result.extracted_data.replace('tel:', '').replace('sms:', '').split(/[?:]/)[0];
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
          default: return <ScanLine size={24} color="var(--tl-primary-light)" />;
      }
  };

  const canDeepInvestigate = result && ['URL', 'Email', 'Phone', 'SMS'].includes(result.qr_type);

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
                    
                    <div className="row g-4 mb-4">
                        
                        {/* Threat Score & Type */}
                        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                            <div className="tl-card p-4 text-center">
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                                <ThreatGauge score={result?.threat_score || 0} />
                                
                                <div className="mt-4 p-3 rounded d-flex align-items-center justify-content-center gap-3" style={{ background: 'var(--tl-bg-surface)', border: '1px solid var(--tl-border)' }}>
                                    <div style={{ padding: 10, background: 'rgba(var(--tl-primary-rgb), 0.1)', borderRadius: 'var(--tl-radius-md)' }}>
                                        {getQrIcon(result?.qr_type)}
                                    </div>
                                    <div className="text-start">
                                        <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase' }}>QR Type Detected</div>
                                        <div style={{ fontSize: '1.125rem', color: 'var(--tl-text-primary)', fontWeight: 600 }}>{result?.qr_type || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            {canDeepInvestigate && (
                                <div className="tl-card p-4">
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Further Investigation</h6>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: '1rem' }}>
                                        This QR code contains a <strong>{result?.qr_type}</strong>. You can run a deep analysis on the extracted target using the dedicated investigation module.
                                    </p>
                                    <Button className="w-100" onClick={handleDeepInvestigate}>
                                        Open in {result?.qr_type} Investigation
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Evidence Panels */}
                        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                            
                            {/* Decoded Content */}
                            <div className="tl-card p-4 flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <ScanLine size={18} color="var(--tl-primary-light)" />
                                    <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Decoded Payload (Safe Preview)</h6>
                                </div>
                                
                                <div className="p-4 rounded" style={{ background: '#020617', border: '1px solid var(--tl-border)' }}>
                                    <div style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-primary-light)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {result?.extracted_data || 'No data extracted'}
                                    </div>
                                </div>
                                
                                <div className="mt-4 p-3 rounded" style={{ background: 'rgba(var(--tl-primary-rgb), 0.1)', fontSize: '0.8125rem', color: 'var(--tl-primary-light)', textAlign: 'left', lineHeight: 1.6, border: '1px solid rgba(var(--tl-primary-rgb), 0.2)' }}>
                                    {result?.summary || 'No summary available.'}
                                </div>
                            </div>
                            
                            {/* Threat Indicators */}
                            <div className="tl-card p-4">
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
                    </div>
                    
                </motion.div>
            </div>
        )}
      </div>
    </div>
  );
}
