import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, AlertTriangle, FileText, Target, Lightbulb,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, Zap, BookOpen, X
} from 'lucide-react';
import MitreAttackMap from './MitreAttackMap';
import aiService from '../../services/aiService';

/**
 * AIInsightsModal — Displays AI-generated threat analysis in a modal.
 */
const AIInsightsModal = ({ isOpen, onClose, aiAnalysis, investigationId, investigationType }) => {
  const [enriching, setEnriching] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(aiAnalysis);

  const analysis = localAnalysis || aiAnalysis;
  const isAvailable = analysis && analysis.ai_status !== 'unavailable';
  const isPartial = analysis && analysis.ai_status === 'partial';

  const handleReEnrich = async () => {
    if (!investigationId || enriching) return;
    setEnriching(true);
    try {
      const res = await aiService.enrichInvestigation(investigationId, { force: true });
      if (res.ai_analysis) {
        setLocalAnalysis(res.ai_analysis);
      }
    } catch (err) {
      console.error('Re-enrichment failed:', err);
    } finally {
      setEnriching(false);
    }
  };

  if (!isOpen) return null;

  // ── AI Unavailable State ────────────────────────────────────────────── //
  if (!analysis || analysis.ai_status === 'unavailable') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="tl-modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            className="tl-card p-4"
            style={{ maxWidth: 600, width: '100%', borderLeft: '3px solid var(--tl-text-faint)' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div style={{
                  width: 36, height: 36, borderRadius: '0.625rem',
                  background: 'rgba(148, 163, 184, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={18} style={{ color: 'var(--tl-text-muted)' }} />
                </div>
                <div>
                  <h6 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--tl-text-primary)' }}>
                    AI Analysis Unavailable
                  </h6>
                  <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                    AI enrichment is not configured or failed to generate.
                  </span>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            {investigationId && (
              <button
                className="tl-btn tl-btn-primary w-100 mt-2"
                style={{ fontSize: '0.8125rem', padding: '0.5rem' }}
                onClick={handleReEnrich}
                disabled={enriching}
              >
                {enriching ? <RefreshCw size={14} className="tl-spin" /> : <Sparkles size={14} />}
                <span style={{ marginLeft: '0.375rem' }}>{enriching ? 'Analyzing...' : 'Run AI Analysis Again'}</span>
              </button>
            )}

            {analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tl-text-secondary)', marginBottom: '0.5rem' }}>
                  Deterministic Recommendations:
                </p>
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="d-flex align-items-start gap-2" style={{ marginBottom: '0.375rem' }}>
                    <Lightbulb size={14} style={{ color: 'var(--tl-warning)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Confidence Badge ──────────────────────────────────────────────── //
  const confidenceScore = analysis.confidence_score || 0;
  const confidenceColor = confidenceScore >= 75 ? 'var(--tl-danger)' :
    confidenceScore >= 50 ? 'var(--tl-warning)' :
    confidenceScore >= 25 ? 'var(--tl-info)' : 'var(--tl-success)';

  const riskLevel = analysis.final_risk_level || analysis.risk_level || 'Unknown';
  const riskColors = {
    'Critical': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    'High': { bg: 'rgba(249,115,22,0.1)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
    'Medium': { bg: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.3)' },
    'Low': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'Safe': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  };
  const riskStyle = riskColors[riskLevel] || riskColors['Medium'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="tl-modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          className="tl-card tl-ai-modal"
          style={{
            maxWidth: 900, width: '100%', maxHeight: '85vh', overflow: 'hidden',
            borderLeft: `3px solid ${riskStyle.color}`,
            display: 'flex', flexDirection: 'column'
          }}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div
            className="d-flex align-items-center justify-content-between p-4"
            style={{ borderBottom: '1px solid var(--tl-border)', background: 'var(--tl-bg-card)', zIndex: 1 }}
          >
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: 40, height: 40, borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h6 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--tl-text-primary)' }}>
                    AI Threat Analysis
                  </h6>
                  {isPartial && (
                    <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '999px', background: 'rgba(234,179,8,0.1)', color: '#eab308', fontWeight: 600 }}>
                      PARTIAL
                    </span>
                  )}
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '999px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 600 }}>
                    {analysis.ai_status === 'completed' ? '✓ AI ENRICHED' : 'AI PROCESSED'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                  Powered by Groq AI • Confidence: {confidenceScore}%
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                background: riskStyle.bg, color: riskStyle.color, border: `1px solid ${riskStyle.border}`,
              }}>
                {riskLevel.toUpperCase()}
              </span>

              {investigationId && (
                <button
                  className="tl-btn tl-btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '0.375rem 0.5rem', marginLeft: '0.5rem' }}
                  onClick={e => { e.stopPropagation(); handleReEnrich(); }}
                  disabled={enriching}
                >
                  <RefreshCw size={12} className={enriching ? 'tl-spin' : ''} />
                </button>
              )}

              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl-text-muted)', marginLeft: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div className="p-4 d-flex flex-column gap-4" style={{ overflowY: 'auto' }}>
            {/* Executive Summary */}
            {analysis.executive_summary && (
              <Section icon={<FileText size={16} />} title="Executive Summary" color="#6366f1">
                <p style={{ fontSize: '0.875rem', color: 'var(--tl-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {analysis.executive_summary}
                </p>
              </Section>
            )}

            {/* Technical Summary */}
            {analysis.technical_summary && (
              <Section icon={<Target size={16} />} title="Technical Analysis" color="#14b8a6">
                <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {analysis.technical_summary}
                </p>
              </Section>
            )}

            {/* Threat Explanation */}
            {analysis.threat_explanation && (
              <Section icon={<AlertTriangle size={16} />} title="Threat Explanation" color="#f97316">
                <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {analysis.threat_explanation}
                </p>
              </Section>
            )}

            {/* Attack Narrative */}
            {analysis.attack_narrative && analysis.attack_narrative !== 'No attack detected.' && (
              <Section icon={<Zap size={16} />} title="Attack Narrative" color="#ef4444">
                <p style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                  {analysis.attack_narrative}
                </p>
              </Section>
            )}

            {/* MITRE ATT&CK Mapping */}
            {analysis.mitre_mapping && analysis.mitre_mapping.length > 0 && (
              <MitreAttackMap mappings={analysis.mitre_mapping} />
            )}

            {/* Threat Indicators */}
            {analysis.threat_indicators && analysis.threat_indicators.length > 0 && (
              <Section icon={<Shield size={16} />} title="Threat Indicators" color="#ef4444">
                <div className="d-flex flex-column gap-1">
                  {analysis.threat_indicators.map((indicator, i) => (
                    <div key={i} className="d-flex align-items-start gap-2">
                      <span style={{ color: 'var(--tl-danger)', fontSize: '0.75rem', marginTop: '3px' }}>●</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>{indicator}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Section icon={<Lightbulb size={16} />} title="Recommendations" color="#eab308">
                <div className="d-flex flex-column gap-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="d-flex align-items-start gap-2" style={{
                      padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)',
                    }}>
                      <span style={{ color: '#eab308', fontWeight: 700, fontSize: '0.75rem', marginTop: '1px', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }}>
                        {typeof rec === 'string' ? rec : rec.action || JSON.stringify(rec)}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Confidence Breakdown */}
            {analysis.confidence_breakdown && (
              <Section icon={<BookOpen size={16} />} title="Confidence Breakdown" color="#8b5cf6">
                <div className="d-flex flex-wrap gap-3">
                  <ConfidenceItem
                    label="Deterministic"
                    value={analysis.confidence_breakdown.breakdown?.deterministic_score}
                    weight={`${(analysis.confidence_breakdown.breakdown?.deterministic_weight || 0) * 100}%`}
                  />
                  <ConfidenceItem
                    label="AI Confidence"
                    value={analysis.confidence_breakdown.breakdown?.ai_confidence}
                    weight={`${(analysis.confidence_breakdown.breakdown?.ai_weight || 0) * 100}%`}
                  />
                  <ConfidenceItem
                    label="Threat Intel"
                    value={analysis.confidence_breakdown.breakdown?.threat_intel_factor}
                    weight={`${(analysis.confidence_breakdown.breakdown?.threat_intel_weight || 0) * 100}%`}
                  />
                  <ConfidenceItem
                    label="Final Score"
                    value={analysis.confidence_breakdown.final_score}
                    highlight
                  />
                </div>
              </Section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Sub-components ────────────────────────────────────────────────────── //
const Section = ({ icon, title, color, children }) => (
  <div>
    <div className="d-flex align-items-center gap-2 mb-2">
      <div style={{ color }}>{icon}</div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--tl-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

const ConfidenceItem = ({ label, value, weight, highlight }) => (
  <div style={{
    padding: '0.625rem 1rem', borderRadius: '0.5rem', minWidth: 110,
    background: highlight ? 'rgba(139,92,246,0.1)' : 'rgba(148,163,184,0.05)',
    border: `1px solid ${highlight ? 'rgba(139,92,246,0.2)' : 'var(--tl-border)'}`,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: highlight ? '#8b5cf6' : 'var(--tl-text-primary)' }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--tl-text-muted)', marginTop: '0.125rem' }}>
      {label}
      {weight && <span style={{ opacity: 0.6 }}> ({weight})</span>}
    </div>
  </div>
);

export default AIInsightsModal;
