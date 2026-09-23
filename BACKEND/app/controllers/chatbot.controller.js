const ChatbotService = require("../services/chatbot.service");
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");

const chatbotService = new ChatbotService();


function _getHistoryCollection() {
    return MongoDB.client.db().collection("CHAT_HISTORY");
}


exports.sendMessage = async (req, res, next) => {
    if (!req.body?.message) {
        return next(new ApiError(400, "Tin nhắn không được để trống"));
    }

    try {
        const { message, docGiaId, conversationId } = req.body;
        const result = await chatbotService.processMessage(
            message,
            docGiaId || null,
            conversationId || null
        );
        return res.send(result);
    } catch (error) {
        console.error("Chatbot controller error:", error);
        return next(new ApiError(500, "Lỗi khi xử lý tin nhắn chatbot"));
    }
};


exports.getHistory = async (req, res, next) => {
    try {
        const { docGiaId } = req.params;
        if (!docGiaId) {
            return next(new ApiError(400, "Thiếu docGiaId"));
        }

        const col = _getHistoryCollection();
        const filter = { docGiaId: docGiaId };
        
        // Nếu có query conversationId thì lọc theo
        if (req.query.conversationId) {
            filter.conversationId = req.query.conversationId;
        }

        const messages = await col.find(filter)
            .sort({ timestamp: 1 }) // Cũ nhất trước
            .limit(100)
            .toArray();

        // Map field 'text' (CHAT_HISTORY) thành 'message' và 'content' cho frontend tương thích
        const data = messages.map(function(msg) {
            return {
                _id: msg._id,
                docGiaId: msg.docGiaId,
                role: msg.role,
                message: msg.text || msg.message,
                content: msg.text || msg.message,
                conversationId: msg.conversationId,
                timestamp: msg.timestamp
            };
        });

        // Trả về danh sách conversations (các hội thoại riêng biệt)
        return res.send({ success: true, data: data });
    } catch (error) {
        console.error("Get history error:", error);
        return next(new ApiError(500, "Lỗi khi lấy lịch sử chat"));
    }
};
