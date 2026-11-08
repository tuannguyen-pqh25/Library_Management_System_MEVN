/**
 * Tiện ích quản lý Indexes cho MongoDB
 * Dự án Quản Lý Mượn Sách (CT449)
 * Thiết lập các Unique Indexes & Compound Indexes giúp đảm bảo toàn vẹn dữ liệu và tối ưu hiệu năng
 */

const INDEX_DEFINITIONS = [
    // 1. Bảng SACH
    {
        collection: "SACH",
        spec: { MaSach: 1 },
        options: { unique: true, name: "uniq_MaSach" },
        description: "Khóa nghiệp vụ duy nhất cho Mã Sách (chống trùng lặp)"
    },
    {
        collection: "SACH",
        spec: { TenSach: 1 },
        options: { name: "idx_TenSach" },
        description: "Tối ưu tìm kiếm theo tên sách"
    },
    {
        collection: "SACH",
        spec: { TheLoai: 1 },
        options: { name: "idx_TheLoai" },
        description: "Tối ưu lọc sách theo thể loại"
    },
    {
        collection: "SACH",
        spec: { MaNXB: 1 },
        options: { name: "idx_MaNXB" },
        description: "Tối ưu join/tra cứu theo Nhà xuất bản"
    },

    // 2. Bảng DOCGIA
    {
        collection: "DOCGIA",
        spec: { MaDocGia: 1 },
        options: { unique: true, name: "uniq_MaDocGia" },
        description: "Khóa nghiệp vụ duy nhất cho Mã Độc Giả"
    },
    {
        collection: "DOCGIA",
        spec: { Email: 1 },
        options: { unique: true, sparse: true, name: "uniq_Email" },
        description: "Email độc giả duy nhất để đăng nhập"
    },
    {
        collection: "DOCGIA",
        spec: { DienThoai: 1 },
        options: { sparse: true, name: "idx_DienThoai" },
        description: "Tối ưu tìm kiếm và đăng nhập theo Số điện thoại"
    },
    {
        collection: "DOCGIA",
        spec: { oauthProvider: 1, oauthId: 1 },
        options: { sparse: true, name: "idx_oauth" },
        description: "Tối ưu định danh đăng nhập OAuth 2.0 (Google)"
    },

    // 3. Bảng NHANVIEN
    {
        collection: "NHANVIEN",
        spec: { MSNV: 1 },
        options: { unique: true, name: "uniq_MSNV" },
        description: "Khóa nghiệp vụ duy nhất cho Mã Số Nhân Viên"
    },
    {
        collection: "NHANVIEN",
        spec: { EMAIL: 1 },
        options: { unique: true, sparse: true, name: "uniq_EMAIL" },
        description: "Email nhân viên duy nhất (nếu có)"
    },

    // 4. Bảng NHAXUATBAN
    {
        collection: "NHAXUATBAN",
        spec: { MaNXB: 1 },
        options: { unique: true, name: "uniq_MaNXB" },
        description: "Khóa nghiệp vụ duy nhất cho Mã NXB"
    },
    {
        collection: "NHAXUATBAN",
        spec: { TenNXB: 1 },
        options: { unique: true, name: "uniq_TenNXB" },
        description: "Tên NXB duy nhất để tránh tạo trùng nhà xuất bản"
    },

    // 5. Bảng THEODOIMUONSACH
    {
        collection: "THEODOIMUONSACH",
        spec: { docGiaId: 1, trangThai: 1 },
        options: { name: "idx_muon_docgia_trangthai" },
        description: "Tối ưu kiểm tra hạn mức mượn (10 quyển) và lịch sử độc giả"
    },
    {
        collection: "THEODOIMUONSACH",
        spec: { sachId: 1 },
        options: { name: "idx_muon_sachid" },
        description: "Tối ưu aggregate thống kê sách được mượn nhiều nhất và hoàn kho"
    },
    {
        collection: "THEODOIMUONSACH",
        spec: { trangThai: 1, ngayTra: 1 },
        options: { name: "idx_muon_trangthai_ngaytra" },
        description: "Tối ưu quét tự động quá hạn và chuông thông báo"
    },
    {
        collection: "THEODOIMUONSACH",
        spec: { trangThai: 1 },
        options: { name: "idx_muon_trangthai" },
        description: "Tối ưu lọc danh sách phiếu theo trạng thái (chờ duyệt, đang mượn...)"
    },

    // 6. Bảng phụ Đánh giá
    {
        collection: "DANHGIA",
        spec: { sachId: 1, docGiaId: 1 },
        options: { name: "idx_danhgia_sach_docgia" },
        description: "Tối ưu tải đánh giá và kiểm tra đánh giá trùng theo từng cuốn sách"
    },

    // 7. Bảng Yêu thích (Wishlist)
    {
        collection: "YEUTHICH",
        spec: { docGiaId: 1, sachId: 1 },
        options: { unique: true, name: "uniq_yeuthich_docgia_sach" },
        description: "Khóa duy nhất chống trùng lặp danh sách yêu thích của độc giả"
    },
    {
        collection: "YEUTHICH",
        spec: { docGiaId: 1 },
        options: { name: "idx_yeuthich_docgia" },
        description: "Tối ưu tải danh sách sách yêu thích theo độc giả"
    }
];

/**
 * Tạo tất cả các indexes cần thiết cho CSDL
 * @param {object} client - MongoDB client instance
 * @param {boolean} verbose - In log chi tiết
 */
async function ensureIndexes(client, verbose = false) {
    if (!client) {
        throw new Error("MongoDB client is not connected.");
    }

    const db = client.db();
    const results = {
        created: 0,
        existed: 0,
        failed: 0,
        details: []
    };

    for (const def of INDEX_DEFINITIONS) {
        try {
            const col = db.collection(def.collection);
            let indexName;
            try {
                indexName = await col.createIndex(def.spec, def.options);
            } catch (createErr) {
                // Nếu index đã tồn tại với tên này nhưng khác key spec (code 85: IndexOptionsConflict / IndexKeySpecsConflict)
                if (createErr.code === 85 || (createErr.message && createErr.message.includes("same name as the requested index"))) {
                    if (def.options?.name) {
                        await col.dropIndex(def.options.name);
                        indexName = await col.createIndex(def.spec, def.options);
                    } else {
                        throw createErr;
                    }
                } else {
                    throw createErr;
                }
            }
            results.created++;
            results.details.push({
                collection: def.collection,
                index: indexName,
                unique: !!def.options.unique,
                status: "success",
                description: def.description
            });
            if (verbose) {
                console.log(`[Index OK] ${def.collection}.${indexName} (${def.description})`);
            }
        } catch (err) {
            results.failed++;
            results.details.push({
                collection: def.collection,
                index: def.options.name,
                unique: !!def.options.unique,
                status: "error",
                error: err.message,
                description: def.description
            });
            console.error(`[Index Error] ${def.collection}.${def.options.name}: ${err.message}`);
        }
    }

    return results;
}

module.exports = {
    INDEX_DEFINITIONS,
    ensureIndexes
};
