import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ShieldAlert, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ArrowRight, Crosshair, FileText, TrendingUp, Clock, ExternalLink, Target, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
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
      zIndex: 100
    }}>
      <div style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: entry.color || entry.payload.fill || 'var(--tl-text-primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.payload.fill || 'var(--tl-primary)', display: 'inline-block' }} />
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

const RISK_COLORS = { Malicious: '#EF4444', Suspicious: '#F59E0B', Safe: '#10B981' };
const TYPE_COLORS = { URL: '#3B82F6', EMAIL: '#10B981', PHONE: '#8B5CF6', OCR: '#06B6D4', QR: '#F59E0B' };

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  
  // Phase 6A New State
  const [typesData, setTypesData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [topTargets, setTopTargets] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes, rRes, tRes, riskRes, topRes, prodRes] = await Promise.all([
          api.get('/api/v1/dashboard/stats').catch(() => ({ data: { total: 0, malicious: 0, safe: 0, suspicious: 0, pending: 0 } })),
          api.get('/api/v1/dashboard/activity').catch(() => ({ data: [
            { name: 'Mon', malicious: 0, safe: 0 }, { name: 'Tue', malicious: 0, safe: 0 },
            { name: 'Wed', malicious: 0, safe: 0 }, { name: 'Thu', malicious: 0, safe: 0 },
            { name: 'Fri', malicious: 0, safe: 0 }, { name: 'Sat', malicious: 0, safe: 0 },
            { name: 'Sun', malicious: 0, safe: 0 },
          ] })),
          api.get('/api/v1/dashboard/recent').catch(() => ({ data: [] })),
          api.get('/api/v1/dashboard/types').catch(() => ({ data: [] })),
          api.get('/api/v1/dashboard/risk').catch(() => ({ data: [] })),
          api.get('/api/v1/dashboard/top-targets').catch(() => ({ data: [] })),
          api.get('/api/v1/dashboard/productivity').catch(() => ({ data: [] })),
        ]);
        setStats(sRes.data);
        setActivityData(aRes.data);
        setRecentInvestigations(rRes.data);
        setTypesData(tRes.data);
        setRiskData(riskRes.data);
        setTopTargets(topRes.data);
        setProductivityData(prodRes.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Investigations', value: stats?.total ?? 0, icon: Search, trend: 'All time', up: true, color: '--tl-primary-rgb' },
    { title: 'Malicious Threats', value: stats?.malicious ?? 0, icon: ShieldAlert, trend: 'Score > 75', up: false, color: '--tl-danger-rgb' },
    { title: 'Safe Entities', value: stats?.safe ?? 0, icon: Activity, trend: 'Score ≤ 40', up: true, color: '--tl-success-rgb' },
    { title: 'Suspicious', value: stats?.suspicious ?? 0, icon: AlertTriangle, trend: 'Score 41–75', up: true, color: '--tl-warning-rgb' },
    { title: 'Average Score', value: stats?.average_score?.toFixed(1) ?? '0.0', icon: TrendingUp, trend: 'Overall', up: true, color: '--tl-info-rgb' },
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
              <button className="tl-btn tl-btn-primary" onClick={() => navigate('/investigations/url')}>
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
            <div key={i} className="col-6 col-md-4 col-xl">
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
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Threat Activity (Last 7 Days)</h6>
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
          <motion.div {...fadeUp(0.35)}>
            <div className="tl-card p-4">
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1rem' }}>Quick Actions</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: <Crosshair size={16} />, label: 'URL Investigation', desc: 'Scan a suspicious URL', path: '/investigations/url' },
                  { icon: <FileText size={16} />, label: 'Generate Report', desc: 'Create threat report', path: '/reports' },
                  { icon: <TrendingUp size={16} />, label: 'View History', desc: 'Detailed statistics', path: '/history' },
                ].map((a, i) => (
                  <button key={i} onClick={() => navigate(a.path)} className="tl-nav-item" style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>
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
                )) : recentInvestigations.filter(x => (x.threat_score ?? 0) > 75).slice(0, 4).map((item, i) => (
                  <div key={i} className="d-flex gap-3 align-items-start" style={{ paddingBottom: '0.75rem', borderBottom: i !== 3 ? '1px solid var(--tl-border)' : 'none' }}>
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

      {/* Analytics Second Row: Productivity & Distribution */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <motion.div {...fadeUp(0.4)}>
            <div className="tl-card p-4" style={{ height: '100%' }}>
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Analyst Productivity (30 Days)</h6>
              <div style={{ height: 250 }}>
                {loading ? (
                  <div className="d-flex h-100 justify-content-around align-items-end gap-2 pb-2">
                    <Skeleton w="8%" h="30%" /><Skeleton w="8%" h="60%" /><Skeleton w="8%" h="40%" />
                    <Skeleton w="8%" h="80%" /><Skeleton w="8%" h="50%" /><Skeleton w="8%" h="90%" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData && productivityData.length > 0 ? productivityData : Array.from({length: 30}).map((_, i) => ({ date: i, count: 0 }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--tl-text-faint)" axisLine={false} tickLine={false} dy={10} fontSize={10} interval="preserveStartEnd" minTickGap={20} />
                      <YAxis stroke="var(--tl-text-faint)" axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} domain={[0, dataMax => (dataMax === 0 ? 5 : dataMax)]} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="count" name="Investigations" fill="var(--tl-primary-light)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-lg-5">
          <motion.div {...fadeUp(0.42)}>
            <div className="tl-card p-4" style={{ height: '100%' }}>
              <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', marginBottom: '1.5rem' }}>Risk Distribution</h6>
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? (
                   <Skeleton w="200px" h="200px" r />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || 'var(--tl-primary)'} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8125rem', color: 'var(--tl-text-secondary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Third Row: Top IOCs and Investigation Types */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
           <motion.div {...fadeUp(0.44)}>
            <div className="tl-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4">
                <Target size={18} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Top Targeted IOCs</h6>
              </div>
              <div className="d-flex flex-column gap-3">
                {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} h="36px" />) : topTargets.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'var(--tl-bg-surface)', border: '1px solid var(--tl-border)' }}>
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(var(--tl-primary-rgb),0.1)', color: 'var(--tl-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.target}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--tl-text-muted)', fontWeight: 600, flexShrink: 0 }}>
                      {item.count} scans
                    </div>
                  </div>
                ))}
                {!loading && topTargets.length === 0 && <div className="text-center text-muted" style={{ fontSize: '0.875rem' }}>No targets found</div>}
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="col-12 col-lg-6">
           <motion.div {...fadeUp(0.46)}>
            <div className="tl-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4">
                <PieChartIcon size={18} color="var(--tl-primary-light)" />
                <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Investigation Types</h6>
              </div>
              <div style={{ height: 260 }}>
                {loading ? (
                   <div className="d-flex justify-content-center align-items-center h-100"><Skeleton w="180px" h="180px" r /></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        stroke="none"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || 'var(--tl-primary-light)'} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <motion.div {...fadeUp(0.48)}>
        <div className="tl-card">
          <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid var(--tl-border)' }}>
            <h6 style={{ fontWeight: 600, color: 'var(--tl-text-primary)', margin: 0 }}>Recent Investigations</h6>
            <button className="tl-btn tl-btn-secondary tl-btn-sm" onClick={() => navigate('/history')}>View All <ArrowRight size={14} /></button>
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
