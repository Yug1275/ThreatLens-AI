import api from '../utils/axios';

const BASE = '/api/v1/workspace';

const workspaceService = {
  // Folders
  getFolders: async () => {
    const response = await api.get(`${BASE}/folders`);
    return response.data;
  },

  createFolder: async (name) => {
    const response = await api.post(`${BASE}/folders`, { name });
    return response.data;
  },

  updateFolder: async (folderId, name) => {
    const response = await api.put(`${BASE}/folders/${folderId}`, { name });
    return response.data;
  },

  deleteFolder: async (folderId) => {
    const response = await api.delete(`${BASE}/folders/${folderId}`);
    return response.data;
  },

  // Saved Searches
  getSavedSearches: async () => {
    const response = await api.get(`${BASE}/searches`);
    return response.data;
  },

  createSavedSearch: async (searchData) => {
    const response = await api.post(`${BASE}/searches`, searchData);
    return response.data;
  },

  updateSavedSearch: async (searchId, searchData) => {
    const response = await api.put(`${BASE}/searches/${searchId}`, searchData);
    return response.data;
  },

  deleteSavedSearch: async (searchId) => {
    const response = await api.delete(`${BASE}/searches/${searchId}`);
    return response.data;
  }
};

export default workspaceService;
