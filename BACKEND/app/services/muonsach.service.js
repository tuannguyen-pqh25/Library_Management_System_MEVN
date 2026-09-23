const { ObjectId } = require("mongodb");

class MuonSachService {
    constructor(client) {
        this.client = client;
        this.MuonSach = client.db().collection("THEODOIMUONSACH");
        // Phải truy cập được collection "SACH" để kiểm tra số quyển
        this.Sach = client.db().collection("SACH");
    }
    /**
     * 1. Create: Chức năng cho Độc Giả tạo phiếu mượn mới.
     * (Đã thêm logic kiểm tra SOQUYEN)
     */
    // DÁN ĐÈ TOÀN BỘ HÀM NÀY VÀO 'muonsach.service.js'
    _tinhTienPhat(phieuMuon) {
        const DON_GIA_MOI_NGAY = 5000;
        const hanTra = new Date(phieuMuon.ngayTra);
        const ngayDoiChieu = phieuMuon.ngayTraThucTe
            ? new Date(phieuMuon.ngayTraThucTe)
            : new Date();

        const soNgayTre = Math.max(
            0,
            Math.floor((ngayDoiChieu - hanTra) / (1000 * 60 * 60 * 24))
        );

        return soNgayTre * DON_GIA_MOI_NGAY * (phieuMuon.soLuong || 1);
    }

    async create(payload) {

        // --- 1. LÀM SẠCH VÀ KIỂM TRA ID SÁCH ---
        // Đọc 'payload.sachId'
        const cleanSachId = payload.sachId ? String(payload.sachId).trim().replace(/"/g, '') : null;
        const sachId = ObjectId.isValid(cleanSachId) ? new ObjectId(cleanSachId) : null;
        if (!sachId) {
            throw new Error("ID Sách không hợp lệ");
        }

        // --- 2. LÀM SẠCH VÀ KIỂM TRA ID ĐỘC GIẢ ---
        // Đọc 'payload.docGiaId' (CHÍNH XÁC TỪNG CHỮ HOA, THƯỜNG)
        const cleanDocGiaId = payload.docGiaId ? String(payload.docGiaId).trim().replace(/"/g, '') : null;
        const docGiaId = ObjectId.isValid(cleanDocGiaId) ? new ObjectId(cleanDocGiaId) : null;

        if (!docGiaId) {
            // Lỗi 500 của bạn xuất phát từ đây
            throw new Error("ID Độc Giả không hợp lệ (Lỗi đọc payload)");
        }

        // --- 2.5. KIỂM TRA VÀ LẤY SỐ LƯỢNG MƯỢN ---
        let soLuong = payload.soLuong ? parseInt(payload.soLuong) : 1;

        if (soLuong < 1 || isNaN(soLuong)) {
            throw new Error("Số lượng mượn phải lớn hơn 0");
        }

        if (soLuong > 3) {
            throw new Error("Mỗi lần chỉ được mượn tối đa 3 quyển");
        }

        // --- 3. KIỂM TRA LOGIC SÁCH (KHÔNG TRỪ KHO NGAY, CHỈ KIỂM TRA TỒN TẠI) ---
        const sach = await this.Sach.findOne({ _id: sachId });
        if (!sach) throw new Error("Không tìm thấy sách");

        // --- 3.5. KIỂM TRA SỐ LƯỢNG SÁCH CÒN LẠI ---
        if (sach.SOQUYEN < soLuong) {
            throw new Error(`Chỉ còn ${sach.SOQUYEN} quyển, không thể mượn ${soLuong} quyển`);
        }

        // --- 3.75. KIỂM TRA HẠNMỨC TỔNG CỘNG ĐỦC GIẢ (MAX 10 QUYỂN) ---
        const docGiaMuonSach = await this.MuonSach.find({
            docGiaId: docGiaId,
            trangThai: { $in: ["chờ duyệt", "đã duyệt", "đang mượn"] }
        }).toArray();

        // Tính tổng số quyển đang mượn
        const currentBorrowCount = docGiaMuonSach.reduce((sum, record) => sum + (record.soLuong || 1), 0);

        if (currentBorrowCount + soLuong > 10) {
            throw new Error(`Bạn đã mượn ${currentBorrowCount} quyển. Không thể vượt quá hạn mức 10 quyển`);
        }

        // --- 3.85. KIỂM TRA MAX 3 QUYỂN PER SÁCH ---
        const bookBorrowRecords = await this.MuonSach.find({
            docGiaId: docGiaId,
            sachId: sachId,
            trangThai: { $in: ["chờ duyệt", "đã duyệt", "đang mượn"] }
        }).toArray();

        const bookBorrowCount = bookBorrowRecords.reduce((sum, record) => sum + (record.soLuong || 1), 0);

        if (bookBorrowCount + soLuong > 3) {
            throw new Error(`Cuốn sách này bạn chỉ được mượn tối đa 3 quyển. Hiện tại bạn đã mượn ${bookBorrowCount} quyển`);
        }

        // Độc giả tạo luôn là "chờ duyệt", nhân viên sẽ duyệt sau
        let trangThaiMoi = "chờ duyệt";
        let nhanVienXuLyId = null;

        const phieuMuonData = {
            docGiaId: docGiaId,
            sachId: sachId,
            soLuong: soLuong,
            ngayMuon: payload.ngayMuon,
            ngayTra: payload.ngayTra,
            trangThai: trangThaiMoi,
            nhanVienId: nhanVienXuLyId,
            ngayTraThucTe: null,
        };

        const result = await this.MuonSach.insertOne(phieuMuonData);
        return await this.findById(result.insertedId);
    }


    //2. Find: Chức năng cho Nhân Viên/Admin xem tất cả phiếu mượn.

    async find(filter) {
        const cursor = await this.MuonSach.find(filter);
        const records = await cursor.toArray();
        return await this._populateMuonSachRecords(records);
    }

    //3. Find by ID: Lấy chi tiết 1 phiếu mượn. 
    async findById(id) {
        return await this.MuonSach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    _normalizeObjectId(value) {
        if (!value) return null;
        if (value instanceof ObjectId) return value;
        if (typeof value === 'string') {
            return ObjectId.isValid(value) ? new ObjectId(value) : null;
        }
        if (typeof value === 'object') {
            if (value.$oid && ObjectId.isValid(value.$oid)) {
                return new ObjectId(value.$oid);
            }
            if (typeof value.toString === 'function') {
                const str = value.toString();
                if (ObjectId.isValid(str)) return new ObjectId(str);
            }
        }
        return null;
    }

    async _populateMuonSachRecords(records) {
        if (!records || records.length === 0) return [];

        return await Promise.all(records.map(async (rec) => {
            const out = { ...rec };
            const normalizedNhanVienId = this._normalizeObjectId(rec.nhanVienId);

            if (normalizedNhanVienId) {
                try {
                    const nhanVien = await this.client.db().collection("NHANVIEN").findOne({ _id: normalizedNhanVienId });
                    if (nhanVien) {
                        out.TenNhanVien = (nhanVien.HOLOT || '') + ' ' + (nhanVien.TEN || nhanVien.HoTenNV || '');
                        out.TenNhanVien = out.TenNhanVien.trim() || 'Nhân viên không xác định';
                    }
                } catch (error) {
                    console.error("Error fetching staff:", error);
                }
            }

            return out;
        }));
    }

    //4. Find by DocGiaId: Chức năng cho Độc Giả xem lịch sử mượn.
    async findByDocGia(docGiaId) {
        const filter = {
            docGiaId: ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null
        };
        const records = await this.find(filter);

        // Populate nhanVienId with staff name and NXB with publisher name
        const populated = await Promise.all(records.map(async (rec) => {
            const out = { ...rec };

            // Populate staff name if nhanVienId exists
            if (rec.nhanVienId && !out.nhanVienName && !out.TenNhanVien) {
                try {
                    const nhanVien = await this.client.db().collection("NHANVIEN").findOne({ _id: rec.nhanVienId });
                    if (nhanVien) {
                        out.nhanVienName = (nhanVien.HOLOT || nhanVien.HoTenNV || '') + ' ' + (nhanVien.TEN || '');
                        out.nhanVienName = out.nhanVienName.trim() || 'Nhân viên không xác định';
                    }
                } catch (error) {
                    console.error("Error fetching staff:", error);
                }
            }

            // Populate publisher name from book
            if (rec.sachId) {
                try {
                    const sach = await this.Sach.findOne({ _id: rec.sachId });
                    if (sach) {
                        out.TENSACH = sach.TENSACH || out.TENSACH;
                        out.TACGIA = sach.TACGIA || out.TACGIA;
                        out.NAMXB = sach.NAMXUATBAN || sach.NAMXB || out.NAMXB;

                        // Populate NXB name - find by MANXB (code) or _id
                        out.nxbName = 'N/A'; // Default value
                        if (sach.MANXB) {
                            // Try to find by MANXB first (string field)
                            let nxb = await this.client.db().collection("NHAXUATBAN").findOne({ MANXB: sach.MANXB });

                            // If not found and MANXB is valid ObjectId, try by _id
                            if (!nxb && ObjectId.isValid(sach.MANXB)) {
                                nxb = await this.client.db().collection("NHAXUATBAN").findOne({ _id: new ObjectId(sach.MANXB) });
                            }

                            if (nxb) {
                                out.nxbName = nxb.TENNXB;
                            } else {
                                out.nxbName = sach.MANXB;
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching publisher:", error);
                }
            }

            return out;
        }));

        return populated;
    }

    /**
     * 5. Update: Nhân Viên cập nhật trạng thái phiếu.
     * (Đã thêm logic trả sách vào kho)
     */
    async update(id, payload) {
        const phieuMuonId = ObjectId.isValid(id) ? new ObjectId(id) : null;
        if (!phieuMuonId) throw new Error("ID Phiếu Mượn không hợp lệ");

        // --- LOGIC QUẢN LÝ SÁCH ---
        // A. Lấy phiếu mượn HIỆN TẠI để biết trạng thái cũ
        const currentPhieuMuon = await this.findById(phieuMuonId);
        if (!currentPhieuMuon) throw new Error("Không tìm thấy phiếu mượn");

        const newTrangThai = payload.trangThai;
        const oldTrangThai = currentPhieuMuon.trangThai;
        const sachId = currentPhieuMuon.sachId;

        // B. Kiểm tra và cập nhật số lượng sách
        const soLuong = currentPhieuMuon.soLuong || 1; // Lấy số lượng từ phiếu

        // Giảm SOQUYEN khi duyệt phiếu mượn (giảm theo số lượng)
        if (newTrangThai === "đã duyệt" && oldTrangThai === "chờ duyệt") {
            const sach = await this.Sach.findOne({ _id: sachId });
            if (!sach) throw new Error("Không tìm thấy sách");
            if (sach.SOQUYEN < soLuong) throw new Error(`Chỉ còn ${sach.SOQUYEN} quyển, không đủ để duyệt`);
            await this.Sach.updateOne(
                { _id: sachId },
                { $inc: { SOQUYEN: -soLuong } }
            );
        }

        // Trả sách (+ SOQUYEN) nếu:
        // 1. Trạng thái mới là "đã trả" (VÀ trạng thái cũ chưa phải là "đã trả")
        // 2. Trạng thái mới là "từ chối" (VÀ trạng thái cũ là "chờ duyệt" hoặc "đã duyệt" hoặc "đang mượn" hoặc "đang chờ trả")

        const isReturning = (newTrangThai === "đã trả" && oldTrangThai !== "đã trả");
        const isRejected = (newTrangThai === "từ chối" && ["đã duyệt", "đang mượn", "đang chờ trả"].includes(oldTrangThai));

        if (isReturning || isRejected) {
            // Cộng soLuong trả lại SOQUYEN cho sách
            await this.Sach.updateOne(
                { _id: sachId },
                { $inc: { SOQUYEN: +soLuong } }
            );
        }
        // --- KẾT THÚC LOGIC QUẢN LÝ SÁCH ---

        // C. Cập nhật phiếu mượn
        const filter = { _id: phieuMuonId };
        const updateData = {};
        const validStates = ["chờ duyệt", "đã duyệt", "đang mượn", "đang chờ trả", "đã trả", "từ chối"];

        if (newTrangThai && validStates.includes(newTrangThai)) {
            updateData.trangThai = newTrangThai;
        } else if (!newTrangThai && payload.daXacNhanNopPhat !== undefined) {
            // Cho phép cập nhật daXacNhanNopPhat mà không cần trạng thái mới
        } else {
            throw new Error("Trạng thái cập nhật không hợp lệ");
        }

        // Chỉ yêu cầu nhanVienId khi không phải yêu cầu trả sách từ độc giả hoặc cập nhật daXacNhanNopPhat
        if (newTrangThai === "đang chờ trả" || (!newTrangThai && payload.daXacNhanNopPhat !== undefined)) {
            // Độc giả yêu cầu trả hoặc cập nhật nộp phạt - không cần nhanVienId
            // Giữ nhanVienId cũ nếu có
            if (payload.nhanVienId) {
                updateData.nhanVienId = ObjectId.isValid(payload.nhanVienId) ? new ObjectId(payload.nhanVienId) : null;
            }
        } else {
            // Nhân viên cập nhật - yêu cầu nhanVienId
            if (payload.nhanVienId) {
                updateData.nhanVienId = ObjectId.isValid(payload.nhanVienId) ? new ObjectId(payload.nhanVienId) : null;
            } else {
                throw new Error("ID Nhân viên xử lý là bắt buộc");
            }
        }

        if (newTrangThai === "đã trả") {
            updateData.ngayTraThucTe = new Date().toISOString().split('T')[0]; // Ghi nhận ngày hôm nay
            updateData.tienPhat = this._tinhTienPhat({
                ...currentPhieuMuon,
                ngayTraThucTe: updateData.ngayTraThucTe
            });
        }

        // Thêm lý do từ chối nếu trạng thái là 'từ chối'
        if (newTrangThai === "từ chối" && payload.lyDoTuChoi) {
            updateData.lyDoTuChoi = payload.lyDoTuChoi;
        }

        // Thêm xác nhận nộp phạt từ độc giả
        if (payload.daXacNhanNopPhat !== undefined) {
            updateData.daXacNhanNopPhat = payload.daXacNhanNopPhat;
        }

        if (payload.daNopPhat !== undefined) {
            updateData.daNopPhat = payload.daNopPhat;
        }

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    /**
     * 6. Delete: Xóa phiếu mượn.
     * (Đã thêm logic trả sách vào kho nếu phiếu bị xóa khi đang mượn)
     */
    async delete(id) {
        // A. Lấy phiếu mượn TRƯỚC KHI XÓA
        const phieuMuon = await this.findById(id);
        if (phieuMuon) {
            const { trangThai, sachId } = phieuMuon;
            const soLuong = phieuMuon.soLuong || 1; // Lấy số lượng từ phiếu
            // Nếu phiếu bị xóa khi sách đang ở ngoài (chờ, đã duyệt, đang mượn)
            // thì phải trả sách về kho
            if (["chờ duyệt", "đã duyệt", "đang mượn"].includes(trangThai)) {
                await this.Sach.updateOne(
                    { _id: sachId },
                    { $inc: { SOQUYEN: +soLuong } }
                );
            }
        }

        // B. Xóa phiếu mượn
        const result = await this.MuonSach.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }
}

module.exports = MuonSachService;