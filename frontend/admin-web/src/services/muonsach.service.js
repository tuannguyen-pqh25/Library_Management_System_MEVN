// src/services/muonsach.service.js (admin-web)
import http from "./http-common";

class MuonSachService {
  /**
   * Get all borrow records.
   * @param {string|null} status - filter by status value stored in DB (e.g. 'chờ duyệt')
   */
  getAll(status = null) {
    const params = status ? { status } : {};
    return http.get("/muonsach", { params });
  }

  /** Get one borrow record by ID */
  getById(id) {
    return http.get(`/muonsach/${id}`);
  }

  /** Approve a borrow request → status "đã duyệt" */
  approve(id) {
    return http.put(`/muonsach/${id}/approve`);
  }

  /** Handover a book → status "đang mượn" */
  handover(id) {
    return http.put(`/muonsach/${id}/handover`);
  }

  /** Reject a borrow request → status "từ chối" */
  reject(id, reason = "") {
    return http.put(`/muonsach/${id}/reject`, { reason });
  }

  /** Confirm book return → status "đã trả" */
  confirmReturn(id) {
    return http.put(`/muonsach/${id}/confirm-return`);
  }

  /** Delete a borrow record (Admin only) */
  delete(id) {
    return http.delete(`/muonsach/${id}`);
  }
}

export default new MuonSachService();
