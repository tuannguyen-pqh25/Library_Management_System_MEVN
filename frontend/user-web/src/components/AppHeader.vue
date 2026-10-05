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
      this.currentUser = AuthService.getCurrentUser()
      if (this.currentUser) {
        this.fetchWishlistCount()
      } else {
        this.wishlistCount = 0
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
    fetchCartCount() {
      this.cartCount = CartService.getCart().length
    },
    handleLogout() {
      AuthService.logout()
      this.currentUser = null
      this.wishlistCount = 0
      this.mobileMenuOpen = false
      this.userDropdownOpen = false
      this.$router.push('/login')
    },
    closeDropdown(e) {
      if (this.userDropdownOpen) {
        const container = this.$el.querySelector('.user-dropdown-container')
        if (container && !container.contains(e.target)) {
          this.userDropdownOpen = false
        }
      }
    }
  },
  created() {
    this.updateUser()
    this.fetchCartCount()
    eventBus.on('auth-change', this.updateUser)
    // Refresh wishlist count khi thay đổi
    eventBus.on('wishlist-change', this.fetchWishlistCount)
    window.addEventListener('cart-updated', this.fetchCartCount)
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown)
  },
  unmounted() {
    document.removeEventListener('click', this.closeDropdown)
    eventBus.off('auth-change', this.updateUser)
    eventBus.off('wishlist-change', this.fetchWishlistCount)
    window.removeEventListener('cart-updated', this.fetchCartCount)
  }
}
</script>

<style scoped>
.app-header {
  z-index: 1030;
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
</style>
