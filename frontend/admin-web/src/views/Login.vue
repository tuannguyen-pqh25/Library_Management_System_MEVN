<template>
  <div class="container-fluid min-vh-100 d-flex flex-column flex-md-row p-0">
    <!-- Toast Messages -->
    <div
      v-if="successMessage"
      class="toast-animated toast-success position-fixed top-0 end-0 p-3 m-3 bg-success text-white rounded shadow"
      style="z-index: 1050"
    >
      <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="toast-animated toast-error position-fixed top-0 end-0 p-3 m-3 bg-danger text-white rounded shadow"
      style="z-index: 1050"
    >
      <i class="fas fa-exclamation-triangle me-2"></i>{{ errorMessage }}
    </div>

    <!-- Left Texture Panel -->
    <div class="col-12 col-md-5 col-lg-6 d-none d-md-flex align-items-center justify-content-center position-relative overflow-hidden">
      <!-- Background image -->
      <div class="position-absolute w-100 h-100" style="background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center; filter: blur(2px) brightness(0.8);"></div>
      <!-- Overlay gradient -->
      <div class="position-absolute w-100 h-100" style="background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.9) 0%, rgba(var(--bs-primary-rgb), 0.7) 100%); mix-blend-mode: multiply;"></div>
      <!-- Additional overlay for readability -->
      <div class="position-absolute w-100 h-100" style="background-color: rgba(0,0,0,0.2);"></div>
      
      <div class="z-1 text-center p-5 d-flex flex-column justify-content-center align-items-center h-100 text-white">
        <div class="d-inline-flex align-items-center gap-2 mb-4">
          <div class="d-flex align-items-center justify-content-center bg-white text-primary rounded font-display fw-bold shadow-sm" style="width: 32px; height: 32px; font-size: 0.85rem">
            Λ
          </div>
          <span class="text-white small fw-medium font-display fs-6">Admin</span>
        </div>

        <h1 class="font-display fw-bold mb-3 display-4">Hệ Thống Quản Trị</h1>
        <p class="font-body fs-5 opacity-75 mb-5" style="max-width: 80%">Cổng thông tin quản trị an toàn dành cho nhân viên thư viện và ban quản lý.</p>

        <div class="d-flex flex-column gap-3 align-items-start">
          <div v-for="f in ['Quản lý danh mục sách', 'Quản lý mượn trả', 'Tài khoản độc giả', 'Quản lý nhân viên', 'Thống kê & Báo cáo']" :key="f" class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-warning" style="width: 8px; height: 8px"></div>
            <span class="text-white font-data small">{{ f }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Login Form -->
    <div class="col-12 col-md-7 col-lg-6 d-flex align-items-center justify-content-center bg-body p-4 p-sm-5 py-5 overflow-auto">
      <div class="w-100" style="max-width: 440px">
        <BaseCard class="border-0 shadow-none bg-transparent">
          <div class="d-inline-flex align-items-center gap-1 px-2 py-1 rounded font-data mb-3 bg-warning text-white shadow-sm" style="font-size: 0.75rem; font-weight: 600;">
            <i class="fa-solid fa-lock" style="font-size: 10px"></i> RESTRICTED ACCESS
          </div>

          <h1 class="fs-3 fw-bold mt-1 mb-2 text-dark font-display">Đăng nhập quản trị</h1>
          <p class="text-muted-custom mb-4 font-body fs-6">Vui lòng nhập thông tin tài khoản nhân viên.</p>

          <form @submit.prevent="handleUnifiedLogin">
            <BaseInput
              v-model="form.identifier"
              label="Staff Email / MSNV"
              type="text"
              placeholder="Ví dụ: ADMIN001"
              required
            />

            <div class="position-relative">
              <div class="d-flex justify-content-between align-items-center mb-0">
                <!-- Label handled by BaseInput or custom -->
              </div>
              <BaseInput
                v-model="form.password"
                label="Mật khẩu"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                class="btn position-absolute border-0 shadow-none text-muted px-3"
                style="top: 36px; right: 0;"
                @click="showPassword = !showPassword"
                v-if="form.password"
              >
                <i :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
              </button>
            </div>

            <div class="text-end mb-4 mt-n2">
              <a href="#" @click.prevent="showForgotPasswordAlert" class="text-warning text-decoration-none small fw-medium font-body">Quên mật khẩu?</a>
            </div>

            <BaseButton type="submit" variant="primary" block class="py-2 fs-5" :disabled="loading">
              {{ loading ? 'Đang xác thực...' : 'Truy cập hệ thống' }}
            </BaseButton>
          </form>

          <div class="mt-4 pt-4 border-top text-center">
            <a href="http://localhost:5173" class="text-decoration-none small fw-semibold font-body text-muted-custom">
              &larr; Quay lại Cổng độc giả
            </a>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import eventBus from '@/services/eventBus'
import { defaultAdminPath, readAdminSession } from '@/services/adminRoles'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()

const form = reactive({
  identifier: '',
  password: '',
})

const loading = ref(false)
const showPassword = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleUnifiedLogin = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const loggedInUser = await AuthService.loginNhanVien({
      MSNV: form.identifier.trim(),
      password: form.password,
    })

    eventBus.emit('auth-change')
    successMessage.value = 'Đăng nhập thành công! Xin chào ' + loggedInUser.HoTenNV

    setTimeout(() => {
      router.push(defaultAdminPath(readAdminSession()?.role))
    }, 700)
  } catch (error) {
    if (error.response?.status === 423) {
      const retryAfter = error.response.data.retryAfter
      errorMessage.value = retryAfter
        ? `Tài khoản đã bị khóa. Thử lại sau ${Math.ceil(retryAfter / 60)} phút.`
        : 'Tài khoản đã bị khóa trong 15 phút.'
    } else {
      errorMessage.value = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    }
  } finally {
    loading.value = false
  }
}

const showForgotPasswordAlert = () => {
  alert('Tính năng đang phát triển!')
}
</script>

<style scoped>
/* Toast animations */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    transform: translateX(50px);
    opacity: 0;
  }
}
.toast-animated {
  animation: slideInFromRight 0.5s ease-out, fadeOut 0.5s ease-in 3s forwards;
}
</style>
