<template>
  <div class="app-shell">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to="/">LibraryHub</router-link>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Trang chủ</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/sach">Sách</router-link>
            </li>
          </ul>
        </div>

        <div class="d-flex align-items-center gap-2">
          <template v-if="currentUser">
            <router-link class="btn btn-light btn-sm" to="/profile">Xin chào, {{ displayName }}</router-link>
            <router-link class="btn btn-outline-light btn-sm" to="/lich-su">Lịch sử</router-link>
            <button class="btn btn-outline-light btn-sm" @click="handleLogout">Đăng xuất</button>
          </template>
          <template v-else>
            <router-link class="btn btn-outline-light btn-sm" to="/login">Đăng nhập</router-link>
            <router-link class="btn btn-light btn-sm" to="/register">Đăng ký</router-link>
          </template>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service'

export default {
  name: 'App',
  computed: {
    currentUser() {
      return AuthService.getCurrentUser()
    },
    displayName() {
      const user = this.currentUser || {}
      return user.Ten || user.HoLot || user.Email || 'Độc giả'
    },
  },
  methods: {
    handleLogout() {
      AuthService.logout()
      this.$router.push('/login')
    },
  },
}
</script>
