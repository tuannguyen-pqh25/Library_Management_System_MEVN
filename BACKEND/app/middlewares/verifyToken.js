const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../api-error");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ApiError(401, "Không có token xác thực"));
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return next(new ApiError(401, "Token đã hết hạn"));
            }
            return next(new ApiError(401, "Token không hợp lệ"));
        }

        if (decoded.aud && decoded.aud !== "admin" && decoded.aud !== "user") {
            return next(new ApiError(403, "Token không hợp lệ cho API này"));
        }

        req.user = decoded;
        next();
    });
};
