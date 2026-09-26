require("dotenv").config();
const { MongoClient } = require("mongodb");
const config = require("./app/config");

async function seedData() {
  const client = new MongoClient(config.db.uri);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db();
    const nxbCollection = db.collection("NHAXUATBAN");
    const sachCollection = db.collection("SACH");

    // Xóa dữ liệu cũ do nhầm key
    await nxbCollection.deleteMany({});
    await sachCollection.deleteMany({});

    // Bơm dữ liệu NXB
    const nxbs = [
      { MaNXB: "NXB01", TenNXB: "Nhà Xuất Bản Trẻ", DiaChi: "TP. Hồ Chí Minh" },
      { MaNXB: "NXB02", TenNXB: "Nhà Xuất Bản Kim Đồng", DiaChi: "Hà Nội" },
      { MaNXB: "NXB03", TenNXB: "Nhà Xuất Bản Giáo Dục", DiaChi: "Hà Nội" }
    ];

    for (const nxb of nxbs) {
      await nxbCollection.insertOne(nxb);
    }
    console.log("✅ Đã bơm dữ liệu Nhà xuất bản (NXB) thành công!");

    // Bơm dữ liệu Sách
    const sachs = [
      { 
        MaSach: "S001", TenSach: "Dế Mèn Phiêu Lưu Ký", DonGia: 50000, 
        SoQuyen: 10, NamXuatBan: 2020, MaNXB: "NXB02", 
        TacGia: "Tô Hoài", HinhAnh: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop" 
      },
      { 
        MaSach: "S002", TenSach: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", DonGia: 85000, 
        SoQuyen: 5, NamXuatBan: 2018, MaNXB: "NXB01", 
        TacGia: "Nguyễn Nhật Ánh", HinhAnh: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop" 
      },
      { 
        MaSach: "S003", TenSach: "Đắc Nhân Tâm", DonGia: 120000, 
        SoQuyen: 20, NamXuatBan: 2021, MaNXB: "NXB01", 
        TacGia: "Dale Carnegie", HinhAnh: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop" 
      },
      { 
        MaSach: "S004", TenSach: "Clean Code", DonGia: 250000, 
        SoQuyen: 3, NamXuatBan: 2015, MaNXB: "NXB03", 
        TacGia: "Robert C. Martin", HinhAnh: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop" 
      }
    ];

    for (const sach of sachs) {
      await sachCollection.insertOne(sach);
    }
    console.log("✅ Đã bơm dữ liệu Sách thành công!");

  } catch (error) {
    console.error("Lỗi khi bơm dữ liệu:", error);
  } finally {
    await client.close();
  }
}

seedData();
