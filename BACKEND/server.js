const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const Redis = require("./app/utils/redis.util");
const { ensureIndexes } = require("./app/utils/indexes.util");

async function startServer() {
    try {
        // Kết nối CSDL
        const client = await MongoDB.connect(config.db.uri);

        // Đảm bảo các Indexes cần thiết luôn được khởi tạo
        try {
            await ensureIndexes(client);
        } catch (indexErr) {
            console.warn("Canh bao tao index:", indexErr.message);
        }

        // Kết nối Redis
        await Redis.connect(config.redis.url);

        // Khởi động server
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error("Cannot connect to the database or Redis!", error);
        process.exit();
    }
}

startServer();
// Trigger nodemon restart 4
