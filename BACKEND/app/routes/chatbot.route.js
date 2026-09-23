const express = require("express");
const chatbot = require("../controllers/chatbot.controller");
const loginLimiter = require("../middleware/loginLimiter");

const router = express.Router();

// Gửi tin nhắn đến chatbot (tự động lưu vào CHAT_HISTORY)
router.route("/message")
    .post(loginLimiter,chatbot.sendMessage);

// Lấy lịch sử chat của độc giả từ CHAT_HISTORY
router.route("/history/:docGiaId")
    .get(chatbot.getHistory);

module.exports = router;
