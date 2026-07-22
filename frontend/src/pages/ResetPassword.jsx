import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      return setError('Invalid or missing reset token.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(password)) {
      return setError('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.');
    }

    setLoading(true);

    try {
      await api.post('/api/v1/auth/reset-password', { token, new_password: password });
      setMessage('Password reset successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The token may be expired or invalid.');
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
              <h2 className="fw-bold">Reset Password</h2>
              <p className="text-muted">Enter your new secure password</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-3 py-2"
                  disabled={!!message}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-3 py-2"
                  disabled={!!message}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 rounded-3 py-2 fw-semibold" disabled={loading || !!message}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ResetPassword;
