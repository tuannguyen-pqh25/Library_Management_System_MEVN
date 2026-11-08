const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const Redis = require("../../utils/redis.util");

/**
 * GET /api/admin/dashboard/stats
 * Tổng hợp thống kê cho Dashboard admin.
 */
exports.getStats = async (req, res, next) => {
    try {
        const isFresh = req.query.fresh === "true" || req.query.fresh === "1";
        const validRanges = ["7d", "14d", "1m", "3m", "6m"];
        const range = validRanges.includes(req.query.range) ? req.query.range : "6m";
        const cacheKey = `admin:dashboard:stats:${range}`;

        if (isFresh) {
            await Redis.del("admin:dashboard:stats");
        }

        const db = MongoDB.client.db();
        const MuonSach = db.collection("THEODOIMUONSACH");
        const Sach = db.collection("SACH");
        const DocGia = db.collection("DOCGIA");

        // Tự động cập nhật trạng thái quá hạn trước khi tính
        const todayDateStr = new Date().toLocaleDateString('en-CA');
        const todayIso = new Date().toISOString();
        const overdueUpdate = await MuonSach.updateMany(
            {
                trangThai: { $in: ["đang mượn", "đã duyệt", "chờ gia hạn"] },
                $or: [
                    { ngayTra: { $lt: todayDateStr } },
                    { ngayTra: { $lt: todayIso } }
                ]
            },
            { $set: { trangThai: "quá hạn", daTungQuaHan: true } }
        );
        const overdueWaitingUpdate = await MuonSach.updateMany(
            {
                trangThai: "đang chờ trả",
                $or: [
                    { ngayTra: { $lt: todayDateStr } },
                    { ngayTra: { $lt: todayIso } }
                ]
            },
            { $set: { daTungQuaHan: true } }
        );
        if ((overdueUpdate && overdueUpdate.modifiedCount > 0) || (overdueWaitingUpdate && overdueWaitingUpdate.modifiedCount > 0)) {
            await Redis.del("admin:dashboard:stats");
        }

        if (!isFresh) {
            const cachedData = await Redis.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }
        }

        // Tính ngày bắt đầu và nhóm thống kê dựa trên range (7d, 14d, 1m, 3m, 6m)
        const now = new Date();
        let startDateStr = "";
        let isDayGroup = false;

        if (range === "7d") {
            isDayGroup = true;
            const d = new Date(now.getTime() - 6 * 86400000);
            startDateStr = d.toISOString().split("T")[0];
        } else if (range === "14d") {
            isDayGroup = true;
            const d = new Date(now.getTime() - 13 * 86400000);
            startDateStr = d.toISOString().split("T")[0];
        } else if (range === "1m") {
            isDayGroup = true;
            const d = new Date(now.getTime() - 29 * 86400000);
            startDateStr = d.toISOString().split("T")[0];
        } else if (range === "3m") {
            isDayGroup = false;
            const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            startDateStr = d.toISOString().split("T")[0];
        } else {
            // default: 6m
            isDayGroup = false;
            const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            startDateStr = d.toISOString().split("T")[0];
        }

        const dateSubstrLen = isDayGroup ? 10 : 7;
        const dateFormatStr = isDayGroup ? "%Y-%m-%d" : "%Y-%m";

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

            // Mượn/trả theo khoảng thời gian được chọn
            MuonSach.aggregate([
                {
                    $match: {
                        ngayMuon: { $gte: startDateStr },
                        trangThai: { $nin: ["chờ duyệt", "từ chối"] },
                    },
                },
                {
                    $addFields: {
                        periodStr: {
                            $cond: {
                                if: { $eq: [{ $type: "$ngayMuon" }, "string"] },
                                then: { $substr: ["$ngayMuon", 0, dateSubstrLen] },
                                else: {
                                    $dateToString: {
                                        format: dateFormatStr,
                                        date: "$ngayMuon",
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: "$periodStr",
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

        const responseData = {
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
            hoatDongMuon: muonTheoThang,
            range,
            isDayGroup,
        };

        await Redis.set(cacheKey, responseData, 30);

        return res.status(200).json(responseData);
    } catch (error) {
        return next(new ApiError(500, `Failed to get dashboard stats: ${error.message}`));
    }
};
