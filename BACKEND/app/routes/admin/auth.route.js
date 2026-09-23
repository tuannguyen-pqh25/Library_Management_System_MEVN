const express = require("express");
const adminAuth = require("../../controllers/admin/auth.controller");
const loginLimiter = require("../../middleware/loginLimiter");

const router = express.Router();

// Route: /api/admin/auth/login
router.post("/login", loginLimiter, adminAuth.login);

module.exports = router;
