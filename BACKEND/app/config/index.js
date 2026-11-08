// Load biến môi trường từ .env file
require("dotenv").config();

const config = {
    app: {
        port: process.env.PORT || 8080,
    },
    // Cấu hình Database
    db: {
        uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach"
    },
    // Cấu hình Redis
    redis: {
        url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
        cacheDuration: parseInt(process.env.REDIS_CACHE_DURATION || "3600", 10),
    },
    // Cấu hình Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    // Quy định mượn sách chung của hệ thống
    quyDinhMuonSach: {
        maxBooksPerTime: 3,            // Tối đa 3 quyển/lần mượn
        maxBooksTotal: 10,             // Tối đa 10 quyển cùng lúc
        maxDaysPerBorrow: 14,          // Tối đa 14 ngày mượn
        finePerDay: 5000,              // Phạt 5,000 VNĐ/ngày trễ
        finePerDayText: "5,000 VNĐ",   // Text hiển thị
    },
    // Cấu hình JWT (xác thực đăng nhập)
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
    // Cấu hình OAuth 2.0 (Đăng nhập Google cho Độc giả)
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/user/auth/google/callback",
        },
        clientRedirectUrl: process.env.OAUTH_CLIENT_REDIRECT_URL || "http://localhost:5173/oauth-callback",
    }
};

module.exports = config;

