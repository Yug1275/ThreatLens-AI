import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow-sm border-0 rounded-4 p-4">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="fw-bold">Welcome Back</h2>
              <p className="text-muted">Sign in to continue to ThreatLens AI</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email or Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-3 py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <div className="d-flex justify-content-between">
                  <Form.Label>Password</Form.Label>
                  <Link to="/forgot-password" className="text-decoration-none small">Forgot Password?</Link>
                </div>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-3 py-2"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 rounded-3 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-decoration-none fw-semibold">Sign Up</Link>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;
