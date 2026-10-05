
const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

const adminAuthRouter = require("./app/routes/admin/auth.route");
const adminSachRouter = require("./app/routes/admin/sach.route");
const adminNxbRouter = require("./app/routes/admin/nhaxuatban.route");
const adminMuonRouter = require("./app/routes/admin/muonsach.route");
const adminNhanVienRouter = require("./app/routes/admin/nhanvien.route");
const adminDocGiaRouter = require("./app/routes/admin/docgia.route");
const adminDashboardRouter = require("./app/routes/admin/dashboard.route");
const userAuthRouter = require("./app/routes/user/auth.route");
const userSachRouter = require("./app/routes/user/sach.route");
const userMuonRouter = require("./app/routes/user/muonsach.route");
const userProfileRouter = require("./app/routes/user/profile.route");
const userYeuThichRouter = require("./app/routes/user/yeuthich.route");
const userDanhGiaRouter = require("./app/routes/user/danhgia.route");

const docgiaRouter = require("./app/routes/docgia.route");
const muonsachRouter = require("./app/routes/muonsach.route");
const chatbotRouter = require("./app/routes/chatbot.route");
const { verifyAdminToken } = require("./app/middlewares/auth");
const requireRole = require("./app/middlewares/requireRole");

// Namespace Admin
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/admin/sach", adminSachRouter);
app.use("/api/admin/nxb", adminNxbRouter);
app.use("/api/admin/muonsach", adminMuonRouter);
app.use("/api/admin/nhanvien", adminNhanVienRouter);
app.use("/api/admin/docgia", adminDocGiaRouter);
app.use("/api/admin/muonsach-legacy", verifyAdminToken, requireRole(["Admin"]), muonsachRouter);

// Namespace User (thứ tự: cụ thể trước, tổng quát sau)
app.use("/api/user/auth", userAuthRouter);
app.use("/api/user/sach", userSachRouter);
app.use("/api/user/muon", userMuonRouter);
app.use("/api/user/yeuthich", userYeuThichRouter);   // Yêu thích (cần auth)
app.use("/api/user/danhgia", userDanhGiaRouter);     // Đánh giá (mixed auth)
app.use("/api/user", userProfileRouter);              // Profile (có verifyToken) — SAU CÙNG

// Các route chưa migrate (tạm giữ)
app.use("/api/docgia", docgiaRouter);
app.use("/api/muonsach", muonsachRouter);
app.use("/api/chatbot", chatbotRouter);


// Xử lý lỗi 404
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});


app.use((err, req, res, next) => {
   
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
