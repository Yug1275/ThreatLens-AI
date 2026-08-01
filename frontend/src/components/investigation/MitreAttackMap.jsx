import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink } from 'lucide-react';

/**
 * MitreAttackMap — Displays MITRE ATT&CK technique mappings.
 * Phase 9 AI Intelligence Engine.
 */
const MitreAttackMap = ({ mappings = [] }) => {
  if (!mappings || mappings.length === 0) {
    return (
      <div className="tl-card p-4" style={{ borderLeft: '3px solid var(--tl-text-faint)' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <Shield size={18} style={{ color: 'var(--tl-text-muted)' }} />
          <span style={{ color: 'var(--tl-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>
            MITRE ATT&CK Mapping
          </span>
        </div>
        <p style={{ color: 'var(--tl-text-faint)', fontSize: '0.8125rem', margin: 0 }}>
          No MITRE ATT&CK techniques were identified for this investigation.
        </p>
      </div>
    );
  }

  // Group by tactic
  const byTactic = {};
  mappings.forEach(m => {
    const tactic = m.tactic || 'Unknown';
    if (!byTactic[tactic]) byTactic[tactic] = [];
    byTactic[tactic].push(m);
  });

  const tacticColors = {
    'Reconnaissance': '#6366f1',
    'Resource Development': '#8b5cf6',
    'Initial Access': '#ef4444',
    'Execution': '#f97316',
    'Persistence': '#eab308',
    'Privilege Escalation': '#f59e0b',
    'Defense Evasion': '#84cc16',
    'Credential Access': '#14b8a6',
    'Discovery': '#06b6d4',
    'Lateral Movement': '#3b82f6',
    'Collection': '#6366f1',
    'Command and Control': '#a855f7',
    'Exfiltration': '#ec4899',
    'Impact': '#ef4444',
  };

  return (
    <div className="tl-card p-4">
      <div className="d-flex align-items-center gap-2 mb-3" style={{ borderBottom: '1px solid var(--tl-border)', paddingBottom: '0.75rem' }}>
        <Shield size={18} style={{ color: 'var(--tl-primary-light)' }} />
        <span style={{ color: 'var(--tl-text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
          MITRE ATT&CK Mapping
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--tl-text-muted)', fontSize: '0.75rem' }}>
          {mappings.length} technique{mappings.length !== 1 ? 's' : ''} identified
        </span>
      </div>

      <div className="d-flex flex-column gap-3">
        {Object.entries(byTactic).map(([tactic, techniques], idx) => (
          <motion.div
            key={tactic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: tacticColors[tactic] || 'var(--tl-primary)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tl-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tactic}
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2" style={{ paddingLeft: '1.375rem' }}>
              {techniques.map((tech, tIdx) => {
                const mitreUrl = tech.url || `https://attack.mitre.org/techniques/${(tech.technique_id || '').replace('.', '/')}/`;
                return (
                  <a
                    key={tIdx}
                    href={mitreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                      background: `${tacticColors[tactic] || 'var(--tl-primary)'}15`,
                      border: `1px solid ${tacticColors[tactic] || 'var(--tl-primary)'}30`,
                      color: tacticColors[tactic] || 'var(--tl-primary-light)',
                      fontSize: '0.75rem', fontWeight: 500,
                      textDecoration: 'none', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 2px 8px ${tacticColors[tactic] || 'var(--tl-primary)'}25`; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                    title={tech.description || tech.technique_name}
                  >
                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{tech.technique_id}</span>
                    <span style={{ color: 'var(--tl-text-secondary)' }}>{tech.technique_name}</span>
                    <ExternalLink size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                  </a>
                );
              })}
            </div>

            {/* Show descriptions if present */}
            {techniques.some(t => t.description) && (
              <div style={{ paddingLeft: '1.375rem', marginTop: '0.5rem' }}>
                {techniques.filter(t => t.description).map((tech, dIdx) => (
                  <p key={dIdx} style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--tl-text-muted)' }}>
                    <strong>{tech.technique_id}:</strong> {tech.description}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MitreAttackMap;
