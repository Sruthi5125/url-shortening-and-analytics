import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  signup: async (name, email, password) => {
    try {
      const response = await authClient.post('/signup', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'An error occurred during signup';
    }
  },

  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Invalid credentials';
    }
  },

  getMe: async (token) => {
    try {
      const response = await authClient.get('/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to authenticate user';
    }
  }
};
