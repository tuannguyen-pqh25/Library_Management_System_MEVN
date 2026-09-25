<template>
  <div class="page-shell d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-7">
          <div class="card-surface p-4 p-md-5">
            <div class="text-center mb-4">
              <h2 class="fw-bold mb-1">Đăng ký tài khoản</h2>
              <p class="text-muted-custom mb-0">Tạo tài khoản độc giả để mượn sách và quản lý hồ sơ</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email</label>
                  <input v-model="form.Email" type="email" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu</label>
                  <input v-model="form.MatKhau" type="password" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Họ lót</label>
                  <input v-model="form.HoLot" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên</label>
                  <input v-model="form.Ten" type="text" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Ngày sinh</label>
                  <input v-model="form.NgaySinh" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Giới tính</label>
                  <select v-model="form.Phai" class="form-select">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Địa chỉ</label>
                  <input v-model="form.DiaChi" type="text" class="form-control" />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Số điện thoại</label>
                  <input v-model="form.DienThoai" type="text" class="form-control" />
                </div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger py-2 mt-3 mb-3">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success py-2 mt-3 mb-3">{{ successMessage }}</div>

              <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="loading">
                {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service'

export default {
  name: 'RegisterUser',
  data() {
    return {
      form: {
        Email: '',
        MatKhau: '',
        HoLot: '',
        Ten: '',
        NgaySinh: '',
        Phai: 'Nam',
        DiaChi: '',
        DienThoai: '',
      },
      loading: false,
      errorMessage: '',
      successMessage: '',
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        await AuthService.register(this.form)
        this.successMessage = 'Đăng ký thành công. Bạn có thể đăng nhập ngay.'
        setTimeout(() => this.$router.push('/login'), 800)
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'Đăng ký thất bại.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
