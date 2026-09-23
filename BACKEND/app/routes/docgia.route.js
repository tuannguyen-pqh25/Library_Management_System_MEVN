const express = require("express");
const docgia = require("../controllers/docgia.controller");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");
const loginLimiter = require("../middleware/loginLimiter");

const router = express.Router();

router.route("/login")
    .post(loginLimiter, docgia.login);

router.route("/")
    .get(verifyToken, checkRole(["Admin", "Staff"]), docgia.findAll)
    .post(docgia.create) // Đây là Đăng Ký
    .delete(verifyToken, checkRole(["Admin"]), docgia.deleteAll);

router.route("/:id")
    .get(verifyToken, checkRole(["Admin", "Staff", "DocGia"]), docgia.findOne)
    .put(verifyToken, checkRole(["Admin"]), docgia.update)
    .delete(verifyToken, checkRole(["Admin"]), docgia.delete);

// Favorites routes
router.route("/:id/favorites")
    .get(verifyToken, checkRole(["DocGia"]), docgia.getFavorites)
    .post(verifyToken, checkRole(["DocGia"]), docgia.addFavorite);

router.route("/:id/favorites/:sachId")
    .delete(verifyToken, checkRole(["DocGia"]), docgia.removeFavorite);

module.exports = router;

