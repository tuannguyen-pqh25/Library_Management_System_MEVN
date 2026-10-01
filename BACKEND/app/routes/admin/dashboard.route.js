const express = require("express");
const dashboard = require("../../controllers/admin/dashboard.controller");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();

// All dashboard routes require valid admin token
router.use(auth.verifyAdminToken);

// GET /api/admin/dashboard/stats — Summary stats for admin dashboard
router.get(
    "/stats",
    requireRole(["Admin", "NhanVienDuyetMuon"]),
    dashboard.getStats
);

module.exports = router;
