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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import eventBus from '@/services/eventBus'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const router = useRouter()

const form = reactive({
  Email: '',
  Password: '',
})

const errorMessage = ref('')
const loading = ref(false)

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
</script>
