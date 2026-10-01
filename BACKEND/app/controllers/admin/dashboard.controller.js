const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

/**
 * GET /api/admin/dashboard/stats
 * Tổng hợp thống kê cho Dashboard admin.
 */
exports.getStats = async (req, res, next) => {
    try {
        const db = MongoDB.client.db();
        const MuonSach = db.collection("THEODOIMUONSACH");
        const Sach = db.collection("SACH");
        const DocGia = db.collection("DOCGIA");

        // Tự động cập nhật trạng thái quá hạn trước khi tính
        const today = new Date().toISOString();
        await MuonSach.updateMany(
            { trangThai: { $in: ["đang mượn", "đã duyệt"] }, ngayTra: { $lt: today } },
            { $set: { trangThai: "quá hạn" } }
        );

        // --- Chạy song song các aggregation ---
        const [
            tongSach,
            tongDocGia,
            docGiaBiKhoa,
            muonSachStats,
            topSach,
            muonTheoThang,
        ] = await Promise.all([
            // Tổng số sách (đầu sách)
            Sach.countDocuments(),

            // Tổng độc giả
            DocGia.countDocuments(),

            // Độc giả bị khóa
            DocGia.countDocuments({ TrangThaiTaiKhoan: "BiKhoa" }),

            // Thống kê phiếu mượn theo trạng thái
            MuonSach.aggregate([
                {
                    $group: {
                        _id: "$trangThai",
                        count: { $sum: 1 },
                        tongSoLuong: { $sum: "$soLuong" },
                    },
                },
            ]).toArray(),

            // Top 5 sách được mượn nhiều nhất
            MuonSach.aggregate([
                {
                    $match: {
                        trangThai: { $in: ["đang mượn", "đã duyệt", "đã trả", "quá hạn"] },
                    },
                },
                {
                    $group: {
                        _id: "$sachId",
                        soLanMuon: { $sum: "$soLuong" },
                    },
                },
                { $sort: { soLanMuon: -1 } },
                { $limit: 7 },
                {
                    $lookup: {
                        from: "SACH",
                        localField: "_id",
                        foreignField: "_id",
                        as: "sachInfo",
                    },
                },
                { $unwind: { path: "$sachInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        soLanMuon: 1,
                        tenSach: { $ifNull: ["$sachInfo.TenSach", "Không xác định"] },
                        hinhAnh: { $ifNull: ["$sachInfo.HinhAnh", null] },
                        maSach: { $ifNull: ["$sachInfo.MaSach", ""] },
                    },
                },
            ]).toArray(),

            // Mượn/trả theo 6 tháng gần nhất
            MuonSach.aggregate([
                {
                    $match: {
                        ngayMuon: {
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 5))
                                .toISOString()
                                .split("T")[0],
                        },
                        trangThai: { $nin: ["chờ duyệt", "từ chối"] },
                    },
                },
                {
                    $addFields: {
                        thangStr: {
                            $cond: {
                                if: { $eq: [{ $type: "$ngayMuon" }, "string"] },
                                then: { $substr: ["$ngayMuon", 0, 7] }, // "YYYY-MM"
                                else: {
                                    $dateToString: {
                                        format: "%Y-%m",
                                        date: "$ngayMuon",
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$thangStr",
                        soPhieuMuon: { $sum: 1 },
                        soSachMuon: { $sum: "$soLuong" },
                    },
                },
                { $sort: { _id: 1 } },
            ]).toArray(),
        ]);

        // Tổng hợp muonSachStats thành object
        const statusMap = {};
        muonSachStats.forEach((s) => {
            statusMap[s._id] = { count: s.count, tongSoLuong: s.tongSoLuong };
        });

        const danhSachTrangThai = ["chờ duyệt", "đã duyệt", "đang mượn", "đang chờ trả", "đã trả", "từ chối", "quá hạn"];
        const statsFormatted = {};
        danhSachTrangThai.forEach((tt) => {
            statsFormatted[tt] = statusMap[tt] || { count: 0, tongSoLuong: 0 };
        });

        const dangMuonCount =
            (statusMap["đã duyệt"]?.count || 0) +
            (statusMap["đang mượn"]?.count || 0) +
            (statusMap["đang chờ trả"]?.count || 0);

        const tongSoQuyenDangMuon =
            (statusMap["đã duyệt"]?.tongSoLuong || 0) +
            (statusMap["đang mượn"]?.tongSoLuong || 0) +
            (statusMap["đang chờ trả"]?.tongSoLuong || 0);

        return res.status(200).json({
            tongQuan: {
                tongSach,
                tongDocGia,
                docGiaBiKhoa,
                choDuyet: statusMap["chờ duyệt"]?.count || 0,
                dangMuon: dangMuonCount,
                tongSoQuyenDangMuon,
                quaHan: statusMap["quá hạn"]?.count || 0,
                daTra: statusMap["đã trả"]?.count || 0,
            },
            chiTietTrangThai: statsFormatted,
            topSach,
            muonTheoThang,
        });
    } catch (error) {
        return next(new ApiError(500, `Failed to get dashboard stats: ${error.message}`));
    }
};
