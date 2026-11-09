require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach";

async function seedDashboard() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db();

    const DocGiaCol = db.collection("DOCGIA");
    const SachCol = db.collection("SACH");
    const MuonSachCol = db.collection("THEODOIMUONSACH");
    const NhanVienCol = db.collection("NHANVIEN");

    // 1. Lấy danh sách nhân viên để gán người duyệt
    const nhanViens = await NhanVienCol.find({}).toArray();
    const adminStaff = nhanViens.find(nv => nv.MSNV === "ADMIN001") || nhanViens[0];
    const staffId = adminStaff ? adminStaff._id : new ObjectId();

    // 2. Lấy danh sách Sách có sẵn
    const allBooks = await SachCol.find({}).toArray();
    if (allBooks.length === 0) {
      console.error("Không tìm thấy sách nào trong CSDL! Vui lòng seed sách trước.");
      return;
    }
    console.log(`Tìm thấy ${allBooks.length} cuốn sách.`);

    // Ưu tiên các sách nổi bật để tạo Top Sách
    const popularBooks = allBooks.slice(0, 8);

    // 3. Tạo thêm độc giả mẫu (16 độc giả mới)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("Docgia@123", salt);

    const sampleReaders = [
      { MaDocGia: "DG1001", HoLot: "Nguyễn Văn", Ten: "An", Phai: "Nam", NgaySinh: "2003-05-12", DienThoai: "0901234501", Email: "an.nguyen@student.edu.vn", DiaChi: "Ninh Kiều, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1002", HoLot: "Trần Thị", Ten: "Bích", Phai: "Nữ", NgaySinh: "2004-08-22", DienThoai: "0901234502", Email: "bich.tran@student.edu.vn", DiaChi: "Cái Răng, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1003", HoLot: "Lê Hoàng", Ten: "Long", Phai: "Nam", NgaySinh: "2002-11-03", DienThoai: "0901234503", Email: "long.le@student.edu.vn", DiaChi: "Bình Thủy, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1004", HoLot: "Phạm Minh", Ten: "Đức", Phai: "Nam", NgaySinh: "2003-02-19", DienThoai: "0901234504", Email: "duc.pham@student.edu.vn", DiaChi: "Ô Môn, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1005", HoLot: "Đỗ Thảo", Ten: "My", Phai: "Nữ", NgaySinh: "2004-09-15", DienThoai: "0901234505", Email: "my.do@student.edu.vn", DiaChi: "Ninh Kiều, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1006", HoLot: "Vũ Quốc", Ten: "Bảo", Phai: "Nam", NgaySinh: "2001-07-28", DienThoai: "0901234506", Email: "bao.vu@student.edu.vn", DiaChi: "Thốt Nốt, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1007", HoLot: "Hoàng Ngọc", Ten: "Ánh", Phai: "Nữ", NgaySinh: "2003-12-05", DienThoai: "0901234507", Email: "anh.hoang@student.edu.vn", DiaChi: "Phong Điền, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1008", HoLot: "Bùi Tiến", Ten: "Dũng", Phai: "Nam", NgaySinh: "2002-04-14", DienThoai: "0901234508", Email: "dung.bui@student.edu.vn", DiaChi: "Vĩnh Thạnh, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1009", HoLot: "Đinh Phương", Ten: "Thảo", Phai: "Nữ", NgaySinh: "2004-01-30", DienThoai: "0901234509", Email: "thao.dinh@student.edu.vn", DiaChi: "Ninh Kiều, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1010", HoLot: "Lý Gia", Ten: "Huy", Phai: "Nam", NgaySinh: "2003-10-10", DienThoai: "0901234510", Email: "huy.ly@student.edu.vn", DiaChi: "Cái Răng, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1011", HoLot: "Ngô Thanh", Ten: "Vân", Phai: "Nữ", NgaySinh: "2002-06-18", DienThoai: "0901234511", Email: "van.ngo@student.edu.vn", DiaChi: "Bình Thủy, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1012", HoLot: "Hồ Văn", Ten: "Cường", Phai: "Nam", NgaySinh: "2004-03-25", DienThoai: "0901234512", Email: "cuong.ho@student.edu.vn", DiaChi: "Ninh Kiều, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      { MaDocGia: "DG1013", HoLot: "Trương Mỹ", Ten: "Duyên", Phai: "Nữ", NgaySinh: "2003-11-11", DienThoai: "0901234513", Email: "duyen.truong@student.edu.vn", DiaChi: "Cái Răng, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" },
      // Độc giả bị khóa vi phạm để demo
      { MaDocGia: "DG1014", HoLot: "Lê Quốc", Ten: "Khánh", Phai: "Nam", NgaySinh: "2001-09-02", DienThoai: "0901234514", Email: "khanh.le@student.edu.vn", DiaChi: "Ninh Kiều, Cần Thơ", TrangThaiTaiKhoan: "BiKhoa", LyDoKhoa: "Quá hạn mượn sách trên 45 ngày chưa hoàn trả", NgayKhoa: "2026-10-25T08:00:00.000Z", NguoiKhoa: "Quản Trị Viên Hệ Thống" },
      { MaDocGia: "DG1015", HoLot: "Nguyễn Hoài", Ten: "Nam", Phai: "Nam", NgaySinh: "2002-08-17", DienThoai: "0901234515", Email: "nam.nguyen@student.edu.vn", DiaChi: "Bình Thủy, Cần Thơ", TrangThaiTaiKhoan: "BiKhoa", LyDoKhoa: "Làm mất sách 'Clean Code' chưa hoàn tất bồi thường", NgayKhoa: "2026-11-02T14:30:00.000Z", NguoiKhoa: "Quản Trị Viên Hệ Thống" },
      { MaDocGia: "DG1016", HoLot: "Phan Thị", Ten: "Hồng", Phai: "Nữ", NgaySinh: "2004-12-01", DienThoai: "0901234516", Email: "hong.phan@student.edu.vn", DiaChi: "Cái Răng, Cần Thơ", TrangThaiTaiKhoan: "BinhThuong" }
    ];

    for (const r of sampleReaders) {
      const exists = await DocGiaCol.findOne({ MaDocGia: r.MaDocGia });
      if (!exists) {
        await DocGiaCol.insertOne({
          ...r,
          Password: defaultPassword,
          createdAt: new Date("2026-05-15T08:00:00.000Z").toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    console.log("Đã cập nhật danh sách độc giả mẫu.");

    const allReaders = await DocGiaCol.find({}).toArray();
    console.log(`Tổng độc giả hiện hành: ${allReaders.length}`);

    // Xóa các phiếu mượn demo cũ tạo trước đó (nếu có đánh dấu isDemo)
    await MuonSachCol.deleteMany({ isDemo: true });

    // 4. Sinh dữ liệu phiếu mượn phân bổ 6 tháng gần nhất (T6/2026 đến T11/2026)
    const newRecords = [];

    // Helper tạo ngày ngẫu nhiên trong tháng
    function getRandomDateInMonth(year, month, minDay = 1, maxDay = 28) {
      const day = Math.floor(Math.random() * (maxDay - minDay + 1)) + minDay;
      const mStr = String(month).padStart(2, "0");
      const dStr = String(day).padStart(2, "0");
      return `${year}-${mStr}-${dStr}`;
    }

    function addDays(dateStr, days) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    }

    // --- THÁNG 6/2026: 8 phiếu (Tất cả đã trả) ---
    for (let i = 0; i < 8; i++) {
      const reader = allReaders[i % allReaders.length];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = getRandomDateInMonth(2026, 6);
      const ngayTra = addDays(ngayMuon, 14);
      const ngayTraThucTe = addDays(ngayMuon, Math.floor(Math.random() * 10) + 3);
      newRecords.push({
        docGiaId: reader._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đã trả",
        ngayTraThucTe,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T08:30:00.000Z`,
        updatedAt: `${ngayTraThucTe}T16:00:00.000Z`
      });
    }

    // --- THÁNG 7/2026: 11 phiếu (Tất cả đã trả) ---
    for (let i = 0; i < 11; i++) {
      const reader = allReaders[(i + 2) % allReaders.length];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = getRandomDateInMonth(2026, 7);
      const ngayTra = addDays(ngayMuon, 14);
      const ngayTraThucTe = addDays(ngayMuon, Math.floor(Math.random() * 12) + 2);
      newRecords.push({
        docGiaId: reader._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đã trả",
        ngayTraThucTe,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T09:15:00.000Z`,
        updatedAt: `${ngayTraThucTe}T15:20:00.000Z`
      });
    }

    // --- THÁNG 8/2026: 12 phiếu (Tất cả đã trả) ---
    for (let i = 0; i < 12; i++) {
      const reader = allReaders[(i + 4) % allReaders.length];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = getRandomDateInMonth(2026, 8);
      const ngayTra = addDays(ngayMuon, 14);
      const ngayTraThucTe = addDays(ngayMuon, Math.floor(Math.random() * 11) + 2);
      newRecords.push({
        docGiaId: reader._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đã trả",
        ngayTraThucTe,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T10:00:00.000Z`,
        updatedAt: `${ngayTraThucTe}T14:45:00.000Z`
      });
    }

    // --- THÁNG 9/2026: 15 phiếu (14 đã trả, 1 từ chối) ---
    for (let i = 0; i < 14; i++) {
      const reader = allReaders[(i + 1) % allReaders.length];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = getRandomDateInMonth(2026, 9);
      const ngayTra = addDays(ngayMuon, 14);
      const ngayTraThucTe = addDays(ngayMuon, Math.floor(Math.random() * 13) + 1);
      newRecords.push({
        docGiaId: reader._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đã trả",
        ngayTraThucTe,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T08:00:00.000Z`,
        updatedAt: `${ngayTraThucTe}T16:30:00.000Z`
      });
    }
    // 1 phiếu từ chối tháng 9
    newRecords.push({
      docGiaId: allReaders[0]._id,
      sachId: popularBooks[3]._id,
      soLuong: 1,
      ngayMuon: "2026-09-18",
      ngayTra: "2026-10-02",
      trangThai: "từ chối",
      lyDoTuChoi: "Độc giả đang giữ tối đa số lượng sách quy định",
      nhanVienId: staffId,
      isDemo: true,
      createdAt: "2026-09-18T11:00:00.000Z",
      updatedAt: "2026-09-18T14:00:00.000Z"
    });

    // --- THÁNG 10/2026: 18 phiếu (10 đã trả, 4 quá hạn, 3 đang mượn, 1 từ chối) ---
    for (let i = 0; i < 10; i++) {
      const reader = allReaders[(i + 3) % allReaders.length];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = getRandomDateInMonth(2026, 10, 1, 15);
      const ngayTra = addDays(ngayMuon, 14);
      const ngayTraThucTe = addDays(ngayMuon, Math.floor(Math.random() * 10) + 2);
      newRecords.push({
        docGiaId: reader._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đã trả",
        ngayTraThucTe,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T08:30:00.000Z`,
        updatedAt: `${ngayTraThucTe}T16:00:00.000Z`
      });
    }

    // 4 phiếu quá hạn (mượn đầu tháng 10, hạn trả cuối tháng 10)
    const overdueReaders = [allReaders[13], allReaders[14], allReaders[2], allReaders[5]];
    for (let i = 0; i < 4; i++) {
      const r = overdueReaders[i] || allReaders[i];
      const book = popularBooks[i % popularBooks.length];
      const ngayMuon = `2026-10-0${i + 5}`;
      const ngayTra = `2026-10-1${i + 9}`;
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: 1,
        ngayMuon,
        ngayTra,
        trangThai: "quá hạn",
        daTungQuaHan: true,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T09:00:00.000Z`,
        updatedAt: `${ngayTra}T23:59:59.000Z`
      });
    }

    // 3 phiếu đang mượn cuối tháng 10 (hạn trả giữa tháng 11)
    for (let i = 0; i < 3; i++) {
      const r = allReaders[(i + 6) % allReaders.length];
      const book = popularBooks[(i + 2) % popularBooks.length];
      const ngayMuon = `2026-10-2${i + 5}`;
      const ngayTra = `2026-11-1${i + 5}`;
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: 2,
        ngayMuon,
        ngayTra,
        trangThai: "đang mượn",
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T14:00:00.000Z`,
        updatedAt: `${ngayMuon}T15:00:00.000Z`
      });
    }

    // --- THÁNG 11/2026 (Tháng hiện tại): 18 phiếu ---
    // 5 phiếu chờ duyệt (ngày 07, 08, 09/11/2026 để demo thao tác duyệt)
    for (let i = 0; i < 5; i++) {
      const r = allReaders[(i + 7) % allReaders.length];
      const book = allBooks[(i + 10) % allBooks.length];
      const ngayMuon = `2026-11-0${Math.floor(Math.random() * 3) + 7}`;
      const ngayTra = addDays(ngayMuon, 14);
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "chờ duyệt",
        isDemo: true,
        createdAt: `${ngayMuon}T09:30:00.000Z`,
        updatedAt: `${ngayMuon}T09:30:00.000Z`
      });
    }

    // 2 phiếu chờ gia hạn (có yêu cầu gia hạn để demo)
    for (let i = 0; i < 2; i++) {
      const r = allReaders[(i + 1) % allReaders.length];
      const book = popularBooks[i];
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: 1,
        ngayMuon: "2026-10-28",
        ngayTra: "2026-11-12",
        trangThai: "chờ gia hạn",
        soLanGiaHan: 0,
        yeuCauGiaHan: {
          lyDo: i === 0 ? "Em đang làm luận văn tốt nghiệp cần giữ thêm 7 ngày để trích dẫn" : "Sách nhiều kiến thức chuyên sâu, em xin phép gia hạn thêm 1 tuần",
          ngayYeuCau: "2026-11-08T10:00:00.000Z",
          trangThai: "chờ duyệt"
        },
        nhanVienId: staffId,
        isDemo: true,
        createdAt: "2026-10-28T08:00:00.000Z",
        updatedAt: "2026-11-08T10:00:00.000Z"
      });
    }

    // 2 phiếu đang chờ trả (độc giả hẹn ngày mang trả)
    for (let i = 0; i < 2; i++) {
      const r = allReaders[(i + 4) % allReaders.length];
      const book = popularBooks[i + 2];
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: 1,
        ngayMuon: "2026-11-01",
        ngayTra: "2026-11-15",
        ngayDuKienTra: "2026-11-10",
        trangThai: "đang chờ trả",
        nhanVienId: staffId,
        isDemo: true,
        createdAt: "2026-11-01T09:00:00.000Z",
        updatedAt: "2026-11-08T16:00:00.000Z"
      });
    }

    // 6 phiếu đang mượn (đã duyệt và mượn thành công trong tháng 11)
    for (let i = 0; i < 6; i++) {
      const r = allReaders[(i + 8) % allReaders.length];
      const book = popularBooks[(i * 2) % popularBooks.length];
      const ngayMuon = `2026-11-0${(i % 5) + 2}`;
      const ngayTra = addDays(ngayMuon, 14);
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: Math.floor(Math.random() * 2) + 1,
        ngayMuon,
        ngayTra,
        trangThai: "đang mượn",
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `${ngayMuon}T08:00:00.000Z`,
        updatedAt: `${ngayMuon}T10:00:00.000Z`
      });
    }

    // 3 phiếu đã trả trong tháng 11
    for (let i = 0; i < 3; i++) {
      const r = allReaders[(i + 3) % allReaders.length];
      const book = popularBooks[i];
      newRecords.push({
        docGiaId: r._id,
        sachId: book._id,
        soLuong: 1,
        ngayMuon: `2026-11-0${i + 1}`,
        ngayTra: "2026-11-15",
        trangThai: "đã trả",
        ngayTraThucTe: `2026-11-0${i + 5}`,
        nhanVienId: staffId,
        isDemo: true,
        createdAt: `2026-11-0${i + 1}T08:00:00.000Z`,
        updatedAt: `2026-11-0${i + 5}T16:00:00.000Z`
      });
    }

    // Lưu toàn bộ phiếu vào CSDL
    await MuonSachCol.insertMany(newRecords);
    console.log(`Đã bơm thêm thành công ${newRecords.length} phiếu mượn demo!`);

    // 5. Xóa Redis cache để Dashboard hiển thị số liệu mới ngay lập tức
    try {
      const Redis = require("./app/utils/redis.util");
      await Redis.clearMatch("admin:dashboard:stats*");
      await Redis.clearMatch("admin:muonsach:*");
      await Redis.clearMatch("user:sach:*");
      console.log("Đã làm mới sạch sẽ Redis Cache.");
    } catch (e) {
      console.log("Redis cache clear skipped hoặc hoàn tất.");
    }

    // Thống kê nhanh kết quả
    const totalPhieu = await MuonSachCol.countDocuments();
    const statsByStatus = await MuonSachCol.aggregate([
      { $group: { _id: "$trangThai", count: { $sum: 1 } } }
    ]).toArray();

    console.log("\n=================== TỔNG KẾT SAU KHI SEED ===================");
    console.log(`- Tổng số độc giả: ${allReaders.length}`);
    console.log(`- Tổng số phiếu mượn: ${totalPhieu}`);
    console.log("- Phân bổ theo trạng thái:");
    statsByStatus.forEach(s => console.log(`  + ${s._id}: ${s.count} phiếu`));
    console.log("=============================================================");

  } catch (error) {
    console.error("Lỗi khi seed dashboard:", error);
  } finally {
    await client.close();
  }
}

seedDashboard();

