const express = require("express");
const sach = require("../../controllers/admin/sach.controller");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const router = express.Router();

// Tất cả các route admin/sach đều yêu cầu admin token và quyền Admin hoặc NhanVienQuanLySach
router.use(auth.verifyAdminToken);
router.use(requireRole(["Admin", "NhanVienQuanLySach"]));

router.route("/")
    .get(sach.findAll)
    .post(sach.create)
    .delete(sach.deleteAll);

router.route("/:id")
    .get(sach.findOne)
    .put(sach.update)
    .delete(sach.delete);

// Route để upload ảnh
router.post("/upload/image", sach.uploadImage);

module.exports = router;
