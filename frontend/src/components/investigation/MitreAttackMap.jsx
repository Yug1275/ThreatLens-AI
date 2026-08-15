import React, { useState } from 'react';
import { Shield, ExternalLink } from 'lucide-react';

const MitreAttackMap = ({ mappings = [] }) => {
  const [hoveredLink, setHoveredLink] = useState(null);

  console.log('MITRE MAPPINGS DATA:', mappings);

  if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
    return null;
  }

  // Safe pluralization
  const count = mappings.length;
  const countText = `${count} technique${count === 1 ? '' : 's'} identified`;

  return (
    <div style={{
      background: 'rgba(10, 15, 28, 0.72)',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.07)',
      padding: '16px',
      marginTop: '12px',
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
        <Shield size={16} style={{ color: '#3b82f6', marginRight: '8px', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          MITRE ATT&CK Mapping
        </span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '12px' }}>
          {countText}
        </span>
      </div>

      {/* Technique Entries — plain, unconditional rendering */}
      {mappings.map((tech, idx) => {
        const techId = typeof tech.technique_id === 'string' ? tech.technique_id : 'Unknown';
        const techName = typeof tech.technique_name === 'string' ? tech.technique_name : 'Unknown';
        const tactic = typeof tech.tactic === 'string' ? tech.tactic : 'Unknown';
        const description = typeof tech.description === 'string' ? tech.description : '';
        const mitreUrl = `https://attack.mitre.org/techniques/${techId.replace('.', '/')}/`;

        return (
          <div key={idx} style={{
            paddingBottom: idx !== mappings.length - 1 ? '16px' : '0',
            marginBottom: idx !== mappings.length - 1 ? '16px' : '0',
            borderBottom: idx !== mappings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            {/* Technique ID + Name */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px' }}>
                {techId} — {techName}
              </span>
              <span style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {tactic}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                {description}
              </p>
            )}

            {/* MITRE Link */}
            <a
              href={mitreUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredLink(idx)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: hoveredLink === idx ? '#34d399' : '#10b981',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: hoveredLink === idx ? 'underline' : 'none',
                transition: 'color 0.2s ease',
              }}
            >
              View on MITRE ATT&CK <ExternalLink size={12} />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default MitreAttackMap;
