const express = require("express");
const danhgia = require("../../controllers/user/danhgia.controller");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

const router = express.Router();

// Route công khai: Lấy danh sách đánh giá theo sách (không cần đăng nhập)
router.get("/:sachId", danhgia.getBySach);

// Các route cần đăng nhập
router.get("/:sachId/my-review", verifyToken, checkRole(["DocGia"]), danhgia.getMyReview);
router.post("/:sachId", verifyToken, checkRole(["DocGia"]), danhgia.upsert);
router.delete("/review/:id", verifyToken, checkRole(["DocGia"]), danhgia.delete);

module.exports = router;
