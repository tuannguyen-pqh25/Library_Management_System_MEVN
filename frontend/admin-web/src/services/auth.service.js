import http from "./http-common";

class AuthService {
  /**
   * Đăng nhập NHÂN VIÊN theo API backend chuẩn
   */
  async loginNhanVien(staff) {
    const response = await http.post("/auth/login", {
      MSNV: staff.MSNV,
      password: staff.password,
    });

    const user = response.data?.data || null;
    const token = response.data?.token || null;

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    if (token) {
      localStorage.setItem("token", token);
    }

    return user;
  }

  /**
   * Đăng xuất (Dùng chung)
   */
  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  /**
   * Lấy user/staff hiện tại từ localStorage (Dùng chung)
   */
  getCurrentUser() {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }
}

export default new AuthService();

