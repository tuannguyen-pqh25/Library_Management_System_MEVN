<template>
  <div class="container-fluid min-vh-100 d-flex flex-column flex-md-row p-0">
    <!-- Left column: Visuals/Texture -->
    <div
      class="col-12 col-md-5 col-lg-6 d-none d-md-flex align-items-center justify-content-center bg-primary text-white position-relative overflow-hidden"
    >
      <!-- Background pattern -->
      <div
        class="position-absolute w-100 h-100 opacity-25"
        style="
          background-image: radial-gradient(#f6f1e7 1px, transparent 1px);
          background-size: 24px 24px;
        "
      ></div>
      <div class="z-1 text-center p-5">
        <h1 class="font-display fw-bold mb-3 display-4">Trở thành Độc giả</h1>
        <p class="font-body fs-5 opacity-75">
          Tham gia cộng đồng để bắt đầu mượn sách.
        </p>
      </div>
    </div>

    <!-- Right column: Form -->
    <div
      class="col-12 col-md-7 col-lg-6 d-flex align-items-center justify-content-center bg-body p-4 p-sm-5 py-5 overflow-auto"
    >
      <div class="w-100" style="max-width: 500px">
        <BaseCard class="border-0 shadow-none bg-transparent">
          <div class="text-center mb-4">
            <h2 class="font-display fw-bold mb-1">Đăng ký tài khoản</h2>
            <p class="text-muted-custom font-body">
              Tạo tài khoản độc giả để mượn sách và quản lý hồ sơ
            </p>
          </div>

          <form @submit.prevent="handleRegister">
            <div class="row g-3">
              <div class="col-sm-6">
                <BaseInput
                  v-model="form.Email"
                  label="Email"
                  type="email"
                  required
                />
              </div>
              <div class="col-sm-6">
                <div class="position-relative">
                  <BaseInput
                    v-model="form.MatKhau"
                    label="Mật khẩu"
                    :type="showPwd ? 'text' : 'password'"
                    placeholder="Min 8 ký tự, A-z, 0-9, !@#..."
                    required
                  />
                  <button type="button" class="btn position-absolute border-0 shadow-none text-muted px-3"
                    style="top: 36px; right: 0;"
                    @click="showPwd = !showPwd"
                    v-if="form.MatKhau">
                    <i :class="showPwd ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
                  </button>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="position-relative">
                  <BaseInput
                    v-model="form.XacNhanMatKhau"
                    label="Xác nhận mật khẩu"
                    :type="showPwd2 ? 'text' : 'password'"
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                  <button type="button" class="btn position-absolute border-0 shadow-none text-muted px-3"
                    style="top: 36px; right: 0;"
                    @click="showPwd2 = !showPwd2"
                    v-if="form.XacNhanMatKhau">
                    <i :class="showPwd2 ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
                  </button>
                </div>
              </div>

              <div class="col-sm-6">
                <BaseInput
                  v-model="form.HoLot"
                  label="Họ và tên đệm"
                  type="text"
                />
              </div>
              <div class="col-sm-6">
                <BaseInput
                  v-model="form.Ten"
                  label="Tên"
                  type="text"
                  required
                />
              </div>

              <div class="col-sm-6">
                <BaseInput
                  v-model="form.NgaySinh"
                  label="Ngày sinh"
                  type="date"
                />
              </div>
              <div class="col-sm-6 mb-3">
                <label
                  class="form-label font-body fw-semibold"
                  style="color: var(--bs-body-color); margin-bottom: 0.5rem"
                  >Giới tính</label
                >
                <select
                  v-model="form.Phai"
                  class="form-select"
                  style="
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                  "
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div class="col-12">
                <BaseInput v-model="form.DiaChi" label="Địa chỉ" type="text" />
              </div>

              <div class="col-12">
                <BaseInput
                  v-model="form.DienThoai"
                  label="Số điện thoại"
                  type="text"
                />
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="alert alert-danger py-2 mt-3 mb-3 font-body small"
            >
              {{ errorMessage }}
            </div>
            <div
              v-if="successMessage"
              class="alert alert-success py-2 mt-3 mb-3 font-body small"
            >
              {{ successMessage }}
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              block
              class="mt-4 mb-3 py-2 fs-5"
              :disabled="loading"
            >
              {{ loading ? "Đang xử lý..." : "Đăng ký" }}
            </BaseButton>
          </form>

          <div class="text-center small text-muted-custom font-body mt-3">
            Đã có tài khoản?
            <router-link
              class="text-decoration-none fw-semibold text-warning"
              to="/login"
              >Đăng nhập</router-link
            >
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "@/services/auth.service";

import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";

const router = useRouter();

const form = reactive({
  Email: "",
  MatKhau: "",
  XacNhanMatKhau: "",
  HoLot: "",
  Ten: "",
  NgaySinh: "",
  Phai: "Nam",
  DiaChi: "",
  DienThoai: "",
});

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showPwd = ref(false);
const showPwd2 = ref(false);

// Regex: tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const validateForm = () => {
  if (!PASSWORD_REGEX.test(form.MatKhau)) {
    errorMessage.value = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$...).";
    return false;
  }
  if (form.MatKhau !== form.XacNhanMatKhau) {
    errorMessage.value = "Mật khẩu xác nhận không khớp.";
    return false;
  }
  return true;
};

const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateForm()) return;

  loading.value = true;
  try {
    await AuthService.register(form);
    successMessage.value = "Đăng ký thành công. Đang chuyển hướng...";
    setTimeout(() => router.push("/login"), 1200);
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};
</script>
