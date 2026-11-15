import api from './api';

const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

export const conversationService = {
  async createOrGetConversation(productId) {
    const res = await api.post('/conversations', { productId: Number(productId) });
    return unwrap(res);
  },

  async getConversations() {
    const res = await api.get('/conversations');
    const data = unwrap(res);
    return Array.isArray(data) ? data : data?.items || data?.conversations || [];
  },

  async getMyConversations() {
    return this.getConversations();
  },

  async getMessages(conversationId) {
    const res = await api.get(`/conversations/${conversationId}/messages`);
    const data = unwrap(res);
    if (Array.isArray(data)) {
      return { conversation: null, messages: data };
    }
    return {
      conversation: data?.conversation || data || null,
      messages: data?.messages || [],
    };
  },

  async getConversationMessages(conversationId) {
    return this.getMessages(conversationId);
  },

  async sendMessage(conversationId, text) {
    const res = await api.post(`/conversations/${conversationId}/messages`, { text });
    return unwrap(res);
  },
};

export default conversationService;