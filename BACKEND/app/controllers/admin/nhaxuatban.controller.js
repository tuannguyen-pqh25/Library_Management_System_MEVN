const NhaXuatBanService = require("../../services/nhaxuatban.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

// 1. Create: Tạo NXB
exports.create = async (req, res, next) => {
    if (!req.body?.MANXB) {
        return next(new ApiError(400, "Mã NXB không được để trống"));
    }
    if (!req.body?.TENNXB) {
        return next(new ApiError(400, "Tên NXB không được để trống"));
    }
    if (!req.body?.DIACHI) {
        return next(new ApiError(400, "Địa chỉ không được để trống"));
    }

    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.create(req.body);
        return res.send({ message: "Tạo NXB thành công", data: document });
    } catch (error) {
        if (error.message.includes("đã tồn tại")) {
            return next(new ApiError(409, error.message)); 
        }
        return next(
            new ApiError(500, "Lỗi xảy ra khi đang tạo NXB")
        );
    }
};

// 2. FindAll: Lấy tất cả NXB (hoặc tìm theo tên)
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const { TENNXB } = req.query; 

        if (TENNXB) {
            documents = await nxbService.findByTen(TENNXB);
        } else {
            documents = await nxbService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi đang lấy thông tin NXB")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy NXB"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi lấy NXB với id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không thể rỗng"));
    }

    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy NXB để cập nhật"));
        }
        return res.send({ message: "NXB được cập nhật thành công", data: document });
    } catch (error) {
        // Kiểm tra nếu là lỗi trùng lặp từ service
        if (error.message.includes("đã tồn tại")) {
            return next(new ApiError(409, error.message));
        }
        return next(
            new ApiError(500, `Lỗi khi cập nhật NXB với id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.delete(req.params.id);
        
        if (!document || (document.value === null && document.ok !== 1)) {
            return next(new ApiError(404, "Không tìm thấy NXB để xóa"));
        }
        return res.send({ message: "NXB đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi xóa NXB với id=${req.params.id}`
            )
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const deletedCount = await nxbService.deleteAll();
        return res.send({
            message: `${deletedCount} NXB đã được xóa thành công`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi đang xóa tất cả NXB")
        );
    }
};
