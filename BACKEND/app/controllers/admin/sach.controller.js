const fs = require("fs");
const path = require("path");
const config = require("../../config");
const SachService = require("../../services/sach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const { uploadImageFromBase64 } = require("../../utils/cloudinary.util");
const Redis = require("../../utils/redis.util");

//1. Tạo một cuốn sách mới
exports.create = async (req, res, next) => {
    // Kiểm tra TenSach có tồn tại không
    if (!req.body?.TenSach) {
        return next(new ApiError(400, "Tên sách không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.create(req.body);
        
        await Redis.clearMatch("user:sach:*");
        await Redis.del("admin:dashboard:stats");
        
        return res.send({ message: "Tạo sách thành công", data: document });
    } catch (error) {
        // BẮT LỖI TRÙNG LẶP (MỚI)
        if (error.message.includes("Tên sách đã tồn tại")) {
            return next(new ApiError(409, error.message)); // 409 = Conflict
        }
        // Lỗi chung
        return next(
            new ApiError(500, "Lỗi xảy ra khi đang tạo sách")
        );
    }
};

// 2. FindAll: Lấy tất cả sách (hoặc tìm theo tên)
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const sachService = new SachService(MongoDB.client);
        const { TENSACH } = req.query;
        if (TENSACH) {
            documents = await sachService.findByName(TENSACH);
        } else {
            documents = await sachService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi khi lấy danh sách sách")
        );
    }
    return res.send(documents);
};

// 3. FindOne: Lấy 1 sách
exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi lấy sách với id=${req.params.id}`
            )
        );
    }
};

// 4. Update: Cập nhật sách
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không thể rỗng"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để cập nhật"));
        }

        await Redis.clearMatch("user:sach:*");

        return res.send({ message: "Sách được cập nhật thành công", data: document });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi cập nhật sách với id=${req.params.id}`)
        );
    }
};

// 5. Delete: Xóa một sách
exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để xóa"));
        }

        await Redis.clearMatch("user:sach:*");
        await Redis.del("admin:dashboard:stats");

        return res.send({ message: "Sách đã được xóa thành công" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Lỗi khi xóa sách với id=${req.params.id}`
            )
        );
    }
};

// 6. DeleteAll: Xóa tất cả sách
exports.deleteAll = async (_req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const deletedCount = await sachService.deleteAll();
        
        await Redis.clearMatch("user:sach:*");
        await Redis.del("admin:dashboard:stats");

        return res.send({
            message: `${deletedCount} sách đã được xóa.`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "Lỗi xảy ra khi xóa tất cả sách")
        );
    }
};

// 7. Upload ảnh (Hỗ trợ Cloudinary và Local Server Fallback)
exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.body?.imageUrl) {
            return next(new ApiError(400, "URL ảnh không được để trống"));
        }

        // 1. Thử upload lên Cloudinary nếu có cấu hình trong .env
        if (config.cloudinary?.cloudName && config.cloudinary?.apiKey && config.cloudinary?.apiSecret) {
            try {
                const result = await uploadImageFromBase64(req.body.imageUrl);
                if (result.success) {
                    return res.send({
                        message: "Upload ảnh lên Cloudinary thành công",
                        data: {
                            url: result.url,
                            publicId: result.publicId,
                        }
                    });
                }
            } catch (cloudErr) {
                console.warn("Upload Cloudinary không thành công, tự động chuyển sang lưu trữ local:", cloudErr.message);
            }
        }

        // 2. Chế độ Fallback: Tự động lưu ảnh vào thư mục public/uploads
        const base64Data = req.body.imageUrl;
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        let ext = "jpg";
        let imageBuffer;
        if (matches && matches.length === 3) {
            const mimeType = matches[1].toLowerCase();
            if (mimeType.includes("png")) ext = "png";
            else if (mimeType.includes("webp")) ext = "webp";
            else if (mimeType.includes("gif")) ext = "gif";
            else if (mimeType.includes("svg")) ext = "svg";
            imageBuffer = Buffer.from(matches[2], "base64");
        } else {
            imageBuffer = Buffer.from(base64Data, "base64");
        }

        const uploadDir = path.join(__dirname, "../../../public/uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.promises.writeFile(filePath, imageBuffer);

        const localUrl = `http://localhost:${config.app.port || 3000}/uploads/${fileName}`;

        return res.send({
            message: "Upload ảnh lên máy chủ thành công",
            data: {
                url: localUrl,
                publicId: fileName,
            }
        });
    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        return next(
            new ApiError(500, `Lỗi khi upload ảnh: ${error.message}`)
        );
    }
};
