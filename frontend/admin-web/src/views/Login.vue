<template>
  <div class="min-vh-100 d-flex w-100 m-0 p-0">
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

    <!-- Left Texture Panel (Hidden on small screens) -->
    <div
      class="d-none d-lg-block col-lg-5 position-relative overflow-hidden text-white"
    >
      <!-- Hình nền từ Unsplash làm lớp dưới cùng -->
      <div
        class="position-absolute top-0 start-0 w-100 h-100 z-0"
        style="
          background-image: url(&quot;https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=900&fit=crop&auto=format&quot;);
          background-size: cover;
          background-position: center;
        "
      ></div>

      <!-- Lớp phủ màu xanh dương (với gradient) để thấy rõ hình nhưng vẫn đọc được chữ -->
      <div
        class="position-absolute top-0 start-0 w-100 h-100 z-0"
        style="
          background: linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.85) 0%,
            rgba(29, 78, 216, 0.9) 100%
          );
        "
      ></div>

      <div
        class="position-relative h-100 d-flex flex-column justify-content-between p-5 z-1"
      >
        <div>
          <div class="d-inline-flex align-items-center gap-2 mb-5">
            <div
              class="d-flex align-items-center justify-content-center bg-white text-primary rounded font-display fw-bold shadow-sm"
              style="width: 32px; height: 32px; font-size: 0.85rem"
            >
              Λ
            </div>
            <span class="text-white small fw-medium font-display fs-6">
              Admin
            </span>
          </div>

          <h2 class="display-5 fw-bold text-white mb-3 font-display lh-sm">
            Library<br />Management<br />System
          </h2>
          <p class="text-white-50 fs-6 lh-base" style="max-width: 80%">
            Cổng thông tin quản trị an toàn dành cho nhân viên thư viện và ban
            quản lý.
          </p>
        </div>

        <div class="d-flex flex-column gap-3">
          <div
            v-for="f in [
              'Quản lý danh mục sách',
              'Quản lý mượn trả',
              'Tài khoản độc giả',
              'Quản lý nhân viên',
              'Thống kê & Báo cáo',
            ]"
            :key="f"
            class="d-flex align-items-center gap-3"
          >
            <div
              class="rounded-circle bg-white"
              style="width: 6px; height: 6px"
            ></div>
            <span
              class="text-white font-data small"
              style="opacity: 0.9; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)"
              >{{ f }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Right Login Form -->
    <div
      class="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 bg-body"
    >
      <div class="card-surface p-5 w-100" style="max-width: 440px">
        <div
          class="d-inline-flex align-items-center gap-1 px-2 py-1 rounded font-data mb-3"
          style="
            background: rgba(37, 99, 235, 0.1);
            color: var(--bs-primary);
            border: 1px solid rgba(37, 99, 235, 0.2);
            font-size: 0.75rem;
            font-weight: 600;
          "
        >
          <i class="fa-solid fa-lock" style="font-size: 10px"></i> RESTRICTED
          ACCESS
        </div>

        <h1 class="fs-3 fw-bold mt-1 mb-2 text-dark font-display">
          Đăng nhập quản trị
        </h1>
        <p class="text-muted mb-4 font-body fs-6">
          Vui lòng nhập thông tin tài khoản nhân viên.
        </p>

        <Form
          @submit="handleUnifiedLogin"
          :validation-schema="loginSchema"
          v-slot="{ values }"
        >
          <div class="mb-4">
            <label class="form-label font-body small fw-semibold mb-2 text-dark"
              >Staff Email / MSNV</label
            >
            <div class="position-relative">
              <span
                class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              >
                <i class="fa-solid fa-user"></i>
              </span>
              <Field
                name="identifier"
                type="text"
                class="form-control font-body ps-5 input-styled"
                placeholder="Ví dụ: ADMIN001"
              />
            </div>
            <ErrorMessage
              name="identifier"
              class="text-danger small mt-1 font-body d-block"
            />
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label
                class="form-label font-body small fw-semibold mb-0 text-dark"
                >Mật khẩu</label
              >
              <a
                href="#"
                @click.prevent="showForgotPasswordAlert"
                class="text-primary text-decoration-none small fw-medium font-body"
                >Quên mật khẩu?</a
              >
            </div>

            <div class="position-relative">
              <span
                class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              >
                <i class="fa-solid fa-key"></i>
              </span>
              <Field
                name="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control font-body ps-5 pe-5 input-styled"
                placeholder="••••••••"
              />

              <button
                type="button"
                class="btn position-absolute top-50 end-0 translate-middle-y border-0 shadow-none text-muted px-3"
                @click="showPassword = !showPassword"
                v-if="values.password"
              >
                <i
                  :class="
                    showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'
                  "
                ></i>
              </button>
            </div>
            <ErrorMessage
              name="password"
              class="text-danger small mt-1 font-body d-block"
            />
          </div>

          <BaseButton type="submit" :loading="loading" class="mt-4">
            Truy cập hệ thống
          </BaseButton>
        </Form>

        <div class="mt-4 pt-4 border-top text-center">
          <a
            href="#"
            @click.prevent="goToReaderPortal"
            class="text-decoration-none small transition-smooth fw-semibold font-body"
            style="color: #4b5563"
          >
            &larr; Quay lại Cổng độc giả
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import AuthService from "@/services/auth.service";
import eventBus from "@/services/eventBus";
import BaseButton from "@/components/ui/BaseButton.vue";

export default {
  name: "Login",
  components: { Form, Field, ErrorMessage, BaseButton },

  data() {
    const loginSchema = yup.object().shape({
      identifier: yup
        .string()
        .required("Vui lòng nhập tên đăng nhập hoặc MSNV"),
      password: yup.string().required("Vui lòng nhập mật khẩu"),
    });

    return {
      loading: false,
      showPassword: false,
      successMessage: "",
      errorMessage: "",
      loginSchema,
    };
  },

  methods: {
    async handleUnifiedLogin(credentials) {
      this.loading = true;
      this.successMessage = "";
      this.errorMessage = "";

      try {
        const identifier = credentials.identifier.trim();
        const password = credentials.password;

        const loggedInUser = await AuthService.loginNhanVien({
          MSNV: identifier,
          password,
        });

        eventBus.emit("auth-change");
        this.loading = false;

        this.successMessage =
          "Đăng nhập thành công! Xin chào " + loggedInUser.HoTenNV;

        setTimeout(() => {
          this.$router.push("/dashboard");
        }, 700);
      } catch (error) {
        this.loading = false;
        if (error.response?.status === 423) {
          const retryAfter = error.response.data.retryAfter;
          this.errorMessage = retryAfter
            ? `Tài khoản đã bị khóa. Thử lại sau ${Math.ceil(retryAfter / 60)} phút.`
            : "Tài khoản đã bị khóa trong 15 phút.";
        } else {
          this.errorMessage =
            error.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng thử lại.";
        }
      }
    },
    goToReaderPortal() {
      window.location.href = "http://localhost:5173";
    },
    showForgotPasswordAlert() {
      alert("Tính năng đang phát triển!");
    },
  },
};
</script>

<style scoped>
.input-styled {
  background-color: #f8fafc;
  color: #1a202c;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s;
  height: 48px;
}
.input-styled:focus {
  background-color: #ffffff !important;
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
  outline: none;
}
.input-styled::placeholder {
  color: #9ca3af !important;
}

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
  animation:
    slideInFromRight 0.5s ease-out,
    fadeOut 0.5s ease-in 3s forwards;
}
</style>
