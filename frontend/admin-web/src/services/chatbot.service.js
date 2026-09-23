import http from "./http-common";

class ChatbotService {
  /**
 
   * @param {string} message - Nội dung tin nhắn
   * @param {string|null} docGiaId - ID độc giả (nếu đã đăng nhập)
   * @param {string|null} conversationId - ID cuộc hội thoại (null nếu là tin nhắn đầu)
   * @returns {Promise} { data: { reply: string, conversationId: string } }
   */
  sendMessage(message, docGiaId = null, conversationId = null) {
    const payload = { message };
    if (docGiaId) {
      payload.docGiaId = docGiaId;
    }
    if (conversationId) {
      payload.conversationId = conversationId;
    }
    return http.post("/chatbot/message", payload);
  }

  /**
   * Lấy lịch sử chat của độc giả từ CHAT_HISTORY
   * @param {string} docGiaId - ID độc giả
   * @param {string|null} conversationId - (tùy chọn) lọc theo 1 hội thoại cụ thể
   * @returns {Promise} { data: { success: boolean, data: Array } }
   */
  getHistory(docGiaId, conversationId = null) {
    let url = `/chatbot/history/${docGiaId}`;
    if (conversationId) {
      url += `?conversationId=${encodeURIComponent(conversationId)}`;
    }
    return http.get(url);
  }
}

export default new ChatbotService();
