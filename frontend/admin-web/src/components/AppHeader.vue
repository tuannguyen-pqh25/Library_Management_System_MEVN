﻿<template>
  <header class="app-header sticky-top bg-white">
    <div class="container-fluid px-4 h-100">
      <div class="d-flex align-items-center justify-content-between h-100">
        
        <!-- 1. BRAND / LOGO -->
        <router-link to="/" class="brand-logo text-decoration-none d-flex align-items-center gap-2">
          <div class="logo-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center">
             <i class="fas fa-book-open"></i>
          </div>
          <div class="d-flex flex-column">
             <span class="fw-bold text-dark fs-5 lh-1">Thư viện <span class="text-primary">Số</span></span>
             <span class="text-muted small" style="font-size: 0.7rem; letter-spacing: 0.5px;">Khám phá tri thức</span>
          </div>
        </router-link>

        <!-- 2. NAVIGATION (Desktop) -->
        <nav class="d-none d-md-flex align-items-center gap-1 nav-menu">
           <router-link to="/" class="nav-item-link" active-class="active">
              <i class="fas fa-home me-1"></i> Trang chủ
           </router-link>
           <router-link to="/books" class="nav-item-link" active-class="active">
              <i class="fas fa-book me-1"></i> Khám phá sách
           </router-link>
           <!-- Chỉ hiện khi là Độc Giả (không có ChucVu) -->
           <template v-if="currentUser && !currentUser.ChucVu">
              <router-link to="/docgia/favorites" class="nav-item-link" active-class="active">
                <i class="fas fa-heart me-1"></i> Yêu thích
              </router-link>
              <router-link to="/docgia/requests" class="nav-item-link" active-class="active">
                <i class="fas fa-list-alt me-1"></i> Yêu cầu
              </router-link>
           </template>
        </nav>

        <!-- 3. USER ACTIONS -->
        <div class="d-flex align-items-center gap-3">
           
           <!-- Guest State -->
           <div v-if="!currentUser" class="d-flex align-items-center gap-2">
              <router-link to="/docgia/register" class="btn btn-light text-primary fw-bold rounded-pill px-4 hover-scale">
                 Đăng ký
              </router-link>
              <router-link to="/login" class="btn btn-primary fw-bold rounded-pill px-4 shadow-sm hover-scale">
                 Đăng nhập
              </router-link>
           </div>

           <!-- Logged In State -->
           <div v-else class="dropdown">
              <!-- Trigger Button -->
              <button 
                class="btn btn-user-profile d-flex align-items-center gap-2 rounded-pill ps-1 pe-3 py-1" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                 <div class="avatar-circle bg-primary-subtle text-primary fw-bold">
                    {{ userInitial }}
                 </div>
                 <div class="d-none d-sm-block text-start ms-1">
                    <div class="fw-bold text-dark fs-7">{{ displayName }}</div>
                    <div class="text-muted fs-8 lh-1">{{ userRoleLabel }}</div>
                 </div>
                 <i class="fas fa-chevron-down text-muted ms-2 fs-8"></i>
              </button>

              <!-- Dropdown Menu -->
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 p-2" aria-labelledby="userDropdown">
                 
                 <!-- Menu cho Độc Giả -->
                 <template v-if="!currentUser.ChucVu">
                    <li>
                        <router-link to="/docgia/account" class="dropdown-item rounded-3 py-2">
                            <i class="fas fa-user-circle me-2 text-primary"></i> Tài khoản của tôi
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/docgia/history" class="dropdown-item rounded-3 py-2">
                            <i class="fas fa-history me-2 text-info"></i> Lịch sử mượn
                        </router-link>
                    </li>
                 </template>

                 <!-- Menu cho Nhân Viên / Admin -->
                 <template v-else>
                    <li>
                        <router-link v-if="currentUser.ChucVu === 'Staff'" to="/staff" class="dropdown-item rounded-3 py-2">
                            <i class="fas fa-columns me-2 text-primary"></i> Trang Quản Lý
                        </router-link>
                    </li>
                     <li>
                        <router-link v-if="currentUser.ChucVu === 'Admin'" to="/admin" class="dropdown-item rounded-3 py-2">
                            <i class="fas fa-user-shield me-2 text-danger"></i> Trang Admin
                        </router-link>
                    </li>
                 </template>
                 
                 <li><hr class="dropdown-divider my-1"></li>
                 <li>
                    <button class="dropdown-item rounded-3 py-2 text-danger fw-semibold" @click="logOut">
                        <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </button>
                 </li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  </header>
</template>

<script>
import AuthService from "@/services/auth.service";
import eventBus from "@/services/eventBus";

export default {
  name: "AppHeader",
  data() {
    return {
      currentUser: null,
    };
  },
  computed: {
    displayName() {
      if (!this.currentUser) return 'Khách';
      return this.currentUser.HoTenNV || (this.currentUser.HOLOT + ' ' + this.currentUser.TEN) || this.currentUser.username;
    },
    userInitial() {
        return this.displayName.charAt(0).toUpperCase();
    },
    userRoleLabel() {
        if (!this.currentUser.ChucVu) return 'Độc giả';
        return this.currentUser.ChucVu === 'Staff' ? 'Nhân viên' : 'Quản trị viên';
    }
  },
  methods: {
    logOut() {
      AuthService.logout();
      eventBus.emit("auth-change");
      this.$router.push('/login');
    },
    updateLoginStatus() {
      this.currentUser = AuthService.getCurrentUser();
    }
  },
  created() {
    this.updateLoginStatus();
    eventBus.on("auth-change", this.updateLoginStatus);
  },
  beforeUnmount() {
    eventBus.off("auth-change", this.updateLoginStatus);
  }
};
</script>

<style scoped>
.app-header {
  height: 74px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  z-index: 1030;
  font-family: 'Inter', sans-serif;
}

/* Logo */
.logo-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
}

/* Navigation Links (Pill Shape) */
.nav-menu {
    background: #f8f9fa;
    padding: 5px;
    border-radius: 50px;
    border: 1px solid #f1f5f9;
}

.nav-item-link {
    color: #64748b;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 8px 20px;
    border-radius: 50px;
    transition: all 0.2s ease;
}

.nav-item-link:hover {
    color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.05);
}

.nav-item-link.active {
    color: #fff;
    background-color: #0d6efd;
    box-shadow: 0 2px 6px rgba(13, 110, 253, 0.3);
}

/* User Profile Button */
.btn-user-profile {
    background-color: transparent;
    border: none !important; /* Xóa hẳn viền */
    transition: all 0.2s;
    outline: none; /* Xóa outline khi focus */
}

.btn-user-profile:hover, .btn-user-profile[aria-expanded="true"] {
    background-color: #f1f5f9; /* Nền xám nhạt khi hover */
}

/* Đã xóa border trắng */
.avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    /* border: 2px solid #fff; <-- Xóa dòng này */
}

.fs-7 { font-size: 0.85rem; }
.fs-8 { font-size: 0.75rem; }

/* Dropdown Menu */
.dropdown-menu {
    min-width: 240px;
    animation: dropdownFadeIn 0.2s ease-out;
    margin-top: 0.5rem !important;
    border: 1px solid rgba(0,0,0,0.05);
}

@keyframes dropdownFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.dropdown-item {
    font-weight: 500;
    color: #475569;
    transition: background-color 0.15s;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f1f5f9;
    color: #0d6efd;
}

.dropdown-item.text-danger:hover {
    background-color: #fef2f2;
    color: #dc2626 !important;
}

/* Utilities */
.hover-scale {
    transition: transform 0.2s;
}
.hover-scale:hover {
    transform: scale(1.05);
}
</style>