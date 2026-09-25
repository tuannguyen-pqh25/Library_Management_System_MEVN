<template>
  <div class="page-shell d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-5">
          <div class="card-surface p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-3" style="width: 54px; height: 54px;">
                <i class="fa-solid fa-book"></i>
              </div>
              <h2 class="fw-bold mb-1">Đăng nhập</h2>
              <p class="text-muted-custom mb-0">Chào mừng bạn quay lại thư viện</p>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label fw-semibold">Email</label>
                <input v-model="form.Email" type="email" class="form-control" placeholder="example@gmail.com" required />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Mật khẩu</label>
                <input v-model="form.MatKhau" type="password" class="form-control" placeholder="••••••••" required />
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 mb-3">{{ errorMessage }}</div>

              <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
              </button>
            </form>

            <div class="text-center small text-muted-custom">
              Chưa có tài khoản?
              <router-link class="text-decoration-none fw-semibold" to="/register">Đăng ký ngay</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service'

export default {
  name: 'LoginUser',
  data() {
    return {
      form: {
        Email: '',
        MatKhau: '',
      },
      errorMessage: '',
      loading: false,
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''
      this.loading = true

      try {
        await AuthService.login(this.form)
        this.$router.push('/sach')
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
