const YeuThichService = require("../../services/yeuthich.service");
const MongoDB = require("../../utils/mongodb.util");

const getService = () => new YeuThichService(MongoDB.client);

/**
 * GET /api/user/yeuthich
 * Lấy danh sách yêu thích của độc giả đang đăng nhập
 */
exports.getMyWishlist = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const wishlist = await getService().getByDocGia(docGiaId);
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/yeuthich/:sachId/check
 * Kiểm tra sách có trong wishlist không
 */
exports.checkWishlist = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        const { sachId } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const wishlisted = await getService().isWishlisted(docGiaId, sachId);
        res.json({ wishlisted });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/user/yeuthich/:sachId/toggle
 * Thêm/bỏ yêu thích
 */
exports.toggle = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        const { sachId } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        const result = await getService().toggle(docGiaId, sachId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/user/yeuthich/:sachId
 * Xóa 1 cuốn khỏi wishlist
 */
exports.remove = async (req, res, next) => {
    try {
        const docGiaId = req.user?.id;
        const { sachId } = req.params;
        if (!docGiaId) return res.status(401).json({ message: "Chưa xác thực" });

        await getService().remove(docGiaId, sachId);
        res.json({ message: "Đã xóa khỏi danh sách yêu thích" });
    } catch (error) {
        next(error);
    }
};
