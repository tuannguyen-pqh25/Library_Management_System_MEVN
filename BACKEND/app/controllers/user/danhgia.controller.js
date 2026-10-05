const DanhGiaService = require("../../services/danhgia.service");
const MongoDB = require("../../utils/mongodb.util");

const getService = () => new DanhGiaService(MongoDB.client);

/**
 * GET /api/user/danhgia/:sachId
 * Lấy danh sách đánh giá của 1 cuốn sách (công khai)
 */
exports.getBySach = async (req, res, next) => {
    try {
        const { sachId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await getService().getBySach(sachId, { page, limit });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/danhgia/:sachId/my-review
 * Kiểm tra độc giả đang đăng nhập đã đánh giá sách này chưa
 */
exports.getMyReview = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        const { sachId } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const review = await getService().getMyReview(docGiaId, sachId);
        res.json(review || null);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/user/danhgia/:sachId
 * Tạo hoặc cập nhật đánh giá (upsert)
 */
exports.upsert = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        const { sachId } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const result = await getService().upsert(docGiaId, sachId, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/user/danhgia/review/:id
 * Xóa đánh giá (chỉ chủ sở hữu)
 */
exports.delete = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        const { id } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const result = await getService().delete(id, docGiaId);
        res.json({ message: "Đã xóa đánh giá", data: result });
    } catch (error) {
        next(error);
    }
};
