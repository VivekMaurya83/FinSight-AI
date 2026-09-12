import api from './api';

export const authService = {
  async signup(data) {
    const response = await api.post('/auth/signup', data);
    if (response.data.access_token) {
      localStorage.setItem('finsight_token', response.data.access_token);
      localStorage.setItem('finsight_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('finsight_token', response.data.access_token);
      localStorage.setItem('finsight_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('finsight_token');
    localStorage.removeItem('finsight_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('finsight_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('finsight_token');
  }
};
