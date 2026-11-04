const { createClient } = require("redis");

class RedisUtil {
    constructor() {
        this.client = null;
    }

    async connect(url) {
        try {
            this.client = createClient({
                url,
                RESP: 2, // Tuong thich voi Redis 5.x tren Windows (khong ho tro RESP3 / lenh HELLO)
                socket: {
                    connectTimeout: 5000,
                    reconnectStrategy: false,
                },
            });

            this.client.on("error", (err) => {
                if (!this.client?.isReady) {
                    this.client = null;
                }
            });
            this.client.on("ready", () => console.log("Redis connected successfully and ready (Port 6379)."));

            await this.client.connect();
        } catch (error) {
            console.log("Khong the ket noi Redis server (port 6379):", error.message || error);
            console.log("He thong tu dong chuyen sang che do fallback (bo qua Cache, hoat dong binh thuong).");
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
            if (key.includes("*")) {
                await this.clearMatch(key);
            } else {
                await this.client.del(key);
                if (key === "admin:dashboard:stats") {
                    await this.clearMatch("admin:dashboard:stats*");
                }
            }
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
