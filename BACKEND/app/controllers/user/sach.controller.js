const SachService = require("../../services/sach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");

exports.findAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const { TENSACH, tenSach, q } = req.query;
        const searchKeyword = TENSACH || tenSach || q;

        const documents = searchKeyword
            ? await sachService.findByName(searchKeyword)
            : await sachService.find({});

        return res.status(200).json(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
    }
};

exports.findOne = async (req, res, next) => {
    const { id, maSach } = req.params;
    const bookId = id || maSach;

    if (!bookId) {
        return next(new ApiError(400, "Thiếu mã sách"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        let document = await sachService.findById(bookId);

        if (!document) {
            const allBooks = await sachService.find({});
            document = allBooks.find((book) => {
                const candidates = [
                    book.MaSach,
                    book.MASACH,
                    book._id?.toString?.(),
                    book.TENSACH,
                ];
                return candidates.some((value) => String(value) === String(bookId));
            });
        }

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }

        return res.status(200).json(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông tin sách với id=${bookId}`));
    }
};
