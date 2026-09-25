const { ObjectId } = require("mongodb");
const redis = require("../config/redis");
const bcrypt = require("bcryptjs");

class DocGiaService {
    constructor(client) {
        this.DocGia = client.db().collection("DOCGIA");
    }

    #extractDocGiaData(payload = {}) {
        const normalizedEmail = payload.Email ?? payload.email ?? payload.username ?? null;
        const normalizedPassword = payload.MatKhau ?? payload.password ?? payload.Password ?? null;

        const docgia = {
            MaDocGia: payload.MaDocGia ?? payload.maDocGia ?? payload.MADOCGIA ?? null,
            HoLot: payload.HoLot ?? payload.hoLot ?? payload.HOLOT ?? null,
            Ten: payload.Ten ?? payload.ten ?? payload.TEN ?? null,
            NgaySinh: payload.NgaySinh ?? payload.ngaySinh ?? payload.NGAYSINH ?? null,
            Phai: payload.Phai ?? payload.gioiTinh ?? payload.GIOITINH ?? "Khác",
            DiaChi: payload.DiaChi ?? payload.diaChi ?? payload.DIACHI ?? null,
            DienThoai: payload.DienThoai ?? payload.dienThoai ?? payload.DIENTHOAI ?? null,
            Email: normalizedEmail,
            MatKhau: normalizedPassword,
            TrangThaiTaiKhoan: payload.TrangThaiTaiKhoan ?? "BinhThuong",
            favorites: payload.favorites ?? [],
            username: payload.username ?? normalizedEmail,
            password: normalizedPassword,
            HOLOT: payload.HOLOT ?? payload.HoLot ?? null,
            TEN: payload.TEN ?? payload.Ten ?? null,
            NGAYSINH: payload.NGAYSINH ?? payload.NgaySinh ?? null,
            GIOITINH: payload.GIOITINH ?? payload.Phai ?? null,
            DIACHI: payload.DIACHI ?? payload.DiaChi ?? null,
            DIENTHOAI: payload.DIENTHOAI ?? payload.DienThoai ?? null,
        };

        Object.keys(docgia).forEach(
            (key) => docgia[key] === undefined && delete docgia[key]
        );
        return docgia;
    }

    // --- Chức năng XÁC THỰC --

    /**
     * Đăng ký một tài khoản độc giả mới.
     * @param {object} payload Dữ liệu độc giả từ req.body
     * @returns {object} Document độc giả vừa tạo (đã bỏ password)
     */
    async create(payload) {
        const docgiaData = this.#extractDocGiaData(payload);

        if (!docgiaData.Email) {
            throw new Error("Email là bắt buộc");
        }

        if (!docgiaData.MatKhau) {
            throw new Error("Mật khẩu là bắt buộc");
        }

        if (!docgiaData.MaDocGia) {
            docgiaData.MaDocGia = `DG${Date.now().toString().slice(-6)}`;
        }

        const existingDocGia = await this.DocGia.findOne({
            $or: [{ Email: docgiaData.Email }, { MaDocGia: docgiaData.MaDocGia }],
        });

        if (existingDocGia) {
            throw new Error("Email hoặc mã độc giả đã tồn tại");
        }

        const salt = await bcrypt.genSalt(10);
        docgiaData.MatKhau = await bcrypt.hash(docgiaData.MatKhau, salt);
        docgiaData.TrangThaiTaiKhoan = docgiaData.TrangThaiTaiKhoan || "BinhThuong";

        await this.DocGia.insertOne(docgiaData);

        delete docgiaData.MatKhau;
        delete docgiaData.password;
        return docgiaData;
    }

    /**
     * Đăng nhập độc giả.
     * @param {object} payload Chứa Email và MatKhau
     * @returns {object} Thông tin độc giả (đã bỏ password)
     */
    async login(payload, ip) {
        const email = payload.Email ?? payload.email ?? payload.username;
        const password = payload.MatKhau ?? payload.password ?? payload.Password;

        if (!email || !password) {
            throw {
                status: 400,
                message: "Email và mật khẩu là bắt buộc",
            };
        }

        try {
            const lockedValue = await redis.get(`login_lock:${email}:${ip}`);
            if (lockedValue) {
                const ttl = await redis.ttl(`login_lock:${email}:${ip}`);
                throw {
                    status: 423,
                    message: `Tài khoản bị khóa. Thử lại sau ${ttl} giây`,
                };
            }
        } catch (error) {
            if (error && error.status) {
                throw error;
            }
        }

        const docgia = await this.DocGia.findOne({ Email: email });
        if (!docgia) {
            throw {
                status: 401,
                message: "Email hoặc mật khẩu không đúng",
            };
        }

        if (docgia.TrangThaiTaiKhoan === "BiKhoa") {
            throw {
                status: 403,
                message: "Tài khoản đã bị khóa",
            };
        }

        const hash = docgia.MatKhau || docgia.password;
        const isMatch = await bcrypt.compare(password, hash);

        if (!isMatch) {
            throw {
                status: 401,
                message: "Email hoặc mật khẩu không đúng",
            };
        }

        delete docgia.MatKhau;
        delete docgia.password;
        return docgia;
    }

    
    async find(filter) {
        const cursor = await this.DocGia.find(filter);
        return await cursor.toArray();
    }

    //Tìm độc giả băng tên
    async findByTen(ten) {
        return await this.find({
            TEN: { $regex: new RegExp(ten), $options: "i" },
        });
    }

    //Tìm độc giả bằng ID
    async findById(id) {
        let objectId;
        if (ObjectId.isValid(id)) {
            objectId = new ObjectId(id);
        } else {
            objectId = id;
        }
        return await this.DocGia.findOne({
            _id: objectId,
        });
    }
 
    // Cập nhật thông tin độc giả (dùng cho Admin).
    async update(id, payload) {
        let objectId;
        if (ObjectId.isValid(id)) {
            objectId = new ObjectId(id);
        } else {
            objectId = id;
        }

        const filter = {
            _id: objectId,
        };
        const update = this.#extractDocGiaData(payload);

        // Nếu người dùng cập nhật cả password, ta phải hash nó
        if (update.password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(update.password, salt);
        } else {
            // Nếu không có pass mới, xóa trường này để không ghi đè
            delete update.password;
        }

        // Nếu không có username mới, xóa trường này để không ghi đè
        if (update.username === undefined) {
             delete update.username;
        }

        // Nếu favorites không được cung cấp, xóa khỏi update để không ghi đè
        if (payload.favorites === undefined) {
            delete update.favorites;
        }

        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        if (result.value) delete result.value.password;
        return result;
    }

     // Xóa độc giả (dùng cho Admin).
    async delete(id) {
        let objectId;
        if (ObjectId.isValid(id)) {
            objectId = new ObjectId(id);
        } else {
            objectId = id;
        }

        const result = await this.DocGia.findOneAndDelete({
            _id: objectId,
        });
        return result;
    }

     //Xóa tất cả độc giả (dùng cho Admin).
    async deleteAll() {
        const result = await this.DocGia.deleteMany({});
        return result.deletedCount;
    }

    // --- Chức năng YÊU THÍCH SÁCH ---

    /**
     * Thêm sách vào danh sách yêu thích của độc giả
     * @param {string} docGiaId ID của độc giả
     * @param {string} sachId ID của sách
     * @returns {object} Thông tin độc giả đã cập nhật
     */
    async addFavorite(docGiaId, sachId) {
        let objectId;
        if (ObjectId.isValid(docGiaId)) {
            objectId = new ObjectId(docGiaId);
        } else {
            objectId = docGiaId;
        }

        const filter = {
            _id: objectId,
        };

        const update = {
            $addToSet: { favorites: sachId } // $addToSet để tránh trùng lặp
        };

        await this.DocGia.updateOne(filter, update);
        const updatedDoc = await this.DocGia.findOne({ _id: objectId });

        if (!updatedDoc) {
            throw new Error("Không tìm thấy độc giả");
        }

        delete updatedDoc.password;
        return updatedDoc;
    }

    /**
     * Xóa sách khỏi danh sách yêu thích của độc giả
     * @param {string} docGiaId ID của độc giả
     * @param {string} sachId ID của sách
     * @returns {object} Thông tin độc giả đã cập nhật
     */
    async removeFavorite(docGiaId, sachId) {
        let objectId;
        if (ObjectId.isValid(docGiaId)) {
            objectId = new ObjectId(docGiaId);
        } else {
            objectId = docGiaId;
        }

        const filter = {
            _id: objectId,
        };

        const update = {
            $pull: { favorites: sachId }
        };

        await this.DocGia.updateOne(filter, update);
        const updatedDoc = await this.DocGia.findOne({ _id: objectId });

        if (!updatedDoc) {
            throw new Error("Không tìm thấy độc giả");
        }

        delete updatedDoc.password;
        return updatedDoc;
    }

    /**
     * Lấy danh sách sách yêu thích của độc giả
     * @param {string} docGiaId ID của độc giả
     * @returns {array} Danh sách ID sách yêu thích
     */
    async getFavorites(docGiaId) {
        let objectId;
        if (ObjectId.isValid(docGiaId)) {
            objectId = new ObjectId(docGiaId);
        } else {
            objectId = docGiaId;
        }

        const docgia = await this.DocGia.findOne({
            _id: objectId,
        });

        if (!docgia) {
            throw new Error("Không tìm thấy độc giả");
        }

        return docgia.favorites || [];
    }

    /**
     * Kiểm tra username có tồn tại không
     * @param {string} username Tên đăng nhập cần kiểm tra
     * @returns {boolean} True nếu tồn tại, false nếu không
     */
    async checkUsernameExists(username) {
        const count = await this.DocGia.countDocuments({ username });
        return count > 0;
    }
}

module.exports = DocGiaService;
