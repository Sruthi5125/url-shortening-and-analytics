import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getClient = (token) => axios.create({
  baseURL: `${API_BASE_URL}/api/urls`,
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export const urlApi = {
  createUrl: async (token, originalUrl, customAlias, expiresAt) => {
    try {
      const payload = { originalUrl };
      if (customAlias) payload.customAlias = customAlias;
      if (expiresAt) payload.expiresAt = expiresAt;
      
      const response = await getClient(token).post('/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create short URL';
    }
  },

  getUrls: async (token) => {
    try {
      const response = await getClient(token).get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch URLs';
    }
  },

  deleteUrl: async (token, id) => {
    try {
      const response = await getClient(token).delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete URL';
    }
  },

  getAnalytics: async (token, id) => {
    try {
      const response = await getClient(token).get(`/${id}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch analytics';
    }
  },

  getQrCode: async (token, id) => {
    try {
      const response = await getClient(token).get(`/${id}/qrcode`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch QR code';
    }
  },

  updateUrl: async (token, id, originalUrl) => {
    try {
      const response = await getClient(token).patch(`/${id}`, { originalUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update URL';
    }
  },

  bulkCreateUrl: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await getClient(token).post('/bulk', formData, {
        headers: { 'Content-Type': undefined },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to process CSV file';
    }
  }
};
