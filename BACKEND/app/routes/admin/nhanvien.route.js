const express = require("express");
const nhanvien = require("../../controllers/nhanvien.controller");
const { verifyAdminToken } = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();
router.use(verifyAdminToken, requireRole(["Admin"]));

router.get("/", nhanvien.findAll);
router.post("/", nhanvien.create);
router.get("/:id", nhanvien.findOne);
router.put("/:id", nhanvien.update);
router.delete("/:id", nhanvien.delete);

module.exports = router;
