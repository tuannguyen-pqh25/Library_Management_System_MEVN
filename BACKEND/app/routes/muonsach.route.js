const express = require("express");
const muonsach = require("../controllers/muonsach.controller");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

// Route cho Độc Giả: Tạo phiếu mượn
// Route cho Nhân Viên: Xem tất cả phiếu mượn
router.route("/")
    .get(verifyToken, checkRole(["Admin", "Staff"]), muonsach.findAll)
    .post(verifyToken, checkRole(["DocGia"]), muonsach.create);

// Route cho Độc Giả: Xem lịch sử mượn của mình
// :id ở đây là ID của Độc Giả
router.route("/docgia/:id")
    .get(verifyToken, checkRole(["DocGia"]), muonsach.findByDocGia);

// Route cho Nhân Viên: Quản lý 1 phiếu mượn cụ thể
// :id ở đây là ID của Phiếu Mượn
router.route("/:id")
    .get(verifyToken, checkRole(["Admin", "Staff"]), muonsach.findOne)
    .put(verifyToken, checkRole(["Admin", "Staff"]), muonsach.update) // Dùng để duyệt/trả/từ chối
    .delete(verifyToken, checkRole(["Admin", "Staff"]), muonsach.delete);

// Route cho Độc Giả: Yêu cầu trả sách
router.route("/:id/request-return")
    .put(verifyToken, checkRole(["DocGia"]), muonsach.requestReturn);

// Route cho Nhân Viên: Xác nhận trả sách (cập nhật ngayTraThucTe và tăng SOQUYEN)
router.route("/:id/confirm-return")
    .put(verifyToken, checkRole(["Admin", "Staff"]), muonsach.confirmReturn);

// Route cho Độc Giả: Xác nhận nộp phạt
router.route("/:id/confirm-fine-payment")
    .put(verifyToken, checkRole(["DocGia"]), muonsach.confirmFinePayment);

module.exports = router;

