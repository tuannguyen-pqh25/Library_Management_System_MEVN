const { createClient } = require("redis");

let errorLogged = false;

const redisClient = createClient({
    url: "redis://localhost:6379",
    socket: {
        // Chỉ reconnect tối đa vài lần với backoff để tránh spam lỗi khi Redis chưa sẵn sàng
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return false; // Dừng tổng hợp sau 10 lần thử, để ứng dụng vẫn chạy
            }
            return Math.min(retries * 200, 2000);
        }
    }
});

redisClient.on("error", (err) => {
    if (!errorLogged) {
        console.log("Redis error:", err.message);
        errorLogged = true;
    }
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redisClient.on("connect", () => {
    errorLogged = false;
    console.log("Redis connected.");
});

redisClient.connect().catch((err) => {
    console.log("Redis initial connect failed:", err.message);
});


module.exports = redisClient;
