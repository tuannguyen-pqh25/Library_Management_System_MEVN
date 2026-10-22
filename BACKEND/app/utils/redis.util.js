const { createClient } = require("redis");

class RedisUtil {
    constructor() {
        this.client = null;
    }

    async connect(url) {
        try {
            this.client = createClient({
                url,
                socket: {
                    connectTimeout: 1500,
                    reconnectStrategy: false,
                },
            });

            this.client.on("error", (err) => {
                this.client = null; // Vô hiệu hóa cache nếu lỗi
            });
            this.client.on("connect", () => console.log("Redis connected successfully."));

            await this.client.connect();
        } catch (error) {
            console.log("⚠️ Không tìm thấy Redis server (port 6379). Hệ thống tự động chuyển sang chế độ fallback (bỏ qua Cache, hoạt động bình thường).");
            this.client = null;
        }
    }

    async get(key) {
        if (!this.client) return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Redis Get Error:", error);
            return null;
        }
    }

    async set(key, value, EX) {
        if (!this.client) return;
        try {
            await this.client.set(key, JSON.stringify(value), { EX });
        } catch (error) {
            console.error("Redis Set Error:", error);
        }
    }

    async del(key) {
        if (!this.client) return;
        try {
            await this.client.del(key);
        } catch (error) {
            console.error("Redis Del Error:", error);
        }
    }

    async clearMatch(pattern) {
        if (!this.client) return;
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } catch (error) {
            console.error("Redis ClearMatch Error:", error);
        }
    }
}

module.exports = new RedisUtil();
