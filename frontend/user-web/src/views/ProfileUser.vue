<template>
  <div class="page-shell">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card-surface p-4">
            <h3 class="fw-bold mb-3 text-dark">Hồ sơ cá nhân</h3>
            <div v-if="profile" class="mb-3">
              <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-2 shadow-sm" style="width: 72px; height: 72px; font-size: 1.5rem;">
                  <i class="fa-solid fa-user"></i>
                </div>
                <h4 class="mb-1 text-dark">{{ profile.HoLot || '' }} {{ profile.Ten || '' }}</h4>
                <p class="text-muted-custom mb-0">{{ profile.Email || 'Chưa cập nhật email' }}</p>
              </div>
            </div>

            <div class="text-muted-custom small">Mã độc giả: {{ profile?.MaDocGia || '—' }}</div>
          </div>

          <!-- TÙY CHỌN GIAO DIỆN SÁNG / TỐI -->
          <div class="card-surface p-4 mt-4">
            <h4 class="fw-bold mb-3 text-dark">
              <i class="fas fa-palette me-2 text-primary"></i>Giao diện hiển thị
            </h4>
            <p class="text-muted-custom small mb-3">Tùy chọn màu sắc giao diện phù hợp với môi trường sử dụng.</p>

            <div class="d-flex flex-column gap-2">
              <div
                class="p-3 border rounded-3 d-flex align-items-center justify-content-between transition-all"
                :class="{ 'border-primary bg-primary bg-opacity-10': !isDark }"
                style="cursor: pointer;"
                @click="setTheme('light')"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-circle bg-white p-2 text-warning d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
                    <i class="fas fa-sun"></i>
                  </div>
                  <div>
                    <div class="fw-semibold text-dark" style="font-size: 0.9rem;">Chế độ Sáng (Light)</div>
                    <small class="text-muted-custom">Tươi sáng, tối ưu ban ngày</small>
                  </div>
                </div>
                <i v-if="!isDark" class="fas fa-check-circle text-primary fs-5"></i>
              </div>

              <div
                class="p-3 border rounded-3 d-flex align-items-center justify-content-between transition-all"
                :class="{ 'border-primary bg-primary bg-opacity-10': isDark }"
                style="cursor: pointer;"
                @click="setTheme('dark')"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-circle bg-dark p-2 text-warning d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
                    <i class="fas fa-moon"></i>
                  </div>
                  <div>
                    <div class="fw-semibold text-dark" style="font-size: 0.9rem;">Chế độ Tối (Dark)</div>
                    <small class="text-muted-custom">Dịu mắt, tiết kiệm pin ban đêm</small>
                  </div>
                </div>
                <i v-if="isDark" class="fas fa-check-circle text-primary fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card-surface p-4">
            <h3 class="fw-bold mb-3">Thông tin cá nhân</h3>
            <form @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Họ lót</label>
                  <input v-model="form.HoLot" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tên</label>
                  <input v-model="form.Ten" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email</label>
                  <input v-model="form.Email" type="email" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Số điện thoại</label>
                  <input v-model="form.DienThoai" type="text" class="form-control" />
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
              </div>

              <div v-if="profileMessage" class="alert mt-3 mb-0 py-2" :class="profileMessageType === 'success' ? 'alert-success' : 'alert-danger'">
                {{ profileMessage }}
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>

          <div class="card-surface p-4 mt-4">
            <h3 class="fw-bold mb-3 text-dark">Đổi mật khẩu</h3>
            <form @submit.prevent="changePassword">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu hiện tại</label>
                  <div class="input-group">
                    <input
                      v-model="passwordForm.currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Nhập mật khẩu đang dùng"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="showCurrentPassword = !showCurrentPassword">
                      <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu mới</label>
                  <div class="input-group">
                    <input
                      v-model="passwordForm.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      minlength="6"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="showNewPassword = !showNewPassword">
                      <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="passwordMessage" class="alert mt-3 mb-0 py-2" :class="passwordMessageType === 'success' ? 'alert-success' : 'alert-danger'">
                {{ passwordMessage }}
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-outline-primary">
                  <i class="fas fa-key me-1"></i>Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileService from '@/services/profile.service'
import { getSavedTheme, applyTheme } from '@/services/theme.service'

export default {
  name: 'ProfileUser',
  data() {
    return {
      profile: null,
      form: {
        HoLot: '',
        Ten: '',
        Email: '',
        DiaChi: '',
        DienThoai: '',
        Phai: 'Nam',
        NgaySinh: '',
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
      },
      showCurrentPassword: false,
      showNewPassword: false,
      isDark: getSavedTheme() === 'dark',
      profileMessage: '',
      profileMessageType: 'success',
      passwordMessage: '',
      passwordMessageType: 'success',
    }
  },
  async created() {
    await this.loadProfile()
    window.addEventListener('theme-change', this.handleThemeEvent)
  },
  unmounted() {
    window.removeEventListener('theme-change', this.handleThemeEvent)
  },
  methods: {
    handleThemeEvent(e) {
      this.isDark = e.detail?.theme === 'dark'
    },
    setTheme(theme) {
      applyTheme(theme)
      this.isDark = theme === 'dark'
    },
    async loadProfile() {
      try {
        const response = await ProfileService.getProfile()
        this.profile = response.data || response || null

        if (this.profile) {
          this.form = {
            HoLot: this.profile.HoLot || '',
            Ten: this.profile.Ten || '',
            Email: this.profile.Email || '',
            DiaChi: this.profile.DiaChi || '',
            DienThoai: this.profile.DienThoai || '',
            Phai: this.profile.Phai || 'Nam',
            NgaySinh: this.profile.NgaySinh ? new Date(this.profile.NgaySinh).toISOString().slice(0, 10) : '',
          }
        }
      } catch (error) {
        console.error('Không thể tải hồ sơ:', error)
      }
    },
    async saveProfile() {
      try {
        await ProfileService.updateProfile(this.form)
        this.profileMessage = 'Cập nhật hồ sơ thành công.'
        this.profileMessageType = 'success'
        await this.loadProfile()
      } catch (error) {
        this.profileMessage = error?.response?.data?.message || 'Cập nhật hồ sơ thất bại.'
        this.profileMessageType = 'error'
      }
    },
    async changePassword() {
      try {
        await ProfileService.changePassword(this.passwordForm)
        this.passwordMessage = 'Đổi mật khẩu thành công.'
        this.passwordMessageType = 'success'
        this.passwordForm = { currentPassword: '', newPassword: '' }
      } catch (error) {
        this.passwordMessage = error?.response?.data?.message || 'Đổi mật khẩu thất bại.'
        this.passwordMessageType = 'error'
      }
    },
  },
}
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease;
}
.transition-all:hover {
  transform: translateY(-2px);
}
</style>
