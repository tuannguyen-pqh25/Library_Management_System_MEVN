const DocGiaService = require("../../services/docgia.service");
const MuonSachService = require("../../services/muonsach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

/**
 * Admin – Lấy tất cả độc giả (hỗ trợ tìm kiếm + populate thống kê mượn sách)
 */
exports.findAll = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { search, trangThai } = req.query;

        let filter = {};

        // Tìm kiếm theo tên, email, mã độc giả
        if (search) {
            const regex = { $regex: new RegExp(search, "i") };
            filter.$or = [
                { Ten: regex },
                { HoLot: regex },
                { TEN: regex },
                { HOLOT: regex },
                { Email: regex },
                { MaDocGia: regex },
            ];
        }

        // Lọc theo trạng thái tài khoản
        if (trangThai) {
            filter.TrangThaiTaiKhoan = trangThai;
        }

        let documents = await docGiaService.find(filter);

        // Đếm số lượng sách đang mượn cho từng độc giả
        const db = MongoDB.client.db();
        const borrowStats = await db.collection("THEODOIMUONSACH").aggregate([
            { $match: { trangThai: { $in: ["chờ duyệt", "đã duyệt", "đang mượn", "đang chờ trả", "quá hạn"] } } },
            { $group: { _id: "$docGiaId", count: { $sum: "$soLuong" } } }
        ]).toArray();

        // borrowMap cần so sánh string
        const borrowMap = {};
        borrowStats.forEach(stat => {
            borrowMap[String(stat._id)] = stat.count;
        });

        // Loại bỏ thông tin nhạy cảm và gán _borrowingCount
        const safeDocuments = documents.map((doc) => {
            delete doc.MatKhau;
            delete doc.password;
            
            // Gán số lượng sách đang mượn vào thongKeMuon.tongDangGiu để tương thích với frontend hiện tại
            doc.thongKeMuon = {
                tongDangGiu: borrowMap[doc._id.toString()] || 0
            };
            return doc;
        });

        return res.send(safeDocuments);
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi lấy danh sách độc giả")
        );
    }
};

/**
 * Admin – Lấy chi tiết 1 độc giả kèm thống kê mượn sách
 */
exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy độc giả"));
        }

        delete document.MatKhau;
        delete document.password;

        // Lấy thống kê mượn sách
        try {
            const muonSachService = new MuonSachService(MongoDB.client);
            const db = MongoDB.client.db();
            const muonSachCollection = db.collection("THEODOIMUONSACH");

            const { ObjectId } = require("mongodb");
            let docGiaId;
            if (ObjectId.isValid(req.params.id)) {
                docGiaId = new ObjectId(req.params.id);
            } else {
                docGiaId = req.params.id;
            }

            // Tính tổng sách (soLuong)
            const [dangMuon, quaHan, daTra, choDuyet, daDuyet, choTra] = await Promise.all([
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "đang mượn" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "quá hạn" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "đã trả" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "chờ duyệt" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "đã duyệt" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
                muonSachCollection.aggregate([{ $match: { docGiaId: docGiaId, trangThai: "đang chờ trả" } }, { $group: { _id: null, total: { $sum: "$soLuong" } } }]).toArray(),
            ]);

            const getCount = (arr) => arr.length > 0 ? arr[0].total : 0;

            const countDangMuon = getCount(dangMuon);
            const countQuaHan = getCount(quaHan);
            const countDaTra = getCount(daTra);
            const countChoDuyet = getCount(choDuyet);
            const countDaDuyet = getCount(daDuyet);
            const countChoTra = getCount(choTra);

            document.thongKeMuon = {
                dangMuon: countDangMuon + countDaDuyet + countChoTra,
                quaHan: countQuaHan,
                daTra: countDaTra,
                choDuyet: countChoDuyet,
                tongDangGiu: countDangMuon + countChoDuyet + countQuaHan + countDaDuyet + countChoTra,
            };
        } catch (_) {
            // Nếu không lấy được thống kê, vẫn trả về thông tin cơ bản
            document.thongKeMuon = null;
        }

        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi lấy chi tiết độc giả id=${req.params.id}`)
        );
    }
};

/**
 * Admin – Khóa / Mở khóa tài khoản độc giả
 * Body: { TrangThaiTaiKhoan: "BiKhoa" | "BinhThuong", LyDoKhoa?: string }
 */
exports.toggleAccountStatus = async (req, res, next) => {
    try {
        const { TrangThaiTaiKhoan, LyDoKhoa } = req.body;

        if (!TrangThaiTaiKhoan || !["BiKhoa", "BinhThuong"].includes(TrangThaiTaiKhoan)) {
            return next(
                new ApiError(400, "TrangThaiTaiKhoan phải là 'BiKhoa' hoặc 'BinhThuong'")
            );
        }

        const docGiaService = new DocGiaService(MongoDB.client);

        // Kiểm tra độc giả tồn tại
        const existing = await docGiaService.findById(req.params.id);
        if (!existing) {
            return next(new ApiError(404, "Không tìm thấy độc giả"));
        }

        // Cập nhật trạng thái
        const { ObjectId } = require("mongodb");
        let objectId;
        if (ObjectId.isValid(req.params.id)) {
            objectId = new ObjectId(req.params.id);
        } else {
            objectId = req.params.id;
        }

        const db = MongoDB.client.db();
        const updateData = {
            TrangThaiTaiKhoan,
        };

        // Nếu khóa thì lưu lý do và ngày khóa
        if (TrangThaiTaiKhoan === "BiKhoa") {
            updateData.LyDoKhoa = LyDoKhoa || "Vi phạm nội quy thư viện";
            updateData.NgayKhoa = new Date();
            updateData.NguoiKhoa = req.user?._id || null;
        } else {
            // Mở khóa → xóa thông tin khóa
            updateData.LyDoKhoa = null;
            updateData.NgayKhoa = null;
            updateData.NguoiKhoa = null;
        }

        await db.collection("DOCGIA").updateOne(
            { _id: objectId },
            { $set: updateData }
        );

        const action = TrangThaiTaiKhoan === "BiKhoa" ? "khóa" : "mở khóa";
        return res.send({
            message: `Đã ${action} tài khoản độc giả thành công`,
            TrangThaiTaiKhoan,
        });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi cập nhật trạng thái tài khoản id=${req.params.id}`)
        );
    }
};

/**
 * Admin – Lấy lịch sử mượn sách của 1 độc giả
 */
exports.getBorrowHistory = async (req, res, next) => {
    try {
        const { ObjectId } = require("mongodb");
        let docGiaId;
        if (ObjectId.isValid(req.params.id)) {
            docGiaId = new ObjectId(req.params.id);
        } else {
            docGiaId = req.params.id;
        }

        const db = MongoDB.client.db();
        const records = await db.collection("THEODOIMUONSACH")
            .aggregate([
                { $match: { docGiaId: docGiaId } },
                {
                    $lookup: {
                        from: "SACH",
                        localField: "sachId",
                        foreignField: "_id",
                        as: "sach",
                    },
                },
                { $unwind: { path: "$sach", preserveNullAndEmptyArrays: true } },
                { $sort: { ngayMuon: -1 } },
            ])
            .toArray();

        return res.send(records);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi lấy lịch sử mượn sách của độc giả id=${req.params.id}`)
        );
    }
};

/**
 * Admin – Reset mật khẩu của user về mặc định
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const bcrypt = require("bcryptjs");
        const docGiaService = new DocGiaService(MongoDB.client);

        const existing = await docGiaService.findById(req.params.id);
        if (!existing) {
            return next(new ApiError(404, "Không tìm thấy độc giả"));
        }

        const { ObjectId } = require("mongodb");
        let objectId = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : req.params.id;

        // Mã hóa mật khẩu mặc định: 123456aA@
        const newPassword = "123456aA@";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const db = MongoDB.client.db();
        await db.collection("DOCGIA").updateOne(
            { _id: objectId },
            { $set: { Password: hashedPassword } }
        );

        return res.send({
            message: "Đã cấp lại mật khẩu cho độc giả",
            newPassword: newPassword
        });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi reset mật khẩu của độc giả id=${req.params.id}`));
    }
};
