require("dotenv").config();
const { MongoClient } = require("mongodb");
const config = require("./app/config");
const { ensureIndexes } = require("./app/utils/indexes.util");

async function main() {
    console.log("=== THIET LAP MONGODB INDEXES CHO HE THONG QUAN LY MUON SACH ===");
    console.log(`Connecting to: ${config.db.uri}`);

    const client = new MongoClient(config.db.uri);
    try {
        await client.connect();
        console.log("Ket noi MongoDB thanh cong!\n");

        console.log("Dang khoi tao cac Unique Indexes & Compound Indexes...");
        const result = await ensureIndexes(client, true);

        console.log("\n--------------------------------------------------------------");
        console.log(`Tong ket: ${result.created} indexes da duoc kiem tra/tao thanh cong, ${result.failed} loi.`);
        console.log("--------------------------------------------------------------\n");

        // Liet ke lai toan bo cac indexes thuc te trong database de xac nhan
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log("=== DANH SACH INDEXES DANG HOAT DONG TRONG CSDL ===");
        for (const c of collections) {
            const col = db.collection(c.name);
            const indexes = await col.indexes();
            console.log(`Collection [${c.name}]:`);
            indexes.forEach(idx => {
                const isUnique = idx.unique ? " (UNIQUE)" : "";
                const isSparse = idx.sparse ? " (SPARSE)" : "";
                console.log(`  - ${idx.name}${isUnique}${isSparse}: ${JSON.stringify(idx.key)}`);
            });
        }
        console.log("\nHoan tat thiet lap Indexes!");
    } catch (error) {
        console.error("Loi khi thiet lap indexes:", error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

main();
