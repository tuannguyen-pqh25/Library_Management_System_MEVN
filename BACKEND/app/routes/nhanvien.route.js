const express = require("express");
const nhanvien = require("../controllers/nhanvien.controller");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");
const loginLimiter = require("../middleware/loginLimiter");

const router = express.Router();

router.route("/login")
    .post(loginLimiter, nhanvien.login);

// --- Route CRUD (cho Admin quản lý) ---

router.route("/")
    .get(verifyToken, checkRole(["Admin"]), nhanvien.findAll)
    .post(verifyToken, checkRole(["Admin"]), nhanvien.create)
    .delete(verifyToken, checkRole(["Admin"]), nhanvien.deleteAll);

router.route("/:id")
    .get(verifyToken, checkRole(["Admin"]), nhanvien.findOne)
    .put(verifyToken, checkRole(["Admin"]), nhanvien.update)
    .delete(verifyToken, checkRole(["Admin"]), nhanvien.delete);

module.exports = router;

