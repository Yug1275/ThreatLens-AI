import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, QrCode, AlertTriangle, Download, Link as LinkIcon, ExternalLink, ShieldCheck } from 'lucide-react';
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
  
  return (
    <div className="pb-5">
      <PageHeader 
        title="QR Code Investigation" 
        subtitle="Safely decode and analyze embedded QR URLs before scanning them on your mobile device."
      />

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-100">
                <div 
                    className={`tl-card p-5 text-center h-100 d-flex flex-column justify-content-center ${dragActive ? 'border-primary' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{ 
                        borderStyle: 'dashed', 
                        borderWidth: '2px',
                        borderColor: dragActive ? 'var(--tl-primary)' : 'var(--tl-border)',
                        transition: 'all 0.2s ease',
                        minHeight: '300px'
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
                                <Button size="sm" onClick={handleSubmit} disabled={loading} icon={loading ? undefined : <ShieldCheck size={16} />}>
                                    {loading ? 'Decoding...' : 'Safe Scan'}
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
            <div className="col-lg-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tl-card p-4 h-100 d-flex flex-column gap-3">
                    <Skeleton w="50%" h="24px" className="mb-2" />
                    <Skeleton w="100%" h="80px" />
                    <div className="d-flex gap-4 mt-3">
                        <Skeleton w="100px" h="100px" r />
                        <div className="flex-grow-1 d-flex flex-column gap-2">
                            <Skeleton w="100%" h="20px" />
                            <Skeleton w="80%" h="20px" />
                            <Skeleton w="90%" h="20px" />
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Results Dashboard */}
        {result && (
            <div className="col-lg-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-100">
                    <div className="tl-card d-flex flex-column h-100">
                        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--tl-border)' }}>
                            <div style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Scan Results</div>
                            <Button variant="ghost" size="sm" icon={<Download size={16} />}>Export</Button>
                        </div>
                        
                        <div className="p-4 flex-grow-1">
                            {/* Safe Preview URL Panel */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <LinkIcon size={16} color="var(--tl-text-muted)" />
                                    <h6 style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', margin: 0 }}>Embedded URL</h6>
                                </div>
                                <div className="p-3 rounded d-flex align-items-center justify-content-between gap-3" style={{ background: result.is_suspicious ? 'rgba(var(--tl-danger-rgb), 0.05)' : 'var(--tl-bg-surface)', border: `1px solid ${result.is_suspicious ? 'rgba(var(--tl-danger-rgb), 0.2)' : 'var(--tl-border)'}` }}>
                                    <div style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', color: 'var(--tl-text-primary)', wordBreak: 'break-all' }}>
                                        {result.embedded_url}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row g-4">
                                <div className="col-sm-5 d-flex flex-column align-items-center justify-content-center">
                                    <ThreatGauge score={result.threat_score} />
                                </div>
                                <div className="col-sm-7">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <AlertTriangle size={16} color={result.is_suspicious ? 'var(--tl-danger)' : 'var(--tl-text-muted)'} />
                                        <h6 style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', margin: 0 }}>Threat Analysis</h6>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                        {result.ai_summary}
                                    </p>
                                    
                                    <div className="mt-4">
                                        <Button variant={result.is_suspicious ? "primary" : "secondary"} size="sm" icon={<ExternalLink size={14} />} disabled={result.is_suspicious}>
                                            Proceed to Deep URL Scan
                                        </Button>
                                    </div>
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
