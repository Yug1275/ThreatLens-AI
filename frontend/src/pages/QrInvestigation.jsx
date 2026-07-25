import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, QrCode, AlertTriangle, Download, Link as LinkIcon, Mail, PhoneCall, Wifi, User, MapPin, Scan, FileText, CheckCircle, Database, ShieldAlert, XCircle } from 'lucide-react';
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

export default function QrInvestigation() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
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
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await api.post('/api/v1/investigation/qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.result_data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during QR analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeepInvestigation = () => {
      if (!result) return;
      const content = result.content;
      if (result.type === "URL") {
          navigate('/investigations/url', { state: { target: content } });
      } else if (result.type === "Email") {
          navigate('/investigations/email', { state: { target: content } });
      } else if (result.type === "Phone") {
          navigate('/investigations/phone', { state: { target: content } });
      }
  };

  const getIconForType = (type) => {
      switch(type) {
          case 'URL': return <LinkIcon size={18} color="var(--tl-primary-light)" />;
          case 'Email': return <Mail size={18} color="var(--tl-primary-light)" />;
          case 'Phone': return <PhoneCall size={18} color="var(--tl-primary-light)" />;
          case 'WiFi': return <Wifi size={18} color="var(--tl-primary-light)" />;
          case 'Contact Card': return <User size={18} color="var(--tl-primary-light)" />;
          case 'Geo Location': return <MapPin size={18} color="var(--tl-primary-light)" />;
          default: return <FileText size={18} color="var(--tl-primary-light)" />;
      }
  };

  const canDeepInvestigate = result && ['URL', 'Email', 'Phone'].includes(result.type);

  return (
    <div className="pb-5">
      <PageHeader 
        title="QR Code Investigation Engine" 
        subtitle="Decode QR codes locally, determine content types automatically, and perform threat assessment before execution."
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
                            <div style={{ width: 120, height: 120, borderRadius: 'var(--tl-radius-md)', overflow: 'hidden', border: '1px solid var(--tl-border)', marginBottom: '1.5rem', background: 'var(--tl-bg-deep)' }}>
                                <img src={previewUrl} alt="QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>{file.name}</h6>
                            <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                            <div className="d-flex justify-content-center gap-3 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); }}>Clear</Button>
                                <Button size="sm" onClick={handleSubmit} disabled={loading} icon={loading ? undefined : <Scan size={16} />}>
                                    {loading ? 'Decoding...' : 'Decode & Analyze'}
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {error && <div className="mt-4 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
                </div>
            </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="col-12">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4">
                    <div className="col-md-4">
                        <div className="tl-card p-4 h-100 d-flex flex-column gap-3">
                            <Skeleton h="20px" w="40%" />
                            <Skeleton h="100px" />
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="tl-card p-4 h-100 d-flex flex-column gap-3">
                            <Skeleton h="20px" w="30%" />
                            <Skeleton h="80px" />
                            <Skeleton h="40px" />
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Results Dashboard */}
        {result && (
            <div className="col-12">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    
                    <div className="row g-4 mb-4">
                        
                        {/* Risk Assessment */}
                        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                            <div className="tl-card p-4 text-center h-100 d-flex flex-column">
                                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', textAlign: 'left' }}>Risk Assessment</h6>
                                <div className="flex-grow-1 d-flex flex-column justify-content-center">
                                    <ThreatGauge score={result.threat_score} />
                                </div>
                                
                                <div className="mt-4 p-3 rounded" style={{ background: 'var(--tl-bg-surface)', fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', textAlign: 'left', lineHeight: 1.6 }}>
                                    {result.summary}
                                </div>
                            </div>
                        </div>

                        {/* Extracted Content & Details */}
                        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                            
                            {/* Threat Rules Panel */}
                            {result.matched_rules && result.matched_rules.length > 0 && (
                                <div className="tl-card p-4">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <ShieldAlert size={18} color="var(--tl-danger)" />
                                        <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Threat Rules Triggered</h6>
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        {result.matched_rules.map((rule, i) => (
                                            <div key={i} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', color: 'var(--tl-danger)', fontSize: '0.8125rem' }}>
                                                <XCircle size={14} />
                                                <span>{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Safe View Panel */}
                            <div className="tl-card p-4 flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        {getIconForType(result.type)}
                                        <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Decoded Payload ({result.type})</h6>
                                    </div>
                                    {canDeepInvestigate && (
                                        <Button variant="primary" size="sm" onClick={handleDeepInvestigation}>
                                            Launch Deep Investigation
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="p-4 rounded d-flex align-items-center" style={{ background: result.threat_score > 40 ? 'rgba(var(--tl-danger-rgb), 0.05)' : 'var(--tl-bg-surface)', border: `1px solid ${result.threat_score > 40 ? 'rgba(var(--tl-danger-rgb), 0.2)' : 'var(--tl-border)'}`, minHeight: '100px' }}>
                                    <div style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-text-primary)', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                        {result.content}
                                    </div>
                                </div>
                                
                                {/* WiFi Specific Metadata Display */}
                                {result.type === "WiFi" && result.metadata && (
                                    <div className="row g-3 mt-4">
                                        <div className="col-sm-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>SSID (Network Name)</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-primary-light)', fontWeight: 500 }}>{result.metadata.ssid}</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Authentication</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{result.metadata.auth}</div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="p-3 rounded" style={{ background: 'var(--tl-bg-surface)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>Password Status</div>
                                                <div style={{ fontSize: '0.875rem', color: result.metadata.has_password ? 'var(--tl-success)' : 'var(--tl-warning)', fontWeight: 500 }}>
                                                    {result.metadata.has_password ? (result.metadata.password_hidden ? 'Hidden/Encrypted' : 'Visible in QR') : 'Open Network'}
                                                </div>
                                            </div>
                                        </div>
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
