<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
    <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center" style="max-width: 480px; width: 100%;">
      <!-- Trạng thái Đang xử lý / Thành công -->
      <div v-if="status === 'processing' || status === 'success'">
        <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 position-relative"
             :class="status === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'"
             style="width: 80px; height: 80px;">
          <i v-if="status === 'success'" class="fas fa-check-circle fa-3x"></i>
          <div v-else class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <h3 class="font-display fw-bold mb-2">
          {{ status === 'success' ? 'Đăng nhập thành công!' : 'Đang xác thực tài khoản...' }}
        </h3>
        <p class="text-muted font-body mb-4">
          {{ status === 'success'
              ? 'Chào mừng bạn quay lại thư viện. Hệ thống đang chuyển hướng...'
              : 'Vui lòng chờ trong giây lát, hệ thống đang đồng bộ dữ liệu ủy quyền...'
          }}
        </p>

        <div class="progress rounded-pill overflow-hidden" style="height: 6px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary"
               :class="{ 'bg-success': status === 'success' }"
               role="progressbar"
               :style="{ width: progressWidth + '%' }">
          </div>
        </div>
      </div>

      <!-- Trạng thái Lỗi -->
      <div v-else-if="status === 'error'">
        <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-4"
             style="width: 80px; height: 80px;">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </div>

        <h3 class="font-display fw-bold text-danger mb-2">Đăng nhập thất bại</h3>
        <p class="text-muted font-body mb-4">
          {{ errorMessage || 'Không thể xác thực thông tin ủy quyền. Vui lòng thử lại sau.' }}
        </p>

        <div class="d-flex flex-column gap-2">
          <router-link to="/login" class="btn btn-primary rounded-pill py-2 fw-semibold">
            <i class="fas fa-arrow-left me-2"></i> Quay lại trang Đăng nhập
          </router-link>
          <router-link to="/" class="btn btn-light rounded-pill py-2 text-secondary">
            Về trang chủ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/services/http-common'
import eventBus from '@/services/eventBus'

const route = useRoute()
const router = useRouter()

const status = ref('processing') // 'processing' | 'success' | 'error'
const errorMessage = ref('')
const progressWidth = ref(40)

onMounted(async () => {
  const token = route.query.token
  const error = route.query.error

  if (error) {
    status.value = 'error'
    errorMessage.value = decodeURIComponent(error)
    return
  }

  if (!token) {
    status.value = 'error'
    errorMessage.value = 'Mã phiên xác thực (token) không hợp lệ hoặc đã hết hạn.'
    return
  }

  try {
    progressWidth.value = 75
    // Lưu token vào localStorage
    localStorage.setItem('token', token)

    // Lấy thông tin cá nhân của Độc giả
    const response = await http.get('/user/profile')
    const user = response.data || null

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }

    progressWidth.value = 100
    status.value = 'success'
    eventBus.emit('auth-change') // Cập nhật Header ngay lập tức

    // Chuyển hướng sau 800ms
    setTimeout(() => {
      router.push('/sach')
    }, 800)
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err?.response?.data?.message || err?.message || 'Lỗi khi tải thông tin độc giả sau đăng nhập.'
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
})
</script>

<style scoped>
.font-display {
  font-family: inherit;
}
</style>
