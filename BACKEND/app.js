
const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 

const adminAuthRouter = require("./app/routes/admin/auth.route");
const adminSachRouter = require("./app/routes/admin/sach.route");
const adminNxbRouter = require("./app/routes/admin/nhaxuatban.route");
const adminMuonRouter = require("./app/routes/admin/muonsach.route");
const userAuthRouter = require("./app/routes/user/auth.route");
const userSachRouter = require("./app/routes/user/sach.route");
const userMuonRouter = require("./app/routes/user/muonsach.route");
const userProfileRouter = require("./app/routes/user/profile.route");

const docgiaRouter = require("./app/routes/docgia.route");
const muonsachRouter = require("./app/routes/muonsach.route");
const chatbotRouter = require("./app/routes/chatbot.route");

// Namespace Admin
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/sach", adminSachRouter);
app.use("/api/admin/nxb", adminNxbRouter);
app.use("/api/admin/muonsach", adminMuonRouter);
app.use("/api/admin/docgia", docgiaRouter);
app.use("/api/admin/muonsach-legacy", muonsachRouter);

// Namespace User
app.use("/api/user/auth", userAuthRouter);
app.use("/api/user/sach", userSachRouter);
app.use("/api/user/muon", userMuonRouter);
app.use("/api/user", userProfileRouter);

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