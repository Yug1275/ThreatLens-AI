import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { Activity, Server, Clock, Database, AlertCircle, HardDrive } from 'lucide-react';
import monitoringService from '../services/monitoringService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);

  const fetchMetrics = async () => {
    try {
      const data = await monitoringService.getMetrics();
      setMetrics(data);
      
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
      
      setCpuHistory(prev => {
        const newHistory = [...prev, { time: now, cpu: data.system.cpu_percent }];
        return newHistory.slice(-20); // Keep last 20 ticks
      });
      
      setMemHistory(prev => {
        const newHistory = [...prev, { time: now, mem: data.system.memory_percent }];
        return newHistory.slice(-20);
      });
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch monitoring data. Server may be down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const statusColor = (status) => {
    return status === 'healthy' ? 'success' : status === 'disabled' ? 'secondary' : 'danger';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4">
      <PageHeader 
        title="System Monitoring" 
        subtitle="Live production observability and system health" 
        icon={<Activity className="text-primary" />} 
      />
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {metrics && (
        <>
          {/* Services Health */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="tl-card border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Server size={18} className="text-primary" /> Service Status
                  </h6>
                  <div className="d-flex gap-4 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <Database size={16} className="text-muted" />
                      <span>Database:</span>
                      <Badge bg={statusColor(metrics.services.database)}>{metrics.services.database.toUpperCase()}</Badge>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={16} className="text-muted" />
                      <span>Background Tasks:</span>
                      <Badge bg={statusColor(metrics.services.background_tasks)}>{metrics.services.background_tasks.toUpperCase()}</Badge>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <HardDrive size={16} className="text-muted" />
                      <span>Cache:</span>
                      <Badge bg={statusColor(metrics.services.redis_cache)}>{metrics.services.redis_cache.toUpperCase()}</Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Stats Row */}
          <Row className="mb-4 g-4">
            <Col md={3}>
              <Card className="tl-card h-100 border-0 shadow-sm text-center py-3">
                <Card.Body>
                  <div className="text-muted mb-2 small fw-bold text-uppercase">Total Requests</div>
                  <h2 className="mb-0 fw-bold">{metrics.api.total_requests}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="tl-card h-100 border-0 shadow-sm text-center py-3">
                <Card.Body>
                  <div className="text-muted mb-2 small fw-bold text-uppercase">Error Rate</div>
                  <h2 className={`mb-0 fw-bold ${metrics.api.error_rate_percent > 5 ? 'text-danger' : ''}`}>
                    {metrics.api.error_rate_percent}%
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="tl-card h-100 border-0 shadow-sm text-center py-3">
                <Card.Body>
                  <div className="text-muted mb-2 small fw-bold text-uppercase">Avg Latency</div>
                  <h2 className={`mb-0 fw-bold ${metrics.api.avg_latency_ms > 500 ? 'text-warning' : ''}`}>
                    {metrics.api.avg_latency_ms} ms
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="tl-card h-100 border-0 shadow-sm text-center py-3">
                <Card.Body>
                  <div className="text-muted mb-2 small fw-bold text-uppercase">Slow Queries</div>
                  <h2 className={`mb-0 fw-bold ${metrics.api.slow_queries > 0 ? 'text-warning' : ''}`}>
                    {metrics.api.slow_queries}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Live Charts */}
          <Row className="mb-4 g-4">
            <Col md={6}>
              <Card className="tl-card border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Activity size={18} className="text-primary" /> CPU Usage (%)
                  </h6>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <LineChart data={cpuHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="tl-card border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <HardDrive size={18} className="text-primary" /> Memory Usage (%)
                  </h6>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <LineChart data={memHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="mem" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2 small text-muted">
                    Currently using {metrics.system.memory_used_mb} MB
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Errors Table */}
          <Row>
            <Col md={12}>
              <Card className="tl-card border-0 shadow-sm">
                <Card.Body>
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <AlertCircle size={18} className="text-danger" /> Recent System Exceptions
                  </h6>
                  {metrics.errors.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                      No recent exceptions. System is running smoothly.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover size="sm">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Method</th>
                            <th>Path</th>
                            <th>Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.errors.map((err, idx) => (
                            <tr key={idx}>
                              <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{new Date(err.timestamp).toLocaleString()}</td>
                              <td><Badge bg="secondary">{err.method}</Badge></td>
                              <td className="font-monospace text-muted small">{err.path}</td>
                              <td className="text-danger small">{err.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </motion.div>
  );
}
