const { ObjectId } = require("mongodb");

class YeuThichService {
    constructor(client) {
        this.client = client;
        this.YeuThich = client.db().collection("YEUTHICH");
        this.Sach = client.db().collection("SACH");
    }

    /**
     * Lấy danh sách yêu thích của 1 độc giả (có populate sách)
     */
    async getByDocGia(docGiaId) {
        const id = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        if (!id) throw new Error("ID Độc giả không hợp lệ");

        const records = await this.YeuThich.find({ docGiaId: id })
            .sort({ createdAt: -1 })
            .toArray();

        // Populate thông tin sách
        const populated = await Promise.all(records.map(async (rec) => {
            const out = { ...rec };
            if (rec.sachId) {
                try {
                    const sach = await this.Sach.findOne({
                        _id: ObjectId.isValid(rec.sachId) ? new ObjectId(rec.sachId) : rec.sachId
                    });
                    if (sach) {
                        out.sach = {
                            _id: sach._id,
                            TenSach: sach.TenSach,
                            TacGia: sach.TacGia,
                            HinhAnh: sach.HinhAnh,
                            TheLoai: sach.TheLoai,
                            SoQuyen: sach.SoQuyen,
                            DonGia: sach.DonGia,
                        };
                    }
                } catch (_) {}
            }
            return out;
        }));

        return populated;
    }

    /**
     * Kiểm tra sách đã được yêu thích bởi 1 độc giả chưa
     */
    async isWishlisted(docGiaId, sachId) {
        const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!dgId || !sId) return false;

        const existing = await this.YeuThich.findOne({ docGiaId: dgId, sachId: sId });
        return !!existing;
    }

    /**
     * Toggle yêu thích: thêm nếu chưa có, xóa nếu đã có
     */
    async toggle(docGiaId, sachId) {
        const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!dgId || !sId) throw new Error("ID không hợp lệ");

        // Kiểm tra sách tồn tại
        const sach = await this.Sach.findOne({ _id: sId });
        if (!sach) throw new Error("Không tìm thấy sách");

        const existing = await this.YeuThich.findOne({ docGiaId: dgId, sachId: sId });

        if (existing) {
            // Bỏ yêu thích
            await this.YeuThich.deleteOne({ _id: existing._id });
            return { action: "removed", wishlisted: false };
        } else {
            // Thêm yêu thích
            await this.YeuThich.insertOne({
                docGiaId: dgId,
                sachId: sId,
                createdAt: new Date().toISOString(),
            });
            return { action: "added", wishlisted: true };
        }
    }

    /**
     * Xóa 1 cuốn sách khỏi wishlist
     */
    async remove(docGiaId, sachId) {
        const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!dgId || !sId) throw new Error("ID không hợp lệ");

        const result = await this.YeuThich.deleteOne({ docGiaId: dgId, sachId: sId });
        return result;
    }
}

module.exports = YeuThichService;
