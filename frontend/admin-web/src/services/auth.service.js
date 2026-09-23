import http from "./http-common";

class AuthService {
  /**
   * Đăng nhập ĐỘC GIẢ
   */
  login(user) {
    return http
      .post("/docgia/login", {
        username: user.username,
        password: user.password,
      })
      .then((response) => {
        // API trả về: { message: "...", data: { ...user... } }
        if (response.data && response.data.data) {
          // Chỉ lưu thông tin user (response.data.data)
          localStorage.setItem("user", JSON.stringify(response.data.data));
          if (response.data.token) localStorage.setItem("token", response.data.token);
          return response.data.data;
        }
        return null;
      });
  }

  /**
   * Đăng nhập NHÂN VIÊN
   */
  loginNhanVien(staff) {
    return http
      .post("/nhanvien/login", {
        MSNV: staff.MSNV,
        password: staff.password,
      })
      .then((response) => {
        // API trả về: { message: "...", data: { ...staff... } }
        if (response.data && response.data.data) {
          // Ghi đè "user" bằng thông tin Nhân Viên
          localStorage.setItem("user", JSON.stringify(response.data.data));
          if (response.data.token) localStorage.setItem("token", response.data.token);
          return response.data.data;
        } else {
          return null;
        }
      }).catch((error) => {
        if (error.response) {
          throw error;
        }
        throw error;
      });
  }

  /**
   * Đăng xuất (Dùng chung)
   */
  logout() {
    localStorage.removeItem("user");
  }

  /**
   * Đăng ký (Chỉ dành cho Độc Giả)
   */
  register(user) {
    return http.post("/docgia", {
      username: user.username,
      password: user.password,
      HOLOT: user.HOLOT,
      TEN: user.TEN,
      NGAYSINH: user.NGAYSINH,
      GIOITINH: user.GIOITINH,
      DIACHI: user.DIACHI,
      DIENTHOAI: user.DIENTHOAI,
    });
  }

  /**
   * Lấy user/staff hiện tại từ localStorage (Dùng chung)
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();

