const NhanVienService = require("../../services/nhanvien.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const nhanvien = await nhanVienService.findById(req.user?._id);

        if (!nhanvien) {
            return next(new ApiError(404, "Không tìm thấy thông tin nhân viên"));
        }

        delete nhanvien.Password;
        return res.status(200).json(nhanvien);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy thông tin cá nhân"));
    }
};

exports.updateProfile = async (req, res, next) => {
    if (!req.user?._id) {
        return next(new ApiError(401, "Không xác định được người dùng"));
    }

    if (Object.keys(req.body || {}).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không thể rỗng"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        
        // Không cho phép tự ý đổi Chức vụ hoặc MSNV qua endpoint cá nhân
        const payload = {
            HoTenNV: req.body.HoTenNV,
            DiaChi: req.body.DiaChi,
            SoDienThoai: req.body.SoDienThoai,
            EMAIL: req.body.EMAIL,
            CCCD: req.body.CCCD,
            AVATAR: req.body.AVATAR,
        };

        const result = await nhanVienService.update(req.user._id, payload);
        if (!result) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để cập nhật"));
        }

        delete result.Password;
        return res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            data: result,
        });
    } catch (error) {
        return next(new ApiError(500, error.message || "Lỗi khi cập nhật hồ sơ"));
    }
};

exports.changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
        return next(new ApiError(400, "Cần nhập mật khẩu hiện tại và mật khẩu mới"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const nhanvien = await nhanVienService.findById(req.user?._id);

        if (!nhanvien) {
            return next(new ApiError(404, "Không tìm thấy nhân viên"));
        }

        const isMatch = await bcrypt.compare(currentPassword, nhanvien.Password);
        if (!isMatch) {
            return next(new ApiError(401, "Mật khẩu hiện tại không đúng"));
        }

        const updated = await nhanVienService.update(req.user._id, {
            Password: newPassword,
        });

        return res.status(200).json({
            message: "Đổi mật khẩu thành công",
            data: updated ? { _id: updated._id } : null,
        });
    } catch (error) {
        return next(new ApiError(500, error.message || "Lỗi khi đổi mật khẩu"));
    }
};
