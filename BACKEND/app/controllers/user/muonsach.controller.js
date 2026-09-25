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
