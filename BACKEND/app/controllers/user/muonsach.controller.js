const MuonSachService = require("../../services/muonsach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.sachId) {
        return next(new ApiError(400, "Thiếu mã sách để mượn"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const payload = {
            ...req.body,
            docGiaId: req.user?._id,
            ngayMuon: req.body.ngayMuon || new Date().toISOString(),
            ngayTra: req.body.ngayTra || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            soLuong: Number(req.body.soLuong || 1),
        };

        const document = await muonSachService.create(payload);

        return res.status(201).json({
            message: "Yêu cầu mượn sách đã được gửi",
            data: document,
        });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể tạo yêu cầu mượn sách"));
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const records = await muonSachService.findByDocGia(req.user?._id);

        return res.status(200).json(records);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy lịch sử mượn sách"));
    }
};

exports.requestReturn = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        
        // Kiểm tra xem phiếu mượn có tồn tại và thuộc về user này không
        const record = await muonSachService.findById(req.params.id);
        if (!record || record.docGiaId.toString() !== req.user._id.toString()) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
        }
        
        if (!["đã duyệt", "đang mượn", "quá hạn"].includes(record.trangThai)) {
            return next(new ApiError(400, "Không thể xin trả sách lúc này"));
        }

        const payload = {
            trangThai: "đang chờ trả",
            ngayDuKienTra: req.body.ngayDuKienTra || new Date().toISOString(),
        };

        const result = await muonSachService.update(req.params.id, payload);
        return res.status(200).json({ message: "Đã gửi yêu cầu xin trả sách", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể yêu cầu trả sách"));
    }
};
