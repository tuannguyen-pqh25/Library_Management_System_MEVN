const express = require("express");
const userAuth = require("../../controllers/user/auth.controller");
const loginLimiter = require("../../middleware/loginLimiter");

const router = express.Router();

router.post("/register", userAuth.register);
router.post("/login", loginLimiter, userAuth.login);
router.post("/refresh", userAuth.refresh);
router.post("/logout", userAuth.logout);

// OAuth 2.0 (Google & Facebook)
router.get("/google", userAuth.googleAuth);
router.get("/google/callback", userAuth.googleCallback);
router.get("/facebook", userAuth.facebookAuth);
router.get("/facebook/callback", userAuth.facebookCallback);
router.get("/mock-oauth", userAuth.mockOAuth);

module.exports = router;

