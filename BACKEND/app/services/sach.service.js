const { ObjectId } = require("mongodb");
const { uploadImageFromUrl, deleteImage } = require("../utils/cloudinary.util");
const config = require("../config");

class SachService {
    constructor(client) {
        this.client = client;
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
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
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
        const now = new Date().toISOString();
        if (!sachData.createdAt) {
            sachData.createdAt = now;
        }
        sachData.updatedAt = now;

        // Tự động sinh MaSach
        if (!sachData.MaSach) {
            // Đếm số lượng sách hiện có để tạo mã
            const count = await this.Sach.countDocuments();
            sachData.MaSach = `S${String(count + 1).padStart(3, '0')}`;

            // Đảm bảo mã không trùng
            let isDuplicate = await this.Sach.findOne({ MaSach: sachData.MaSach });
            let attempts = 1;
            while (isDuplicate) {
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

        // B. Nếu có hình ảnh và có cấu hình Cloudinary, thử upload lên Cloudinary
        const hasCloudinary = Boolean(config.cloudinary?.cloudName && config.cloudinary?.apiKey && config.cloudinary?.apiSecret);
        if (sachData.HinhAnh && hasCloudinary && !sachData.HinhAnh.includes("/uploads/")) {
            try {
                const uploadResult = await uploadImageFromUrl(sachData.HinhAnh);
                if (uploadResult?.success) {
                    sachData.HinhAnh = uploadResult.url;
                    sachData.CloudinaryPublicId = uploadResult.publicId; // Lưu ID để xóa sau
                }
            } catch (cloudErr) {
                console.warn("Cloudinary upload failed, keeping original image URL:", cloudErr.message);
            }
        }

        // C. Chèn sách mới vào CSDL
        const result = await this.Sach.insertOne(sachData);

        const newDocument = await this.findById(result.insertedId);
        return newDocument;
    }

    // 2. Tìm tất cả sách
    async find(filter) {
        const cursor = await this.Sach.find(filter);
        const books = await cursor.toArray();
        try {
            const [nxbs, borrowAgg] = await Promise.all([
                this.client.db().collection("NHAXUATBAN").find({}).toArray(),
                this.client.db().collection("THEODOIMUONSACH").aggregate([
                    { $match: { trangThai: { $in: ["đang mượn", "đã duyệt", "đã trả", "quá hạn"] } } },
                    { $group: { _id: "$sachId", count: { $sum: { $ifNull: ["$soLuong", 1] } } } }
                ]).toArray()
            ]);

            const nxbMap = new Map();
            nxbs.forEach(n => {
                if (n.MaNXB) nxbMap.set(n.MaNXB, n.TenNXB);
                if (n._id) nxbMap.set(n._id.toString(), n.TenNXB);
            });

            const borrowCountMap = new Map();
            borrowAgg.forEach(b => {
                if (b._id) borrowCountMap.set(b._id.toString(), b.count);
            });

            return books.map(book => {
                const soLanMuon = borrowCountMap.get(book._id.toString()) || 0;
                return {
                    ...book,
                    TenNXB: nxbMap.get(book.MaNXB) || nxbMap.get(book.MaNXB?.toString()) || book.MaNXB || '—',
                    soLanMuon,
                    isHot: soLanMuon >= 3
                };
            });
        } catch (_) {
            return books;
        }
    }

    // 3. Tìm sách bằng Tên
    async findByName(name) {
        return await this.find({
            TenSach: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // 4. Tìm sách bằng ID
    async findById(id) {
        const book = await this.Sach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        if (!book) return null;
        try {
            let nxb = null;
            if (book.MaNXB) {
                nxb = await this.client.db().collection("NHAXUATBAN").findOne({ MaNXB: book.MaNXB });
                if (!nxb && ObjectId.isValid(book.MaNXB)) {
                    nxb = await this.client.db().collection("NHAXUATBAN").findOne({ _id: new ObjectId(book.MaNXB) });
                }
            }
            return {
                ...book,
                TenNXB: nxb ? nxb.TenNXB : (book.MaNXB || '—')
            };
        } catch (_) {
            return book;
        }
    }

    // 5. Cập nhật sách
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.#extractSachData(payload);
        update.updatedAt = new Date().toISOString();

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

        // Nếu có ảnh mới và có cấu hình Cloudinary, upload lên Cloudinary và xóa ảnh cũ
        const hasCloudinaryUpdate = Boolean(config.cloudinary?.cloudName && config.cloudinary?.apiKey && config.cloudinary?.apiSecret);
        if (update.HinhAnh && update.HinhAnh !== oldBook?.HinhAnh) {
            if (hasCloudinaryUpdate) {
                // Xóa ảnh cũ từ Cloudinary nếu có
                if (oldBook?.CloudinaryPublicId) {
                    try { await deleteImage(oldBook.CloudinaryPublicId); } catch (_) { }
                }

                // Upload ảnh mới lên Cloudinary nếu không phải file cục bộ
                if (!update.HinhAnh.includes("/uploads/")) {
                    try {
                        const uploadResult = await uploadImageFromUrl(update.HinhAnh);
                        if (uploadResult?.success) {
                            update.HinhAnh = uploadResult.url;
                            update.CloudinaryPublicId = uploadResult.publicId;
                        }
                    } catch (cloudErr) {
                        console.warn("Cloudinary update failed, keeping original image URL:", cloudErr.message);
                    }
                }
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