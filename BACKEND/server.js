const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const Redis = require("./app/utils/redis.util");

async function startServer() {
    try {
        // Kết nối CSDL
        await MongoDB.connect(config.db.uri);

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
