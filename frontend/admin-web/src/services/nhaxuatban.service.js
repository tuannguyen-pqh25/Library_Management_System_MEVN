// Tên tệp: src/services/nhaxuatban.service.js

import http from "./http-common";

class NhaXuatBanService {
  getAll() {
    return http.get("/nxb");
  }

  get(id) {
    return http.get(`/nxb/${id}`);
  }

  create(data) {
    return http.post("/nxb", data);
  }

  update(id, data) {
    return http.put(`/nxb/${id}`, data);
  }

  delete(id) {
    return http.delete(`/nxb/${id}`);
  }
}

export default new NhaXuatBanService();