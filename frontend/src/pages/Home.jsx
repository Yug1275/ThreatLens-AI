import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldAlert, Globe, Activity, Lock, Database, 
  Search, Terminal, Crosshair, QrCode, Mail, PhoneCall, FileText,
  BrainCircuit, GitPullRequest, GitMerge, Fingerprint, Eye, Code,
  Server, ShieldCheck
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const IntelligenceMarquee = ({ items, reverse = false }) => (
  <div className="tl-marquee-container" style={{ 
    overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid rgba(56,189,248,0.1)', borderBottom: '1px solid rgba(56,189,248,0.1)',
    background: 'rgba(7,11,22,0.8)', backdropFilter: 'blur(10px)', padding: '1rem 0'
  }}>
    <motion.div 
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      style={{ display: 'inline-block' }}
    >
      {[...items, ...items, ...items].map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--tl-text-faint)', letterSpacing: '0.1em' }}>
          {item}
          <span style={{ margin: '0 2rem', color: 'var(--tl-primary-dark)' }}>◆</span>
        </span>
      ))}
    </motion.div>
  </div>
);

export default function Home() {
  return (
    <div className="tl-landing-page" style={{ paddingTop: '80px' }}>
      
      {/* ================= SECTION 1: HERO ================= */}
      <section className="tl-section-hero" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div className="container" style={{ zIndex: 2, position: 'relative' }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center mx-auto" style={{ maxWidth: '800px' }}>
            <motion.div variants={fadeInUp} className="mb-4 d-flex justify-content-center">
              <div className="tl-badge" style={{ background: 'rgba(0,168,107,0.1)', border: '1px solid rgba(0,168,107,0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--tl-radius-pill)' }}>
                <Activity size={16} className="me-2 text-primary" />
                <span style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--tl-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>AI-POWERED CYBER THREAT INTELLIGENCE</span>
              </div>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} style={{ fontFamily: 'var(--tl-font-serif)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 600, lineHeight: 1.05, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Investigate. Correlate.<br />
              <span style={{ color: 'var(--tl-primary)' }}>Understand. Act.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} style={{ fontSize: '1.125rem', color: 'var(--tl-text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              ThreatLens AI combines deterministic security analysis with AI-powered intelligence to investigate URLs, emails, phone numbers, QR codes and images through one unified platform.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <Link to="/register" className="tl-btn tl-btn-primary tl-btn-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600 }}>
                Start Investigation
              </Link>
              <a href="#platform" className="tl-btn tl-btn-secondary tl-btn-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600 }}>
                Explore Intelligence
              </a>
            </motion.div>

            <motion.div variants={fadeInUp} className="d-flex flex-wrap justify-content-center gap-4" style={{ fontSize: '0.875rem', color: 'var(--tl-text-faint)', fontWeight: 500 }}>
              <span className="d-flex align-items-center gap-2"><Eye size={16} color="var(--tl-primary)" /> Multi-Modal Analysis</span>
              <span className="d-flex align-items-center gap-2"><BrainCircuit size={16} color="var(--tl-electric)" /> AI-Assisted Investigation</span>
              <span className="d-flex align-items-center gap-2"><GitMerge size={16} color="var(--tl-cyan)" /> IOC Correlation</span>
              <span className="d-flex align-items-center gap-2"><FileText size={16} color="var(--tl-warning)" /> Actionable Reports</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 2: INTELLIGENCE MARQUEE ================= */}
      <IntelligenceMarquee items={[
        'URL INTELLIGENCE', 'EMAIL ANALYSIS', 'PHONE INTELLIGENCE', 
        'QR ANALYSIS', 'OCR & ENTITY EXTRACTION', 'AI THREAT REASONING', 
        'IOC CORRELATION', 'MITIGATION REPORTS'
      ]} />

      {/* ================= SECTION 3: MULTI-MODAL INVESTIGATION ================= */}
      <section id="platform" className="tl-section" style={{ padding: '8rem 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="mb-5 text-center mx-auto" style={{ maxWidth: '700px' }}>
            <motion.h2 variants={fadeInUp} style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1rem' }}>One Platform. Multiple Threat Vectors.</motion.h2>
            <motion.p variants={fadeInUp} style={{ color: 'var(--tl-text-muted)', fontSize: '1.125rem' }}>Modern threats rarely arrive through a single channel. ThreatLens AI brings multiple investigation workflows into one unified analyst workspace.</motion.p>
          </motion.div>

          <div className="row g-4">
            {[
              { icon: <Crosshair />, title: 'URL Investigation', desc: 'Trace the infrastructure behind suspicious links.', details: 'WHOIS, DNS, SSL inspection, redirect analysis and threat scoring help uncover the risk behind suspicious URLs.', tags: ['WHOIS', 'DNS', 'SSL', 'Redirect Analysis', 'Threat Scoring'], path: '/investigations/url', color: 'var(--tl-cyan)' },
              { icon: <Mail />, title: 'Email Investigation', desc: 'Expose phishing infrastructure before it becomes a breach.', details: 'Analyze email authentication signals, headers, domains, phishing indicators and extracted IOCs.', tags: ['SPF', 'DKIM', 'DMARC', 'Phishing Detection', 'IOC Extraction'], path: '/investigations/email', color: 'var(--tl-success)' },
              { icon: <PhoneCall />, title: 'Phone Investigation', desc: 'Turn phone numbers into actionable intelligence.', details: 'Validate numbers, analyze carrier and geographic intelligence, and identify potential scam indicators.', tags: ['Number Validation', 'Carrier Detection', 'Geographic Intelligence', 'Scam Detection'], path: '/investigations/phone', color: 'var(--tl-primary-light)' },
              { icon: <QrCode />, title: 'QR Investigation', desc: 'Don\'t trust what you can\'t see.', details: 'Decode QR payloads, classify destinations, safely preview content and identify potential indicators of compromise.', tags: ['QR Decoding', 'Payload Classification', 'Safe Preview', 'IOC Extraction'], path: '/investigations/qr', color: 'var(--tl-warning)' },
              { icon: <Search />, title: 'OCR Investigation', desc: 'Extract intelligence from visual evidence.', details: 'Extract text from images, identify entities and route suspicious visual content for deeper investigation.', tags: ['OCR Extraction', 'Entity Detection', 'Threat Identification', 'Investigation Routing'], path: '/investigations/ocr', color: 'var(--tl-electric)' }
            ].map((card, idx) => (
              <div key={idx} className={idx < 2 ? "col-12 col-md-6" : "col-12 col-md-4"}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="tl-card h-100 p-4"
                  style={{ 
                    display: 'flex', flexDirection: 'column', 
                    background: 'rgba(7, 11, 22, 0.6)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = card.color; e.currentTarget.style.boxShadow = `0 10px 30px -10px ${card.color}33`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {React.cloneElement(card.icon, { size: 24 })}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--tl-font)', color: 'white', margin: 0, fontSize: '18px', fontWeight: 600 }}>{card.title}</h3>
                    </div>
                  </div>
                  <h6 style={{ color: 'var(--tl-text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>{card.desc}</h6>
                  <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', flex: 1, marginBottom: '1.5rem' }}>{card.details}</p>
                  
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {card.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--tl-text-faint)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link to={card.path} className="text-decoration-none d-flex align-items-center gap-2" style={{ color: card.color, fontSize: '0.875rem', fontWeight: 600, marginTop: 'auto' }}>
                    Investigate Now <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: AI INTELLIGENCE ================= */}
      <section id="intelligence" className="tl-section" style={{ padding: '8rem 0', background: 'linear-gradient(180deg, rgba(2,4,12,0) 0%, rgba(2,4,12,0.8) 50%, rgba(2,4,12,0) 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.h2 initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
                From Raw Indicators to Threat Intelligence
              </motion.h2>
              <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} style={{ color: 'var(--tl-text-muted)', fontSize: '1.125rem', marginBottom: '2rem' }}>
                ThreatLens AI combines deterministic investigation with an intelligent LLM layer to transform raw indicators into contextual security intelligence.
              </motion.p>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} style={{ padding: '1.5rem', background: 'rgba(56,189,248,0.05)', borderLeft: '4px solid var(--tl-cyan)', borderRadius: '0 8px 8px 0' }}>
                <p style={{ margin: 0, color: 'var(--tl-text-primary)', fontStyle: 'italic', fontWeight: 500 }}>"Deterministic analysis provides the evidence. AI provides the intelligence layer."</p>
              </motion.div>
            </div>
            
            <div className="col-lg-6 offset-lg-1">
              <div className="position-relative">
                {/* Connecting Line */}
                <div className="position-absolute d-none d-md-block" style={{ left: '24px', top: '24px', bottom: '24px', width: '2px', background: 'linear-gradient(to bottom, rgba(56,189,248,0.5), rgba(56,189,248,0))' }} />
                
                {[
                  { num: '01', title: 'CONTEXT', desc: 'Understand the surrounding threat landscape.' },
                  { num: '02', title: 'CORRELATION', desc: 'Connect indicators, entities and investigative findings.' },
                  { num: '03', title: 'REASONING', desc: 'Use AI to interpret complex threat signals and investigative context.' },
                  { num: '04', title: 'ACTION', desc: 'Generate clear explanations, reports and mitigation strategies.' }
                ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="d-flex align-items-start gap-4 mb-4 position-relative"
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(7, 11, 22, 0.9)', border: '2px solid var(--tl-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tl-cyan)', fontWeight: 700, fontFamily: 'var(--tl-font-mono)', zIndex: 2, flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div style={{ paddingTop: '0.5rem' }}>
                      <h5 style={{ color: 'white', fontWeight: 600, letterSpacing: '0.05em', fontSize: '1.125rem' }}>{step.title}</h5>
                      <p style={{ color: 'var(--tl-text-muted)', margin: 0 }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: HOW THREATLENS WORKS ================= */}
      <section id="workflow" className="tl-section" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="text-center mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1rem' }}>How ThreatLens Thinks</h2>
            <p style={{ fontFamily: 'var(--tl-font)', color: 'var(--tl-text-muted)', fontSize: '1.125rem' }}>From the first submitted indicator to an actionable security report, every investigation follows a structured intelligence workflow.</p>
          </div>
          
          <div className="row g-4">
            {[
              { num: '01', title: 'INPUT', desc: 'Submit a URL, email, phone number, QR code or image.' },
              { num: '02', title: 'VALIDATE', desc: 'Normalize and validate the submitted indicator.' },
              { num: '03', title: 'INVESTIGATE', desc: 'Gather deterministic intelligence through specialized analysis engines.' },
              { num: '04', title: 'CORRELATE', desc: 'Identify suspicious entities, relationships and indicators.' },
              { num: '05', title: 'ANALYZE', desc: 'AI interprets collected intelligence and investigative context.' },
              { num: '06', title: 'REPORT', desc: 'Generate structured findings and actionable mitigation recommendations.' }
            ].map((step, idx) => (
              <div key={idx} className="col-12 col-md-4 col-lg-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="tl-card h-100 p-4 text-center position-relative" style={{ background: 'rgba(7,11,22,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Subtle Connector Line for Desktop */}
                  {idx < 5 && <div className="d-none d-lg-block position-absolute" style={{ top: '3rem', right: '-1rem', width: '2rem', height: '1px', background: 'rgba(255,255,255,0.1)' }} />}
                  
                  <div style={{ color: 'var(--tl-text-faint)', fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem', marginBottom: '1rem' }}>{step.num}</div>
                  <h6 style={{ color: 'white', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{step.title}</h6>
                  <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', margin: 0 }}>{step.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: LIVE INTELLIGENCE STREAM ================= */}
      <section className="tl-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="tl-card p-0 overflow-hidden" style={{ background: '#020617', border: '1px solid rgba(56,189,248,0.1)' }}>
            <div className="d-flex align-items-center justify-content-between p-4 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div>
                <h5 style={{ color: 'white', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Terminal size={18} color="var(--tl-cyan)" /> Intelligence Stream</h5>
                <p style={{ color: 'var(--tl-text-faint)', margin: 0, fontSize: '0.875rem' }}>Continuous visibility across active investigations.</p>
              </div>
              <div className="d-flex gap-2">
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--tl-danger)' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--tl-warning)' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--tl-success)' }} />
              </div>
            </div>
            
            <div className="p-4" style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.875rem' }}>
              {[
                { time: '14:22:01', event: 'URL Investigation Completed', lines: [['Threat Score', '82'], ['Classification', 'MALICIOUS']], color: 'var(--tl-danger)' },
                { time: '14:21:45', event: 'Email Investigation Completed', lines: [['SPF', 'FAIL'], ['DKIM', 'FAIL'], ['Classification', 'SUSPICIOUS']], color: 'var(--tl-warning)' },
                { time: '14:21:12', event: 'QR Investigation Completed', lines: [['Payload', 'URL'], ['IOC Detected', 'YES']], color: 'var(--tl-cyan)' },
                { time: '14:20:59', event: 'AI Analysis Completed', lines: [['Confidence', 'HIGH'], ['Report', 'GENERATED']], color: 'var(--tl-success)' },
              ].map((log, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.2 }} className="mb-4">
                  <div className="d-flex gap-3 mb-1">
                    <span style={{ color: 'var(--tl-text-faint)' }}>[{log.time}]</span>
                    <span style={{ color: log.color }}>● {log.event}</span>
                  </div>
                  {log.lines.map((line, lidx) => (
                    <div key={lidx} className="d-flex gap-3" style={{ paddingLeft: '5.5rem' }}>
                      <span style={{ color: 'var(--tl-text-muted)', width: '120px' }}>{line[0]}</span>
                      <span style={{ color: 'var(--tl-text-faint)' }}>........</span>
                      <span style={{ color: 'white' }}>{line[1]}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 1 }} className="d-flex gap-3">
                <span style={{ color: 'var(--tl-text-faint)' }}>[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                <span style={{ color: 'var(--tl-text-primary)' }} className="blink">Waiting for next event_</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: ANALYST WORKSPACE ================= */}
      <section className="tl-section" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="text-center mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1rem' }}>An Intelligence Workspace, Not Just a Scanner</h2>
            <p style={{ fontFamily: 'var(--tl-font)', color: 'var(--tl-text-muted)', fontSize: '1.125rem' }}>ThreatLens AI is designed around the complete investigation workflow — from the first indicator to the final report.</p>
          </div>
          
          <div className="row g-4">
            {[
              { icon: <Database />, title: 'Investigation History', desc: 'Keep a searchable record of previous investigations.' },
              { icon: <Activity />, title: 'Analyst Workspace', desc: 'Organize investigations and intelligence into structured workflows.' },
              { icon: <GitPullRequest />, title: 'IOC Repository', desc: 'Maintain a centralized view of discovered indicators of compromise.' },
              { icon: <FileText />, title: 'Threat Reports', desc: 'Transform investigation results into structured, actionable reports.' }
            ].map((card, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="tl-card p-4 d-flex align-items-center gap-4 h-100"
                  style={{ background: 'rgba(7,11,22,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tl-text-primary)' }}>
                    {React.cloneElement(card.icon, { size: 24 })}
                  </div>
                  <div>
                    <h5 style={{ color: 'white', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{card.title}</h5>
                    <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', margin: 0 }}>{card.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: SECURITY & RELIABILITY ================= */}
      <section id="security" className="tl-section" style={{ padding: '6rem 0', background: 'linear-gradient(180deg, rgba(2,4,12,0) 0%, rgba(2,4,12,0.6) 100%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1rem' }}>Built for Secure Investigation</h2>
          </div>
          
          <div className="row g-4 justify-content-center">
            {[
              { icon: <Lock />, title: 'JWT Authentication', desc: 'Short-lived access tokens protect API access.' },
              { icon: <ShieldCheck />, title: 'Role-Based Access Control', desc: 'Fine-grained permissions for Analyst and Admin roles.' },
              { icon: <Terminal />, title: 'Audit Logging', desc: 'Track investigation and user activity across the platform.' },
              { icon: <Code />, title: 'Strict Data Validation', desc: 'Structured validation through Pydantic schemas.' },
              { icon: <Fingerprint />, title: 'Secure Password Handling', desc: 'Passwords are securely hashed using bcrypt via Passlib.' },
              { icon: <Server />, title: 'Deterministic Fallback', desc: 'Threat scoring remains available when external AI services fail.' }
            ].map((feat, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-4 rounded h-100"
                  style={{ background: 'transparent', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div style={{ color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>{React.cloneElement(feat.icon, { size: 20 })}</div>
                  <h6 style={{ color: 'white', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{feat.title}</h6>
                  <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', margin: 0 }}>{feat.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: SECURITY MARQUEE ================= */}
      <IntelligenceMarquee reverse items={[
        'JWT AUTHENTICATION', 'ROLE-BASED ACCESS CONTROL', 'AUDIT LOGGING', 
        'STRICT DATA VALIDATION', 'DETERMINISTIC FALLBACK', 'SECURE API ARCHITECTURE'
      ]} />

      {/* ================= SECTION 10: WHY THREATLENS ================= */}
      <section className="tl-section" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="text-center mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            <h2 style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1rem' }}>Built to Investigate. Designed to Explain.</h2>
          </div>
          
          <div className="row g-0 justify-content-center">
            <div className="col-12 col-md-5">
              <div className="p-5 h-100" style={{ background: 'rgba(7,11,22,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px 0 0 16px' }}>
                <h4 style={{ color: 'var(--tl-text-muted)', fontWeight: 600, marginBottom: '2rem' }}>Traditional Security Tools</h4>
                <ul className="list-unstyled" style={{ color: 'var(--tl-text-muted)', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <li className="d-flex gap-3 align-items-center"><span style={{ color: 'rgba(255,255,255,0.2)' }}>✕</span> Single indicator analysis</li>
                  <li className="d-flex gap-3 align-items-center"><span style={{ color: 'rgba(255,255,255,0.2)' }}>✕</span> Raw technical results</li>
                  <li className="d-flex gap-3 align-items-center"><span style={{ color: 'rgba(255,255,255,0.2)' }}>✕</span> Manual correlation</li>
                  <li className="d-flex gap-3 align-items-center"><span style={{ color: 'rgba(255,255,255,0.2)' }}>✕</span> Scattered investigation workflows</li>
                  <li className="d-flex gap-3 align-items-center"><span style={{ color: 'rgba(255,255,255,0.2)' }}>✕</span> Technical output</li>
                </ul>
              </div>
            </div>
            
            <div className="col-12 col-md-5">
              <div className="p-5 h-100 tl-card-glow" style={{ background: 'rgba(10,15,28,0.9)', border: '1px solid var(--tl-cyan)', borderRadius: '0 16px 16px 0', position: 'relative', zIndex: 2 }}>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '2rem' }}>ThreatLens AI</h4>
                <ul className="list-unstyled" style={{ color: 'var(--tl-text-primary)', fontSize: '1.0625rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <li className="d-flex gap-3 align-items-center"><ShieldAlert size={18} color="var(--tl-cyan)" /> Multi-modal investigations</li>
                  <li className="d-flex gap-3 align-items-center"><ShieldAlert size={18} color="var(--tl-cyan)" /> Contextual intelligence</li>
                  <li className="d-flex gap-3 align-items-center"><ShieldAlert size={18} color="var(--tl-cyan)" /> AI-assisted analysis</li>
                  <li className="d-flex gap-3 align-items-center"><ShieldAlert size={18} color="var(--tl-cyan)" /> Unified analyst workspace</li>
                  <li className="d-flex gap-3 align-items-center"><ShieldAlert size={18} color="var(--tl-cyan)" /> Actionable reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 11: FINAL CTA ================= */}
      <section className="tl-section position-relative" style={{ padding: '8rem 0', background: 'radial-gradient(ellipse at bottom, rgba(56,189,248,0.1) 0%, rgba(2,4,12,1) 70%)' }}>
        <div className="container text-center position-relative" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontFamily: 'var(--tl-font-serif)', fontSize: '36px', fontWeight: 500, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Have an Indicator? Investigate It.</h2>
            <p style={{ color: 'var(--tl-text-muted)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
              Turn suspicious digital artifacts into structured threat intelligence.
            </p>
            <Link to="/register" className="tl-btn tl-btn-primary tl-btn-lg" style={{ padding: '1rem 3rem', fontSize: '1.125rem', fontWeight: 600, borderRadius: '8px' }}>
              Launch Investigation
            </Link>
            <p style={{ color: 'var(--tl-text-faint)', fontSize: '0.875rem', marginTop: '1.5rem', letterSpacing: '0.05em' }}>
              URL · Email · Phone · QR · Image
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: '#02040a', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="row g-4 mb-5">
            <div className="col-12 col-lg-4 mb-4 mb-lg-0">
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em', display: 'block', marginBottom: '1rem' }}>
                Threat<span className="text-gradient">Lens</span> AI
              </span>
              <p style={{ color: 'var(--tl-text-muted)', fontSize: '0.875rem', maxWidth: '300px' }}>
                Enterprise-grade, AI-powered Cyber Threat Intelligence Platform.
              </p>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2 offset-lg-1">
              <h6 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>PLATFORM</h6>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.875rem' }}>
                <li><Link to="/dashboard" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Dashboard</Link></li>
                <li><Link to="/investigations/url" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>URL Investigation</Link></li>
                <li><Link to="/investigations/email" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Email Investigation</Link></li>
                <li><Link to="/investigations/phone" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Phone Investigation</Link></li>
                <li><Link to="/investigations/qr" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>QR Investigation</Link></li>
                <li><Link to="/investigations/ocr" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>OCR Investigation</Link></li>
              </ul>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <h6 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>INTELLIGENCE</h6>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.875rem' }}>
                <li><a href="#intelligence" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>AI Intelligence</a></li>
                <li><Link to="/reports" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Reports</Link></li>
                <li><Link to="/history" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Findings</Link></li>
                <li><Link to="/history" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>Investigation History</Link></li>
                <li><Link to="/iocs" style={{ color: 'var(--tl-text-muted)', textDecoration: 'none' }}>IOC Repository</Link></li>
              </ul>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <h6 style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>SECURITY</h6>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.875rem' }}>
                <li><span style={{ color: 'var(--tl-text-muted)' }}>Authentication</span></li>
                <li><span style={{ color: 'var(--tl-text-muted)' }}>RBAC</span></li>
                <li><span style={{ color: 'var(--tl-text-muted)' }}>Audit Logging</span></li>
                <li><span style={{ color: 'var(--tl-text-muted)' }}>Data Validation</span></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'var(--tl-text-faint)', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>
              © 2026 ThreatLens AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
