import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ShieldAlert, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ArrowRight, Crosshair, FileText, TrendingUp, Clock, ExternalLink
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import api from '../utils/axios';

/* ---- Skeleton ---- */
const Skeleton = ({ w = '100%', h = '20px', r = false }) => (
  <div className="tl-skeleton" style={{ width: w, height: h, borderRadius: r ? '50%' : undefined }} />
);

/* ---- Custom Tooltip ---- */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--tl-bg-surface)', border: '1px solid var(--tl-border)',
      borderRadius: 'var(--tl-radius-sm)', padding: '0.75rem', boxShadow: 'var(--tl-shadow-lg)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: entry.color }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
};

// Formats ISO timestamps to relative strings ("2h ago", "3d ago")
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Maps threat_score to a status string matching the dashboard badge logic
function scoreToStatus(score) {
  if (score == null) return 'PENDING';
  if (score > 75) return 'MALICIOUS';
  if (score > 40) return 'SUSPICIOUS';
  return 'SAFE';
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes, rRes] = await Promise.all([
          api.get('/api/v1/dashboard/stats').catch(() => ({ data: { total: 0, malicious: 0, safe: 0, suspicious: 0, pending: 0 } })),
          api.get('/api/v1/dashboard/activity').catch(() => ({ data: [
            { name: 'Mon', malicious: 0, safe: 0 }, { name: 'Tue', malicious: 0, safe: 0 },
            { name: 'Wed', malicious: 0, safe: 0 }, { name: 'Thu', malicious: 0, safe: 0 },
            { name: 'Fri', malicious: 0, safe: 0 }, { name: 'Sat', malicious: 0, safe: 0 },
            { name: 'Sun', malicious: 0, safe: 0 },
          ] })),
          api.get('/api/v1/dashboard/recent').catch(() => ({ data: [] })),
        ]);
        setStats(sRes.data);
        setActivityData(aRes.data);
        setRecentInvestigations(rRes.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Investigations', value: stats?.total ?? 0, icon: Search, trend: 'All time', up: true, color: '--tl-primary-rgb' },
    { title: 'Malicious Threats', value: stats?.malicious ?? 0, icon: ShieldAlert, trend: 'Score > 75', up: false, color: '--tl-danger-rgb' },
    { title: 'Safe Entities', value: stats?.safe ?? 0, icon: Activity, trend: 'Score ≤ 40', up: true, color: '--tl-success-rgb' },
    { title: 'Suspicious', value: stats?.suspicious ?? 0, icon: AlertTriangle, trend: 'Score 41–75', up: true, color: '--tl-warning-rgb' },
  ];

  const statusBadge = (status) => {
    const map = { MALICIOUS: 'danger', SAFE: 'success', PENDING: 'warning', SUSPICIOUS: 'warning' };
    return <span className={`tl-badge tl-badge-${map[status] || 'primary'}`}>{status}</span>;
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' }
  });

  return (
    <div>
      {/* Welcome */}
      <motion.div {...fadeUp(0)}>
        <div className="tl-welcome-card">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 style={{ fontWeight: 700, color: 'var(--tl-text-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Welcome back, {user?.username || 'Analyst'} 👋
              </h2>
              <p style={{ color: 'var(--tl-text-muted)', marginBottom: '1.25rem', maxWidth: '500px' }}>
                Here's what's happening with your security posture today. Stay ahead of emerging threats.
              </p>
              <button className="tl-btn tl-btn-primary">
                <Search size={16} /> New Investigation
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="col-6 col-xl-3">
              <motion.div {...fadeUp(0.05 * (i + 1))}>
                {loading ? (
                  <div className="tl-stat-card"><Skeleton h="24px" w="50%" /><div style={{ marginTop: '1rem' }}><Skeleton h="40px" w="60%" /></div></div>
                ) : (
                  <div className="tl-stat-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span style={{ color: 'var(--tl-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>{s.title}</span>
                      <div className="tl-stat-icon" style={{ background: `rgba(var(${s.color}), 0.1)`, color: `rgb(var(${s.color}))` }}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--tl-text-primary)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                      {s.value}
                    </div>
                    <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      <span style={{ color: s.up ? 'var(--tl-success)' : 'var(--tl-danger)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {s.trend}
                      </span>
                      <span style={{ color: 'var(--tl-text-faint)' }}>vs last week</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <motion.div {...fadeUp(0.3)}>
            <div className="tl-card p-4" style={{ height: '100%' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Threat Activity</h6>
                <select className="tl-input" style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>

              <div style={{ height: 280 }}>
                {loading ? (
                  <div className="d-flex flex-column justify-content-end gap-2 h-100 pb-4">
                    <Skeleton h="30%" /><Skeleton h="50%" /><Skeleton h="70%" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gSafe" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gMal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--tl-text-faint)" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                      <YAxis stroke="var(--tl-text-faint)" axisLine={false} tickLine={false} fontSize={12} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="safe" stroke="#10B981" strokeWidth={2} fill="url(#gSafe)" name="Safe" />
                      <Area type="monotone" dataKey="malicious" stroke="#EF4444" strokeWidth={2} fill="url(#gMal)" name="Malicious" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions + Threat Feed */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          {/* Quick Actions */}
          <motion.div {...fadeUp(0.35)}>
            <div className="tl-card p-4">
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Quick Actions</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: <Crosshair size={16} />, label: 'URL Investigation', desc: 'Scan a suspicious URL' },
                  { icon: <FileText size={16} />, label: 'Generate Report', desc: 'Create threat report' },
                  { icon: <TrendingUp size={16} />, label: 'View Analytics', desc: 'Detailed statistics' },
                ].map((a, i) => (
                  <button key={i} className="tl-nav-item" style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    <div className="tl-stat-icon" style={{ width: 32, height: 32, background: 'rgba(var(--tl-primary-rgb), 0.1)', color: 'var(--tl-primary-light)' }}>
                      {a.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)', fontSize: '0.8125rem' }}>{a.label}</div>
                      <div style={{ color: 'var(--tl-text-faint)', fontSize: '0.6875rem' }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Threat Feed */}
          <motion.div {...fadeUp(0.4)} style={{ flex: 1 }}>
            <div className="tl-card p-4 d-flex flex-column" style={{ height: '100%' }}>
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Recent Threats</h6>
              <div className="d-flex flex-column gap-3 flex-grow-1">
                {loading ? [1,2,3].map(i => (
                  <div key={i} className="d-flex gap-3 align-items-center">
                    <Skeleton w="36px" h="36px" r />
                    <div style={{ flex: 1 }}><Skeleton w="70%" h="14px" /><div style={{ height: 6 }} /><Skeleton w="40%" h="12px" /></div>
                  </div>
                )) : recentInvestigations.filter(x => (x.threat_score ?? 0) > 75).map((item, i) => (
                  <div key={i} className="d-flex gap-3 align-items-start" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--tl-border)' }}>
                    <div className="tl-stat-icon" style={{ width: 36, height: 36, background: 'rgba(var(--tl-danger-rgb), 0.1)', color: 'var(--tl-danger)', flexShrink: 0 }}>
                      <ShieldAlert size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--tl-text-primary)', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.target}</div>
                      <div className="d-flex gap-2 align-items-center" style={{ fontSize: '0.6875rem', color: 'var(--tl-text-faint)' }}>
                        <span>{item.type}</span><span>•</span><span>{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <motion.div {...fadeUp(0.45)}>
        <div className="tl-card">
          <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Recent Investigations</h6>
            <button className="tl-btn tl-btn-secondary tl-btn-sm">View All <ArrowRight size={14} /></button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="p-4 d-flex flex-column gap-3">
                <Skeleton h="32px" /><Skeleton h="32px" /><Skeleton h="32px" />
              </div>
            ) : (
              <table className="tl-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Target</th><th>Type</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvestigations.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--tl-font-mono)', fontSize: '0.8125rem', color: 'var(--tl-text-faint)' }}>{item.id.slice(0, 8)}…</td>
                      <td style={{ fontWeight: 500, color: 'var(--tl-text-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.target}</td>
                      <td><span className="tl-badge tl-badge-info">{item.type}</span></td>
                      <td>{statusBadge(scoreToStatus(item.threat_score))}</td>
                      <td><Clock size={12} style={{ marginRight: 4, opacity: 0.5 }} />{timeAgo(item.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => navigate(`/investigations/detail/${item.id}`)}><ExternalLink size={14} /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
