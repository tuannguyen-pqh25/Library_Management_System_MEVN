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
    // Cấu hình Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    // Cấu hình Gemini AI Chatbot (hỗ trợ nhiều key, tự động chuyển đổi khi hết quota)
    gemini: {
        // Key đơn (tương thích ngược)
        apiKey: process.env.GEMINI_API_KEY || "",
        // Mảng nhiều key - nhập cách nhau bằng dấu phẩy trong .env
        // Ví dụ: GEMINI_API_KEYS=AIzaSyAaaa,AIzaSyBbbb,AIzaSyCccc
        apiKeys: (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(k => k.length > 0),
    },
    // Quy định mượn sách (dùng cho chatbot tra cứu)
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
    }
};

module.exports = config;

