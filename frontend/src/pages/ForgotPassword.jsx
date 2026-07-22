import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
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
              <h2 className="fw-bold">Forgot Password</h2>
              <p className="text-muted">Enter your email to receive a reset link</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="email">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-3 py-2"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 rounded-3 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-decoration-none fw-semibold">Back to Sign In</Link>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ForgotPassword;
