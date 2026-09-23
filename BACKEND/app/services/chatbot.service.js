const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");
const MongoDB = require("../utils/mongodb.util");
const SachService = require("./sach.service");
const MuonSachService = require("./muonsach.service");
const DocGiaService = require("./docgia.service");

const TRANG_THAI = {
    DANG_MUON: "đang mượn",
    DANG_CHO_TRA: "đang chờ trả",
    DA_DUYET: "đã duyệt",
    CHO_DUYET: "chờ duyệt",
    DA_TRA: "đã trả",
    TU_CHOI: "từ chối",
    TRE_HAN: "trễ hạn"
};

class ChatbotService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.apiKeyList = [];
        this.currentKeyIndex = 0;
        this.failedKeys = new Set();
        this._loadApiKeys();
        this._initGemini();
    }

    _getHistoryCollection() {
        return MongoDB.client.db().collection("CHAT_HISTORY");
    }

    _loadApiKeys() {
        const keys = config.gemini.apiKeys && config.gemini.apiKeys.length > 0
            ? config.gemini.apiKeys
            : (config.gemini.apiKey ? [config.gemini.apiKey] : []);
        this.apiKeyList = keys;
        this.currentKeyIndex = 0;
        this.failedKeys = new Set();
        if (keys.length > 0) {
            console.log("Loaded " + keys.length + " Gemini API key(s)");
        } else {
            console.warn("No Gemini API key configured.");
        }
    }

    _switchToNextKey() {
        if (this.failedKeys.size >= this.apiKeyList.length) {
            return false;
        }
        let attempts = 0;
        while (attempts < this.apiKeyList.length) {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeyList.length;
            if (!this.failedKeys.has(this.currentKeyIndex)) {
                this._initGemini(this.apiKeyList[this.currentKeyIndex]);
                return true;
            }
            attempts++;
        }
        return false;
    }

    _initGemini(apiKeyOverride) {   
        const apiKey = apiKeyOverride || this.apiKeyList[this.currentKeyIndex];
        if (!apiKey) {
            console.warn("No Gemini API key.");
            return;
        }
        try {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: "Ban la tro ly thu vien. NHIEM VU: Giup doc gia tra loi cau hoi ve thu vien.\n\nPHAM VI:\n1. Tra cuu sach (ten, tac gia, noi dung, the loai)\n2. Xem sach dang muon, tre han\n3. Lich su muon, sach yeu thich\n4. Tien phat\n5. Quy dinh thu vien\n\nQUY TAC BAT BUOC:\n- Khi doc gia hoi ve sach -> GOI NGAY tim_sach()\n- Neu tim_sach tra ve 0 -> GOI NGAY tim_sach_de_xuat()\n- Khi hoi noi dung/mo ta sach -> GOI xem_chi_tiet_sach(id)\n- Khi hoi sach dang muon -> GOI xem_sach_dang_muon()\n- Khi hoi sach tre han -> GOI xem_sach_tre_han()\n- Khi hoi lich su -> GOI xem_lich_su_muon()\n- Khi hoi tien phat -> GOI xem_tien_phat()\n- Khi hoi quy dinh -> GOI xem_quy_dinh_muon()\n- Khi hoi sach yeu thich -> GOI xem_sach_yeu_thich()\n\nKHONG duoc hoi lai ID doc gia. KHONG dung markdown. Tra loi tieng Viet tu nhien."
            });
            console.log("Gemini init OK, key index: " + this.currentKeyIndex);
        } catch (e) {
            console.error("Gemini init error: " + e.message);
        }
    }

    generateConversationId() {
        return "conv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
    }

    async _getConversationHistory(conversationId) {
        if (!conversationId) return null;
        try {
            const col = this._getHistoryCollection();
            const messages = await col.find({ conversationId: conversationId })
                .sort({ timestamp: 1 })
                .toArray();
            if (!messages || messages.length === 0) return null;
            return messages;
        } catch (e) {
            console.error("Get history error: " + e.message);
            return null;
        }
    }

    async _saveMessage(conversationId, docGiaId, role, text) {
        if (!conversationId) return;
        try {
            const col = this._getHistoryCollection();
            await col.insertOne({
                conversationId: conversationId,
                docGiaId: docGiaId || null,
                role: role,
                text: text,
                timestamp: new Date()
            });
        } catch (e) {
            console.error("Save msg error: " + e.message);
        }
    }

    _defineTools() {
        return {
            functionDeclarations: [
                {
                    name: "tim_sach",
                    description: "Tim sach theo ten hoac tac gia. Tra ve day du: ten, tac gia, so luong, gia, the loai, so trang, nam xuat ban, ngon ngu, mo ta.",
                    parameters: {
                        type: "object",
                        properties: {
                            tu_khoa: { type: "string", description: "Tu khoa can tim (ten sach, tac gia)" }
                        },
                        required: ["tu_khoa"]
                    }
                },
                {
                    name: "tim_sach_de_xuat",
                    description: "Khi tim_sach KHONG co ket qua, goi ham nay de tim gan dung hoac goi y sach tu the loai, tac gia.",
                    parameters: {
                        type: "object",
                        properties: {
                            tu_khoa: { type: "string", description: "Tu khoa nguoi dung da nhap" }
                        },
                        required: ["tu_khoa"]
                    }
                },
                {
                    name: "xem_chi_tiet_sach",
                    description: "Xem chi tiet day du cua mot cuon sach theo ID bao gom ca mo ta noi dung.",
                    parameters: {
                        type: "object",
                        properties: {
                            sachId: { type: "string", description: "ID cua sach (MongoDB ObjectId)" }
                        },
                        required: ["sachId"]
                    }
                },
                {
                    name: "xem_sach_dang_muon",
                    description: "Xem danh sach sach doc gia DANG muon.",
                    parameters: { type: "object", properties: {} }
                },
                {
                    name: "xem_sach_tre_han",
                    description: "Xem danh sach sach doc gia bi TRE HAN.",
                    parameters: { type: "object", properties: {} }
                },
                {
                    name: "xem_lich_su_muon",
                    description: "Xem TOAN BO lich su muon sach cua doc gia.",
                    parameters: { type: "object", properties: {} }
                },
                {
                    name: "xem_sach_yeu_thich",
                    description: "Xem danh sach sach yeu thich cua doc gia.",
                    parameters: { type: "object", properties: {} }
                },
                {
                    name: "xem_tien_phat",
                    description: "Xem tong tien phat hien tai cua doc gia.",
                    parameters: { type: "object", properties: {} }
                },
                {
                    name: "xem_quy_dinh_muon",
                    description: "Xem quy dinh muon sach cua thu vien.",
                    parameters: { type: "object", properties: {} }
                }
            ]
        };
    }

    async _executeFunction(functionCall, docGiaId) {
        const functionName = functionCall.name;
        const args = functionCall.args || {};
        console.log("Execute: " + functionName, JSON.stringify(args).substring(0, 200));

        switch (functionName) {
            case "tim_sach": {
                const sachService = new SachService(MongoDB.client);
                const keyword = args.tu_khoa || "";
                const books = await sachService.findByName(keyword);
                if (!books || books.length === 0) {
                    return JSON.stringify({ found: false, books: [], message: "Khong tim thay sach nao." });
                }
                return JSON.stringify({
                    found: true,
                    total: books.length,
                    books: books.map(function(b) {
                        return {
                            _id: b._id.toString(),
                            TENSACH: b.TENSACH,
                            TACGIA: b.TACGIA,
                            SOQUYEN: b.SOQUYEN,
                            DONGIA: b.DONGIA,
                            THELOAI: b.THELOAI,
                            MOTA: b.MOTA || "Khong co mo ta",
                            SOTRANG: b.SOTRANG || "Khong ro",
                            NAMXUATBAN: b.NAMXUATBAN || "Khong ro",
                            NGONNGU: b.NGONNGU || "Khong ro",
                            HinhAnh: b.HinhAnh || null
                        };
                    })
                });
            }

            case "tim_sach_de_xuat": {
                const sachService = new SachService(MongoDB.client);
                const keyword = args.tu_khoa || "";
                const characters = keyword.split("").filter(function(c) { return c.trim(); });
                const fuzzyRegex = characters.length > 0
                    ? characters.map(function(c) { return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join(".*")
                    : ".*";

                try {
                    const allBooks = await sachService.find({
                        $or: [
                            { TENSACH: { $regex: fuzzyRegex, $options: "i" } },
                            { TACGIA: { $regex: keyword, $options: "i" } },
                            { THELOAI: { $regex: keyword, $options: "i" } }
                        ]
                    });
                    if (!allBooks || allBooks.length === 0) {
                        const fallback = await sachService.find({});
                        const limited = fallback.slice(0, 5);
                        return JSON.stringify({
                            found: true,
                            isSuggestion: true,
                            message: "Khong tim thay sach voi tu khoa '" + keyword + "'. Mot so sach trong thu vien:",
                            books: limited.map(function(b) {
                                return {
                                    _id: b._id.toString(),
                                    TENSACH: b.TENSACH,
                                    TACGIA: b.TACGIA,
                                    SOQUYEN: b.SOQUYEN,
                                    THELOAI: b.THELOAI,
                                    MOTA: (b.MOTA || "").substring(0, 200)
                                };
                            })
                        });
                    }
                    const limited = allBooks.slice(0, 8);
                    return JSON.stringify({
                        found: true,
                        isSuggestion: true,
                        message: "Tim thay " + allBooks.length + " sach gan dung:",
                        books: limited.map(function(b) {
                            return {
                                _id: b._id.toString(),
                                TENSACH: b.TENSACH,
                                TACGIA: b.TACGIA,
                                SOQUYEN: b.SOQUYEN,
                                THELOAI: b.THELOAI,
                                MOTA: (b.MOTA || "").substring(0, 200)
                            };
                        })
                    });
                } catch (e) {
                    return JSON.stringify({ found: false, books: [], message: "Loi tim kiem: " + e.message });
                }
            }

            case "xem_chi_tiet_sach": {
                const sachService = new SachService(MongoDB.client);
                try {
                    const book = await sachService.findById(args.sachId);
                    if (!book) {
                        return JSON.stringify({ found: false, message: "Khong tim thay sach." });
                    }
                    return JSON.stringify({
                        found: true,
                        book: {
                            _id: book._id.toString(),
                            TENSACH: book.TENSACH,
                            TACGIA: book.TACGIA,
                            SOQUYEN: book.SOQUYEN,
                            DONGIA: book.DONGIA,
                            THELOAI: book.THELOAI,
                            MOTA: book.MOTA || "Sach khong co mo ta.",
                            SOTRANG: book.SOTRANG || "Khong ro",
                            NAMXUATBAN: book.NAMXUATBAN || "Khong ro",
                            NGONNGU: book.NGONNGU || "Khong ro",
                            HinhAnh: book.HinhAnh || null
                        }
                    });
                } catch (e) {
                    return JSON.stringify({ found: false, message: "Loi: " + e.message });
                }
            }

            case "xem_sach_dang_muon":
            case "xem_sach_tre_han": {
                if (!docGiaId) {
                    return JSON.stringify({ found: false, error: "Ban can dang nhap." });
                }
                const muonSachService = new MuonSachService(MongoDB.client);
                const records = await muonSachService.findByDocGia(docGiaId);
                const today = new Date();
                const activeStatuses = [TRANG_THAI.DANG_MUON, TRANG_THAI.DANG_CHO_TRA, TRANG_THAI.DA_DUYET, TRANG_THAI.CHO_DUYET];
                const activeRecords = records.filter(function(r) {
                    return activeStatuses.indexOf(r.trangThai) >= 0;
                });
                if (activeRecords.length === 0) {
                    if (functionName === "xem_sach_tre_han") {
                        return JSON.stringify({ found: false, books: [], message: "Khong co sach tre han." });
                    }
                    return JSON.stringify({ found: false, books: [], message: "Khong co sach dang muon." });
                }
                const processed = [];
                for (let i = 0; i < activeRecords.length; i++) {
                    const r = activeRecords[i];
                    let status = r.trangThai;
                    let daysOverdue = 0;
                    let daysLeft = 0;
                    if ((r.trangThai === TRANG_THAI.DANG_MUON || r.trangThai === TRANG_THAI.DANG_CHO_TRA) && r.ngayTra) {
                        const dueDate = new Date(r.ngayTra);
                        const diffTime = today.getTime() - dueDate.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays > 0) {
                            status = TRANG_THAI.TRE_HAN;
                            daysOverdue = diffDays;
                        } else {
                            daysLeft = Math.abs(diffDays);
                        }
                    }
                    let tenSach = r.TENSACH;
                    if (!tenSach || tenSach === "Dang tai..." || tenSach === "Đang tải...") {
                        try {
                            const sach = await new SachService(MongoDB.client).findById(r.sachId);
                            tenSach = sach ? sach.TENSACH : "Khong xac dinh";
                        } catch (e) {
                            tenSach = "Khong xac dinh";
                        }
                    }
                    processed.push({
                        _id: r._id.toString(),
                        TENSACH: tenSach,
                        ngayMuon: r.ngayMuon ? r.ngayMuon.split("T")[0] : "",
                        ngayTra: r.ngayTra ? r.ngayTra.split("T")[0] : "",
                        trangThai: status,
                        soLuong: r.soLuong || 1,
                        daysOverdue: daysOverdue,
                        daysLeft: daysLeft
                    });
                }
                if (functionName === "xem_sach_tre_han") {
                    const overdueOnly = processed.filter(function(r) { return r.daysOverdue > 0; });
                    if (overdueOnly.length === 0) {
                        return JSON.stringify({ found: false, books: [], message: "Khong co sach tre han." });
                    }
                    return JSON.stringify({ found: true, books: overdueOnly, total: overdueOnly.length });
                }
                return JSON.stringify({ found: true, books: processed, total: processed.length });
            }

            case "xem_lich_su_muon": {
                if (!docGiaId) {
                    return JSON.stringify({ found: false, error: "Ban can dang nhap." });
                }
                const muonSachService = new MuonSachService(MongoDB.client);
                const records = await muonSachService.findByDocGia(docGiaId);
                const finePerDay = config.quyDinhMuonSach.finePerDay;
                const today = new Date();
                const processed = [];
                for (let i = 0; i < records.length; i++) {
                    const r = records[i];
                    let tenSach = r.TENSACH;
                    if (!tenSach || tenSach === "Dang tai..." || tenSach === "Đang tải...") {
                        try {
                            const sach = await new SachService(MongoDB.client).findById(r.sachId);
                            tenSach = sach ? sach.TENSACH : "Khong xac dinh";
                        } catch (e) {
                            tenSach = "Khong xac dinh";
                        }
                    }
                    let fine = 0;
                    let daysOverdue = 0;
                    if (r.trangThai === TRANG_THAI.DANG_MUON || r.trangThai === TRANG_THAI.DANG_CHO_TRA) {
                        if (r.ngayTra) {
                            const dueDate = new Date(r.ngayTra);
                            daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysOverdue > 0) fine = daysOverdue * finePerDay;
                        }
                    }
                    if (r.trangThai === TRANG_THAI.DA_TRA && r.ngayTra && r.ngayTraThucTe) {
                        const dueDate = new Date(r.ngayTra);
                        const actualReturn = new Date(r.ngayTraThucTe);
                        daysOverdue = Math.ceil((actualReturn.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysOverdue > 0 && !r.daXacNhanNopPhat) fine = daysOverdue * finePerDay;
                    }
                    processed.push({
                        TENSACH: tenSach,
                        ngayMuon: r.ngayMuon ? r.ngayMuon.split("T")[0] : "",
                        ngayTra: r.ngayTra ? r.ngayTra.split("T")[0] : "",
                        ngayTraThucTe: r.ngayTraThucTe ? r.ngayTraThucTe.split("T")[0] : null,
                        trangThai: r.trangThai,
                        tienPhat: fine,
                        soNgayTre: daysOverdue,
                        daNopPhat: r.daXacNhanNopPhat || false
                    });
                }
                return JSON.stringify({ found: true, records: processed, total: processed.length });
            }

            case "xem_sach_yeu_thich": {
                if (!docGiaId) {
                    return JSON.stringify({ found: false, error: "Ban can dang nhap." });
                }
                const docGiaService = new DocGiaService(MongoDB.client);
                const favorites = await docGiaService.getFavorites(docGiaId);
                if (!favorites || favorites.length === 0) {
                    return JSON.stringify({ found: false, books: [], message: "Chua co sach yeu thich." });
                }
                const sachService = new SachService(MongoDB.client);
                const favBooks = [];
                for (let i = 0; i < favorites.length; i++) {
                    try {
                        const book = await sachService.findById(favorites[i]);
                        if (book) {
                            favBooks.push({
                                TENSACH: book.TENSACH,
                                TACGIA: book.TACGIA,
                                SOQUYEN: book.SOQUYEN,
                                THELOAI: book.THELOAI,
                                MOTA: book.MOTA ? book.MOTA.substring(0, 150) : ""
                            });
                        }
                    } catch (e) {}
                }
                return JSON.stringify({ found: true, books: favBooks, total: favBooks.length });
            }

            case "xem_tien_phat": {
                if (!docGiaId) {
                    return JSON.stringify({ found: false, error: "Ban can dang nhap." });
                }
                const muonSachService = new MuonSachService(MongoDB.client);
                const records = await muonSachService.findByDocGia(docGiaId);
                const finePerDay = config.quyDinhMuonSach.finePerDay;
                const finePerDayText = config.quyDinhMuonSach.finePerDayText;
                let totalFine = 0;
                const overdueDetails = [];
                const today = new Date();
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    if (record.trangThai === TRANG_THAI.DANG_MUON || record.trangThai === TRANG_THAI.DANG_CHO_TRA) {
                        if (record.ngayTra) {
                            const dueDate = new Date(record.ngayTra);
                            const days = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (days > 0) {
                                const fine = days * finePerDay;
                                totalFine += fine;
                                overdueDetails.push({ sach: record.TENSACH || "Dang tai...", soNgayTre: days, tienPhat: fine });
                            }
                        }
                    }
                    if (record.trangThai === TRANG_THAI.DA_TRA && record.ngayTra && record.ngayTraThucTe) {
                        const dueDate = new Date(record.ngayTra);
                        const returnDate = new Date(record.ngayTraThucTe);
                        const days = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                        if (days > 0 && !record.daXacNhanNopPhat) {
                            totalFine += days * finePerDay;
                            overdueDetails.push({ sach: record.TENSACH || "Dang tai...", soNgayTre: days, tienPhat: days * finePerDay });
                        }
                    }
                }
                return JSON.stringify({
                    totalFine: totalFine,
                    finePerDay: finePerDay,
                    finePerDayText: finePerDayText,
                    soSachTreHan: overdueDetails.length,
                    chiTiet: overdueDetails,
                    message: totalFine > 0 ? "Tong tien phat: " + totalFine.toLocaleString("vi-VN") + " VND" : "Ban khong co khoan phat nao."
                });
            }

            case "xem_quy_dinh_muon": {
                const rules = config.quyDinhMuonSach;
                return JSON.stringify({
                    quy_dinh_muon_sach: {
                        maxBooksPerTime: rules.maxBooksPerTime + " quyen/lan",
                        maxBooksTotal: rules.maxBooksTotal + " quyen cung luc",
                        maxDaysPerBorrow: rules.maxDaysPerBorrow + " ngay"
                    },
                    quy_dinh_phat: { finePerDay: rules.finePerDayText + "/ngay" },
                    huong_dan: { doi_mat_khau: "Vao Tai khoan > Doi mat khau", dang_ky: "Nhan Dang ky", tra_sach: "Vao Sach dang muon, gui yeu cau tra" }
                });
            }

            default:
                return JSON.stringify({ error: "Khong ho tro: " + functionName });
        }
    }

    async processMessage(message, docGiaId, conversationId) {
        if (!this.model) {
            return { reply: "Chatbot chua duoc cau hinh API Key.", conversationId: conversationId || null };
        }

        let convId = conversationId;
        let history = [];

        // Load existing conversation history from MongoDB
        if (convId) {
            const msgs = await this._getConversationHistory(convId);
            if (msgs) {
                history = msgs;
            } else {
                convId = null;
            }
        }

        // Create new conversation if needed
        if (!convId) {
            convId = this.generateConversationId();
        }

        try {
            const tools = this._defineTools();
            const geminiHistory = [];

            // Build Gemini history from MongoDB messages (limit to last 20 for token efficiency)
            const recentHistory = history.slice(-20);
            for (let i = 0; i < recentHistory.length; i++) {
                const h = recentHistory[i];
                geminiHistory.push({
                    role: h.role,
                    parts: [{ text: h.text }]
                });
            }

            // Add current user message
            geminiHistory.push({
                role: "user",
                parts: [{ text: message }]
            });

            // Save user message to MongoDB
            await this._saveMessage(convId, docGiaId, "user", message);

            let finalText = "";
            let loopCount = 0;
            const maxLoops = 5;

            while (loopCount < maxLoops) {
                let result;
                try {
                    result = await this.model.generateContent({
                        contents: geminiHistory,
                        tools: [tools],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
                    });
                } catch (apiError) {
                    const isQuota = apiError.status === 429 || apiError.status === 403 ||
                        (apiError.message && (apiError.message.indexOf("429") >= 0 || apiError.message.indexOf("403") >= 0 || apiError.message.indexOf("API_KEY") >= 0));
                    if (isQuota) {
                        this.failedKeys.add(this.currentKeyIndex);
                        if (this._switchToNextKey()) {
                            loopCount++;
                            continue;
                        }
                        return { reply: "Chatbot tam thoi khong phan hoi duoc.", conversationId: convId };
                    }
                    throw apiError;
                }

                const candidate = result.response.candidates ? result.response.candidates[0] : null;
                if (!candidate) break;

                const parts = candidate.content ? candidate.content.parts || [] : [];
                let hasFunctionCall = false;

                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];
                    if (part.functionCall) {
                        hasFunctionCall = true;
                        console.log("Gemini called: " + part.functionCall.name);
                        const functionResult = await this._executeFunction(part.functionCall, docGiaId);

                        geminiHistory.push({
                            role: "model",
                            parts: [{ functionCall: part.functionCall }]
                        });
                        geminiHistory.push({
                            role: "user",
                            parts: [{
                                functionResponse: {
                                    name: part.functionCall.name,
                                    response: { result: functionResult }
                                }
                            }]
                        });
                    }
                    if (part.text) {
                        finalText = part.text;
                    }
                }

                if (!hasFunctionCall) break;
                loopCount++;
            }

            if (!finalText) {
                try {
                    const finalResult = await this.model.generateContent({
                        contents: geminiHistory,
                        tools: [tools],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
                    });
                    finalText = finalResult.response.text();
                } catch (e) {
                    finalText = "";
                }
                finalText = finalText || "Xin loi, chua xu ly duoc.";
            }

            // Save model response to MongoDB
            await this._saveMessage(convId, docGiaId, "model", finalText);

            return { reply: finalText, conversationId: convId };
        } catch (error) {
            console.error("Chatbot error:", error.message || error);
            let errorMsg = "Da co loi xay ra. Vui long thu lai sau.";
            if (error.status === 429) errorMsg = "Ban da gui qua nhieu cau hoi.";
            else if (error.status === 403) errorMsg = "Chatbot chua duoc cau hinh.";
            return { reply: errorMsg, conversationId: convId };
        }
    }
}

module.exports = ChatbotService;
