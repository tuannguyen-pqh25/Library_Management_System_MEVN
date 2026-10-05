const { ObjectId } = require("mongodb");

class DanhGiaService {
    constructor(client) {
        this.client = client;
        this.DanhGia = client.db().collection("DANHGIA");
        this.Sach = client.db().collection("SACH");
        this.DocGia = client.db().collection("DOCGIA");
    }

    /**
     * Lấy tất cả đánh giá của 1 cuốn sách (có populate tên độc giả)
     */
    async getBySach(sachId, { page = 1, limit = 10 } = {}) {
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!sId) throw new Error("ID Sách không hợp lệ");

        const skip = (page - 1) * limit;
        const total = await this.DanhGia.countDocuments({ sachId: sId });
        const records = await this.DanhGia.find({ sachId: sId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        // Populate tên độc giả
        const populated = await Promise.all(records.map(async (rec) => {
            const out = { ...rec };
            if (rec.docGiaId) {
                try {
                    const docGia = await this.DocGia.findOne({
                        _id: ObjectId.isValid(rec.docGiaId) ? new ObjectId(rec.docGiaId) : rec.docGiaId
                    });
                    if (docGia) {
                        const hoLot = docGia.HoLot || "";
                        const ten = docGia.Ten || "";
                        out.tenDocGia = `${hoLot} ${ten}`.trim() || docGia.Email || "Ẩn danh";
                    }
                } catch (_) {
                    out.tenDocGia = "Ẩn danh";
                }
            }
            return out;
        }));

        // Tính điểm trung bình
        const ratingAgg = await this.DanhGia.aggregate([
            { $match: { sachId: sId } },
            { $group: { _id: null, avgRating: { $avg: "$soSao" }, count: { $sum: 1 } } }
        ]).toArray();

        const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avgRating : 0;

        return {
            reviews: populated,
            avgRating: Math.round(avgRating * 10) / 10,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Kiểm tra độc giả đã đánh giá cuốn sách này chưa
     */
    async getMyReview(docGiaId, sachId) {
        const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!dgId || !sId) return null;

        return await this.DanhGia.findOne({ docGiaId: dgId, sachId: sId });
    }

    /**
     * Tạo hoặc cập nhật đánh giá (mỗi độc giả chỉ đánh giá 1 lần/sách)
     */
    async upsert(docGiaId, sachId, payload) {
        const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const sId = ObjectId.isValid(sachId) ? new ObjectId(sachId) : null;
        if (!dgId || !sId) throw new Error("ID không hợp lệ");

        // Kiểm tra sách tồn tại
        const sach = await this.Sach.findOne({ _id: sId });
        if (!sach) throw new Error("Không tìm thấy sách");

        // Kiểm tra độc giả đã mượn sách chưa (chỉ cho phép nếu trạng thái không phải chờ duyệt/từ chối)
        const MuonSach = this.client.db().collection("THEODOIMUONSACH");
        const daMuon = await MuonSach.findOne({
            docGiaId: dgId,
            sachId: sId,
            trangThai: { $nin: ["chờ duyệt", "từ chối"] }
        });

        if (!daMuon) {
            throw new Error("Bạn phải mượn sách này (đã được thủ thư duyệt) thì mới có thể đánh giá!");
        }

        // Validate sao (1-5)
        const soSao = parseInt(payload.soSao);
        if (isNaN(soSao) || soSao < 1 || soSao > 5) {
            throw new Error("Số sao phải từ 1 đến 5");
        }

        // Validate loại đánh giá chất lượng vật lý (tùy chọn)
        const validTinhTrang = ["tot", "nhanbich", "matrang", "khac"];
        const tinhTrang = payload.tinhTrang && validTinhTrang.includes(payload.tinhTrang)
            ? payload.tinhTrang : null;

        const now = new Date().toISOString();
        const existing = await this.DanhGia.findOne({ docGiaId: dgId, sachId: sId });

        if (existing) {
            // Cập nhật
            const result = await this.DanhGia.findOneAndUpdate(
                { _id: existing._id },
                {
                    $set: {
                        soSao,
                        noiDung: payload.noiDung?.trim() || "",
                        tinhTrang,
                        updatedAt: now,
                    }
                },
                { returnDocument: "after" }
            );
            return { ...result, action: "updated" };
        } else {
            // Tạo mới
            const doc = {
                docGiaId: dgId,
                sachId: sId,
                soSao,
                noiDung: payload.noiDung?.trim() || "",
                tinhTrang,
                createdAt: now,
                updatedAt: now,
            };
            const ins = await this.DanhGia.insertOne(doc);
            return { ...doc, _id: ins.insertedId, action: "created" };
        }
    }

    /**
     * Xóa đánh giá (chỉ chủ sở hữu hoặc admin)
     */
    async delete(id, docGiaId) {
        const reviewId = ObjectId.isValid(id) ? new ObjectId(id) : null;
        if (!reviewId) throw new Error("ID đánh giá không hợp lệ");

        const filter = { _id: reviewId };
        if (docGiaId) {
            const dgId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
            if (dgId) filter.docGiaId = dgId;
        }

        const result = await this.DanhGia.findOneAndDelete(filter);
        if (!result) throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền xóa");
        return result;
    }
}

module.exports = DanhGiaService;
