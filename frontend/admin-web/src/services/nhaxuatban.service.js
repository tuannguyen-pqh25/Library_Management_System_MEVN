// Tên tệp: src/services/nhaxuatban.service.js

import http from "./http-common";

class NhaXuatBanService {
  getAll() {
    return http.get("/nhaxuatban");
  }

  get(id) {
    return http.get(`/nhaxuatban/${id}`);
  }

  create(data) {
    return http.post("/nhaxuatban", data);
  }

  update(id, data) {
    return http.put(`/nhaxuatban/${id}`, data);
  }

  delete(id) {
    return http.delete(`/nhaxuatban/${id}`);
  }
}

export default new NhaXuatBanService();