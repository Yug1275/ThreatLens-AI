import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFormData({
        firstName: user.profile.first_name || '',
        lastName: user.profile.last_name || '',
        bio: user.profile.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.put('/api/v1/auth/profile', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="fw-bold mb-4">My Profile</h2>
        
        <Row>
          <Col md={4} className="mb-4">
            <Card className="shadow-sm border-0 rounded-4 text-center p-4">
              <Card.Body>
                <div className="mb-3 d-flex justify-content-center">
                  <UserCircle size={100} className="text-secondary" />
                </div>
                <h4 className="fw-bold">{user?.username}</h4>
                <p className="text-muted">{user?.email}</p>
                <div className="badge bg-primary rounded-pill px-3 py-2">
                  {user?.is_superuser ? 'Administrator' : 'Standard User'}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={8}>
            <Card className="shadow-sm border-0 rounded-4 p-4">
              <Card.Body>
                <h4 className="fw-bold border-bottom pb-3 mb-4">Edit Details</h4>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="bio">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="rounded-3"
                      placeholder="Tell us a bit about yourself"
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" className="rounded-3 px-4 py-2 fw-semibold" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Profile;
