const jwt = require("jsonwebtoken");
const config = require("../../config");
const ApiError = require("../../api-error");
const MongoDB = require("../../utils/mongodb.util");
const DocGiaService = require("../../services/docgia.service");

exports.register = async (req, res, next) => {
    const { Email, MatKhau, MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body || {};

    if (!Email || !MatKhau) {
        return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.create({
            Email,
            MatKhau,
            MaDocGia,
            HoLot,
            Ten,
            NgaySinh,
            Phai,
            DiaChi,
            DienThoai,
        });

        return res.status(201).json({
            message: "Đăng ký tài khoản độc giả thành công",
            data: docGia,
        });
    } catch (error) {
        const message = error?.message || "Đăng ký thất bại";
        const statusCode = error?.status || 409;
        return next(new ApiError(statusCode, message));
    }
};

exports.login = async (req, res, next) => {
    const ip = req.headers["x-test-user"] || req.ip;
    const { Email, MatKhau, password } = req.body || {};

    if ((!Email && !req.body?.email) || !(MatKhau || password)) {
        return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.login({
            Email: Email ?? req.body?.email,
            MatKhau: MatKhau ?? password,
        }, ip);

        const token = jwt.sign(
            {
                _id: docGia._id,
                role: "DocGia",
                aud: "user",
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return res.status(200).json({
            message: "Đăng nhập thành công",
            data: docGia,
            token,
        });
    } catch (error) {
        const statusCode = error?.status || 401;
        const message = error?.message || "Email hoặc mật khẩu không đúng";
        return next(new ApiError(statusCode, message));
    }
};

exports.refresh = async (_req, res) => {
    return res.status(200).json({
        message: "Refresh token thành công",
        data: null,
    });
};

exports.logout = async (_req, res) => {
    return res.status(200).json({
        message: "Đăng xuất thành công",
    });
};
