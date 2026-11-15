import api from './api';

export const conversationService = {
  async getMyConversations() {
    const response = await api.get('/conversations');
    return response.data;
  },

  async createOrGetConversation(productId) {
    const response = await api.post('/conversations', {
      productId: Number(productId),
    });
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId, text) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      text: text.trim(),
    });
    return response.data;
  },
};

export default conversationService;
