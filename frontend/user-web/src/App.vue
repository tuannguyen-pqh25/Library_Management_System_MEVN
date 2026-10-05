<template>
  <div class="app-shell d-flex flex-column min-vh-100">
    <!-- Component Header tái sử dụng -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="flex-grow-1 bg-body">
      <router-view />
    </main>

    <!-- Chat Widget -->
    <ChatWidget />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import ChatWidget from '@/components/ui/ChatWidget.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    ChatWidget
  }
}
</script>

<style>
/* Đặt font-family hoặc reset CSS toàn cục nếu cần, tuy nhiên style.css đã lo phần này */
.app-shell {
  background-color: var(--bs-body-bg);
}
</style>
