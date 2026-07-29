import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/notifications';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const notificationService = {
    getNotifications: async (skip = 0, limit = 100) => {
        const response = await axios.get(`${API_URL}/?skip=${skip}&limit=${limit}`, getAuthHeaders());
        return response.data;
    },
    
    markAsRead: async (notificationId) => {
        const response = await axios.patch(`${API_URL}/${notificationId}/read`, {}, getAuthHeaders());
        return response.data;
    },
    
    markAllAsRead: async () => {
        const response = await axios.post(`${API_URL}/read-all`, {}, getAuthHeaders());
        return response.data;
    },
    
    getPreferences: async () => {
        const response = await axios.get(`${API_URL}/preferences`, getAuthHeaders());
        return response.data;
    },
    
    updatePreferences: async (preferences) => {
        const response = await axios.put(`${API_URL}/preferences`, preferences, getAuthHeaders());
        return response.data;
    }
};
