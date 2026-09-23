const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 30 * 1000,
    max: 15,
    keyGenerator: (req) => {
        // Ưu tiên header x-test-user (dùng để test), ngược lại dùng IP đã chuẩn hóa IPv6
        return req.headers["x-test-user"] || ipKeyGenerator(req.ip);
    },
    handler: (req, res, next, options) => {
        const resetTime = req.rateLimit.resetTime;
        const seconds = Math.ceil((resetTime - Date.now()) / 1000);

        res.status(429).json({
            success: false,
            message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${seconds} giây.`,
            retryAfter: seconds
        });
    }
});

module.exports = loginLimiter;
