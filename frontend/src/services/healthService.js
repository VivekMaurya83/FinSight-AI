import api from './api';

export const healthService = {
  async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (err) {
      return {
        status: 'offline',
        database: { status: 'offline' },
        ollama: { status: 'offline' }
      };
    }
  },

  async getOllamaHealth() {
    try {
      const response = await api.get('/health/ollama');
      return response.data;
    } catch {
      return { status: 'offline' };
    }
  }
};
