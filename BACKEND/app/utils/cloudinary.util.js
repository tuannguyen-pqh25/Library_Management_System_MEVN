const cloudinary = require("cloudinary").v2;
const config = require("../config");

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload ảnh lên Cloudinary từ URL
 * @param {string} fileUrl - URL của ảnh muốn upload
 * @param {string} publicId - ID công khai của ảnh trên Cloudinary (optional)
 * @returns {Promise} - Promise chứa kết quả upload
 */
async function uploadImageFromUrl(fileUrl, publicId = null) {
    try {
        const uploadOptions = {
            folder: "QuanLyMuonSach/sach", // Thư mục lưu ảnh trên Cloudinary
            resource_type: "auto",
        };

        // Nếu có publicId thì sẽ ghi đè ảnh cũ
        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        const result = await cloudinary.uploader.upload(fileUrl, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi upload ảnh: ${error.message}`,
            error,
        };
    }
}

/**
 * Upload ảnh từ file binary (Base64)
 * @param {string} base64Data - Dữ liệu ảnh dạng Base64 (có thể là data URL đầy đủ hoặc chỉ base64)
 * @param {string} publicId - ID công khai của ảnh (optional)
 * @returns {Promise} - Promise chứa kết quả upload
 */
async function uploadImageFromBase64(base64Data, publicId = null) {
    try {
        const uploadOptions = {
            folder: "QuanLyMuonSach/sach",
            resource_type: "auto",
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        // Nếu đã là data URL đầy đủ thì dùng trực tiếp, nếu không thì thêm prefix
        let uploadData = base64Data;
        if (!base64Data.startsWith('data:image/')) {
            uploadData = `data:image/jpeg;base64,${base64Data}`;
        }

        const result = await cloudinary.uploader.upload(uploadData, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi upload ảnh: ${error.message}`,
            error,
        };
    }
}

/**
 * Xóa ảnh từ Cloudinary
 * @param {string} publicId - ID công khai của ảnh cần xóa
 * @returns {Promise} - Promise chứa kết quả xóa
 */
async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === "ok",
            message: result.result === "ok" ? "Xóa ảnh thành công" : "Không thể xóa ảnh",
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi xóa ảnh: ${error.message}`,
            error,
        };
    }
}

module.exports = {
    uploadImageFromUrl,
    uploadImageFromBase64,
    deleteImage,
};
