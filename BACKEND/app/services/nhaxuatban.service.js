const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.NhaXuatBan = client.db().collection("NHAXUATBAN");
    }

    #extractNhaXuatBanData(payload) {
        const nhaXuatBan = {
            MaNXB: payload.MaNXB,
            TenNXB: payload.TenNXB,
            DiaChi: payload.DiaChi,
        };

        Object.keys(nhaXuatBan).forEach(
            (key) => nhaXuatBan[key] === undefined && delete nhaXuatBan[key]
        );
        return nhaXuatBan;
    }

    /**
     * 1. Create: Tạo một NXB mới.
     * Logic: Kiểm tra trùng TenNXB.
     */
    async create(payload) {
        const nxbData = this.#extractNhaXuatBanData(payload);

        // Kiểm tra xem TenNXB đã tồn tại chưa
        const existingNXB = await this.NhaXuatBan.findOne({ TenNXB: nxbData.TenNXB });
        if (existingNXB) {
            throw new Error("Tên Nhà Xuất Bản đã tồn tại");
        }
        
        // Kiểm tra xem MaNXB đã tồn tại chưa (nếu bạn muốn MaNXB là duy nhất)
        if (nxbData.MaNXB) {
             const existingMaNXB = await this.NhaXuatBan.findOne({ MaNXB: nxbData.MaNXB });
             if (existingMaNXB) {
                throw new Error("Mã Nhà Xuất Bản đã tồn tại");
             }
        }

        // Chèn NXB mới vào CSDL
        const result = await this.NhaXuatBan.insertOne(nxbData);
        const newNXB = await this.findById(result.insertedId);
        return newNXB;
    }


    //2. Find: Tìm tất cả NXB (hoặc theo Tên).
    async find(filter) {
        const cursor = await this.NhaXuatBan.find(filter);
        return await cursor.toArray();
    }
    
    async findByTen(ten) {
         return await this.find({
            TenNXB: { $regex: new RegExp(ten), $options: "i" },
        });
    }

    //3. Find by ID: Tìm NXB bằng ID.
    async findById(id) {
        return await this.NhaXuatBan.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

  
     //4. Update: Cập nhật thông tin NXB.

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.#extractNhaXuatBanData(payload);

        // Kiểm tra xem TenNXB đã tồn tại chưa (trừ bản ghi hiện tại)
        if (update.TenNXB) {
            const existingNXB = await this.NhaXuatBan.findOne({
                TenNXB: update.TenNXB,
                _id: { $ne: filter._id }
            });
            if (existingNXB) {
                throw new Error("Tên Nhà Xuất Bản đã tồn tại");
            }
        }

        // Kiểm tra xem MaNXB đã tồn tại chưa (trừ bản ghi hiện tại)
        if (update.MaNXB) {
            const existingMaNXB = await this.NhaXuatBan.findOne({
                MaNXB: update.MaNXB,
                _id: { $ne: filter._id }
            });
            if (existingMaNXB) {
                throw new Error("Mã Nhà Xuất Bản đã tồn tại");
            }
        }

        const result = await this.NhaXuatBan.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

   
    // 5. Delete: Xóa NXB.
    async delete(id) {
        const result = await this.NhaXuatBan.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result; 
    }

    //6. DeleteAll: Xóa tất cả NXB.  
    async deleteAll() {
        const result = await this.NhaXuatBan.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhaXuatBanService;