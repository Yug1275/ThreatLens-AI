import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle, FileText, Download, Target } from 'lucide-react';
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

export default function OcrInvestigation() {
  const [file, setFile] = useState(null);
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
    // Only accept images
    if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
    }
    setFile(selectedFile);
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
      // Set a generic content type header, axios handles multipart boundaries
      const res = await api.post('/api/v1/investigation/ocr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.result_data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during OCR analysis.');
    } finally {
      setLoading(false);
    }
  };
  
  // Highlight suspicious words in text
  const renderHighlightedText = (text, suspiciousWords) => {
      if (!suspiciousWords || suspiciousWords.length === 0) return <p>{text}</p>;
      
      let highlightedText = text;
      // Very simple string replace for demo purposes. In a real app, use a proper regex with boundaries
      suspiciousWords.forEach(word => {
          const regex = new RegExp(`(${word})`, 'gi');
          highlightedText = highlightedText.replace(regex, '<mark style="background: rgba(var(--tl-danger-rgb), 0.2); color: var(--tl-danger); padding: 0.125rem 0.25rem; border-radius: 4px; font-weight: 500;">$1</mark>');
      });
      
      return <p dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="pb-5">
      <PageHeader 
        title="OCR Investigation" 
        subtitle="Extract text from screenshots and analyze it for phishing attempts and malicious intent."
      />

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div 
            className={`tl-card p-5 text-center ${dragActive ? 'border-primary' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{ 
                borderStyle: 'dashed', 
                borderWidth: '2px',
                borderColor: dragActive ? 'var(--tl-primary)' : 'var(--tl-border)',
                transition: 'all 0.2s ease'
            }}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleChange} 
                style={{ display: 'none' }} 
            />
            
            <div className="mx-auto mb-4" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb), 0.1)', color: 'var(--tl-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={32} />
            </div>
            
            {file ? (
                <>
                    <h5 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>{file.name}</h5>
                    <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button variant="ghost" onClick={() => { setFile(null); setResult(null); }}>Clear</Button>
                        <Button onClick={handleSubmit} disabled={loading} icon={loading ? undefined : <Upload size={18} />}>
                            {loading ? 'Processing...' : 'Analyze Image'}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <h5 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>Drag & Drop an image here</h5>
                    <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem' }}>or click to browse your files (PNG, JPG, WEBP)</p>
                    <Button variant="secondary" className="mt-3" onClick={() => fileInputRef.current.click()}>
                        Select File
                    </Button>
                </>
            )}
            
            {error && <div className="mt-4 text-danger" style={{ fontSize: '0.875rem' }}>{error}</div>}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row g-4">
          <div className="col-lg-4">
            <div className="tl-card p-4 h-100 d-flex flex-column gap-4">
                <Skeleton h="100px" />
                <Skeleton h="100px" />
            </div>
          </div>
          <div className="col-lg-8">
            <div className="tl-card p-4 h-100">
              <Skeleton w="40%" h="24px" className="mb-4" />
              <div className="d-flex flex-column gap-3">
                <Skeleton w="100%" h="20px" />
                <Skeleton w="90%" h="20px" />
                <Skeleton w="95%" h="20px" />
                <Skeleton w="80%" h="20px" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 style={{ color: 'var(--tl-text-primary)', margin: 0, fontWeight: 600 }}>Analysis Results</h5>
              <Button variant="secondary" size="sm" icon={<Download size={16} />}>Export Report</Button>
          </div>
            
          <div className="row g-4">
            
            {/* Left Column: Metrics & Summary */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                
              {/* Threat Score Card */}
              <div className="tl-card p-4 d-flex flex-column align-items-center text-center">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem', width: '100%', textAlign: 'left' }}>Risk Assessment</h6>
                <ThreatGauge score={result.threat_score} />
              </div>
              
              {/* OCR Confidence */}
              <div className="tl-card p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>OCR Confidence</h6>
                      <Target size={18} color="var(--tl-primary-light)" />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--tl-text-primary)' }}>
                      {result.confidence_score}%
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', margin: 0, marginTop: '0.5rem' }}>
                      High confidence in text extraction accuracy.
                  </p>
              </div>
              
              {/* AI Summary */}
              <div className="tl-card p-4 flex-grow-1">
                  <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>AI Summary</h6>
                  <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-secondary)', lineHeight: 1.6 }}>
                      {result.ai_summary}
                  </p>
              </div>

            </div>

            {/* Right Column: Extracted Text */}
            <div className="col-12 col-xl-8">
              <div className="tl-card d-flex flex-column h-100">
                <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--tl-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--tl-text-primary)' }}>Extracted Text</div>
                    <Badge variant={result.suspicious_words.length > 0 ? "danger" : "success"}>
                        {result.suspicious_words.length} Keywords Flagged
                    </Badge>
                </div>
                
                <div className="p-4 flex-grow-1" style={{ 
                    background: 'rgba(var(--tl-bg-deep-rgb), 0.5)', 
                    fontFamily: 'var(--tl-font-mono)', 
                    fontSize: '0.875rem',
                    color: 'var(--tl-text-primary)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap'
                }}>
                    {renderHighlightedText(result.extracted_text, result.suspicious_words)}
                </div>
                
                {result.suspicious_words.length > 0 && (
                    <div className="p-4 border-top" style={{ borderColor: 'var(--tl-border)', background: 'rgba(148,163,184,0.02)' }}>
                        <h6 style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: '1rem' }}>Flagged Indicators</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {result.suspicious_words.map((word, i) => (
                                <span key={i} className="tl-badge" style={{ background: 'rgba(var(--tl-danger-rgb), 0.1)', color: 'var(--tl-danger)' }}>
                                    {word}
                                </span>
                            ))}
                        </div>
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
