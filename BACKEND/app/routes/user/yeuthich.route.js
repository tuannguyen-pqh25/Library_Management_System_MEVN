const express = require("express");
const yeuthich = require("../../controllers/user/yeuthich.controller");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

const router = express.Router();

// Tất cả route yêu thích đều yêu cầu đăng nhập
router.use(verifyToken);
router.use(checkRole(["DocGia"]));

// Lấy danh sách yêu thích của mình
router.get("/", yeuthich.getMyWishlist);

// Kiểm tra 1 sách có trong wishlist không
router.get("/:sachId/check", yeuthich.checkWishlist);

// Toggle yêu thích (thêm/bỏ)
router.post("/:sachId/toggle", yeuthich.toggle);

// Xóa khỏi wishlist
router.delete("/:sachId", yeuthich.remove);

module.exports = router;
