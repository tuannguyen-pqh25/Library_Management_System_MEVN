<template>
  <header class="app-header bg-white border-bottom shadow-sm sticky-top">
    <div class="container h-100">
      <div class="d-flex align-items-center justify-content-between h-100 py-2">

        <!-- BRAND / LOGO -->
        <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2 flex-shrink-0">
          <div class="brand-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="d-flex flex-column d-none d-sm-flex">
            <span class="font-display fw-bold text-dark fs-5 lh-1">Thư viện <span class="text-accent">Số</span></span>
            <span class="text-muted-custom" style="font-size: 0.68rem; letter-spacing: 0.5px;">Dành cho độc giả</span>
          </div>
        </router-link>

        <!-- NAVIGATION — desktop -->
        <nav class="d-none d-lg-flex align-items-center gap-1 mx-3 flex-grow-1 justify-content-center">
          <router-link to="/" class="nav-item-link rounded-pill" active-class="active" exact>
            <i class="fas fa-home me-1"></i> Trang chủ
          </router-link>
          <router-link to="/sach" class="nav-item-link rounded-pill" active-class="active">
            <i class="fas fa-book me-1"></i> Khám phá Sách
          </router-link>
          <router-link v-if="currentUser" to="/yeuthich" class="nav-item-link rounded-pill" active-class="active">
            <i class="fas fa-heart me-1 text-danger"></i> Yêu thích
            <span v-if="wishlistCount > 0" class="badge bg-danger rounded-pill ms-1" style="font-size:0.6rem;">
              {{ wishlistCount > 99 ? '99+' : wishlistCount }}
            </span>
          </router-link>
          <router-link v-if="currentUser" to="/gio-muon" class="nav-item-link rounded-pill" active-class="active">
            <i class="fas fa-shopping-basket me-1 text-primary"></i> Giỏ mượn
            <span v-if="cartCount > 0" class="badge bg-primary rounded-pill ms-1" style="font-size:0.6rem;">
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </router-link>
        </nav>

        <!-- USER ACTIONS + Hamburger -->
        <div class="d-flex align-items-center gap-2">

          <!-- NOTIFICATION BELL -->
          <div v-if="currentUser" class="notif-wrapper" ref="notifWrapperRef">
            <button
              id="notif-bell-btn"
              class="btn btn-light rounded-circle d-flex align-items-center justify-content-center position-relative notif-bell-btn"
              style="width:38px;height:38px;"
              :class="{ 'notif-has-alert': notifCount > 0 }"
              title="Thông báo mượn trả"
              @click.stop="toggleNotifDropdown"
              :aria-expanded="notifDropdownOpen"
            >
              <i class="fas fa-bell" :class="notifCount > 0 ? 'text-warning' : 'text-secondary'"></i>
              <span
                v-if="notifCount > 0"
                class="notif-badge position-absolute"
              >
                {{ notifCount > 9 ? '9+' : notifCount }}
              </span>
            </button>

            <!-- Notification dropdown panel -->
            <transition name="notif-drop">
              <div v-if="notifDropdownOpen" class="notif-dropdown shadow-lg" id="notif-dropdown-panel">
                <!-- Header -->
                <div class="notif-header d-flex align-items-center justify-content-between px-3 py-2">
                  <span class="fw-bold text-dark" style="font-size:0.92rem;">
                    <i class="fas fa-bell me-2 text-warning"></i>Thông báo mượn trả
                  </span>
                  <span v-if="notifCount > 0" class="badge rounded-pill" style="background:#ef4444;font-size:0.7rem;">{{ notifCount }}</span>
                </div>
                <div class="notif-divider"></div>

                <!-- Loading -->
                <div v-if="notifLoading" class="notif-empty py-4 text-center">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <p class="mb-0 mt-2 text-muted" style="font-size:0.82rem;">Đang tải...</p>
                </div>

                <!-- Empty state -->
                <div v-else-if="notifications.length === 0" class="notif-empty py-4 text-center px-3">
                  <div class="notif-empty-icon mb-2">
                    <i class="fas fa-check-circle text-success" style="font-size:2rem;"></i>
                  </div>
                  <p class="mb-0 fw-semibold text-dark" style="font-size:0.875rem;">Tất cả ổn!</p>
                  <p class="mb-0 text-muted" style="font-size:0.78rem;">Bạn không có sách nào sắp đến hạn trả.</p>
                </div>

                <!-- Notification list -->
                <ul v-else class="notif-list mb-0 ps-0">
                  <li
                    v-for="item in notifications"
                    :key="item._id"
                    class="notif-item d-flex align-items-start gap-3"
                    @click="goToHistory"
                    role="button"
                    :title="item.trangThai === 'quá hạn' || item.daysLeft < 0 ? 'Bấm để xem và xin trả sách' : 'Bấm để xem lịch sử'"
                  >
                    <!-- Book thumbnail -->
                    <div class="notif-thumb flex-shrink-0">
                      <img
                        v-if="item.sachInfo && item.sachInfo.HinhAnh"
                        :src="item.sachInfo.HinhAnh"
                        :alt="item.sachInfo.TenSach"
                        class="notif-thumb-img"
                        @error="e => e.target.style.display='none'"
                      />
                      <div v-else class="notif-thumb-placeholder">
                        <i class="fas fa-book text-white"></i>
                      </div>
                    </div>

                    <!-- Info -->
                    <div class="min-w-0 flex-grow-1">
                      <p class="mb-0 fw-semibold text-dark text-truncate" style="font-size:0.82rem;">
                        {{ item.sachInfo ? item.sachInfo.TenSach : 'Sách đã mượn' }}
                      </p>
                      <p class="mb-1 text-muted" style="font-size:0.75rem;">
                        Số lượng: {{ item.soLuong || 1 }} quyển
                      </p>
                      <!-- Alert label -->
                      <span
                        v-if="item.alertType === 'overdue'"
                        class="notif-chip chip-overdue"
                      >
                        <i class="fas fa-exclamation-circle me-1"></i>
                        Quá hạn {{ item.daysLeft < 0 ? Math.abs(item.daysLeft) + ' ngày' : '' }}
                      </span>
                      <span
                        v-else-if="item.alertType === 'soon'"
                        class="notif-chip chip-soon"
                      >
                        <i class="fas fa-clock me-1"></i>
                        {{ item.daysLeft === 0 ? 'Hết hạn hôm nay' : 'Hết hạn sau ' + item.daysLeft + ' ngày' }}
                      </span>
                    </div>
                  </li>
                </ul>

                <!-- Footer -->
                <div class="notif-divider"></div>
                <div class="text-center py-2">
                  <button class="btn btn-sm btn-link text-primary fw-semibold text-decoration-none" style="font-size:0.8rem;" @click="goToHistory">
                    <i class="fas fa-history me-1"></i>Xem toàn bộ lịch sử mượn
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Heart icon — only on medium screens (wishlist shortcut) -->
          <router-link
            v-if="currentUser"
            to="/yeuthich"
            class="btn btn-light rounded-circle d-flex align-items-center justify-content-center d-lg-none position-relative p-0"
            style="width:38px;height:38px;"
            title="Yêu thích"
          >
            <i class="fas fa-heart text-danger"></i>
            <span
              v-if="wishlistCount > 0"
              class="badge bg-danger rounded-pill position-absolute"
              style="top:-4px;right:-4px;font-size:0.55rem;min-width:16px;padding:2px 4px;"
            >
              {{ wishlistCount > 9 ? '9+' : wishlistCount }}
            </span>
          </router-link>

          <!-- Auth user dropdown -->
          <template v-if="currentUser">
            <div class="dropdown user-dropdown-container">
              <button
                class="btn btn-user-profile d-flex align-items-center gap-2 rounded-pill ps-1 pe-3 py-1 border-0"
                type="button"
                id="userDropdown"
                @click="userDropdownOpen = !userDropdownOpen"
                :aria-expanded="userDropdownOpen"
              >
                <div class="user-avatar bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                  {{ userInitial }}
                </div>
                <div class="text-start ms-1 d-none d-sm-block">
                  <div class="fw-bold text-dark lh-1" style="font-size:0.85rem;">{{ displayName }}</div>
                  <div class="text-muted-custom lh-1 mt-1" style="font-size:0.72rem;">Độc giả</div>
                </div>
                <i class="fas fa-chevron-down text-muted-custom ms-1 d-none d-sm-block" style="font-size:0.7rem;"></i>
              </button>

              <ul class="dropdown-menu dropdown-menu-end shadow-lg border border-light rounded-4 mt-3 p-2 user-dropdown bg-white" :class="{ show: userDropdownOpen }" aria-labelledby="userDropdown">
                <!-- User info card inside dropdown -->
                <li class="px-3 pt-2 pb-3 mb-2 border-bottom">
                  <div class="d-flex align-items-center gap-3">
                    <div class="user-avatar-lg bg-primary bg-gradient text-white fw-bold d-flex align-items-center justify-content-center rounded-circle shadow-sm">
                      {{ userInitial }}
                    </div>
                    <div class="min-w-0">
                      <div class="fw-bold text-dark text-truncate" style="font-size:1rem;">{{ displayName }}</div>
                      <div class="text-muted-custom text-truncate" style="font-size:0.8rem;">Độc giả thư viện</div>
                    </div>
                  </div>
                </li>

                <li>
                  <router-link class="dropdown-item rounded-3 py-2 mb-1 d-flex align-items-center gap-3 fw-medium text-secondary" to="/profile" active-class="active text-primary">
                    <span class="menu-icon bg-primary bg-opacity-10 text-primary"><i class="fas fa-user"></i></span>
                    Tài khoản của tôi
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item rounded-3 py-2 mb-1 d-flex align-items-center gap-3 fw-medium text-secondary" to="/lich-su" active-class="active text-info">
                    <span class="menu-icon bg-info bg-opacity-10 text-info"><i class="fas fa-history"></i></span>
                    Lịch sử mượn
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item rounded-3 py-2 mb-1 d-flex align-items-center gap-3 fw-medium text-secondary" to="/gio-muon" active-class="active text-primary">
                    <span class="menu-icon bg-primary bg-opacity-10 text-primary"><i class="fas fa-shopping-basket"></i></span>
                    Giỏ mượn
                    <span v-if="cartCount > 0" class="badge bg-primary ms-auto rounded-pill shadow-sm">{{ cartCount }}</span>
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item rounded-3 py-2 mb-2 d-flex align-items-center gap-3 fw-medium text-secondary" to="/yeuthich" active-class="active text-danger">
                    <span class="menu-icon bg-danger bg-opacity-10 text-danger"><i class="fas fa-heart"></i></span>
                    Sách yêu thích
                    <span v-if="wishlistCount > 0" class="badge bg-danger ms-auto rounded-pill shadow-sm">{{ wishlistCount }}</span>
                  </router-link>
                </li>
                <li><div class="dropdown-divider my-2 opacity-25"></div></li>
                <li>
                  <button class="dropdown-item rounded-3 py-2 text-danger fw-bold d-flex align-items-center gap-3 mt-1" @click="handleLogout">
                    <span class="menu-icon bg-danger bg-opacity-10 text-danger"><i class="fas fa-sign-out-alt"></i></span>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </template>

          <!-- Guest buttons -->
          <template v-else>
            <router-link to="/register" class="btn btn-light text-primary fw-bold rounded-pill px-3 hover-scale d-none d-sm-inline-flex gap-1 align-items-center">
              <i class="fas fa-user-plus"></i> Đăng ký
            </router-link>
            <router-link to="/login" class="btn btn-primary fw-bold rounded-pill px-4 shadow-sm hover-scale d-flex align-items-center gap-1">
              <i class="fas fa-sign-in-alt"></i> <span class="d-none d-sm-inline">Đăng nhập</span>
            </router-link>
          </template>

          <!-- Hamburger — mobile -->
          <button
            class="btn btn-light rounded-3 d-lg-none p-2 border-0"
            type="button"
            @click="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle menu"
          >
            <i class="fas" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <transition name="slide-down">
        <nav v-if="mobileMenuOpen" class="mobile-nav d-lg-none pb-3">
          <router-link to="/" class="mobile-nav-item" active-class="active" exact @click="mobileMenuOpen = false">
            <i class="fas fa-home me-2"></i> Trang chủ
          </router-link>
          <router-link to="/sach" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">
            <i class="fas fa-book me-2"></i> Khám phá Sách
          </router-link>
          <template v-if="currentUser">
            <router-link to="/yeuthich" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">
              <i class="fas fa-heart me-2 text-danger"></i> Yêu thích
              <span v-if="wishlistCount > 0" class="badge bg-danger rounded-pill ms-1">{{ wishlistCount }}</span>
            </router-link>
            <router-link to="/gio-muon" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">
              <i class="fas fa-shopping-basket me-2 text-primary"></i> Giỏ mượn
              <span v-if="cartCount > 0" class="badge bg-primary rounded-pill ms-1">{{ cartCount }}</span>
            </router-link>
            <router-link to="/lich-su" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">
              <i class="fas fa-history me-2 text-info"></i> Lịch sử mượn
            </router-link>
            <router-link to="/profile" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">
              <i class="fas fa-user-circle me-2 text-primary"></i> Tài khoản
            </router-link>
            <button class="mobile-nav-item text-danger border-0 bg-transparent w-100 text-start" @click="handleLogout">
              <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
            </button>
          </template>
          <template v-else>
            <router-link to="/register" class="mobile-nav-item" @click="mobileMenuOpen = false">
              <i class="fas fa-user-plus me-2"></i> Đăng ký
            </router-link>
            <router-link to="/login" class="mobile-nav-item text-primary fw-semibold" @click="mobileMenuOpen = false">
              <i class="fas fa-sign-in-alt me-2"></i> Đăng nhập
            </router-link>
          </template>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script>
import AuthService from '@/services/auth.service'
import YeuThichService from '@/services/yeuthich.service'
import CartService from '@/services/cart.service'
import MuonSachService from '@/services/muonsach.service'
import eventBus from '@/services/eventBus'

export default {
  name: 'AppHeader',
  data() {
    return {
      currentUser: null,
      wishlistCount: 0,
      cartCount: 0,
      mobileMenuOpen: false,
      userDropdownOpen: false,
      // Notification bell
      notifications: [],
      notifDropdownOpen: false,
      notifLoading: false,
      _notifTimer: null,
    }
  },
  computed: {
    notifCount() {
      return this.notifications.length
    },
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
      this.currentUser = AuthService.getCurrentUser()
      if (this.currentUser) {
        this.fetchWishlistCount()
        this.fetchNotifications()
      } else {
        this.wishlistCount = 0
        this.notifications = []
      }
    },
    async fetchWishlistCount() {
      try {
        const res = await YeuThichService.getMyWishlist()
        this.wishlistCount = Array.isArray(res.data) ? res.data.length : 0
      } catch (_) {
        this.wishlistCount = 0
      }
    },
    async fetchNotifications() {
      if (!this.currentUser) return
      this.notifLoading = true
      try {
        this.notifications = await MuonSachService.getNotifications()
      } catch (_) {
        this.notifications = []
      } finally {
        this.notifLoading = false
      }
    },
    toggleNotifDropdown() {
      this.notifDropdownOpen = !this.notifDropdownOpen
      if (this.notifDropdownOpen) {
        this.userDropdownOpen = false
        // Refresh data mỗi lần mở
        this.fetchNotifications()
      }
    },
    goToHistory() {
      this.notifDropdownOpen = false
      this.$router.push('/lich-su')
    },
    fetchCartCount() {
      this.cartCount = CartService.getCart().length
    },
    handleLogout() {
      AuthService.logout()
      this.currentUser = null
      this.wishlistCount = 0
      this.notifications = []
      this.mobileMenuOpen = false
      this.userDropdownOpen = false
      this.notifDropdownOpen = false
      this.$router.push('/login')
    },
    closeDropdown(e) {
      if (this.userDropdownOpen) {
        const container = this.$el.querySelector('.user-dropdown-container')
        if (container && !container.contains(e.target)) {
          this.userDropdownOpen = false
        }
      }
      if (this.notifDropdownOpen) {
        const wrapper = this.$refs.notifWrapperRef
        if (wrapper && !wrapper.contains(e.target)) {
          this.notifDropdownOpen = false
        }
      }
    }
  },
  created() {
    this.updateUser()
    this.fetchCartCount()
    eventBus.on('auth-change', this.updateUser)
    eventBus.on('wishlist-change', this.fetchWishlistCount)
    window.addEventListener('cart-updated', this.fetchCartCount)
    // Auto-refresh thông báo mỗi 5 phút
    this._notifTimer = setInterval(() => {
      if (this.currentUser) this.fetchNotifications()
    }, 5 * 60 * 1000)
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown)
  },
  unmounted() {
    document.removeEventListener('click', this.closeDropdown)
    eventBus.off('auth-change', this.updateUser)
    eventBus.off('wishlist-change', this.fetchWishlistCount)
    window.removeEventListener('cart-updated', this.fetchCartCount)
    if (this._notifTimer) clearInterval(this._notifTimer)
  }
}
</script>

<style scoped>
.app-header {
  z-index: 1031;
  min-height: 64px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.text-accent {
  color: #f59e0b;
}

/* Nav links */
.nav-item-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.92rem;
  padding: 7px 16px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.nav-item-link:hover {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.06);
}
.nav-item-link.active {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
  font-weight: 600;
}

/* User avatar */
.user-avatar {
  width: 34px; height: 34px;
  font-size: 0.9rem;
}
.user-avatar-lg {
  width: 40px; height: 40px;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Profile button */
.btn-user-profile {
  background-color: transparent;
  transition: all 0.2s;
}
.btn-user-profile:hover,
.btn-user-profile[aria-expanded="true"] {
  background-color: #f8f9fa;
}

/* Dropdown */
.user-dropdown-container {
  position: relative;
}
.user-dropdown {
  min-width: 260px;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: none;
}
.user-dropdown.show {
  display: block;
  animation: dropdownFade 0.2s ease;
}
@keyframes dropdownFade {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-item {
  font-size: 0.875rem;
  transition: all 0.15s;
}
.dropdown-item:hover {
  background-color: #f8f9fa;
}
.dropdown-item:active, .dropdown-item.active {
  background-color: rgba(13, 110, 253, 0.08) !important;
  color: #0d6efd !important;
  font-weight: 600;
}
.dropdown-item.active .text-secondary {
  color: inherit !important;
}
.dropdown-item.text-danger:active, .dropdown-item.active.text-danger {
  background-color: rgba(220, 53, 69, 0.08) !important;
  color: #dc3545 !important;
}
.dropdown-item.text-info:active, .dropdown-item.active.text-info {
  background-color: rgba(13, 202, 240, 0.08) !important;
  color: #0dcaf0 !important;
}
.menu-icon {
  width: 34px; height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.dropdown-item:hover .menu-icon {
  transform: scale(1.1);
}

/* Hover scale */
.hover-scale { transition: transform 0.2s; }
.hover-scale:hover { transform: scale(1.04); }

/* Mobile nav */
.mobile-nav {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.mobile-nav-item:hover,
.mobile-nav-item.active {
  background: rgba(13, 110, 253, 0.07);
  color: #0d6efd;
}
.mobile-nav-item.text-danger:hover {
  background: #fff0f0;
}

/* Slide transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ============================================
   NOTIFICATION BELL
   ============================================ */
.notif-wrapper {
  position: relative;
}

/* Rung nhẹ khi có alert */
.notif-bell-btn.notif-has-alert {
  animation: bellShake 0.5s ease 0.3s 2;
}
@keyframes bellShake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-12deg); }
  40% { transform: rotate(10deg); }
  60% { transform: rotate(-8deg); }
  80% { transform: rotate(6deg); }
}

.notif-badge {
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 0.52rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
  line-height: 1;
  animation: popIn 0.3s ease;
}
@keyframes popIn {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

/* Dropdown panel */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 330px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.07);
  z-index: 9999;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07);
}

.notif-header {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-bottom: none;
}

.notif-divider {
  height: 1px;
  background: #f0f0f0;
}

.notif-empty {
  padding: 20px;
}

/* List */
.notif-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}
.notif-list::-webkit-scrollbar { width: 4px; }
.notif-list::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

.notif-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}
.notif-item:last-child {
  border-bottom: none;
}
.notif-item:hover {
  background: #fafafa;
}

/* Thumbnail */
.notif-thumb {
  width: 42px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notif-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.notif-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-size: 1rem;
}

/* Chips */
.notif-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  line-height: 1.4;
}
.chip-overdue {
  background: #fee2e2;
  color: #dc2626;
}
.chip-soon {
  background: #fef3c7;
  color: #d97706;
}

/* Dropdown transition */
.notif-drop-enter-active,
.notif-drop-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notif-drop-enter-from,
.notif-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
