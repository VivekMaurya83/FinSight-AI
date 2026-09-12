import api from './api';

export const chatService = {
  async getConversations() {
    const response = await api.get('/conversations');
    return response.data;
  },

  async getConversation(id) {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  async createConversation(title = 'New Conversation') {
    const response = await api.post('/conversations', { title });
    return response.data;
  },

  async deleteConversation(id) {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },

  async sendMessage(conversationId, content) {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  }
};
