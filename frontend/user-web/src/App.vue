<template>
  <div class="app-shell d-flex flex-column min-vh-100">
    <!-- Component Header tái sử dụng -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="flex-grow-1 bg-body">
      <router-view />
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'App',
  components: {
    AppHeader
  }
}
</script>

<style>
/* Đặt font-family hoặc reset CSS toàn cục nếu cần, tuy nhiên style.css đã lo phần này */
.app-shell {
  background-color: var(--bs-body-bg);
}
</style>
