<template>
  <aside class="app-sidebar bg-white border-end d-flex flex-column h-100" style="width: 260px;">
    <!-- Brand -->
    <div class="sidebar-brand d-flex align-items-center gap-3 p-4 border-bottom">
      <div class="logo-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
        <i class="fas fa-book-open fs-5"></i>
      </div>
      <div class="d-flex flex-column">
        <span class="font-display fw-bold text-dark fs-5 lh-1">Thư viện <span class="text-accent">Số</span></span>
        <span class="text-muted-custom small" style="font-size: 0.75rem;">Admin Portal</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-grow-1 overflow-auto py-3">
      <ul class="nav flex-column px-3 gap-1">
        <li v-if="canBorrow" class="nav-item">
          <router-link to="/dashboard" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-chart-pie" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Dashboard</span>
          </router-link>
        </li>
        <li v-if="canBorrow" class="nav-item">
          <router-link to="/muonsach" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-clipboard-list" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Quản lý Mượn Sách</span>
          </router-link>
        </li>
        <li v-if="canManageBooks" class="nav-item">
          <router-link to="/sach" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-book" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Quản lý Sách</span>
          </router-link>
        </li>
        <li v-if="canManageBooks" class="nav-item">
          <router-link to="/nxb" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-building" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Quản lý NXB</span>
          </router-link>
        </li>
        <li v-if="isAdmin" class="nav-item">
          <router-link to="/nhanvien" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-users-cog" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Quản lý Nhân Viên</span>
          </router-link>
        </li>
        <li v-if="isAdmin" class="nav-item">
          <router-link to="/docgia" class="nav-link rounded-3 d-flex align-items-center gap-3 py-2 px-3" active-class="active">
            <i class="fas fa-user-graduate" style="width: 20px; text-align: center;"></i>
            <span class="fw-medium">Quản lý Độc Giả</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { BOOK_ROLES, BORROW_ROLES, ROLES, readAdminSession } from '@/services/adminRoles'

const role = readAdminSession()?.role
const canBorrow = BORROW_ROLES.includes(role)
const canManageBooks = BOOK_ROLES.includes(role)
const isAdmin = role === ROLES.admin
</script>

<style scoped>
.app-sidebar {
  transition: all 0.3s ease;
}

.nav-link {
  color: var(--bs-secondary);
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--bs-body-bg);
  color: var(--bs-primary);
}

.nav-link.active {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  font-weight: 600;
}

.nav-link i {
  font-size: 1.1rem;
}
</style>
