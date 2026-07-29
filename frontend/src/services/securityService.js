import api from '../utils/axios';

const BASE = '/api/v1/security';

const securityService = {
  getSessions: async () => {
    const response = await api.get(`${BASE}/sessions`);
    return response.data;
  },

  revokeSession: async (sessionId) => {
    const response = await api.delete(`${BASE}/sessions/${sessionId}`);
    return response.data;
  },

  getAuditLogs: async (skip = 0, limit = 50) => {
    const response = await api.get(`${BASE}/audit`, {
      params: { skip, limit }
    });
    return response.data;
  }
};

export default securityService;
