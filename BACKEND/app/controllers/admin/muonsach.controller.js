const MuonSachService = require("../../services/muonsach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

/**
 * GET /api/admin/muonsach
 * Get all borrow records. Supports filtering: ?status=pending
 */
exports.findAll = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const filter = {};

        if (req.query.status) {
            filter.trangThai = req.query.status;
        }

        const records = await muonSachService.findAllPopulated(filter);
        return res.status(200).json(records);
    } catch (error) {
        return next(new ApiError(500, `Failed to get borrow records: ${error.message}`));
    }
};

/**
 * GET /api/admin/muonsach/:id
 * Get one borrow record by ID.
 */
exports.findOne = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const record = await muonSachService.findById(req.params.id);
        if (!record) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json(record);
    } catch (error) {
        return next(new ApiError(500, `Failed to get borrow record: ${error.message}`));
    }
};

/**
 * PUT /api/admin/muonsach/:id/approve
 * Approve a borrow request → status "đã duyệt", deduct SoQuyen.
 * req.user._id is the staff ID from the JWT token.
 */
exports.approve = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const staffId = req.user?._id || req.user?.sub;
        if (!staffId) {
            return next(new ApiError(401, "Cannot identify the processing staff"));
        }

        const payload = {
            trangThai: "đã duyệt",
            nhanVienId: staffId,
        };

        const result = await muonSachService.update(req.params.id, payload);
        if (!result) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json({ message: "Borrow request approved successfully", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Failed to approve borrow request"));
    }
};

/**
 * PUT /api/admin/muonsach/:id/reject
 * Reject a borrow request → status "từ chối".
 * Body: { reason?: string }
 */
exports.reject = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const staffId = req.user?._id || req.user?.sub;
        if (!staffId) {
            return next(new ApiError(401, "Cannot identify the processing staff"));
        }

        const payload = {
            trangThai: "từ chối",
            nhanVienId: staffId,
            lyDoTuChoi: req.body?.reason || "",
        };

        const result = await muonSachService.update(req.params.id, payload);
        if (!result) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json({ message: "Borrow request rejected successfully", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Failed to reject borrow request"));
    }
};

/**
 * PUT /api/admin/muonsach/:id/handover
 * Giao sách cho độc giả → status "đang mượn".
 */
exports.handover = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const staffId = req.user?._id || req.user?.sub;
        if (!staffId) {
            return next(new ApiError(401, "Cannot identify the processing staff"));
        }

        const payload = {
            trangThai: "đang mượn",
            nhanVienId: staffId,
        };

        const result = await muonSachService.update(req.params.id, payload);
        if (!result) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json({ message: "Book handed over successfully", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Failed to handover book"));
    }
};

/**
 * PUT /api/admin/muonsach/:id/confirm-return
 * Confirm book return → status "đã trả", log return date, restore SoQuyen.
 */
exports.confirmReturn = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const staffId = req.user?._id || req.user?.sub;
        if (!staffId) {
            return next(new ApiError(401, "Cannot identify the processing staff"));
        }

        const payload = {
            trangThai: "đã trả",
            nhanVienId: staffId,
        };

        const result = await muonSachService.update(req.params.id, payload);
        if (!result) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json({ message: "Book return confirmed successfully", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Failed to confirm book return"));
    }
};

/**
 * DELETE /api/admin/muonsach/:id
 * Delete a borrow record (Admin only).
 */
exports.delete = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const result = await muonSachService.delete(req.params.id);
        if (!result) {
            return next(new ApiError(404, "Borrow record not found"));
        }
        return res.status(200).json({ message: "Borrow record deleted successfully" });
    } catch (error) {
        return next(new ApiError(500, `Failed to delete borrow record: ${error.message}`));
    }
};
