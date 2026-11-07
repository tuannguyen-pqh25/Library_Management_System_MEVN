<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6); z-index: 1055;" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        
        <!-- Header -->
        <div class="modal-header border-bottom px-4 py-3 bg-body">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 44px; height: 44px; font-size: 1.1rem;">
              {{ initial }}
            </div>
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0">Hồ sơ cá nhân</h5>
              <div class="d-flex align-items-center gap-2 mt-1">
                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0" style="font-size: 0.75rem;">{{ profile.ChucVu || 'Nhân viên' }}</span>
                <span class="text-muted-custom small" style="font-size: 0.75rem;">MSNV: {{ profile.MSNV || '—' }}</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4 bg-body">
          <!-- Nav Tabs -->
          <ul class="nav nav-pills gap-2 mb-4 p-1 bg-light rounded-3" style="width: fit-content;">
            <li class="nav-item">
              <button
                class="nav-link rounded-3 py-2 px-3 fw-medium d-flex align-items-center gap-2"
                :class="{ active: activeTab === 'info' }"
                @click="activeTab = 'info'"
                type="button"
              >
                <i class="fas fa-id-card"></i> Thông tin
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link rounded-3 py-2 px-3 fw-medium d-flex align-items-center gap-2"
                :class="{ active: activeTab === 'password' }"
                @click="activeTab = 'password'"
                type="button"
              >
                <i class="fas fa-key"></i> Đổi mật khẩu
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link rounded-3 py-2 px-3 fw-medium d-flex align-items-center gap-2"
                :class="{ active: activeTab === 'theme' }"
                @click="activeTab = 'theme'"
                type="button"
              >
                <i :class="isDark ? 'fas fa-moon' : 'fas fa-sun'"></i> Giao diện
              </button>
            </li>
          </ul>

          <!-- Alert message -->
          <div v-if="alertMessage" class="alert d-flex align-items-center gap-2 py-2 mb-3" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
            <i :class="alertType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            <span>{{ alertMessage }}</span>
          </div>

          <!-- TAB 1: THÔNG TIN CÁ NHÂN -->
          <div v-show="activeTab === 'info'">
            <form @submit.prevent="handleSaveProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Mã số nhân viên (MSNV)</label>
                  <input type="text" class="form-control" :value="profile.MSNV" disabled readonly />
                  <div class="form-text text-muted-custom" style="font-size:0.75rem;">Mã định danh hệ thống (không thể sửa)</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Chức vụ</label>
                  <input type="text" class="form-control" :value="profile.ChucVu" disabled readonly />
                  <div class="form-text text-muted-custom" style="font-size:0.75rem;">Phân quyền phân hệ quản trị</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Họ và tên <span class="text-danger">*</span></label>
                  <input v-model="form.HoTenNV" type="text" class="form-control" placeholder="Nguyễn Văn A" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Email</label>
                  <input v-model="form.EMAIL" type="email" class="form-control" placeholder="staff@example.com" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Số điện thoại</label>
                  <input v-model="form.SoDienThoai" type="text" class="form-control" placeholder="0901234567" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Số CCCD / CMND</label>
                  <input v-model="form.CCCD" type="text" class="form-control" placeholder="012345678901" />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small">Địa chỉ</label>
                  <input v-model="form.DiaChi" type="text" class="form-control" placeholder="Đại học Cần Thơ, Ninh Kiều, Cần Thơ" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4" @click="$emit('close')">Đóng</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm" :disabled="submitting">
                  <i v-if="submitting" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-save me-1"></i> Lưu thông tin
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 2: ĐỔI MẬT KHẨU -->
          <div v-show="activeTab === 'password'">
            <form @submit.prevent="handleChangePassword">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold small">Mật khẩu hiện tại <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      v-model="pwdForm.currentPassword"
                      :type="showCurrentPwd ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Nhập mật khẩu đang sử dụng"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="showCurrentPwd = !showCurrentPwd">
                      <i :class="showCurrentPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Mật khẩu mới <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      v-model="pwdForm.newPassword"
                      :type="showNewPwd ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      minlength="6"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="showNewPwd = !showNewPwd">
                      <i :class="showNewPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      v-model="pwdForm.confirmPassword"
                      :type="showConfirmPwd ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Nhập lại mật khẩu mới"
                      minlength="6"
                      required
                    />
                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPwd = !showConfirmPwd">
                      <i :class="showConfirmPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4" @click="$emit('close')">Đóng</button>
                <button type="submit" class="btn btn-warning rounded-pill px-4 shadow-sm text-dark fw-bold" :disabled="submitting">
                  <i v-if="submitting" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-key me-1"></i> Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 3: TÙY CHỌN GIAO DIỆN SÁNG / TỐI -->
          <div v-show="activeTab === 'theme'">
            <div class="row g-3">
              <div class="col-md-6">
                <div
                  class="card-surface p-3 border rounded-4 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary shadow-sm bg-primary bg-opacity-10': !isDark }"
                  style="cursor: pointer;"
                  @click="setTheme('light')"
                >
                  <div class="p-3 bg-white rounded-3 mb-3 border d-inline-flex align-items-center justify-content-center text-warning" style="width: 56px; height: 56px; font-size: 1.6rem;">
                    <i class="fas fa-sun"></i>
                  </div>
                  <h6 class="fw-bold mb-1 text-dark">Chế độ Sáng (Light)</h6>
                  <p class="text-muted-custom small mb-2">Giao diện tươi sáng, tối ưu cho môi trường làm việc ban ngày</p>
                  <span v-if="!isDark" class="badge bg-primary rounded-pill px-3 py-1"><i class="fas fa-check me-1"></i>Đang sử dụng</span>
                </div>
              </div>

              <div class="col-md-6">
                <div
                  class="card-surface p-3 border rounded-4 text-center cursor-pointer transition-all"
                  :class="{ 'border-primary shadow-sm bg-primary bg-opacity-10': isDark }"
                  style="cursor: pointer;"
                  @click="setTheme('dark')"
                >
                  <div class="p-3 bg-dark rounded-3 mb-3 border border-secondary d-inline-flex align-items-center justify-content-center text-warning" style="width: 56px; height: 56px; font-size: 1.6rem;">
                    <i class="fas fa-moon"></i>
                  </div>
                  <h6 class="fw-bold mb-1 text-dark">Chế độ Tối (Dark)</h6>
                  <p class="text-muted-custom small mb-2">Giao diện màu tối, dịu mắt và tiết kiệm pin khi làm việc ban đêm</p>
                  <span v-if="isDark" class="badge bg-primary rounded-pill px-3 py-1"><i class="fas fa-check me-1"></i>Đang sử dụng</span>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button type="button" class="btn btn-light rounded-pill px-4" @click="$emit('close')">Xong</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { getSavedTheme, applyTheme } from "@/services/theme.service";

export default {
  name: "AdminProfileModal",
  emits: ["close", "updated"],
  data() {
    return {
      activeTab: "info",
      profile: {},
      form: {
        HoTenNV: "",
        EMAIL: "",
        SoDienThoai: "",
        DiaChi: "",
        CCCD: "",
      },
      pwdForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      showCurrentPwd: false,
      showNewPwd: false,
      showConfirmPwd: false,
      submitting: false,
      alertMessage: "",
      alertType: "success",
      isDark: getSavedTheme() === "dark",
    };
  },
  computed: {
    initial() {
      const name = this.form.HoTenNV || this.profile.HoTenNV || this.profile.MSNV || "A";
      return name.charAt(0).toUpperCase();
    },
  },
  async created() {
    await this.loadProfile();
    window.addEventListener("theme-change", this.handleThemeEvent);
  },
  unmounted() {
    window.removeEventListener("theme-change", this.handleThemeEvent);
  },
  methods: {
    handleThemeEvent(e) {
      this.isDark = e.detail?.theme === "dark";
    },
    setTheme(theme) {
      applyTheme(theme);
      this.isDark = theme === "dark";
      this.alertMessage = `Đã chuyển sang giao diện ${theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}.`;
      this.alertType = "success";
    },
    async loadProfile() {
      try {
        const res = await ProfileService.getProfile();
        this.profile = res.data || res || {};
        this.form = {
          HoTenNV: this.profile.HoTenNV || "",
          EMAIL: this.profile.EMAIL || "",
          SoDienThoai: this.profile.SoDienThoai || "",
          DiaChi: this.profile.DiaChi || "",
          CCCD: this.profile.CCCD || "",
        };
      } catch (err) {
        // Fallback to local user
        const local = AuthService.getCurrentUser() || {};
        this.profile = local;
        this.form = {
          HoTenNV: local.HoTenNV || "",
          EMAIL: local.EMAIL || "",
          SoDienThoai: local.SoDienThoai || "",
          DiaChi: local.DiaChi || "",
          CCCD: local.CCCD || "",
        };
      }
    },
    async handleSaveProfile() {
      this.submitting = true;
      this.alertMessage = "";
      try {
        const res = await ProfileService.updateProfile(this.form);
        this.alertMessage = "Cập nhật thông tin cá nhân thành công!";
        this.alertType = "success";
        
        // Sync with AuthService / localStorage
        const current = AuthService.getCurrentUser() || {};
        const updated = { ...current, ...this.form };
        localStorage.setItem("user", JSON.stringify(updated));

        this.$emit("updated", updated);
      } catch (err) {
        this.alertMessage = err.response?.data?.message || "Cập nhật thông tin thất bại.";
        this.alertType = "danger";
      } finally {
        this.submitting = false;
      }
    },
    async handleChangePassword() {
      if (this.pwdForm.newPassword !== this.pwdForm.confirmPassword) {
        this.alertMessage = "Mật khẩu xác nhận không trùng khớp!";
        this.alertType = "danger";
        return;
      }

      this.submitting = true;
      this.alertMessage = "";
      try {
        await ProfileService.changePassword({
          currentPassword: this.pwdForm.currentPassword,
          newPassword: this.pwdForm.newPassword,
        });
        this.alertMessage = "Đổi mật khẩu thành công!";
        this.alertType = "success";
        this.pwdForm = { currentPassword: "", newPassword: "", confirmPassword: "" };
      } catch (err) {
        this.alertMessage = err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.";
        this.alertType = "danger";
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.avatar-circle {
  transition: all 0.2s ease;
}
.transition-all {
  transition: all 0.2s ease;
}
.transition-all:hover {
  transform: translateY(-2px);
}
</style>
