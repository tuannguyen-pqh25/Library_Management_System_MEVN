<template>
  <header class="app-header bg-white border-bottom d-flex align-items-center justify-content-between px-4 sticky-top" style="height: 72px; min-height: 72px; z-index: 1020;">
    <!-- Left: Welcome / Greeting -->
    <div class="d-flex align-items-center gap-2">
      <span class="text-muted-custom fs-7 d-none d-md-inline">Xin chào,</span>
      <span class="fw-bold text-dark fs-6">{{ displayName }}</span>
      <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 ms-1" style="font-size:0.75rem;">{{ userRoleLabel }}</span>
    </div>

    <!-- Right: Theme & User Profile -->
    <div class="d-flex align-items-center gap-2">
      <!-- Quick Theme Toggle on Header -->
      <button
        class="btn btn-light rounded-circle d-flex align-items-center justify-content-center border-0"
        style="width: 40px; height: 40px;"
        :title="isDark ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'"
        @click="handleToggleTheme"
        type="button"
      >
        <i :class="isDark ? 'fas fa-sun text-warning' : 'fas fa-moon text-secondary'"></i>
      </button>

      <!-- User Dropdown container -->
      <div v-if="currentUser" class="position-relative" ref="adminDropdownRef">
        <button 
          class="btn btn-user-profile d-flex align-items-center gap-2 rounded-pill ps-1 pe-3 py-1 border-0" 
          type="button" 
          id="adminUserDropdown" 
          @click.stop="toggleDropdown"
          :aria-expanded="dropdownOpen"
        >
          <div class="avatar-circle bg-accent text-white fw-bold d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 40px; height: 40px;">
            {{ userInitial }}
          </div>
          <div class="text-start ms-1 d-none d-sm-block">
            <div class="fw-bold text-dark fs-7 lh-1 text-truncate" style="max-width: 140px;">{{ displayName }}</div>
            <div class="text-muted-custom fs-8 lh-1 mt-1">{{ userRoleLabel }}</div>
          </div>
          <i class="fas fa-chevron-down text-muted-custom ms-2 fs-8"></i>
        </button>

        <!-- Dropdown menu panel -->
        <transition name="admin-drop">
          <div
            v-if="dropdownOpen"
            class="admin-dropdown-panel shadow-lg rounded-4 p-2 bg-white border position-absolute"
            style="min-width: 250px; right: 0; top: calc(100% + 8px); z-index: 1030;"
            @click.stop
          >
            <!-- User Info Header inside Dropdown -->
            <div class="px-3 pt-2 pb-3 mb-2 border-bottom">
              <div class="d-flex align-items-center gap-3">
                <div class="avatar-circle bg-accent text-white fw-bold d-flex align-items-center justify-content-center rounded-circle shadow-sm flex-shrink-0" style="width: 42px; height: 42px; font-size: 1.05rem;">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <div class="fw-bold text-dark text-truncate" style="font-size: 0.95rem;">{{ displayName }}</div>
                  <div class="text-muted-custom text-truncate" style="font-size: 0.8rem;">{{ currentUser.EMAIL || currentUser.MSNV }}</div>
                  <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0 mt-1" style="font-size: 0.7rem;">{{ userRoleLabel }}</span>
                </div>
              </div>
            </div>

            <!-- Profile Management button -->
            <button
              class="dropdown-custom-item rounded-3 py-2 px-3 mb-1 d-flex align-items-center gap-3 fw-medium text-secondary text-decoration-none w-100 border-0 bg-transparent text-start"
              @click="openProfileModal"
              type="button"
            >
              <span class="menu-icon bg-primary bg-opacity-10 text-primary"><i class="fas fa-user-shield"></i></span>
              <span>Hồ sơ cá nhân</span>
            </button>

            <!-- Theme Toggle Item -->
            <div
              class="dropdown-custom-item rounded-3 py-2 px-3 mb-1 d-flex align-items-center justify-content-between text-secondary"
              @click="handleToggleTheme"
              role="button"
            >
              <div class="d-flex align-items-center gap-3">
                <span class="menu-icon" :class="isDark ? 'bg-warning bg-opacity-10 text-warning' : 'bg-secondary bg-opacity-10 text-secondary'">
                  <i :class="isDark ? 'fas fa-moon' : 'fas fa-sun'"></i>
                </span>
                <span class="fw-medium" style="font-size: 0.875rem;">{{ isDark ? 'Chế độ tối' : 'Chế độ sáng' }}</span>
              </div>
              <div class="form-check form-switch m-0 p-0 d-flex align-items-center">
                <input class="form-check-input ms-0" type="checkbox" role="switch" :checked="isDark" style="cursor: pointer;" @click.stop="handleToggleTheme">
              </div>
            </div>

            <div class="dropdown-divider my-2 opacity-25"></div>

            <!-- Logout -->
            <button
              class="dropdown-custom-item rounded-3 py-2 px-3 text-danger fw-bold d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start"
              @click="logOut"
              type="button"
            >
              <span class="menu-icon bg-danger bg-opacity-10 text-danger"><i class="fas fa-sign-out-alt"></i></span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Admin Profile Modal -->
    <AdminProfileModal
      v-if="showProfileModal"
      @close="showProfileModal = false"
      @updated="handleProfileUpdated"
    />
  </header>
</template>

<script>
import AuthService from "@/services/auth.service";
import AdminProfileModal from "@/components/AdminProfileModal.vue";
import { getSavedTheme, toggleTheme } from "@/services/theme.service";

export default {
  name: "AppHeader",
  components: {
    AdminProfileModal,
  },
  data() {
    return {
      currentUser: null,
      dropdownOpen: false,
      showProfileModal: false,
      isDark: getSavedTheme() === "dark",
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
    },
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    closeDropdown(e) {
      if (this.dropdownOpen) {
        const wrapper = this.$refs.adminDropdownRef;
        if (wrapper && !wrapper.contains(e.target)) {
          this.dropdownOpen = false;
        }
      }
    },
    openProfileModal() {
      this.dropdownOpen = false;
      this.showProfileModal = true;
    },
    handleProfileUpdated(updatedUser) {
      this.currentUser = updatedUser;
    },
    handleToggleTheme() {
      const next = toggleTheme();
      this.isDark = next === "dark";
    },
    handleThemeEvent(e) {
      this.isDark = e.detail?.theme === "dark";
    },
    logOut() {
      this.dropdownOpen = false;
      AuthService.logout();
      this.$router.push("/login");
    },
  },
  created() {
    this.currentUser = AuthService.getCurrentUser();
    window.addEventListener("theme-change", this.handleThemeEvent);
  },
  mounted() {
    document.addEventListener("click", this.closeDropdown);
  },
  unmounted() {
    document.removeEventListener("click", this.closeDropdown);
    window.removeEventListener("theme-change", this.handleThemeEvent);
  },
};
</script>

<style scoped>
.btn-user-profile {
  background-color: transparent;
  transition: all 0.2s;
}

.btn-user-profile:hover,
.btn-user-profile[aria-expanded="true"] {
  background-color: var(--bs-body-bg);
}

.fs-7 { font-size: 0.85rem; }
.fs-8 { font-size: 0.75rem; }

.menu-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.dropdown-custom-item {
  font-size: 0.875rem;
  transition: all 0.15s ease;
  cursor: pointer;
}

.dropdown-custom-item:hover {
  background-color: var(--bs-body-bg);
  color: var(--bs-primary) !important;
}

/* Animations */
.admin-drop-enter-active,
.admin-drop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.admin-drop-enter-from,
.admin-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
