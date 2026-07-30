import api from '../utils/axios';

const monitoringService = {
  getHealth: async () => {
    const response = await api.get('/api/v1/monitoring/health');
    return response.data;
  },

  getMetrics: async () => {
    const response = await api.get('/api/v1/monitoring/metrics');
    return response.data;
  }
};

export default monitoringService;
