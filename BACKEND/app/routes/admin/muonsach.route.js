const express = require("express");
const muonsach = require("../../controllers/admin/muonsach.controller");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();

// All admin routes require a valid admin token
router.use(auth.verifyAdminToken);

// GET /api/admin/muonsach        — Get all borrow records (filter by ?status=)
router.get("/", requireRole(["Admin", "NhanVienDuyetMuon"]), muonsach.findAll);

// GET /api/admin/muonsach/:id    — Get one borrow record
router.get("/:id", requireRole(["Admin", "NhanVienDuyetMuon"]), muonsach.findOne);

// PUT /api/admin/muonsach/:id/approve  — Approve borrow request → "đã duyệt"
router.put("/:id/approve", requireRole(["Admin", "NhanVienDuyetMuon"]), muonsach.approve);

// PUT /api/admin/muonsach/:id/reject   — Reject borrow request  → "từ chối"
router.put("/:id/reject", requireRole(["Admin", "NhanVienDuyetMuon"]), muonsach.reject);

// PUT /api/admin/muonsach/:id/confirm-return — Confirm book return → "đã trả"
router.put("/:id/confirm-return", requireRole(["Admin", "NhanVienDuyetMuon"]), muonsach.confirmReturn);

// DELETE /api/admin/muonsach/:id — Delete a borrow record (Admin only)
router.delete("/:id", requireRole(["Admin"]), muonsach.delete);

module.exports = router;
