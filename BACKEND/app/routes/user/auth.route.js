const express = require("express");
const userAuth = require("../../controllers/user/auth.controller");
const loginLimiter = require("../../middleware/loginLimiter");

const router = express.Router();

router.post("/register", userAuth.register);
router.post("/login", loginLimiter, userAuth.login);
router.post("/refresh", userAuth.refresh);
router.post("/logout", userAuth.logout);

module.exports = router;
