import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, X, Download, Shield, AlertTriangle, Target,
  CheckCircle, Lightbulb, ArrowRight, Brain, Loader2
} from 'lucide-react';
import aiService from '../../services/aiService';
import MitreAttackMap from './MitreAttackMap';

/**
 * ExecutiveReportModal — Generate and display AI-powered executive reports.
 * Phase 9 AI Intelligence Engine.
 *
 * Props:
 *   - isOpen: boolean
 *   - onClose: () => void
 *   - investigationIds: string[]
 */
const ExecutiveReportModal = ({ isOpen, onClose, investigationIds = [] }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!investigationIds.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.generateReport(investigationIds);
      setReport(res.report);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const severityColors = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#eab308',
    'Low': '#22c55e',
    'Immediate': '#ef4444',
    'Short-term': '#f97316',
    'Long-term': '#3b82f6',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="tl-modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--tl-bg-card)', borderRadius: '1rem',
            border: '1px solid var(--tl-border)', maxWidth: 900,
            width: '100%', maxHeight: '85vh', overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          className="executive-report-modal"
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid var(--tl-border)', position: 'sticky', top: 0, background: 'var(--tl-bg-card)', zIndex: 1 }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: 40, height: 40, borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={20} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--tl-text-primary)' }}>
                  Executive Threat Intelligence Report
                </h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                  {investigationIds.length} investigation{investigationIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {report && (
                <button className="tl-btn tl-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={handlePrint}>
                  <Download size={14} /> Export
                </button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)', padding: '0.375rem' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {!report && !loading && !error && (
              <div className="text-center py-5">
                <Brain size={48} style={{ color: 'var(--tl-text-faint)', marginBottom: '1rem' }} />
                <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Generate Executive Report
                </h6>
                <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-muted)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  AI will analyze {investigationIds.length} investigation{investigationIds.length !== 1 ? 's' : ''} and generate a comprehensive threat intelligence report for executive stakeholders.
                </p>
                <button className="tl-btn tl-btn-primary" onClick={handleGenerate}>
                  <Lightbulb size={16} /> Generate Report
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-5">
                <Loader2 size={40} className="tl-spin" style={{ color: 'var(--tl-primary-light)', marginBottom: '1rem' }} />
                <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>Generating Report...</h6>
                <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)' }}>AI is analyzing your investigations. This may take 10-15 seconds.</p>
              </div>
            )}

            {error && (
              <div className="text-center py-5">
                <AlertTriangle size={40} style={{ color: 'var(--tl-warning)', marginBottom: '1rem' }} />
                <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 600 }}>Report Generation Failed</h6>
                <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', marginBottom: '1rem' }}>{error}</p>
                <button className="tl-btn tl-btn-primary" onClick={handleGenerate}>
                  Retry
                </button>
              </div>
            )}

            {report && (
              <div className="d-flex flex-column gap-4">
                {/* Risk Rating */}
                <div className="d-flex align-items-center gap-3 p-3" style={{
                  borderRadius: '0.75rem',
                  background: `${severityColors[report.risk_rating] || '#6366f1'}10`,
                  border: `1px solid ${severityColors[report.risk_rating] || '#6366f1'}25`,
                }}>
                  <Shield size={24} style={{ color: severityColors[report.risk_rating] || '#6366f1' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Risk Rating</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: severityColors[report.risk_rating] || 'var(--tl-text-primary)' }}>
                      {report.risk_rating}
                    </div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                    {report.investigation_count} investigation{report.investigation_count !== 1 ? 's' : ''} analyzed
                  </span>
                </div>

                {/* Executive Summary */}
                {report.executive_summary && (
                  <ReportSection title="Executive Summary" icon={<FileText size={16} />}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-secondary)', lineHeight: 1.8, margin: 0 }}>
                      {report.executive_summary}
                    </p>
                  </ReportSection>
                )}

                {/* Technical Findings */}
                {report.technical_findings?.length > 0 && (
                  <ReportSection title="Technical Findings" icon={<Target size={16} />}>
                    <div className="d-flex flex-column gap-2">
                      {report.technical_findings.map((finding, i) => (
                        <div key={i} className="d-flex align-items-start gap-2 p-3" style={{
                          borderRadius: '0.5rem', background: 'rgba(148,163,184,0.05)',
                          border: '1px solid var(--tl-border)',
                        }}>
                          <span style={{
                            padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 700,
                            background: `${severityColors[finding.severity] || '#6366f1'}15`,
                            color: severityColors[finding.severity] || '#6366f1',
                            flexShrink: 0,
                          }}>
                            {finding.severity}
                          </span>
                          <div>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-primary)' }}>{finding.finding}</span>
                            {finding.evidence && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', margin: '0.25rem 0 0' }}>
                                Evidence: {finding.evidence}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ReportSection>
                )}

                {/* IOCs */}
                {report.indicators_of_compromise?.length > 0 && (
                  <ReportSection title="Indicators of Compromise" icon={<AlertTriangle size={16} />}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--tl-border)' }}>
                            <th style={{ padding: '0.5rem', color: 'var(--tl-text-muted)', fontWeight: 600, textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '0.5rem', color: 'var(--tl-text-muted)', fontWeight: 600, textAlign: 'left' }}>Value</th>
                            <th style={{ padding: '0.5rem', color: 'var(--tl-text-muted)', fontWeight: 600, textAlign: 'left' }}>Context</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.indicators_of_compromise.map((ioc, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--tl-border)' }}>
                              <td style={{ padding: '0.5rem', color: 'var(--tl-primary-light)', fontWeight: 600 }}>{ioc.type}</td>
                              <td style={{ padding: '0.5rem', color: 'var(--tl-text-primary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{ioc.value}</td>
                              <td style={{ padding: '0.5rem', color: 'var(--tl-text-muted)' }}>{ioc.context}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ReportSection>
                )}

                {/* MITRE Mapping */}
                {report.mitre_mapping?.length > 0 && (
                  <MitreAttackMap mappings={report.mitre_mapping} />
                )}

                {/* Recommendations */}
                {report.recommendations?.length > 0 && (
                  <ReportSection title="Recommendations" icon={<Lightbulb size={16} />}>
                    <div className="d-flex flex-column gap-2">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="d-flex align-items-start gap-2 p-3" style={{
                          borderRadius: '0.5rem',
                          background: `${severityColors[rec.priority] || '#6366f1'}08`,
                          border: `1px solid ${severityColors[rec.priority] || '#6366f1'}15`,
                        }}>
                          <span style={{
                            padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.625rem', fontWeight: 700,
                            background: `${severityColors[rec.priority] || '#6366f1'}15`,
                            color: severityColors[rec.priority] || '#6366f1',
                            flexShrink: 0,
                          }}>
                            {rec.priority}
                          </span>
                          <div>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-primary)', fontWeight: 500 }}>{rec.action}</span>
                            {rec.rationale && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', margin: '0.25rem 0 0' }}>
                                {rec.rationale}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ReportSection>
                )}

                {/* Next Steps */}
                {report.next_steps?.length > 0 && (
                  <ReportSection title="Next Steps" icon={<ArrowRight size={16} />}>
                    <div className="d-flex flex-column gap-1">
                      {report.next_steps.map((step, i) => (
                        <div key={i} className="d-flex align-items-center gap-2">
                          <CheckCircle size={14} style={{ color: 'var(--tl-success)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </ReportSection>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ReportSection = ({ title, icon, children }) => (
  <div>
    <div className="d-flex align-items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--tl-border)', paddingBottom: '0.75rem' }}>
      <span style={{ color: 'var(--tl-primary-light)' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tl-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

export default ExecutiveReportModal;
