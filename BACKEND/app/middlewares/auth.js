const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../api-error");

exports.verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError(401, "Không có token xác thực"));
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ApiError(401, "Token đã hết hạn"));
            }
            return next(new ApiError(401, "Token không hợp lệ"));
        }
        
        // Kiểm tra audience (aud) phải là admin
        if (decoded.aud !== "admin") {
            return next(new ApiError(403, "Token không có quyền truy cập Admin API"));
        }
        
        req.user = decoded; // { _id, role, aud }
        next();
    });
};

exports.verifyUserToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError(401, "Không có token xác thực"));
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ApiError(401, "Token đã hết hạn"));
            }
            return next(new ApiError(401, "Token không hợp lệ"));
        }
        
        // Kiểm tra audience (aud) phải là user
        if (decoded.aud !== "user") {
            return next(new ApiError(403, "Token không có quyền truy cập User API"));
        }
        
        req.user = decoded;
        next();
    });
};
