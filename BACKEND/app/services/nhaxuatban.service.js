const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.NhaXuatBan = client.db().collection("NHAXUATBAN");
    }

    #extractNhaXuatBanData(payload) {
        const nhaXuatBan = {
            MANXB: payload.MANXB,
            TENNXB: payload.TENNXB,
            DIACHI: payload.DIACHI,
        };

        Object.keys(nhaXuatBan).forEach(
            (key) => nhaXuatBan[key] === undefined && delete nhaXuatBan[key]
        );
        return nhaXuatBan;
    }

    /**
     * 1. Create: Tạo một NXB mới.
     * Logic: Kiểm tra trùng TENNXB.
     */
    async create(payload) {
        const nxbData = this.#extractNhaXuatBanData(payload);

        // Kiểm tra xem TENNXB đã tồn tại chưa
        const existingNXB = await this.NhaXuatBan.findOne({ TENNXB: nxbData.TENNXB });
        if (existingNXB) {
            throw new Error("Tên Nhà Xuất Bản đã tồn tại");
        }
        
        // Kiểm tra xem MANXB đã tồn tại chưa (nếu bạn muốn MANXB là duy nhất)
        if (nxbData.MANXB) {
             const existingMaNXB = await this.NhaXuatBan.findOne({ MANXB: nxbData.MANXB });
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
            TENNXB: { $regex: new RegExp(ten), $options: "i" },
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

        // Kiểm tra xem TENNXB đã tồn tại chưa (trừ bản ghi hiện tại)
        if (update.TENNXB) {
            const existingNXB = await this.NhaXuatBan.findOne({
                TENNXB: update.TENNXB,
                _id: { $ne: filter._id }
            });
            if (existingNXB) {
                throw new Error("Tên Nhà Xuất Bản đã tồn tại");
            }
        }

        // Kiểm tra xem MANXB đã tồn tại chưa (trừ bản ghi hiện tại)
        if (update.MANXB) {
            const existingMaNXB = await this.NhaXuatBan.findOne({
                MANXB: update.MANXB,
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