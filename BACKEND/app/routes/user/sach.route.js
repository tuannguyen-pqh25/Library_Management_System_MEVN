const express = require("express");
const sach = require("../../controllers/user/sach.controller");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(["DocGia"]));

router.route("/")
    .get(sach.findAll);

router.route("/:id")
    .get(sach.findOne);

module.exports = router;
