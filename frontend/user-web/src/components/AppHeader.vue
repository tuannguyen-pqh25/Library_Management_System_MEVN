<template>
  <header class="app-header bg-white border-bottom shadow-sm sticky-top">
    <div class="container h-100">
      <div class="d-flex align-items-center justify-content-between h-100 py-3">
        
        <!-- BRAND / LOGO -->
        <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2">
          <div class="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
             <i class="fas fa-book-open fs-5"></i>
          </div>
          <div class="d-flex flex-column">
             <span class="font-display fw-bold text-dark fs-5 lh-1">Thư viện <span class="text-accent">Số</span></span>
             <span class="text-muted-custom small" style="font-size: 0.7rem; letter-spacing: 0.5px;">Dành cho độc giả</span>
          </div>
        </router-link>

        <!-- NAVIGATION -->
        <nav class="d-none d-md-flex align-items-center gap-2">
           <router-link to="/" class="nav-item-link rounded-pill" active-class="active">
              Trang chủ
           </router-link>
           <router-link to="/sach" class="nav-item-link rounded-pill" active-class="active">
              Khám phá Sách
           </router-link>
        </nav>

        <!-- USER ACTIONS -->
        <div class="d-flex align-items-center gap-2">
           <template v-if="currentUser">
              <div class="dropdown">
                <button 
                  class="btn btn-user-profile d-flex align-items-center gap-2 rounded-pill ps-1 pe-3 py-1 border-0" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div class="bg-accent text-white fw-bold d-flex align-items-center justify-content-center rounded-circle" style="width: 36px; height: 36px;">
                    {{ userInitial }}
                  </div>
                  <div class="text-start ms-1 d-none d-sm-block">
                    <div class="fw-bold text-dark fs-7 lh-1">{{ displayName }}</div>
                    <div class="text-muted-custom fs-8 lh-1 mt-1">Độc giả</div>
                  </div>
                  <i class="fas fa-chevron-down text-muted-custom ms-1 fs-8 d-none d-sm-block"></i>
                </button>

                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2 p-2" aria-labelledby="userDropdown">
                  <li>
                    <router-link class="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2" to="/profile">
                      <i class="fas fa-user-circle text-primary"></i> Tài khoản của tôi
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2" to="/lich-su">
                      <i class="fas fa-history text-info"></i> Lịch sử mượn
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider my-1"></li>
                  <li>
                    <button class="dropdown-item rounded-2 py-2 text-danger fw-semibold d-flex align-items-center gap-2" @click="handleLogout">
                      <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
           </template>
           <template v-else>
              <router-link to="/register" class="btn btn-light text-primary fw-bold rounded-pill px-4 hover-scale d-none d-sm-block">
                 Đăng ký
              </router-link>
              <router-link to="/login" class="btn btn-primary fw-bold rounded-pill px-4 shadow-sm hover-scale">
                 Đăng nhập
              </router-link>
           </template>
        </div>

      </div>
    </div>
  </header>
</template>

<script>
import AuthService from '@/services/auth.service'
// Trong Vue 3 Composition API/Pinia thường dùng store. Ở đây code cũ đang dùng methods.

export default {
  name: 'AppHeader',
  data() {
    return {
      currentUser: null,
    }
  },
  computed: {
    displayName() {
      const user = this.currentUser || {}
      return user.Ten || user.HoLot || user.Email || 'Độc giả'
    },
    userInitial() {
      return this.displayName.charAt(0).toUpperCase()
    }
  },
  methods: {
    updateUser() {
      this.currentUser = AuthService.getCurrentUser();
    },
    handleLogout() {
      AuthService.logout()
      this.updateUser()
      this.$router.push('/login')
    }
  },
  created() {
    this.updateUser()
    // Lắng nghe sự kiện login từ các component khác nếu có (như LoginUser phát ra)
    window.addEventListener('storage', this.updateUser); 
  },
  unmounted() {
    window.removeEventListener('storage', this.updateUser);
  }
}
</script>

<style scoped>
.app-header {
  z-index: 1030;
}

.nav-item-link {
  color: var(--bs-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 8px 20px;
  transition: all 0.2s ease;
}

.nav-item-link:hover {
  color: var(--bs-primary);
  background-color: var(--bs-body-bg);
}

.nav-item-link.active {
  color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  font-weight: 600;
}

.btn-user-profile {
  background-color: transparent;
  transition: all 0.2s;
}

.btn-user-profile:hover, .btn-user-profile[aria-expanded="true"] {
  background-color: var(--bs-body-bg);
}

.fs-7 { font-size: 0.85rem; }
.fs-8 { font-size: 0.75rem; }

.dropdown-menu {
  min-width: 220px;
}

.dropdown-item {
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: var(--bs-body-bg);
  color: var(--bs-primary);
}

.dropdown-item.text-danger:hover {
  background-color: #fef2f2;
}

.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.05);
}
</style>
