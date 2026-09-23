const ApiError = require("../api-error");

module.exports = (allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return next(new ApiError(403, "Không tìm thấy thông tin chức vụ"));
    }
    if (!allowedRoles.includes(req.user.role)) {
        return next(new ApiError(403, "Bạn không có quyền thực hiện thao tác này"));
    }
    next();
};
