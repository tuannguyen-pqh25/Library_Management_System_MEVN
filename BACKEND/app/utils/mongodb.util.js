const { MongoClient } = require("mongodb");

class MongoDB {
    static client = null;

    static async connect(uri) {
        if (this.client) return this.client;
        try {
            this.client = new MongoClient(uri);
            await this.client.connect();
    
            return this.client;
        } catch (error) {
            console.error("Failed to connect to MongoDB", error);
            process.exit(1);
        }
    }

    static get clientInstance() {
        return this.client;
    }
}

module.exports = MongoDB;