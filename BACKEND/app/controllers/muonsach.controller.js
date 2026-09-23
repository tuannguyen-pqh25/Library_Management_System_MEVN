const MuonSachService = require("../services/muonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// 1. Create (Độc giả tạo phiếu mượn)
exports.create = async (req, res, next) => {
    // Độc giả phải gửi ID của mình, ID sách, và ngày
    if (!req.body?.docGiaId || !req.body?.sachId || !req.body?.ngayMuon) {
        return next(new ApiError(400, "ID độc giả, ID sách và ngày mượn là bắt buộc"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const document = await muonSachService.create(req.body);
        return res.send({ message: "Gửi phiếu mượn thành công", data: document });
    } catch (error) {
         // Bắt lỗi hết sách (409 = Conflict)
        if (error.message.includes("Sách đã hết")) {
            return next(new ApiError(409, error.message));
        }
        return next(
            new ApiError(500, `Lỗi xảy ra khi đang tạo phiếu mượn: ${error.message}`)
        );
    }
};

// 2. FindAll (Nhân Viên/Admin xem tất cả phiếu)
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        documents = await muonSachService.find({});
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi đang lấy thông tin phiếu mượn")
        );
    }
    return res.send(documents);
};

// 3. FindByDocGia (Độc giả xem lịch sử mượn)
exports.findByDocGia = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        // Lấy ID độc giả từ URL (ví dụ: /api/muonsach/docgia/12345)
        const documents = await muonSachService.findByDocGia(req.params.id); 
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi lấy lịch sử mượn sách của độc giả id=${req.params.id}`
            )
        );
    }
};

// 4. FindOne (Xem chi tiết 1 phiếu)
exports.findOne = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const document = await muonSachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi lấy phiếu mượn với id=${req.params.id}`
            )
        );
    }
};

// 5. Update (Nhân Viên/Admin duyệt/trả/từ chối phiếu)
exports.update = async (req, res, next) => {
    // Nhân viên phải gửi trạng thái mới VÀ ID của chính mình
    if (!req.body?.trangThai || !req.body?.nhanVienId) {
        return next(new ApiError(400, "Trạng thái và ID Nhân viên xử lý là bắt buộc"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        // ID của phiếu mượn lấy từ URL
        const document = await muonSachService.update(req.params.id, req.body); 
        
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn để cập nhật"));
        }
        return res.send({ message: "Cập nhật trạng thái phiếu mượn thành công", data: document });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi cập nhật phiếu mượn: ${error.message}`)
        );
    }
};

// 6. Request Return (Độc giả yêu cầu trả sách)
exports.requestReturn = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        // Độc giả chỉ cần gửi trạng thái "đang chờ trả", không cần nhanVienId
        const payload = {
            trangThai: "đang chờ trả",
            nhanVienId: null, // Không cần nhân viên cho yêu cầu trả
        };
        const document = await muonSachService.update(req.params.id, payload);
        return res.send({ message: "Yêu cầu trả sách đã được gửi", data: document });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi gửi yêu cầu trả sách: ${error.message}`)
        );
    }
};

// 6.5. Confirm Return (Nhân viên xác nhận trả sách - cập nhật ngayTraThucTe + SOQUYEN)
exports.confirmReturn = async (req, res, next) => {
    try {
        if (!req.body?.nhanVienId) {
            return next(new ApiError(400, "ID Nhân viên xử lý là bắt buộc"));
        }

        const muonSachService = new MuonSachService(MongoDB.client);
        const payload = {
            trangThai: "đã trả",
            nhanVienId: req.body.nhanVienId,
        };
        const document = await muonSachService.update(req.params.id, payload);
        return res.send({ message: "Xác nhận trả sách thành công", data: document });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi xác nhận trả sách: ${error.message}`)
        );
    }
};

// 6.6. Confirm Fine Payment (Độc giả xác nhận đã nộp phạt)
exports.confirmFinePayment = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const payload = {
            daXacNhanNopPhat: true
        };
        const document = await muonSachService.update(req.params.id, payload);
        return res.send({ message: "Xác nhận nộp phạt thành công", data: document });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi xác nhận nộp phạt: ${error.message}`)
        );
    }
};

// 7. Delete (Xóa 1 phiếu)
exports.delete = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const document = await muonSachService.delete(req.params.id);

        if (!document || (document.value === null && document.ok !== 1)) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn để xóa"));
        }
        return res.send({ message: "Phiếu mượn đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi xóa phiếu mượn với id=${req.params.id}`
            )
        );
    }
};
