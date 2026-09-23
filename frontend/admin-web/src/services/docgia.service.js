// Tên tệp: src/services/docgia.service.js

import http from "./http-common";

// Service này dùng cho Admin quản lý,
// (AuthService đã xử lý đăng nhập/đăng ký)
class DocGiaService {
  // Admin: Lấy tất cả độc giả
  getAll() {
    return http.get("/docgia");
  }

  // Admin: Lấy 1 độc giả
  get(id) {
    return http.get(`/docgia/${id}`);
  }

  // Admin: Cập nhật độc giả
  update(id, data) {
    return http.put(`/docgia/${id}`, data);
  }

  // Admin/Staff: Tạo mới độc giả
  create(data) {
    return http.post(`/docgia`, data);
  }

  // Admin: Xóa độc giả
  delete(id) {
    return http.delete(`/docgia/${id}`);
  }

  // Kiểm tra username có tồn tại không
  checkUsernameExists(username) {
    return http.get(`/docgia/check-username/${username}`);
  }

  // Thêm sách vào yêu thích
  addFavorite(docGiaId, sachId) {
    return http.post(`/docgia/${docGiaId}/favorites`, { sachId });
  }

  // Xóa sách khỏi yêu thích
  removeFavorite(docGiaId, sachId) {
    return http.delete(`/docgia/${docGiaId}/favorites/${sachId}`);
  }

  // Lấy danh sách sách yêu thích
  getFavorites(docGiaId) {
    return http.get(`/docgia/${docGiaId}/favorites`);
  }
}

export default new DocGiaService();
