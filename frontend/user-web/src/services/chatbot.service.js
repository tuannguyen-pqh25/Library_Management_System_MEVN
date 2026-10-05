import http from "./http-common";

class ChatbotService {
  async sendMessage(message, docGiaId = null, conversationId = null) {
    return await http.post("/chatbot/message", {
      message,
      docGiaId,
      conversationId
    });
  }

  async getHistory(docGiaId, conversationId = null) {
    let url = `/chatbot/history/${docGiaId}`;
    if (conversationId) {
      url += `?conversationId=${conversationId}`;
    }
    return await http.get(url);
  }
}

export default new ChatbotService();
