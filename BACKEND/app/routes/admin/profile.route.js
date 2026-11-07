const express = require("express");
const profileController = require("../../controllers/admin/profile.controller");
const { verifyAdminToken } = require("../../middlewares/auth");

const router = express.Router();

router.use(verifyAdminToken);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.put("/password", profileController.changePassword);

module.exports = router;
