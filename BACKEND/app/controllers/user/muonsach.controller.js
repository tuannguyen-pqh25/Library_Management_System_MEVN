const MuonSachService = require("../../services/muonsach.service");
const MongoDB = require("../../utils/mongodb.util");
const ApiError = require("../../api-error");
const Redis = require("../../utils/redis.util");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
    if (!req.body?.sachId) {
        return next(new ApiError(400, "Thiếu mã sách để mượn"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const payload = {
            ...req.body,
            docGiaId: req.user?._id,
            ngayMuon: req.body.ngayMuon || new Date().toISOString(),
            ngayTra: req.body.ngayTra || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            soLuong: Number(req.body.soLuong || 1),
        };

        const document = await muonSachService.create(payload);

        await Redis.del("admin:dashboard:stats");
        await Redis.clearMatch("user:sach:*");

        return res.status(201).json({
            message: "Yêu cầu mượn sách đã được gửi",
            data: document,
        });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể tạo yêu cầu mượn sách"));
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const records = await muonSachService.findByDocGia(req.user?._id);

        return res.status(200).json(records);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy lịch sử mượn sách"));
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const docGiaId = req.user?._id;
        if (!docGiaId) {
            return res.status(200).json([]);
        }

        const muonSachService = new MuonSachService(MongoDB.client);
        const db = MongoDB.client.db();
        const docGia = await db.collection("DOCGIA").findOne({
            _id: ObjectId.isValid(docGiaId) ? new ObjectId(docGiaId) : docGiaId
        });

        // Lấy danh sách phiếu mượn (đã tự động cập nhật quá hạn)
        const records = await muonSachService.findByDocGia(docGiaId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const notifications = [];

        // A. Thông báo tài khoản bị khóa (Ưu tiên cao nhất)
        if (docGia && docGia.TrangThaiTaiKhoan === "BiKhoa") {
            notifications.push({
                _id: `lock_${docGia._id}`,
                notifId: `account_locked_${docGia._id}`,
                alertType: "account_locked",
                title: "Tài khoản của bạn đang bị khóa!",
                message: docGia.LyDoKhoa
                    ? `Tài khoản độc giả đã bị khóa do: ${docGia.LyDoKhoa}. Vui lòng liên hệ ban quản lý thư viện để giải quyết.`
                    : "Tài khoản độc giả đã bị khóa do vi phạm quy định (trễ hạn mượn sách hoặc theo quyết định của thủ thư). Vui lòng liên hệ thư viện để được giải quyết.",
                time: docGia.updatedAt || new Date().toISOString(),
                isUrgent: true,
            });
        }

        // B. Thông báo từ các phiếu mượn & thống kê phạt
        let maxSoNgayTre = 0;
        let tongTienPhat = 0;

        records.forEach((item) => {
            const dueDateStr = item.ngayTra || item.ngayHenTra;
            let daysLeft = null;
            let soNgayTre = 0;
            if (dueDateStr) {
                const due = new Date(dueDateStr);
                if (!isNaN(due.getTime())) {
                    due.setHours(0, 0, 0, 0);
                    daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) {
                        soNgayTre = Math.abs(daysLeft);
                    }
                }
            }

            const notifTime = item.updatedAt || item.createdAt || item.ngayMuon || "";
            const soLuong = item.soLuong || 1;
            if (item.trangThai === "quá hạn" && soNgayTre <= 0) {
                soNgayTre = 1;
            }
            const tienPhat = soNgayTre * 5000 * soLuong;

            const isOverdue = item.trangThai === "quá hạn" || item.daTungQuaHan || (daysLeft !== null && daysLeft < 0 && ["đang mượn", "đang chờ trả", "chờ gia hạn"].includes(item.trangThai));
            if (isOverdue && !["đã trả", "từ chối"].includes(item.trangThai)) {
                tongTienPhat += tienPhat;
                if (soNgayTre > maxSoNgayTre) maxSoNgayTre = soNgayTre;
            }

            // 1. THỦ THƯ ĐÃ DUYỆT YÊU CẦU MƯỢN SÁCH
            if (item.trangThai === "đã duyệt") {
                notifications.push({
                    ...item,
                    notifId: `${item._id}_approved`,
                    daysLeft,
                    alertType: "approved",
                    title: "Yêu cầu mượn đã được duyệt",
                    message: `Thủ thư đã duyệt yêu cầu mượn ${soLuong} quyển sách "${item.TenSach || 'Sách mượn'}". Vui lòng đến thư viện nhận sách!`,
                    time: notifTime,
                });
            }

            // 1.5. YÊU CẦU GIA HẠN ĐƯỢC DUYỆT HOẶC TỪ CHỐI
            if (item.yeuCauGiaHan && item.yeuCauGiaHan.trangThai === "đã duyệt") {
                const approvedTime = item.yeuCauGiaHan.ngayDuyet || notifTime;
                notifications.push({
                    ...item,
                    notifId: `${item._id}_ext_approved_${item.giaHanCount || item.yeuCauGiaHan.soNgayGiaHan || 1}`,
                    daysLeft,
                    alertType: "extension_approved",
                    title: "Gia hạn sách thành công",
                    message: `Thủ thư đã duyệt gia hạn sách "${item.TenSach || 'Sách mượn'}" thêm ${item.yeuCauGiaHan.soNgayGiaHan || 7} ngày. Hạn trả mới: ${item.ngayTra ? new Date(item.ngayTra).toLocaleDateString('vi-VN') : '—'}.`,
                    time: approvedTime,
                });
            } else if (item.yeuCauGiaHan && item.yeuCauGiaHan.trangThai === "từ chối") {
                const rejectedTime = item.yeuCauGiaHan.ngayDuyet || notifTime;
                notifications.push({
                    ...item,
                    notifId: `${item._id}_ext_rejected_${item.giaHanCount || 1}`,
                    daysLeft,
                    alertType: "extension_rejected",
                    title: "Yêu cầu gia hạn bị từ chối",
                    message: `Yêu cầu gia hạn sách "${item.TenSach || 'Sách mượn'}" không được duyệt: ${item.yeuCauGiaHan.lyDoTuChoi || 'Quy định thư viện'}. Hạn trả vẫn là ${item.ngayTra ? new Date(item.ngayTra).toLocaleDateString('vi-VN') : '—'}.`,
                    time: rejectedTime,
                });
            }

            // 2. YÊU CẦU BỊ TỪ CHỐI
            if (item.trangThai === "từ chối") {
                notifications.push({
                    ...item,
                    notifId: `${item._id}_rejected`,
                    daysLeft,
                    alertType: "rejected",
                    title: "Yêu cầu mượn bị từ chối",
                    message: item.lyDoTuChoi ? `Lý do: ${item.lyDoTuChoi}` : `Yêu cầu mượn sách "${item.TenSach || 'Sách mượn'}" không được duyệt.`,
                    time: notifTime,
                });
            }
            // 3. SÁCH QUÁ HẠN (KÈM GIÁ TIỀN PHẠT TÍNH TRỰC TIẾP)
            else if (isOverdue) {
                notifications.push({
                    ...item,
                    notifId: `${item._id}_overdue_${dueDateStr || ''}`,
                    daysLeft,
                    soNgayTre,
                    tienPhat,
                    alertType: "overdue",
                    title: "Sách quá hạn trả!",
                    message: `Đã quá hạn ${soNgayTre} ngày (${soLuong} quyển). Phí phạt trễ hạn tạm tính: ${tienPhat.toLocaleString('vi-VN')} VNĐ (5.000đ/ngày/quyển). Vui lòng trả sách sớm!`,
                    time: notifTime,
                });
            }
            // 4. SÁCH SẮP ĐẾN HẠN TRẢ (trong vòng 2 ngày)
            else if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 2 && ["đang mượn", "đang chờ trả", "chờ gia hạn"].includes(item.trangThai)) {
                notifications.push({
                    ...item,
                    notifId: `${item._id}_soon_${dueDateStr || ''}`,
                    daysLeft,
                    alertType: "soon",
                    title: "Sắp đến hạn trả sách",
                    message: daysLeft === 0 ? `Hôm nay là hạn trả sách "${item.TenSach || 'Sách mượn'}"!` : `Còn ${daysLeft} ngày nữa đến hạn trả sách "${item.TenSach || 'Sách mượn'}".`,
                    time: notifTime,
                });
            }
        });

        // C. CẢNH BÁO TRƯỚC KHI KHÓA TÀI KHOẢN (Khi chưa bị khóa nhưng trễ hạn hoặc tiền phạt tăng cao)
        if (docGia && docGia.TrangThaiTaiKhoan !== "BiKhoa" && (maxSoNgayTre > 0 || tongTienPhat > 0)) {
            // C.1. Cảnh báo trước khi khóa 1 ngày (quyển đầu tiên trễ hạn 6-7 ngày, sắp cán mốc > 7 ngày)
            if (maxSoNgayTre >= 6) {
                notifications.push({
                    _id: `lock_warn_urgent_${docGia._id}`,
                    notifId: `lock_warn_urgent_${docGia._id}_${maxSoNgayTre}`,
                    alertType: "lock_warning_urgent",
                    title: "CẢNH BÁO KHẨN CẤP: Tài khoản sắp bị khóa sau 1 ngày!",
                    message: `Quyển sách đầu tiên của bạn đã trễ hạn ${maxSoNgayTre} ngày. Theo quy chế thư viện, tài khoản sẽ tự động bị KHÓA sau 24h nữa (khi thời gian trễ tính từ quyển đầu tiên vượt quá 7 ngày). Hãy mang sách đến trả ngay!`,
                    time: new Date().toISOString(),
                    isUrgent: true,
                });
            }
            // C.2. Cảnh báo trước khi khóa khoảng 3 ngày (quyển đầu tiên trễ hạn 4-5 ngày)
            else if (maxSoNgayTre >= 4) {
                notifications.push({
                    _id: `lock_warn_3d_${docGia._id}`,
                    notifId: `lock_warn_3d_${docGia._id}_${maxSoNgayTre}`,
                    alertType: "lock_warning",
                    title: "Cảnh báo: Nguy cơ bị khóa tài khoản sau 3 ngày",
                    message: `Quyển sách đầu tiên của bạn đã trễ hạn ${maxSoNgayTre} ngày. Tài khoản sẽ tự động bị KHÓA khi thời gian trễ của quyển đầu tiên vượt quá 7 ngày (1 tuần). Vui lòng sắp xếp trả sách sớm!`,
                    time: new Date().toISOString(),
                    isUrgent: true,
                });
            }

            // C.3. Cảnh báo theo mốc tổng tiền phạt đạt 75.000 VNĐ
            if (tongTienPhat >= 75000 && tongTienPhat < 100000) {
                notifications.push({
                    _id: `fine_warn_75k_${docGia._id}`,
                    notifId: `fine_warn_75k_${docGia._id}`,
                    alertType: "fine_warning_75k",
                    title: "CẢNH BÁO TIỀN PHẠT: Tổng tiền phạt đã đạt 75.000 VNĐ",
                    message: `Tổng tiền phạt trễ hạn tích lũy của tất cả các sách bạn đang mượn đã đạt ${tongTienPhat.toLocaleString('vi-VN')} VNĐ. Tài khoản sẽ tự động bị KHÓA NGAY khi tổng tiền phạt đạt 100.000 VNĐ. Hãy đến trả sách ngay!`,
                    time: new Date().toISOString(),
                    isUrgent: true,
                });
            }
            // C.4. Cảnh báo theo mốc tổng tiền phạt đạt 50.000 VNĐ
            else if (tongTienPhat >= 50000 && tongTienPhat < 75000) {
                notifications.push({
                    _id: `fine_warn_50k_${docGia._id}`,
                    notifId: `fine_warn_50k_${docGia._id}`,
                    alertType: "fine_warning_50k",
                    title: "Nhắc nhở tiền phạt: Tổng tiền phạt đạt 50.000 VNĐ",
                    message: `Tổng tiền phạt trễ hạn của tất cả các sách bạn đang mượn là ${tongTienPhat.toLocaleString('vi-VN')} VNĐ (mức khóa tài khoản tự động là 100.000 VNĐ). Vui lòng trả sách sớm để tránh phát sinh thêm phí!`,
                    time: new Date().toISOString(),
                    isUrgent: false,
                });
            }
        }

        // Sắp xếp ưu tiên: Tài khoản bị khóa (0) -> Cảnh báo khẩn cấp (1) -> Tiền phạt 75k (2) -> Cảnh báo khóa 3d (3) -> Tiền phạt 50k (4) -> Quá hạn (5) -> Đã duyệt (6) -> Sắp hết hạn (7) -> Từ chối (8)
        const priority = {
            account_locked: 0,
            lock_warning_urgent: 1,
            fine_warning_75k: 2,
            lock_warning: 3,
            fine_warning_50k: 4,
            overdue: 5,
            approved: 6,
            extension_approved: 6,
            soon: 7,
            rejected: 8,
            extension_rejected: 8
        };
        notifications.sort((a, b) => {
            const pDiff = (priority[a.alertType] ?? 99) - (priority[b.alertType] ?? 99);
            if (pDiff !== 0) return pDiff;
            return new Date(b.time || 0) - new Date(a.time || 0);
        });

        return res.status(200).json(notifications);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông báo: ${error.message}`));
    }
};

exports.requestReturn = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);

        // Kiểm tra xem phiếu mượn có tồn tại và thuộc về user này không
        const record = await muonSachService.findById(req.params.id);
        if (!record || record.docGiaId.toString() !== req.user._id.toString()) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
        }

        if (!["đã duyệt", "đang mượn", "quá hạn"].includes(record.trangThai)) {
            return next(new ApiError(400, "Không thể xin trả sách lúc này"));
        }

        const todayDateStr = new Date().toLocaleDateString('en-CA');
        const returnDateStr = record.ngayTra ? new Date(record.ngayTra).toLocaleDateString('en-CA') : null;
        const isPastDue = record.trangThai === "quá hạn" || (returnDateStr && returnDateStr < todayDateStr) || Boolean(record.daTungQuaHan);

        const payload = {
            trangThai: "đang chờ trả",
            ngayDuKienTra: req.body.ngayDuKienTra || new Date().toISOString(),
            daTungQuaHan: isPastDue,
        };

        const result = await muonSachService.update(req.params.id, payload);
        await Redis.del("admin:dashboard:stats");
        return res.status(200).json({ message: "Đã gửi yêu cầu xin trả sách", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể yêu cầu trả sách"));
    }
};

exports.updatePending = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const soLuong = req.body.soLuong;
        if (!soLuong) return next(new ApiError(400, "Vui lòng cung cấp số lượng"));

        const result = await muonSachService.updatePendingRequest(req.params.id, req.user._id, soLuong);
        await Redis.del("admin:dashboard:stats");
        return res.status(200).json({ message: "Đã cập nhật số lượng", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể cập nhật phiếu mượn"));
    }
};

exports.deletePending = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const result = await muonSachService.deletePendingRequest(req.params.id, req.user._id);
        await Redis.del("admin:dashboard:stats");
        await Redis.clearMatch("user:sach:*");
        return res.status(200).json({ message: "Đã hủy yêu cầu mượn sách", data: result });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể hủy phiếu mượn"));
    }
};

exports.requestExtension = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const result = await muonSachService.requestExtension(req.params.id, req.user._id, req.body);
        await Redis.del("admin:dashboard:stats");
        return res.status(200).json({
            message: "Yêu cầu gia hạn sách đã được gửi tới thủ thư để xét duyệt",
            data: result
        });
    } catch (error) {
        return next(new ApiError(400, error.message || "Không thể yêu cầu gia hạn sách"));
    }
};
