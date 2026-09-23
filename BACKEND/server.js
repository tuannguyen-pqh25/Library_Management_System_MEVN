const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util"); 

async function startServer() {
    try {
        // Kết nối CSDL
        await MongoDB.connect(config.db.uri);

        // Khởi động server
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error("Cannot connect to the database!", error);
        process.exit();
    }
}

startServer();
