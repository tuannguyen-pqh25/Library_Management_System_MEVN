<template>
  <div class="container-fluid min-vh-100 d-flex flex-column flex-md-row p-0">
    <!-- Left column: Visuals/Texture -->
    <div class="col-12 col-md-5 col-lg-6 d-none d-md-flex align-items-center justify-content-center bg-primary text-white position-relative overflow-hidden">
      <!-- Background pattern -->
      <div class="position-absolute w-100 h-100 opacity-25" style="background-image: radial-gradient(#F6F1E7 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="z-1 text-center p-5">
        <h1 class="font-display fw-bold mb-3 display-4">Thư Viện Số</h1>
        <p class="font-body fs-5 opacity-75">Nền tảng quản lý mượn sách trực tuyến</p>
      </div>
    </div>

    <!-- Right column: Form -->
    <div class="col-12 col-md-7 col-lg-6 d-flex align-items-center justify-content-center bg-body p-4 p-sm-5">
      <div class="w-100" style="max-width: 400px;">
        <BaseCard class="border-0 shadow-none bg-transparent">
          <div class="text-center mb-5">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-white mb-3 shadow-sm" style="width: 60px; height: 60px;">
              <i class="fa-solid fa-book-open fs-3"></i>
            </div>
            <h2 class="font-display fw-bold mb-1">Đăng nhập</h2>
            <p class="text-muted-custom font-body">Chào mừng bạn quay lại thư viện</p>
          </div>

          <form @submit.prevent="handleLogin">
            <BaseInput
              v-model="form.Email"
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              required
            />

            <BaseInput
              v-model="form.Password"
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              required
            />

            <div v-if="errorMessage" class="alert alert-danger py-2 mb-3 font-body small">
              {{ errorMessage }}
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              block
              class="mt-4 mb-3 py-2 fs-5"
              :disabled="loading"
            >
              {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
            </BaseButton>
          </form>

          <!-- Divider: Hoặc đăng nhập bằng -->
          <div class="d-flex align-items-center my-4">
            <hr class="flex-grow-1 my-0 text-muted opacity-25" />
            <span class="px-3 text-muted-custom small font-body">hoặc tiếp tục với</span>
            <hr class="flex-grow-1 my-0 text-muted opacity-25" />
          </div>

          <!-- OAuth Social Login Buttons -->
          <div class="d-grid gap-2">
            <!-- Google Button -->
            <button
              type="button"
              class="btn btn-outline-secondary py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 fw-medium social-btn google-btn shadow-sm"
              @click="loginWithGoogle"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Đăng nhập với Google</span>
            </button>

            <!-- Facebook Button -->
            <button
              type="button"
              class="btn py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 fw-medium social-btn facebook-btn text-white shadow-sm"
              @click="loginWithFacebook"
            >
              <i class="fab fa-facebook-f text-white fs-6"></i>
              <span>Đăng nhập với Facebook</span>
            </button>
          </div>

          <div class="text-center small text-muted-custom font-body mt-4">
            Chưa có tài khoản?
            <router-link class="text-decoration-none fw-semibold text-warning" to="/register">Đăng ký ngay</router-link>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthService from '@/services/auth.service'
import eventBus from '@/services/eventBus'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()
const route = useRoute()

const form = reactive({
  Email: '',
  Password: '',
})

const errorMessage = ref('')
const loading = ref(false)

onMounted(() => {
  if (route.query.error) {
    errorMessage.value = decodeURIComponent(route.query.error)
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await AuthService.login(form)
    eventBus.emit('auth-change') // Báo AppHeader reload trạng thái đăng nhập
    router.push('/sach')
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = () => {
  window.location.href = 'http://localhost:3000/api/user/auth/google'
}

const loginWithFacebook = () => {
  window.location.href = 'http://localhost:3000/api/user/auth/facebook'
}
</script>

<style scoped>
.social-btn {
  transition: all 0.2s ease;
  font-size: 0.92rem;
}
.google-btn {
  background-color: #ffffff;
  border-color: #dadce0;
  color: #3c4043;
}
.google-btn:hover {
  background-color: #f8f9fa;
  border-color: #c6c9cc;
  color: #202124;
  transform: translateY(-1px);
}
.facebook-btn {
  background-color: #1877F2;
  border-color: #1877F2;
}
.facebook-btn:hover {
  background-color: #166fe5;
  border-color: #166fe5;
  color: #ffffff;
  transform: translateY(-1px);
}
</style>

