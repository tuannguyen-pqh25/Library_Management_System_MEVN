<template>
  <div>
    <!-- Nút mở chat -->
    <button 
      class="chat-toggle-btn shadow-lg d-flex align-items-center justify-content-center"
      @click="toggleChat"
      :class="{ 'd-none': isOpen }"
    >
      <i class="fas fa-robot fa-2x text-white"></i>
      <span v-if="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {{ unreadCount }}
      </span>
    </button>

    <!-- Cửa sổ Chat -->
    <div 
      class="chat-window shadow-lg d-flex flex-column"
      :class="{ 'open': isOpen }"
    >
      <!-- Header -->
      <div class="chat-header bg-primary text-white p-3 d-flex justify-content-between align-items-center rounded-top-4">
        <div class="d-flex align-items-center">
          <i class="fas fa-robot fa-lg me-2"></i>
          <h5 class="mb-0 fw-bold">Trợ lý AI Thư viện</h5>
        </div>
        <button class="btn btn-sm btn-link text-white p-0 border-0" @click="toggleChat">
          <i class="fas fa-times fa-lg"></i>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-body flex-grow-1 p-3 overflow-auto" ref="chatBody">
        <div v-if="messages.length === 0" class="text-center text-muted my-5">
          <i class="fas fa-comment-dots fa-3x mb-3 text-light"></i>
          <p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>
        </div>
        
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-bubble mb-3 d-flex flex-column"
          :class="msg.role === 'user' ? 'align-items-end' : 'align-items-start'"
        >
          <div class="d-flex align-items-end" :class="{'flex-row-reverse': msg.role === 'user'}">
            <div class="avatar shadow-sm d-flex align-items-center justify-content-center" :class="msg.role === 'user' ? 'ms-2 bg-secondary text-white' : 'me-2 bg-primary text-white'">
              <i :class="msg.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div 
              class="message-content px-3 py-2"
              :class="msg.role === 'user' ? 'bg-primary text-white rounded-user' : 'bg-light text-dark rounded-ai border border-light-subtle shadow-sm'"
              style="white-space: pre-wrap; font-size: 0.95rem; max-width: 85%;"
            >
              <div v-if="msg.isLoading" class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <span v-else>{{ msg.content }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-footer p-3 border-top bg-white rounded-bottom-4">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input 
            type="text" 
            class="form-control rounded-pill px-3 bg-light" 
            v-model="inputMessage" 
            placeholder="Nhập câu hỏi..." 
            :disabled="isLoading"
          />
          <button 
            type="submit" 
            class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style="width: 42px; height: 42px;"
            :disabled="!inputMessage.trim() || isLoading"
          >
            <i class="fas fa-paper-plane" :class="{'fa-spin fa-spinner': isLoading}"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ChatbotService from '@/services/chatbot.service';
import AuthService from '@/services/auth.service';

export default {
  name: 'ChatWidget',
  data() {
    return {
      isOpen: false,
      inputMessage: '',
      messages: [],
      isLoading: false,
      unreadCount: 0,
      conversationId: `conv_${Date.now()}` // Tạo ID session tạm
    }
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.unreadCount = 0;
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const body = this.$refs.chatBody;
        if (body) {
          body.scrollTop = body.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) return;
      
      const userMsg = this.inputMessage.trim();
      this.inputMessage = '';
      
      // Thêm tin nhắn user vào giao diện
      this.messages.push({ role: 'user', content: userMsg });
      this.scrollToBottom();
      
      // Hiệu ứng typing
      this.isLoading = true;
      this.messages.push({ role: 'model', content: '', isLoading: true });
      this.scrollToBottom();

      try {
        const user = AuthService.getCurrentUser();
        const docGiaId = user ? user._id : null;
        
        const res = await ChatbotService.sendMessage(userMsg, docGiaId, this.conversationId);
        
        // Cập nhật lại tin nhắn bot
        this.messages.pop(); // Xóa tin isLoading
        if (res.data && res.data.reply) {
          this.messages.push({ role: 'model', content: res.data.reply });
          if (res.data.conversationId) {
            this.conversationId = res.data.conversationId;
          }
        } else {
          this.messages.push({ role: 'model', content: "Xin lỗi, tôi không thể trả lời lúc này." });
        }
      } catch (error) {
        this.messages.pop();
        console.error(error);
        this.messages.push({ role: 'model', content: "Đã xảy ra lỗi kết nối với máy chủ AI." });
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    }
  }
}
</script>

<style scoped>
.chat-toggle-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--bs-primary);
  border: none;
  cursor: pointer;
  z-index: 9999;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
}

.chat-window {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 380px;
  height: 600px;
  max-height: calc(100vh - 100px);
  background-color: #fff;
  border-radius: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  transform: translateY(20px) scale(0.9);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.chat-window.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: all;
}

.chat-body {
  background-color: #f8f9fa;
  scroll-behavior: smooth;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.rounded-user {
  border-radius: 18px 18px 0 18px;
}

.rounded-ai {
  border-radius: 18px 18px 18px 0;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
}

.typing-indicator span {
  display: block;
  width: 6px;
  height: 6px;
  background-color: #adb5bd;
  border-radius: 50%;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@media (max-width: 576px) {
  .chat-window {
    width: calc(100vw - 40px);
    right: 20px;
    bottom: 20px;
    height: calc(100vh - 100px);
  }
}
</style>
