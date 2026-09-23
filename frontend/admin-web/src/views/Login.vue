<template>
  <div v-if="successMessage" class="toast-animated toast-success">
    <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
  </div>

  <div v-if="errorMessage" class="toast-animated toast-error">
    <i class="fas fa-exclamation-triangle me-2"></i>{{ errorMessage }}
  </div>

  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="row justify-content-center w-100">
      <div class="col-10 col-sm-8 col-md-6 col-lg-4">

        <div class="form-container">
          <div class="text-center mb-4">
            <h4 class="mb-1 text-dark">Chào mừng trở lại!</h4>
            <p class="text-secondary-light mb-0">
              Đăng nhập để tiếp tục khám phá thư viện.
            </p>
          </div>

          <Form @submit="handleUnifiedLogin" :validation-schema="loginSchema" :validate-on-input="true"
            v-slot="{ values }">
            <div class="form-group mb-4">
              <label class="form-label">Tên đăng nhập hoặc MSNV</label>
              <div class="input-group-custom">
                <span class="input-icon">
                  <i class="fa-solid fa-user"></i>
                </span>

                <Field name="identifier" type="text" class="form-control" placeholder="Nhập tên đăng nhập hoặc MSNV" />
              </div>
              <ErrorMessage name="identifier" class="error-feedback" />
            </div>

            <div class="form-group mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label mb-0">Mật khẩu</label>
                <a href="#" @click.prevent="showForgotPasswordAlert" class="text-link-small">
                  Quên mật khẩu?
                </a>
              </div>

              <div class="input-group-custom password-input">
                <span class="input-icon">
                  <i class="fa-solid fa-lock"></i>
                </span>

                <Field name="password" :type="showPassword ? 'text' : 'password'" class="form-control"
                  placeholder="Nhập mật khẩu của bạn" />

                <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword"
                  v-if="values.password">
                  <i v-if="showPassword" class="fa-solid fa-eye"></i>
                  <i v-else class="fa-solid fa-eye-slash"></i>
                </button>
              </div>

              <ErrorMessage name="password" class="error-feedback" />
            </div>

            <div class="form-group mt-4">
              <button class="btn btn-primary w-100" :disabled="loading">
                <span v-if="!loading">Đăng nhập</span>
                <span v-else>Đang xử lý...</span>
              </button>
            </div>

          </Form>

          <div class="text-center mt-4">
            <small class="text-secondary-light">
              Chưa có tài khoản?
              <router-link to="/docgia/register" class="text-link">Đăng ký ngay</router-link>
            </small>
          </div>

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

export default {
  name: "Login",
  components: { Form, Field, ErrorMessage },

  data() {
    const loginSchema = yup.object().shape({
      identifier: yup.string().required("Tên đăng nhập hoặc MSNV là bắt buộc!"),
      password: yup.string().required("Mật khẩu là bắt buộc!"),
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

        console.log("FINAL ERROR:", error.response);

        if (error.response?.status === 423) {
          const retryAfter = error.response.data.retryAfter;

          this.errorMessage = retryAfter
            ? `Tài khoản đã bị khóa. Vui lòng thử lại sau ${Math.ceil(retryAfter / 60)} phút.`
            : "Tài khoản đã bị khóa trong 15 phút.";
        }
        else {
          this.errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Đăng nhập thất bại. Vui lòng thử lại.";
        }
      }
    },
    showForgotPasswordAlert() {
      alert("Tính năng đang trong giai đoạn phát triển");
    },
  }
};
</script>



<style scoped>
/* ==== Toast (Giữ nguyên) ==== */
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
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  z-index: 1000;
  font-weight: bold;
  animation: slideInFromRight 0.5s ease-out, fadeOut 0.5s ease-in 3s forwards;
}

.toast-success {
  background-color: #28a745;
  color: white;
}

.toast-error {
  background-color: #dc3545;
  color: white;
}

/* ==== 🎨 START: CẬP NHẬT GIAO DIỆN NỔI BẬT HƠN ==== */

/* ==== Layout ==== */
.login-container {
  min-height: 90vh;
  background-color: #f9fafb;
  padding: 50px 0;
  display: flex;
  /* Dùng flexbox để căn giữa hoàn hảo */
  align-items: center;
  /* Căn giữa theo chiều dọc */
  justify-content: center;
  /* Căn giữa theo chiều ngang */
}

.form-container {
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  /* Bo góc nhiều hơn nữa */
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -4px rgb(0 0 0 / 0.05);
  /* Đổ bóng mạnh hơn một chút */
  max-width: 440px;
  /* Tăng nhẹ độ rộng để thoáng hơn */
  width: 100%;
  /* Đảm bảo nó dùng hết max-width */
  margin: 0 auto;
  /* Căn giữa form */
}

/* Tiêu đề */
.text-center h4 {
  font-weight: 700;
  font-size: 28px;
  /* Tăng kích thước tiêu đề chính */
  color: #1a202c;
  /* Màu tối hơn cho tiêu đề */
  margin-bottom: 8px;
}

.text-secondary-light {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
  /* Tăng line-height cho dễ đọc */
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  display: block;
  /* Đảm bảo label chiếm một dòng riêng */
}

/* ==== Input + Icon ==== */
.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 14px;
  color: #9ca3af;
  font-size: 19px;
  /* Tăng kích thước icon */
  min-width: 40px;
  /* Đảm bảo icon có đủ không gian */
  transition: color 0.2s ease;
  /* Hiệu ứng chuyển màu cho icon */
}

.input-group-custom {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  /* Viền sáng hơn */
  border-radius: 10px;
  /* Bo góc nhẹ hơn cho input group */
  background-color: #f8fafc;
  /* Nền input hơi xám */
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

/* Hiệu ứng khi bấm vào (Focus) */
.input-group-custom:focus-within {
  border-color: #2563eb;
  /* Màu xanh đậm hơn khi focus */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  /* Đổ bóng xanh nhẹ */
  background-color: #ffffff;
  /* Nền trắng khi focus */
}

.input-group-custom:focus-within .input-icon {
  color: #2563eb;
  /* Màu icon đổi thành xanh khi focus */
}

.form-control {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;

  flex-grow: 1;

  padding: 13px 14px 13px 12px;
  /* Padding lớn hơn cho input */
  height: 48px;
  /* Chiều cao cố định, lớn hơn */
  font-size: 16px;
  /* Font chữ to hơn */
  background-color: transparent;
  color: #1a202c;
  /* Màu chữ đậm */
}

/* ĐÃ XÓA KHỐI CSS GÂY LỖI TẠI ĐÂY */

.form-control::placeholder {
  color: #9ca3af;
  /* ĐÃ XÓA TRANSITION TẠI ĐÂY */
}

/* Nút con mắt */
.password-input .btn-toggle-password {
  position: static;
  transform: none;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 19px;
  /* Đồng bộ kích thước icon */
  color: #9ca3af;
  padding: 0 16px;
  z-index: 3;
}

.password-input .btn-toggle-password:hover {
  color: #374151;
}

.password-input .form-control {
  padding-right: 0 !important;
}


/* Error */
.error-feedback {
  color: #e53e3e;
  /* Màu đỏ sáng hơn */
  font-size: 13px;
  margin-top: 6px;
}

/* Button */
.btn-primary {
  background-color: #2563eb;
  /* Màu xanh đậm hơn, đồng bộ với focus */
  border: none;
  /* Bỏ border */
  font-weight: 600;
  padding: 14px;
  /* Nút to hơn */
  border-radius: 10px;
  /* Đồng bộ bo góc */
  font-size: 16px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25);
  /* Thêm bóng mờ cho nút */
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  /* Màu xanh đậm hơn khi hover */
  transform: translateY(-2px);
  /* Hiệu ứng nhấc lên */
  box-shadow: 0 6px 16px 0 rgba(37, 99, 235, 0.3);
  /* Bóng mờ rõ hơn */
}

.btn-primary:disabled {
  background-color: #2563eb;
  opacity: 0.6;
}

/* Link */
.text-link,
.text-link-small {
  color: #2563eb !important;
  /* Đồng bộ màu link */
  text-decoration: none;
  font-weight: 600;
}

.text-link-small {
  font-weight: 500;
  font-size: 14px;
}

.text-link:hover,
.text-link-small:hover {
  text-decoration: underline;
  color: #1d4ed8 !important;
}

.alert {
  border-radius: 8px;
  /* Đồng bộ bo góc */
  font-size: 14px;
  padding: 12px 16px;
  background-color: #fff5f5;
  /* Nền đỏ nhạt */
  color: #c53030;
  /* Chữ đỏ đậm */
  border: 1px solid #fed7d7;
  /* Viền đỏ nhạt */
}

/* ==== KHẮC PHỤC LỖI AUTOFILL CỦA TRÌNH DUYỆT ==== */
.form-control:-webkit-autofill,
.form-control:-webkit-autofill:hover,
.form-control:-webkit-autofill:focus,
.form-control:-webkit-autofill:active {
  -webkit-text-fill-color: #1a202c;
  /* Đồng bộ màu chữ */
  transition: background-color 5000s ease-in-out 0s;
  /* Hack: Vẽ bóng trắng đè lên nền autofill của trình duyệt */
  /* Cập nhật màu nền này để khớp với màu .input-group-custom */
  box-shadow: 0 0 0 1000px #f8fafc inset !important;
}

/* Khi focus vào input đã autofill */
.input-group-custom:focus-within .form-control:-webkit-autofill {
  /* Đổi nền thành trắng để khớp với hiệu ứng focus */
  box-shadow: 0 0 0 1000px #ffffff inset !important;
}
</style>