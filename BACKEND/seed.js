require("dotenv").config();
const { MongoClient } = require("mongodb");
const config = require("./app/config");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  const client = new MongoClient(config.db.uri);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db();
    const nhanVienCollection = db.collection("NHANVIEN"); 

    const adminExists = await nhanVienCollection.findOne({ MSNV: "ADMIN001" });
    if (adminExists) {
      console.log("Admin ADMIN001 already exists!");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@123", salt);

      await nhanVienCollection.insertOne({
        MSNV: "ADMIN001",
        HoTenNV: "Quản Trị Viên Hệ Thống",
        Password: hashedPassword,
        ChucVu: "Admin",
        DiaChi: "Hệ thống",
        SoDienThoai: "0123456789"
      });
      console.log("Created Admin with MSNV: ADMIN001, Password: Admin@123");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await client.close();
  }
}

seedAdmin();
