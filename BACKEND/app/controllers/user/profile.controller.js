const DocGiaService = require("../../services/docgia.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.findById(req.user?._id);

        if (!docGia) {
            return next(new ApiError(404, "Không tìm thấy thông tin độc giả"));
        }

        delete docGia.MatKhau;
        delete docGia.password;

        return res.status(200).json(docGia);
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
        const docGiaService = new DocGiaService(MongoDB.client);
        const result = await docGiaService.update(req.user._id, req.body);

        if (!result || !result.value) {
            return next(new ApiError(404, "Không tìm thấy độc giả để cập nhật"));
        }

        const updatedUser = result.value;
        delete updatedUser.MatKhau;
        delete updatedUser.password;

        return res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            data: updatedUser,
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
        const docGiaService = new DocGiaService(MongoDB.client);
        const currentUser = await docGiaService.findById(req.user?._id);

        if (!currentUser) {
            return next(new ApiError(404, "Không tìm thấy người dùng"));
        }

        const hash = currentUser.MatKhau || currentUser.password;
        const isMatch = await bcrypt.compare(currentPassword, hash);

        if (!isMatch) {
            return next(new ApiError(401, "Mật khẩu hiện tại không đúng"));
        }

        const updated = await docGiaService.update(req.user._id, {
            MatKhau: newPassword,
        });

        return res.status(200).json({
            message: "Đổi mật khẩu thành công",
            data: updated && updated.value ? { _id: updated.value._id } : null,
        });
    } catch (error) {
        return next(new ApiError(500, error.message || "Lỗi khi đổi mật khẩu"));
    }
};
