import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Globe, ShieldAlert, Activity, FileText, ChevronRight, Brain, Download
} from 'lucide-react';
import api from '../utils/axios';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import InvestigationProgress from '../components/investigation/InvestigationProgress';

import UrlReportView from '../components/investigation/UrlReportView';
import AIInsightsModal from '../components/investigation/AIInsightsModal';

// ── Investigation Steps ───────────────────────────────────────────────── //

const URL_STEPS = [
  "Investigation Initialized", "Validating URL Format", "Extracting Domain",
  "Checking Domain Structure", "WHOIS Lookup", "DNS Record Analysis",
  "SSL Certificate Inspection", "Redirect Chain Analysis", "IOC Extraction",
  "Rule-Based Threat Detection", "Threat Score Calculation",
  "Generating Investigation Report", "Investigation Completed"
];

// ── Main Page ─────────────────────────────────────────────────────────── //

export default function UrlInvestigation() {
  const location = useLocation();
  const [url, setUrl] = useState(location.state?.target || '');

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsInvestigating(true);
    setIsBackendComplete(false);
    setShowReport(false);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/api/v1/investigation/url', { url });
      setResult(response.data);
      setIsBackendComplete(true);
    } catch (err) {
      console.error('Investigation failed:', err);
      setError(err.response?.data?.detail || 'An error occurred during the investigation.');
      setIsInvestigating(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `investigation_${result.id || 'url'}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="pb-5">
      <PageHeader
        title="URL Investigation Engine"
        subtitle="Deep static analysis, WHOIS lookups, SSL inspection, and threat intelligence scoring."
      />

      {/* ── Search Input ── */}
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

      {/* ── Animation ── */}
      {isInvestigating && !showReport && !error && (
        <div className="mb-5">
          <InvestigationProgress
            steps={URL_STEPS}
            target={url}
            isBackendComplete={isBackendComplete}
            onRevealReport={() => { setShowReport(true); setIsInvestigating(false); }}
          />
        </div>
      )}

      {/* ── Results ── */}
      {showReport && result && (
        <div className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center">
            <h5 style={{ color: 'var(--tl-text-primary)', margin: 0, fontWeight: 600 }}>Investigation Report</h5>
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" icon={<Brain size={16} />} onClick={() => setShowAIModal(true)}>
                AI Analysis
              </Button>
              <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={handleExport}>
                Export Report
              </Button>
            </div>
          </div>
          <UrlReportView result={result.result_data} />
          
          <AIInsightsModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            aiAnalysis={result?.result_data?.ai_analysis}
            investigationId={result?.id}
            investigationType={result?.type}
          />
        </div>
      )}
    </div>
  );
}
