const SachService = require("../../services/sach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const Redis = require("../../utils/redis.util");

exports.findAll = async (req, res, next) => {
    try {
        const { TenSach, TheLoai } = req.query;
        
        // Chuẩn hóa từ khóa tìm kiếm: loại bỏ dấu câu (.,?!:;…) và khoảng trắng thừa
        const cleanSearch = TenSach ? String(TenSach).replace(/[.,?!:;…]+/g, ' ').trim() : "";
        const cleanCategory = TheLoai ? String(TheLoai).trim() : "";

        const cacheKey = `user:sach:all:${cleanSearch || "all"}:${cleanCategory || "all"}`;
        const cachedData = await Redis.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const sachService = new SachService(MongoDB.client);
        const filter = {};
        if (cleanSearch) {
            const words = cleanSearch.split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            if (words.length > 0) {
                // Hỗ trợ tìm kiếm theo từng từ: mỗi từ khóa đều xuất hiện trong Tên Sách HOẶC Tác Giả HOẶC Thể Loại
                filter.$and = words.map(w => ({
                    $or: [
                        { TenSach: { $regex: new RegExp(w, "i") } },
                        { TacGia: { $regex: new RegExp(w, "i") } },
                        { TheLoai: { $regex: new RegExp(w, "i") } }
                    ]
                }));
            }
        }
        if (cleanCategory) {
            filter.TheLoai = cleanCategory;
        }

        const documents = await sachService.find(filter);

        await Redis.set(cacheKey, documents, 3600);

        return res.status(200).json(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
    }
};

exports.findOne = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError(400, "Thiếu mã sách"));
    }

    try {
        const cacheKey = `user:sach:one:${id}`;
        const cachedData = await Redis.get(cacheKey);

        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const sachService = new SachService(MongoDB.client);
        let document = await sachService.findById(id);

        if (!document) {
            const allBooks = await sachService.find({});
            document = allBooks.find((book) => {
                const candidates = [
                    book.MaSach,
                    book._id?.toString?.(),
                    book.TenSach,
                ];
                return candidates.some((value) => String(value) === String(id));
            });
        }

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }

        await Redis.set(cacheKey, document, 3600);

        return res.status(200).json(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông tin sách với id=${id}`));
    }
};
