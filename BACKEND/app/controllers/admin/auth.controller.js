const NhanVienService = require("../../services/nhanvien.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const jwt = require("jsonwebtoken");
const config = require("../../config");

// Login Admin
exports.login = async (req, res, next) => {
    const ip = req.headers["x-test-user"] || req.ip;

    if (!req.body?.MSNV || !req.body?.Password) {
        return next(new ApiError(400, "MSNV và Mật khẩu là bắt buộc"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const nhanvien = await nhanVienService.login(req.body, ip);

        const token = jwt.sign({
            _id: nhanvien._id,
            role: nhanvien.ChucVu,
            aud: "admin" // Bắt buộc cho Admin
        }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

        return res.send({ message: "Đăng nhập thành công", data: nhanvien, token });
    } catch (error) {
        return next(new ApiError(error.status || 401, error.message)); 
    }
};
