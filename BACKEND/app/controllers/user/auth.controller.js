const jwt = require("jsonwebtoken");
const config = require("../../config");
const ApiError = require("../../api-error");
const MongoDB = require("../../utils/mongodb.util");
const DocGiaService = require("../../services/docgia.service");

exports.register = async (req, res, next) => {
    const { Email, Password, MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body || {};

    if (!Email || !Password) {
        return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.create({
            Email,
            Password,
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
    const { Email, Password } = req.body || {};

    if (!Email || !Password) {
        return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.login({
            Email,
            Password,
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

// --- OAUTH 2.0 (GOOGLE) ---

const { passport, isGoogleConfigured } = require("../../config/passport");

/**
 * Khởi tạo quá trình đăng nhập Google OAuth 2.0
 */
exports.googleAuth = (req, res, next) => {
    if (!isGoogleConfigured()) {
        const redirectUrl = config.oauth.clientRedirectUrl || "http://localhost:5173/oauth-callback";
        return res.redirect(`${redirectUrl}?error=${encodeURIComponent("Tính năng Google OAuth chưa được cấu hình Client ID / Secret trên máy chủ.")}`);
    }
    return passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })(req, res, next);
};

/**
 * Xử lý callback sau khi xác thực Google thành công
 */
exports.googleCallback = (req, res, next) => {
    const redirectUrl = config.oauth.clientRedirectUrl || "http://localhost:5173/oauth-callback";

    passport.authenticate("google", { session: false }, (err, user) => {
        if (err || !user) {
            const message = err?.message || "Đăng nhập với tài khoản Google thất bại";
            return res.redirect(`${redirectUrl}?error=${encodeURIComponent(message)}`);
        }

        // Tạo JWT token nội bộ cho độc giả
        const token = jwt.sign(
            {
                _id: user._id,
                role: "DocGia",
                aud: "user",
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return res.redirect(`${redirectUrl}?token=${token}`);
    })(req, res, next);
};

/**
 * Chế độ Demo/Mock OAuth phục vụ kiểm thử và báo cáo khi chưa có credentials thực tế
 */
exports.mockOAuth = async (req, res) => {
    const redirectUrl = config.oauth.clientRedirectUrl || "http://localhost:5173/oauth-callback";

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const email = "docgia.google@example.com";
        const hoLot = "Google";
        const ten = "Độc Giả Demo";

        const docGia = await docGiaService.findOrCreateByOAuth({
            Email: email,
            HoLot: hoLot,
            Ten: ten,
            provider: "google",
            providerId: `demo_google_${Date.now()}`,
        });

        const token = jwt.sign(
            {
                _id: docGia._id,
                role: "DocGia",
                aud: "user",
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return res.redirect(`${redirectUrl}?token=${token}`);
    } catch (error) {
        return res.redirect(`${redirectUrl}?error=${encodeURIComponent(error.message || "Lỗi tạo tài khoản demo OAuth")}`);
    }
};


