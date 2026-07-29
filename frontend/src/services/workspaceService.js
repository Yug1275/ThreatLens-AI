import api from './api';

const workspaceService = {
  // Folders
  getFolders: async () => {
    const response = await api.get('/workspace/folders');
    return response.data;
  },

  createFolder: async (name) => {
    const response = await api.post('/workspace/folders', { name });
    return response.data;
  },

  updateFolder: async (folderId, name) => {
    const response = await api.put(`/workspace/folders/${folderId}`, { name });
    return response.data;
  },

  deleteFolder: async (folderId) => {
    const response = await api.delete(`/workspace/folders/${folderId}`);
    return response.data;
  },

  // Saved Searches
  getSavedSearches: async () => {
    const response = await api.get('/workspace/searches');
    return response.data;
  },

  createSavedSearch: async (searchData) => {
    const response = await api.post('/workspace/searches', searchData);
    return response.data;
  },

  updateSavedSearch: async (searchId, searchData) => {
    const response = await api.put(`/workspace/searches/${searchId}`, searchData);
    return response.data;
  },

  deleteSavedSearch: async (searchId) => {
    const response = await api.delete(`/workspace/searches/${searchId}`);
    return response.data;
  }
};

export default workspaceService;
