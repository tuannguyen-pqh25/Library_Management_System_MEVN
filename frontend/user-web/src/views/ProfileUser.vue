<template>
  <div class="page-shell">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card-surface p-4 h-100">
            <h3 class="fw-bold mb-3">Hồ sơ cá nhân</h3>
            <div v-if="profile" class="mb-3">
              <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-2" style="width: 72px; height: 72px; font-size: 1.5rem;">
                  <i class="fa-solid fa-user"></i>
                </div>
                <h4 class="mb-1">{{ profile.HoLot || '' }} {{ profile.Ten || '' }}</h4>
                <p class="text-muted-custom mb-0">{{ profile.Email || 'Chưa cập nhật email' }}</p>
              </div>
            </div>

            <div class="text-muted-custom small">Mã độc giả: {{ profile?.MaDocGia || '—' }}</div>
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
            <h3 class="fw-bold mb-3">Đổi mật khẩu</h3>
            <form @submit.prevent="changePassword">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu hiện tại</label>
                  <input v-model="passwordForm.currentPassword" type="password" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Mật khẩu mới</label>
                  <input v-model="passwordForm.newPassword" type="password" class="form-control" required />
                </div>
              </div>

              <div v-if="passwordMessage" class="alert mt-3 mb-0 py-2" :class="passwordMessageType === 'success' ? 'alert-success' : 'alert-danger'">
                {{ passwordMessage }}
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-outline-primary">Đổi mật khẩu</button>
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
      profileMessage: '',
      profileMessageType: 'success',
      passwordMessage: '',
      passwordMessageType: 'success',
    }
  },
  async created() {
    await this.loadProfile()
  },
  methods: {
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
