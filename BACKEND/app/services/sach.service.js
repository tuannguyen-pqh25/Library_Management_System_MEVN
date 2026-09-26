const { ObjectId } = require("mongodb");
const { uploadImageFromUrl, deleteImage } = require("../utils/cloudinary.util");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("SACH");
    }

    // Hàm trích xuất dữ liệu sách
    #extractSachData(payload) {
        const sach = {
            MaSach: payload.MaSach,
            TenSach: payload.TenSach,
            DonGia: payload.DonGia,
            SoQuyen: payload.SoQuyen,
            NamXuatBan: payload.NamXuatBan,
            MaNXB: payload.MaNXB,
            TacGia: payload.TacGia, 
            HinhAnh: payload.HinhAnh,
            CloudinaryPublicId: payload.CloudinaryPublicId,
            SoTrang: payload.SoTrang,
            MoTa: payload.MoTa,
            NgonNgu: payload.NgonNgu,
            TheLoai: payload.TheLoai,
        };

        // Loại bỏ các trường không xác định (undefined)
        Object.keys(sach).forEach(
            (key) => sach[key] === undefined && delete sach[key]
        );
        return sach;
    }

    // 1. Tạo sách mới
    async create(payload) {
        const sachData = this.#extractSachData(payload);

        // Tự động sinh MaSach
        if (!sachData.MaSach) {
            // Đếm số lượng sách hiện có để tạo mã
            const count = await this.Sach.countDocuments();
            sachData.MaSach = `S${String(count + 1).padStart(3, '0')}`;
            
            // Đảm bảo mã không trùng
            let isDuplicate = await this.Sach.findOne({ MaSach: sachData.MaSach });
            let attempts = 1;
            while(isDuplicate) {
                sachData.MaSach = `S${String(count + 1 + attempts).padStart(3, '0')}`;
                isDuplicate = await this.Sach.findOne({ MaSach: sachData.MaSach });
                attempts++;
            }
        } else {
            const existingMaSach = await this.Sach.findOne({ MaSach: sachData.MaSach });
            if (existingMaSach) {
                throw new Error("Mã sách đã tồn tại");
            }
        }
        
        const existingBook = await this.Sach.findOne({ TenSach: sachData.TenSach });
        if (existingBook) {
            throw new Error("Tên sách đã tồn tại");
        }

        // B. Nếu có hình ảnh, upload lên Cloudinary
        if (sachData.HinhAnh) {
            const uploadResult = await uploadImageFromUrl(sachData.HinhAnh);
            if (uploadResult.success) {
                sachData.HinhAnh = uploadResult.url;
                sachData.CloudinaryPublicId = uploadResult.publicId; // Lưu ID để xóa sau
            } else {
                throw new Error(`Lỗi upload ảnh: ${uploadResult.message}`);
            }
        }

        // C. Chèn sách mới vào CSDL
        const result = await this.Sach.insertOne(sachData);

        const newDocument = await this.Sach.findOne({ _id: result.insertedId });
        return newDocument;
    }

    // 2. Tìm tất cả sách
    async find(filter) {
        const cursor = await this.Sach.find(filter);
        return await cursor.toArray();
    }

    // 3. Tìm sách bằng Tên
    async findByName(name) {
        return await this.find({
            TenSach: { $regex: new RegExp(name), $options: "i" }, 
        });
    }

    // 4. Tìm sách bằng ID
    async findById(id) {
        return await this.Sach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // 5. Cập nhật sách
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.#extractSachData(payload);

        // Cập nhật không trùng tên sách hoặc mã sách (trừ bản ghi hiện tại)
        if (update.TenSach) {
            const existingBook = await this.Sach.findOne({
                TenSach: update.TenSach,
                _id: { $ne: filter._id }
            });
            if (existingBook) {
                throw new Error("Tên sách đã tồn tại");
            }
        }

        if (update.MaSach) {
            const existingMaSach = await this.Sach.findOne({
                MaSach: update.MaSach,
                _id: { $ne: filter._id }
            });
            if (existingMaSach) {
                throw new Error("Mã sách đã tồn tại");
            }
        }

        // Lấy sách cũ để kiểm tra ảnh
        const oldBook = await this.Sach.findOne(filter);

        // Nếu có ảnh mới, upload lên Cloudinary và xóa ảnh cũ
        if (update.HinhAnh && update.HinhAnh !== oldBook?.HinhAnh) {
            // Xóa ảnh cũ từ Cloudinary nếu có
            if (oldBook?.CloudinaryPublicId) {
                await deleteImage(oldBook.CloudinaryPublicId);
            }

            // Upload ảnh mới
            const uploadResult = await uploadImageFromUrl(update.HinhAnh);
            if (uploadResult.success) {
                update.HinhAnh = uploadResult.url;
                update.CloudinaryPublicId = uploadResult.publicId;
            } else {
                throw new Error(`Lỗi upload ảnh: ${uploadResult.message}`);
            }
        }

        const result = await this.Sach.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    // 6. Xóa sách
    async delete(id) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        // Lấy sách để xóa ảnh từ Cloudinary
        const book = await this.Sach.findOne(filter);
        if (book?.CloudinaryPublicId) {
            await deleteImage(book.CloudinaryPublicId);
        }

        const result = await this.Sach.findOneAndDelete(filter);
        return result;
    }

    // 7. Xóa tất cả
    async deleteAll() {
        // FIX 3: Sửa lỗi (NhanVien -> Sach)
        const result = await this.Sach.deleteMany({}); 
        return result.deletedCount;
    }
}

module.exports = SachService;