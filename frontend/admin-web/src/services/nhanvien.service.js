import http from "./http-common";

class NhanVienService {
  getAll() {
    return http.get("/nhanvien");
  }

  get(id) {
    return http.get(`/nhanvien/${id}`);
  }

  // FIX: SỬA HÀM CREATE (Gửi JSON bình thường)
  create(data) {
    // 'data' là một đối tượng JSON
    return http.post("/nhanvien", data);
  }

  update(id, data) {
    return http.put(`/nhanvien/${id}`, data);
  }

  delete(id) {
    return http.delete(`/nhanvien/${id}`);
  }
}

export default new NhanVienService();