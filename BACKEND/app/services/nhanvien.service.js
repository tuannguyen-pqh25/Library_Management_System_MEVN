const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs"); 
const redis = require("../config/redis");
class NhanVienService {
    constructor(client) {
        this.NhanVien = client.db().collection("NHANVIEN");
    }

    #extractNhanVienData(payload) {
        const nhanvien = {
            MSNV: payload.MSNV,
            Password: payload.password, // Nhận "password" (thường)
            HoTenNV: payload.HoTenNV,
            ChucVu: payload.ChucVu, // <-- FIX 1: Bỏ (|| "staff")
            DiaChi: payload.DiaChi,
            SoDienThoai: payload.SoDienThoai,
            EMAIL: payload.EMAIL,
            CCCD: payload.CCCD,
            AVATAR: payload.AVATAR,
        };

        Object.keys(nhanvien).forEach(
            (key) => nhanvien[key] === undefined && delete nhanvien[key]
        );
        return nhanvien;
    }

    async create(payload) {
        const nhanvienData = this.#extractNhanVienData(payload);

        // (Kiểm tra MSNV đã tồn tại - giữ nguyên)
        const existingNhanVien = await this.NhanVien.findOne({ MSNV: nhanvienData.MSNV });
        if (existingNhanVien) {
            throw new Error("MSNV đã tồn tại");
        }

        // (Băm mật khẩu - giữ nguyên)
        if (nhanvienData.Password) {
            const salt = await bcrypt.genSalt(10);
            nhanvienData.Password = await bcrypt.hash(nhanvienData.Password, salt);
        } else {
            throw new Error("Mật khẩu là bắt buộc");
        }
        
        // FIX 2: Sửa logic kiểm tra (chấp nhận "Admin" (hoa))
        if (!nhanvienData.ChucVu || !["Staff", "Admin"].includes(nhanvienData.ChucVu)) {
             nhanvienData.ChucVu = "Staff"; // Mặc định là "Staff" (hoa)
        }

        // (Đã sửa lỗi insertedId)
        await this.NhanVien.insertOne(nhanvienData);
        
        delete nhanvienData.Password; 
        return nhanvienData;
    }

    async login(payload, ip) {
        const username = payload.MSNV;
        const failKey = `login_fail:${username}:${ip}`;
        const lockKey = `login_lock:${username}:${ip}`;
        // 1. Kiểm tra tài khoản có bị khóa
        const locked = await redis.get(lockKey);
        if (locked) {
            const ttl = await redis.ttl(lockKey);
            throw {
                status: 423,
                message:
                    `Tài khoản bị khóa. Thử lại sau ${ttl} giây`
            };
        }
        const nhanvien = await this.NhanVien.findOne({ MSNV: payload.MSNV });
        
        if (!nhanvien) {
            throw new Error("MSNV hoặc Mật khẩu không đúng");
        }
        const isMatch = await bcrypt.compare(payload.password, nhanvien.Password);
        
        if (!isMatch) {
            const attempts = await redis.incr(failKey);
            console.log(`Số lần thử đăng nhập thất bại cho ${username}: ${ip} : ${attempts}`);
            if (attempts === 1) {
                await redis.expire(
                    failKey,
                    900
                );
            }
            if (attempts >= 5) {
                await redis.set(
                    lockKey,
                    "locked",
                    {
                        EX: 900
                    }
                );
                await redis.del(failKey);
                throw {
                    status: 423,
                    message:
                        "Tài khoản bị khóa 15 phút do nhập sai quá nhiều lần"
                };
            }
            throw {
                status: 401,
                message:
                    `Sai mật khẩu. Còn ${5 - attempts} lần thử`
            };
        }
        // 4. Login thành công
        await redis.del(failKey);
        delete nhanvien.Password;
        return nhanvien;

    }

    // --- Chức năng CRUD (Giữ nguyên) ---
 
    async find(filter) {
        const cursor = await this.NhanVien.find(filter);
        return await cursor.toArray();
    }
    
    async findById(id) {
        return await this.NhanVien.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }); 
    }
   
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        // FIX 3: Sửa lại extractData khi update - thêm EMAIL, CCCD, AVATAR
        const updatePayload = {
            HoTenNV: payload.HoTenNV,
            ChucVu: payload.ChucVu,
            DiaChi: payload.DiaChi,
            SoDienThoai: payload.SoDienThoai,
            EMAIL: payload.EMAIL,
            CCCD: payload.CCCD,
            AVATAR: payload.AVATAR,
        }
        // Xóa các trường undefined
         Object.keys(updatePayload).forEach(
            (key) => updatePayload[key] === undefined && delete updatePayload[key]
        );

        // Xử lý password nếu được cung cấp
        if (payload.password) {
            const salt = await bcrypt.genSalt(10);
            updatePayload.Password = await bcrypt.hash(payload.password, salt);
        }

        const result = await this.NhanVien.findOneAndUpdate(
            filter,
            { $set: updatePayload },
            { returnDocument: "after" }
        );
        
        if (result.value) delete result.value.Password;
        return result;
    }

    async delete(id) {
        const result = await this.NhanVien.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result; 
    }

    async deleteAll() {
        const result = await this.NhanVien.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhanVienService;