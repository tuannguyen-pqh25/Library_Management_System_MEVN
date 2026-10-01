const express = require("express");
const docgia = require("../../controllers/admin/docgia.controller");
const { verifyAdminToken } = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();

// Tất cả route đều cần admin token + role Admin
router.use(verifyAdminToken);
router.use(requireRole(["Admin"]));

// GET /api/admin/docgia — Danh sách tất cả độc giả (hỗ trợ ?search=...&trangThai=...)
router.get("/", docgia.findAll);

// GET /api/admin/docgia/:id — Chi tiết 1 độc giả + thống kê mượn sách
router.get("/:id", docgia.findOne);

// PUT /api/admin/docgia/:id/status — Khóa / Mở khóa tài khoản
router.put("/:id/status", docgia.toggleAccountStatus);

// GET /api/admin/docgia/:id/history — Lịch sử mượn sách của 1 độc giả
router.get("/:id/history", docgia.getBorrowHistory);

// PUT /api/admin/docgia/:id/reset-password — Đặt lại mật khẩu về mặc định
router.put("/:id/reset-password", docgia.resetPassword);

module.exports = router;
