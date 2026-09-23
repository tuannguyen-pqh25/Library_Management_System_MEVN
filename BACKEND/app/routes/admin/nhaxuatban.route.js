const express = require("express");
const nhaxuatban = require("../../controllers/admin/nhaxuatban.controller");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();

router.use(auth.verifyAdminToken);
router.use(requireRole(["Admin", "NhanVienQuanLySach"]));

router.route("/")
    .get(nhaxuatban.findAll)
    .post(nhaxuatban.create)
    .delete(nhaxuatban.deleteAll);

router.route("/:id")
    .get(nhaxuatban.findOne)
    .put(nhaxuatban.update)
    .delete(nhaxuatban.delete);

module.exports = router;
