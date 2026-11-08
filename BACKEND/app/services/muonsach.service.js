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

        if (soLuong > 10) {
            throw new Error("Mỗi lần chỉ được mượn tối đa 10 quyển");
        }

        // --- 3. CẬP NHẬT TRẠNG THÁI QUÁ HẠN & TỰ ĐỘNG KHÓA TRƯỚC TIÊN ---
        await this._checkAndUpdateOverdue();

        // --- 3.25. KIỂM TRA TRẠNG THÁI TÀI KHOẢN ĐỘC GIẢ ---
        const docGiaData = await this.client.db().collection("DOCGIA").findOne({ _id: docGiaId });
        if (!docGiaData) {
            throw new Error("Không tìm thấy thông tin tài khoản độc giả");
        }
        if (docGiaData.TrangThaiTaiKhoan === "BiKhoa") {
            const reason = docGiaData.LyDoKhoa ? `: ${docGiaData.LyDoKhoa}` : "";
            throw new Error(`Tài khoản của bạn đang bị khóa do${reason}. Bạn không thể mượn sách lúc này! Vui lòng liên hệ ban quản lý thư viện để giải quyết.`);
        }

        // --- 3.5. KIỂM TRA TỒN TẠI VÀ SỐ LƯỢNG SÁCH CÒN LẠI ---
        const sach = await this.Sach.findOne({ _id: sachId });
        if (!sach) throw new Error("Không tìm thấy sách");

        if (sach.SoQuyen < soLuong) {
            throw new Error(`Chỉ còn ${sach.SoQuyen} quyển, không thể mượn ${soLuong} quyển`);
        }

        // --- 3.75. KIỂM TRA HẠN MỨC TỔNG CỘNG ĐỘC GIẢ (MAX 10 QUYỂN) ---
        const docGiaMuonSach = await this.MuonSach.find({
            docGiaId: docGiaId,
            trangThai: { $in: ["chờ duyệt", "đã duyệt", "đang mượn", "chờ gia hạn", "đang chờ trả", "quá hạn"] }
        }).toArray();

        // 1. Kiểm tra sách quá hạn: Độc giả có sách quá hạn (kể cả đang chờ xác nhận trả) sẽ không được mượn thêm
        const todayDateStr = new Date().toLocaleDateString('en-CA');
        const isOverdueLoan = (record) => {
            if (record.trangThai === "quá hạn") return true;
            if (record.daTungQuaHan) return true;
            if (["đang chờ trả", "đang mượn", "chờ gia hạn", "đã duyệt"].includes(record.trangThai) && record.ngayTra) {
                const returnDateStr = new Date(record.ngayTra).toLocaleDateString('en-CA');
                if (returnDateStr < todayDateStr) return true;
            }
            return false;
        };

        const overdueRecords = docGiaMuonSach.filter(isOverdueLoan);
        const overdueCount = overdueRecords.reduce((sum, record) => sum + (record.soLuong || 1), 0);
        if (overdueCount > 0) {
            throw new Error(`Bạn đang có ${overdueCount} quyển sách quá hạn (hoặc đang chờ thủ thư xác nhận trả sách quá hạn). Vui lòng hoàn tất trả sách và chờ thủ thư xác nhận trước khi mượn thêm sách mới!`);
        }

        // 2. Tính tổng số quyển đang giữ hoặc chờ duyệt (gồm chờ duyệt, đã duyệt, đang mượn, đang chờ trả)
        const currentBorrowCount = docGiaMuonSach.reduce((sum, record) => sum + (record.soLuong || 1), 0);

        if (currentBorrowCount + soLuong > 10) {
            const remaining = Math.max(0, 10 - currentBorrowCount);
            throw new Error(`Bạn đang giữ / chờ duyệt ${currentBorrowCount} quyển. Hạn mức tối đa là 10 quyển (bạn chỉ có thể mượn thêm tối đa ${remaining} quyển).`);
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await this.MuonSach.insertOne(phieuMuonData);
        return await this.findById(result.insertedId);
    }


    async _checkAndUpdateOverdue() {
        try {
            const todayDateStr = new Date().toLocaleDateString('en-CA');
            const todayIso = new Date().toISOString();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const res = await this.MuonSach.updateMany(
                {
                    trangThai: { $in: ["đang mượn", "đã duyệt", "chờ gia hạn"] },
                    $or: [
                        { ngayTra: { $lt: todayDateStr } },
                        { ngayTra: { $lt: todayIso } }
                    ]
                },
                {
                    $set: { trangThai: "quá hạn", daTungQuaHan: true }
                }
            );

            // Cũng đánh dấu daTungQuaHan: true cho các phiếu "đang chờ trả" mà đã quá hạn
            const resWaiting = await this.MuonSach.updateMany(
                {
                    trangThai: "đang chờ trả",
                    $or: [
                        { ngayTra: { $lt: todayDateStr } },
                        { ngayTra: { $lt: todayIso } }
                    ]
                },
                {
                    $set: { daTungQuaHan: true }
                }
            );

            // Quét tự động khóa tài khoản độc giả: quá hạn > 7 ngày (quá 1 tuần) hoặc tiền phạt >= 100.000 VNĐ
            let hadAccountLocked = false;
            const overdueRecords = await this.MuonSach.find({
                trangThai: { $in: ["quá hạn", "đang mượn", "chờ gia hạn", "đang chờ trả"] },
                $or: [
                    { trangThai: "quá hạn" },
                    { daTungQuaHan: true },
                    { ngayTra: { $lt: todayDateStr } },
                    { ngayTra: { $lt: todayIso } }
                ]
            }).toArray();

            if (overdueRecords.length > 0) {
                // Gom nhóm phiếu quá hạn theo docGiaId
                const readerMap = new Map();
                for (const rec of overdueRecords) {
                    if (!rec.docGiaId) continue;
                    const dgKey = rec.docGiaId.toString();
                    if (!readerMap.has(dgKey)) {
                        readerMap.set(dgKey, { docGiaId: rec.docGiaId, maxDays: 0, totalFine: 0 });
                    }
                    const item = readerMap.get(dgKey);

                    let soNgayTre = 0;
                    if (rec.ngayTra) {
                        const due = new Date(rec.ngayTra);
                        if (!isNaN(due.getTime())) {
                            due.setHours(0, 0, 0, 0);
                            const diffDays = Math.round((today - due) / (1000 * 60 * 60 * 24));
                            if (diffDays > 0) soNgayTre = diffDays;
                        }
                    }
                    if (rec.trangThai === "quá hạn" && soNgayTre <= 0) {
                        soNgayTre = 1;
                    }

                    const fine = soNgayTre * 5000 * (rec.soLuong || 1);
                    if (soNgayTre > item.maxDays) item.maxDays = soNgayTre;
                    item.totalFine += fine;
                }

                // Kiểm tra độc giả nào vượt ngưỡng (quá hạn > 7 ngày từ quyển đầu tiên hoặc tổng phạt >= 100.000đ)
                for (const [, stats] of readerMap.entries()) {
                    if (stats.maxDays > 7 || stats.totalFine >= 100000) {
                        const docGiaObjId = this._normalizeObjectId(stats.docGiaId);
                        if (!docGiaObjId) continue;

                        let reason = "";
                        if (stats.maxDays > 7 && stats.totalFine >= 100000) {
                            reason = `Tự động khóa: Quyển sách đầu tiên đã trễ hạn ${stats.maxDays} ngày (> 1 tuần) và tổng tiền phạt các sách (${stats.totalFine.toLocaleString('vi-VN')} VNĐ) vượt mức 100.000 VNĐ`;
                        } else if (stats.maxDays > 7) {
                            reason = `Tự động khóa: Quyển sách đầu tiên đã trễ hạn ${stats.maxDays} ngày (tính từ lúc quyển đầu tiên trễ hạn, vượt quá thời hạn 1 tuần cho phép)`;
                        } else {
                            reason = `Tự động khóa: Tổng tiền phạt trễ hạn tích lũy của tất cả các sách đang mượn (${stats.totalFine.toLocaleString('vi-VN')} VNĐ) đạt mức >= 100.000 VNĐ`;
                        }

                        const updateRes = await this.client.db().collection("DOCGIA").updateOne(
                            {
                                _id: docGiaObjId,
                                TrangThaiTaiKhoan: { $ne: "BiKhoa" }
                            },
                            {
                                $set: {
                                    TrangThaiTaiKhoan: "BiKhoa",
                                    LyDoKhoa: reason,
                                    NgayKhoa: new Date(),
                                    NguoiKhoa: "HeThongTuDong",
                                    updatedAt: new Date().toISOString()
                                }
                            }
                        );

                        if (updateRes && updateRes.modifiedCount > 0) {
                            hadAccountLocked = true;
                        }
                    }
                }
            }

            if ((res && res.modifiedCount > 0) || (resWaiting && resWaiting.modifiedCount > 0) || hadAccountLocked) {
                const Redis = require("../utils/redis.util");
                await Redis.del("admin:dashboard:stats");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái quá hạn:", error);
        }
    }

    //2. Find: Chức năng cho Nhân Viên/Admin xem tất cả phiếu mượn.

    async find(filter) {
        await this._checkAndUpdateOverdue();
        const cursor = await this.MuonSach.find(filter).sort({ createdAt: -1, ngayMuon: -1 });
        const records = await cursor.toArray();
        return await this._populateMuonSachRecords(records);
    }

    //3. Find by ID: Lấy chi tiết 1 phiếu mượn. 
    async findById(id) {
        await this._checkAndUpdateOverdue();
        return await this.MuonSach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    /**
     * 3.5. findAllPopulated: Lấy toàn bộ phiếu mượn, đã populate đầy đủ
     * Sách (TenSach, HinhAnh), DocGia (HoTen, DienThoai), NhanVien (HoTen)
     */
    async findAllPopulated(filter = {}) {
        await this._checkAndUpdateOverdue();
        const records = await this.MuonSach.find(filter)
            .sort({ createdAt: -1, ngayMuon: -1 })
            .toArray();

        return await Promise.all(records.map(async (rec) => {
            const out = { ...rec };

            // Populate Sách
            if (rec.sachId) {
                try {
                    const sach = await this.Sach.findOne({ _id: this._normalizeObjectId(rec.sachId) });
                    if (sach) {
                        out.TenSach = sach.TenSach || sach.TENSACH || '—';
                        out.HinhAnh = sach.HinhAnh || null;
                        out.MaSach = sach.MaSach || sach.MASACH || '—';
                        // Populate NXB name
                        if (sach.MaNXB) {
                            try {
                                let nxb = await this.client.db().collection("NHAXUATBAN").findOne({ MaNXB: sach.MaNXB });
                                if (!nxb && ObjectId.isValid(sach.MaNXB)) {
                                    nxb = await this.client.db().collection("NHAXUATBAN").findOne({ _id: new ObjectId(sach.MaNXB) });
                                }
                                out.TenNXB = nxb ? nxb.TenNXB : sach.MaNXB;
                            } catch (_) { out.TenNXB = '—'; }
                        }
                    }
                } catch (e) { console.error("Populate sach error:", e); }
            }

            // Populate DocGia
            if (rec.docGiaId) {
                try {
                    const docGia = await this.client.db().collection("DOCGIA").findOne({ _id: this._normalizeObjectId(rec.docGiaId) });
                    if (docGia) {
                        out.TenDocGia = ((docGia.HoLot || docGia.HOLOT || '') + ' ' + (docGia.Ten || docGia.TEN || '')).trim() || docGia.Email || '—';
                        out.EmailDocGia = docGia.Email || docGia.EMAIL || '—';
                        out.DienThoaiDocGia = docGia.DienThoai || docGia.DIENTHOAI || '—';
                        out.TrangThaiTaiKhoan = docGia.TrangThaiTaiKhoan || 'BinhThuong';
                        out.MaDocGia = docGia.MaDocGia || '—';
                    }
                } catch (e) { console.error("Populate docgia error:", e); }
            }

            // Populate NhanVien
            const nhanVienId = this._normalizeObjectId(rec.nhanVienId);
            if (nhanVienId) {
                try {
                    const nv = await this.client.db().collection("NHANVIEN").findOne({ _id: nhanVienId });
                    if (nv) {
                        out.TenNhanVien = ((nv.HOLOT || '') + ' ' + (nv.TEN || nv.HoTenNV || '')).trim() || 'Nhân viên không xác định';
                    }
                } catch (e) { console.error("Populate nhanvien error:", e); }
            }

            return out;
        }));
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
        if (!docGiaId) return [];
        const objId = ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : null;
        const strId = String(docGiaId);
        const filter = {
            $or: [
                ...(objId ? [{ docGiaId: objId }] : []),
                { docGiaId: strId }
            ]
        };
        const records = await this.find(filter);

        // Populate nhanVienId with staff name and NXB with publisher name
        const populated = await Promise.all(records.map(async (rec) => {
            const out = { ...rec };

            // Populate staff name if nhanVienId exists
            if (rec.nhanVienId && !out.nhanVienName && !out.TenNhanVien) {
                try {
                    const nhanVien = await this.client.db().collection("NHANVIEN").findOne({ _id: this._normalizeObjectId(rec.nhanVienId) });
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
                    const sach = await this.Sach.findOne({ _id: this._normalizeObjectId(rec.sachId) });
                    if (sach) {
                        out.TenSach = sach.TenSach || out.TenSach;
                        out.TacGia = sach.TacGia || out.TacGia;
                        out.NamXuatBan = sach.NamXuatBan || out.NamXuatBan;
                        out.HinhAnh = sach.HinhAnh || null;
                        out.MaSach = sach.MaSach || '';

                        // Populate NXB name - find by MaNXB (code) or _id
                        out.nxbName = 'N/A'; // Default value
                        if (sach.MaNXB) {
                            // Try to find by MaNXB first (string field)
                            let nxb = await this.client.db().collection("NHAXUATBAN").findOne({ MaNXB: sach.MaNXB });

                            // If not found and MaNXB is valid ObjectId, try by _id
                            if (!nxb && ObjectId.isValid(sach.MaNXB)) {
                                nxb = await this.client.db().collection("NHAXUATBAN").findOne({ _id: new ObjectId(sach.MaNXB) });
                            }

                            if (nxb) {
                                out.nxbName = nxb.TenNXB;
                            } else {
                                out.nxbName = sach.MaNXB;
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
        const allowedTransitions = {
            "chờ duyệt": ["đã duyệt", "từ chối"],
            "đã duyệt": ["đang mượn", "đang chờ trả", "đã trả", "từ chối", "quá hạn"],
            "đang mượn": ["đang chờ trả", "đã trả", "từ chối", "quá hạn", "chờ gia hạn"],
            "chờ gia hạn": ["đang mượn", "đang chờ trả", "đã trả", "từ chối", "quá hạn"],
            "quá hạn": ["đang chờ trả", "đã trả"],
            "đang chờ trả": ["đã trả", "từ chối"],
        };
        if (newTrangThai && !allowedTransitions[oldTrangThai]?.includes(newTrangThai)) {
            throw new Error("Chuyển trạng thái phiếu mượn không hợp lệ");
        }
        const sachId = currentPhieuMuon.sachId;

        // B. Kiểm tra và cập nhật số lượng sách
        const soLuong = currentPhieuMuon.soLuong || 1; // Lấy số lượng từ phiếu
        let stockDeducted = false;

        // Việc trừ kho thực hiện sau khi đã kiểm tra toàn bộ payload.

        // Trả sách (+ SOQUYEN) nếu:
        // 1. Trạng thái mới là "đã trả" (VÀ trạng thái cũ chưa phải là "đã trả")
        // 2. Trạng thái mới là "từ chối" (VÀ trạng thái cũ là "chờ duyệt" hoặc "đã duyệt" hoặc "đang mượn" hoặc "đang chờ trả")

        const isReturning = (newTrangThai === "đã trả" && oldTrangThai !== "đã trả");
        const isRejected = (newTrangThai === "từ chối" && ["đã duyệt", "đang mượn", "đang chờ trả"].includes(oldTrangThai));

        if ((isReturning || isRejected) && !await this.Sach.findOne({ _id: sachId })) {
            throw new Error("Không tìm thấy sách để hoàn kho");
        }
        // --- KẾT THÚC LOGIC QUẢN LÝ SÁCH ---

        // C. Cập nhật phiếu mượn
        const filter = { _id: phieuMuonId, trangThai: oldTrangThai };
        const updateData = {};
        const validStates = ["chờ duyệt", "đã duyệt", "đang mượn", "chờ gia hạn", "đang chờ trả", "đã trả", "từ chối", "quá hạn"];

        if (newTrangThai && validStates.includes(newTrangThai)) {
            updateData.trangThai = newTrangThai;
        } else if (!newTrangThai && payload.daXacNhanNopPhat !== undefined) {
            // Cho phép cập nhật daXacNhanNopPhat mà không cần trạng thái mới
        } else {
            throw new Error("Trạng thái cập nhật không hợp lệ");
        }

        // Chỉ yêu cầu nhanVienId khi không phải yêu cầu trả/gia hạn sách từ độc giả hoặc cập nhật daXacNhanNopPhat
        if (newTrangThai === "đang chờ trả" || newTrangThai === "chờ gia hạn" || (!newTrangThai && payload.daXacNhanNopPhat !== undefined)) {
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
        if (payload.ngayDuKienTra) {
            updateData.ngayDuKienTra = payload.ngayDuKienTra;
        }
        if (payload.daTungQuaHan !== undefined) {
            updateData.daTungQuaHan = payload.daTungQuaHan;
        }

        updateData.updatedAt = new Date().toISOString();

        if (newTrangThai === "đã duyệt") {
            const stock = await this.Sach.updateOne(
                { _id: sachId, SoQuyen: { $gte: soLuong } },
                { $inc: { SoQuyen: -soLuong } }
            );
            if (!stock.matchedCount) throw new Error("Không đủ sách để duyệt");
            stockDeducted = true;
        }
        try {
            const result = await this.MuonSach.findOneAndUpdate(
                filter,
                { $set: updateData },
                { returnDocument: "after" }
            );
            if (!result) throw new Error("Phiếu mượn đã được xử lý");
            if (isReturning || isRejected) {
                await this.Sach.updateOne({ _id: sachId }, { $inc: { SoQuyen: soLuong } });
            }
            try {
                const Redis = require("../utils/redis.util");
                await Redis.del("admin:dashboard:stats");
                await Redis.clearMatch("user:sach:*");
            } catch (_) { }
            return result;
        } catch (error) {
            if (stockDeducted) {
                await this.Sach.updateOne({ _id: sachId }, { $inc: { SoQuyen: soLuong } });
            }
            throw error;
        }
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
            // Nếu phiếu bị xóa khi sách đang ở ngoài (chờ, đã duyệt, đang mượn)
            // thì phải trả sách về kho
            if (["đã duyệt", "đang mượn", "đang chờ trả"].includes(trangThai) && !await this.Sach.findOne({ _id: sachId })) {
                throw new Error("Không tìm thấy sách để hoàn kho");
            }
        }

        // B. Xóa phiếu mượn
        const result = await this.MuonSach.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
            ...(phieuMuon ? { trangThai: phieuMuon.trangThai } : {}),
        });
        if (result && ["đã duyệt", "đang mượn", "đang chờ trả"].includes(result.trangThai)) {
            await this.Sach.updateOne({ _id: result.sachId }, { $inc: { SoQuyen: result.soLuong || 1 } });
            try {
                const Redis = require("../utils/redis.util");
                await Redis.del("admin:dashboard:stats");
                await Redis.clearMatch("user:sach:*");
            } catch (_) { }
        }
        return result;
    }

    // 7. Update pending request (cho độc giả)
    async updatePendingRequest(id, docGiaId, soLuong) {
        const phieuMuonId = ObjectId.isValid(id) ? new ObjectId(id) : null;
        if (!phieuMuonId) throw new Error("ID Phiếu Mượn không hợp lệ");

        const record = await this.findById(phieuMuonId);
        if (!record || record.docGiaId.toString() !== docGiaId.toString()) {
            throw new Error("Không tìm thấy phiếu mượn");
        }
        if (record.trangThai !== "chờ duyệt") {
            throw new Error("Chỉ có thể sửa số lượng khi phiếu mượn đang chờ duyệt");
        }

        soLuong = parseInt(soLuong);
        if (isNaN(soLuong) || soLuong < 1 || soLuong > 10) {
            throw new Error("Số lượng phải từ 1 đến 10");
        }

        const sach = await this.Sach.findOne({ _id: record.sachId });
        if (!sach) throw new Error("Không tìm thấy sách");

        if (sach.SoQuyen < soLuong) {
            throw new Error(`Chỉ còn ${sach.SoQuyen} quyển, không thể mượn ${soLuong} quyển`);
        }

        const docGiaMuonSach = await this.MuonSach.find({
            docGiaId: record.docGiaId,
            trangThai: { $in: ["chờ duyệt", "đã duyệt", "đang mượn", "chờ gia hạn", "đang chờ trả", "quá hạn"] }
        }).toArray();

        const currentCount = docGiaMuonSach.reduce((sum, r) => sum + (r._id.toString() === id.toString() ? 0 : (r.soLuong || 1)), 0);
        if (currentCount + soLuong > 10) {
            throw new Error(`Bạn đã mượn/chờ duyệt ${currentCount} quyển. Không thể sửa thành ${soLuong} quyển vì sẽ vượt giới hạn 10`);
        }

        return await this.MuonSach.findOneAndUpdate(
            { _id: phieuMuonId },
            { $set: { soLuong, updatedAt: new Date().toISOString() } },
            { returnDocument: "after" }
        );
    }

    // 8. Delete pending request (cho độc giả)
    async deletePendingRequest(id, docGiaId) {
        const phieuMuonId = ObjectId.isValid(id) ? new ObjectId(id) : null;
        if (!phieuMuonId) throw new Error("ID Phiếu Mượn không hợp lệ");

        const record = await this.findById(phieuMuonId);
        if (!record || record.docGiaId.toString() !== docGiaId.toString()) {
            throw new Error("Không tìm thấy phiếu mượn");
        }
        if (record.trangThai !== "chờ duyệt") {
            throw new Error("Chỉ có thể xóa phiếu mượn khi đang chờ duyệt");
        }

        return await this.MuonSach.findOneAndDelete({ _id: phieuMuonId });
    }

    // 9. Yêu cầu gia hạn mượn sách (Dành cho Độc giả)
    async requestExtension(phieuMuonId, docGiaId, payload) {
        const id = ObjectId.isValid(phieuMuonId) ? new ObjectId(phieuMuonId) : null;
        if (!id) throw new Error("ID phiếu mượn không hợp lệ");

        await this._checkAndUpdateOverdue();

        const record = await this.MuonSach.findOne({ _id: id });
        if (!record) throw new Error("Không tìm thấy phiếu mượn");

        if (record.docGiaId.toString() !== docGiaId.toString()) {
            throw new Error("Bạn không có quyền gia hạn phiếu mượn này");
        }

        const docGia = await this.client.db().collection("DOCGIA").findOne({ _id: this._normalizeObjectId(docGiaId) });
        if (docGia && docGia.TrangThaiTaiKhoan === "BiKhoa") {
            const reason = docGia.LyDoKhoa ? `: ${docGia.LyDoKhoa}` : "";
            throw new Error(`Tài khoản của bạn đang bị khóa do${reason}. Không thể gửi yêu cầu gia hạn sách!`);
        }

        if (record.trangThai === "chờ gia hạn") {
            throw new Error("Phiếu mượn này đã có yêu cầu gia hạn đang chờ thủ thư duyệt!");
        }

        if (record.trangThai !== "đang mượn") {
            throw new Error(`Chỉ có thể gia hạn khi sách đang ở trạng thái "đang mượn" (hiện tại: ${record.trangThai})`);
        }

        if ((record.giaHanCount || 0) >= 2) {
            throw new Error("Phiếu mượn này đã đạt giới hạn gia hạn tối đa (2 lần)!");
        }

        // Quy tắc: Phải gia hạn trước 3 ngày kể từ ngày hết hạn trả (ngayTra)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const returnDate = new Date(record.ngayTra);
        returnDate.setHours(0, 0, 0, 0);

        const diffTime = returnDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 3) {
            throw new Error(`Yêu cầu gia hạn phải được thực hiện trước ngày hết hạn ít nhất 3 ngày (hiện tại còn ${diffDays > 0 ? diffDays : 0} ngày)!`);
        }

        const soNgayGiaHan = Number(payload.soNgayGiaHan) || 7;
        if (soNgayGiaHan <= 0 || soNgayGiaHan > 14) {
            throw new Error("Số ngày gia hạn không hợp lệ (từ 1 đến 14 ngày)");
        }

        const newReturnDate = new Date(record.ngayTra);
        newReturnDate.setDate(newReturnDate.getDate() + soNgayGiaHan);
        const ngayTraMoi = newReturnDate.toISOString().split('T')[0];

        const yeuCauGiaHan = {
            ngayYeuCau: new Date().toISOString(),
            soNgayGiaHan: soNgayGiaHan,
            ngayTraMoi: ngayTraMoi,
            lyDo: payload.lyDo || "Cần thêm thời gian đọc sách",
            trangThai: "chờ duyệt"
        };

        const result = await this.MuonSach.findOneAndUpdate(
            { _id: id, trangThai: "đang mượn" },
            {
                $set: {
                    trangThai: "chờ gia hạn",
                    yeuCauGiaHan: yeuCauGiaHan,
                    updatedAt: new Date().toISOString()
                }
            },
            { returnDocument: "after" }
        );

        if (!result) throw new Error("Không thể gửi yêu cầu gia hạn lúc này");
        return result;
    }

    // 10. Duyệt gia hạn sách (Dành cho Thủ thư / Admin)
    async approveExtension(phieuMuonId, staffId) {
        const id = ObjectId.isValid(phieuMuonId) ? new ObjectId(phieuMuonId) : null;
        if (!id) throw new Error("ID phiếu mượn không hợp lệ");

        const record = await this.MuonSach.findOne({ _id: id });
        if (!record) throw new Error("Không tìm thấy phiếu mượn");

        if (record.trangThai !== "chờ gia hạn" || !record.yeuCauGiaHan) {
            throw new Error("Phiếu mượn không có yêu cầu gia hạn chờ duyệt");
        }

        const ngayTraMoi = record.yeuCauGiaHan.ngayTraMoi;
        const result = await this.MuonSach.findOneAndUpdate(
            { _id: id, trangThai: "chờ gia hạn" },
            {
                $set: {
                    trangThai: "đang mượn",
                    ngayTra: ngayTraMoi,
                    giaHanCount: (record.giaHanCount || 0) + 1,
                    "yeuCauGiaHan.trangThai": "đã duyệt",
                    "yeuCauGiaHan.ngayDuyet": new Date().toISOString(),
                    "yeuCauGiaHan.nhanVienId": ObjectId.isValid(staffId) ? new ObjectId(staffId) : staffId,
                    updatedAt: new Date().toISOString()
                }
            },
            { returnDocument: "after" }
        );

        if (!result) throw new Error("Phiếu mượn đã được cập nhật trước đó");
        try {
            const Redis = require("../utils/redis.util");
            await Redis.del("admin:dashboard:stats");
        } catch (_) { }
        return result;
    }

    // 11. Từ chối gia hạn sách (Dành cho Thủ thư / Admin)
    async rejectExtension(phieuMuonId, staffId, reason) {
        const id = ObjectId.isValid(phieuMuonId) ? new ObjectId(phieuMuonId) : null;
        if (!id) throw new Error("ID phiếu mượn không hợp lệ");

        const record = await this.MuonSach.findOne({ _id: id });
        if (!record) throw new Error("Không tìm thấy phiếu mượn");

        if (record.trangThai !== "chờ gia hạn" || !record.yeuCauGiaHan) {
            throw new Error("Phiếu mượn không có yêu cầu gia hạn chờ duyệt");
        }

        const result = await this.MuonSach.findOneAndUpdate(
            { _id: id, trangThai: "chờ gia hạn" },
            {
                $set: {
                    trangThai: "đang mượn",
                    "yeuCauGiaHan.trangThai": "từ chối",
                    "yeuCauGiaHan.lyDoTuChoi": reason || "Thư viện không đồng ý gia hạn sách này",
                    "yeuCauGiaHan.ngayDuyet": new Date().toISOString(),
                    "yeuCauGiaHan.nhanVienId": ObjectId.isValid(staffId) ? new ObjectId(staffId) : staffId,
                    updatedAt: new Date().toISOString()
                }
            },
            { returnDocument: "after" }
        );

        if (!result) throw new Error("Phiếu mượn đã được cập nhật trước đó");
        try {
            const Redis = require("../utils/redis.util");
            await Redis.del("admin:dashboard:stats");
        } catch (_) { }
        return result;
    }
}

module.exports = MuonSachService;
