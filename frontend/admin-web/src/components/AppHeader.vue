<template>
  <header class="app-header bg-white border-bottom d-flex align-items-center justify-content-between px-4" style="height: 72px; min-height: 72px;">
    <!-- Title / Breadcrumb Placeholder -->
    <div>
      <!-- Có thể thêm breadcrumb ở đây sau nếu cần -->
    </div>

    <!-- User Profile -->
    <div class="d-flex align-items-center gap-3">
      <div v-if="currentUser" class="dropdown">
        <button 
          class="btn btn-user-profile d-flex align-items-center gap-2 rounded-pill ps-1 pe-3 py-1 border-0" 
          type="button" 
          id="userDropdown" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <div class="avatar-circle bg-accent text-white fw-bold d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px;">
            {{ userInitial }}
          </div>
          <div class="text-start ms-1">
            <div class="fw-bold text-dark fs-7 lh-1">{{ displayName }}</div>
            <div class="text-muted-custom fs-8 lh-1 mt-1">{{ userRoleLabel }}</div>
          </div>
          <i class="fas fa-chevron-down text-muted-custom ms-2 fs-8"></i>
        </button>

        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2 p-2" aria-labelledby="userDropdown">
          <li>
            <button class="dropdown-item rounded-2 py-2 text-danger fw-semibold d-flex align-items-center gap-2" @click="logOut">
              <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import AuthService from "@/services/auth.service";

export default {
  name: "AppHeader",
  data() {
    return {
      currentUser: null,
    };
  },
  computed: {
    displayName() {
      if (!this.currentUser) return "Quản trị viên";
      return this.currentUser.HoTenNV || this.currentUser.MSNV;
    },
    userInitial() {
      return this.displayName.charAt(0).toUpperCase();
    },
    userRoleLabel() {
      if (!this.currentUser) return "Admin";
      return this.currentUser.ChucVu || "Nhân viên";
    }
  },
  methods: {
    logOut() {
      AuthService.logout();
      this.$router.push("/login");
    }
  },
  created() {
    this.currentUser = AuthService.getCurrentUser();
  }
};
</script>

<style scoped>
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
  min-width: 200px;
}

.dropdown-item {
  transition: all 0.2s;
}

.dropdown-item.text-danger:hover {
  background-color: #fef2f2;
}
</style>
