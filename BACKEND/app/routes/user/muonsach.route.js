const express = require("express");
const muonsach = require("../../controllers/user/muonsach.controller");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(["DocGia"]));

router.route("/")
    .post(muonsach.create);

router.get("/lich-su", muonsach.getHistory);
router.post("/:id/request-return", muonsach.requestReturn);

router.route("/:id")
    .put(muonsach.updatePending)
    .delete(muonsach.deletePending);

module.exports = router;
