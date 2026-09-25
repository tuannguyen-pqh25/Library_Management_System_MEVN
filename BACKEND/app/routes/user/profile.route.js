const express = require("express");
const profileController = require("../../controllers/user/profile.controller");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(["DocGia"]));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.put("/profile/password", profileController.changePassword);

module.exports = router;
