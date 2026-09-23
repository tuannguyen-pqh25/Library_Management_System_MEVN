// Tên tệp: src/services/muonsach.service.js

import http from "./http-common";

class MuonSachService {
  // 1. Admin: Lấy tất cả phiếu mượn
  getAll() {
    return http.get("/muonsach");
  }

  // 2. Admin: Lấy 1 phiếu mượn (để xem chi tiết/sửa)
  get(id) {
    return http.get(`/muonsach/${id}`);
  }

  // 3. Admin/Nhân viên: Cập nhật trạng thái phiếu (Duyệt, Trả, Từ chối)
  // data sẽ là { trangThai: "...", nhanVienId: "..." }
  update(id, data) {
    return http.put(`/muonsach/${id}`, data);
  }

  // 4. Admin: Xóa 1 phiếu (khi bị lỗi)
  delete(id) {
    return http.delete(`/muonsach/${id}`);
  }
  
  // 5. Độc giả: Tạo phiếu mượn (Dùng cho trang của độc giả sau này)
  // data sẽ là { docGiaId, sachId, ngayMuon, ngayTra }
  create(data) {
     return http.post("/muonsach", data);
  }

  // 6. Độc giả: Lấy lịch sử mượn của mình (Dùng cho trang của độc giả sau này)
  getForDocGia(docGiaId) {
    return http.get(`/muonsach/docgia/${docGiaId}`);
  }

  // 7. Độc giả: Yêu cầu trả sách
  requestReturn(id) {
    return http.put(`/muonsach/${id}/request-return`);
  }

  // 8. Nhân viên: Xác nhận trả sách (cập nhật ngayTraThucTe + SOQUYEN)
  confirmReturn(id, nhanVienId) {
    return http.put(`/muonsach/${id}/confirm-return`, { nhanVienId });
  }

  // 9. Độc giả: Xác nhận đã nộp phạt
  confirmFinePayment(id) {
    return http.put(`/muonsach/${id}/confirm-fine-payment`);
  }
}

export default new MuonSachService();
