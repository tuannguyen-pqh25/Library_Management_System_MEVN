const express = require("express");
const sach = require("../../controllers/user/sach.controller");

const router = express.Router();

// Public routes - ai cũng có thể xem danh sách sách
router.route("/")
    .get(sach.findAll);

router.route("/:id")
    .get(sach.findOne);

module.exports = router;
