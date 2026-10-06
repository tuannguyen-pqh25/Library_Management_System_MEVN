const express = require("express");
const chatbot = require("../controllers/chatbot.controller");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

// Rate limiter riêng cho chatbot: 30 request/phút (thoải mái hơn loginLimiter)
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            reply: "Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một chút nhé! 😊"
        });
    }
});

// Gửi tin nhắn đến chatbot (tự động lưu vào CHAT_HISTORY)
router.route("/message")
    .post(chatLimiter, chatbot.sendMessage);

// Lấy lịch sử chat của độc giả từ CHAT_HISTORY
router.route("/history/:docGiaId")
    .get(chatbot.getHistory);

module.exports = router;

