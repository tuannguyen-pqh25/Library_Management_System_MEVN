import http from "./http-common";

class SachService {
  // Lấy tất cả sách
  getAll() {
    return http.get("/sach");
  }

  // Lấy 1 cuốn sách
  get(id) {
    return http.get(`/sach/${id}`);
  }

  // Tạo sách mới (Gửi JSON)
  create(data) {
    return http.post("/sach", data);
  }

  // Upload ảnh (gửi imageUrl - có thể là data URL hoặc remote URL)
  uploadImage(imageUrl, signal = null) {
    const config = signal ? { signal } : {};
    return http.post("/sach/upload/image", { imageUrl }, config);
  }

  // Cập nhật sách
  update(id, data) {
    return http.put(`/sach/${id}`, data);
  }

  // Xóa sách
  delete(id) {
    return http.delete(`/sach/${id}`);
  }
}

export default new SachService();