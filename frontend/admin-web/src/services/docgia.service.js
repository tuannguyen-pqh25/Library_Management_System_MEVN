import http from "./http-common";

/**
 * Admin DocGia Service
 * Base URL: /api/admin (đã cấu hình trong http-common)
 * Endpoints: /docgia/*
 */
class DocGiaService {
  // Lấy tất cả độc giả (hỗ trợ ?search=...&trangThai=...)
  getAll(params = {}) {
    return http.get("/docgia", { params });
  }

  // Lấy chi tiết 1 độc giả (kèm thống kê mượn sách)
  get(id) {
    return http.get(`/docgia/${id}`);
  }

  // Khóa / Mở khóa tài khoản
  toggleAccountStatus(id, data) {
    return http.put(`/docgia/${id}/status`, data);
  }

  // Lấy lịch sử mượn sách của 1 độc giả
  getBorrowHistory(id) {
    return http.get(`/docgia/${id}/history`);
  }

  // Đặt lại mật khẩu về mặc định
  resetPassword(id) {
    return http.put(`/docgia/${id}/reset-password`);
  }
}

export default new DocGiaService();
