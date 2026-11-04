# AGENTS.md - Quy Chuẩn Phát Triển Hệ Thống CT449 (MEVN Stack)

> Áp dụng cho: **Codex (OpenAI / Copilot)**, **Gemini (Antigravity)**, **Claude (Claude Code / Anthropic)**.
> File này đóng vai trò là **Single Source of Truth** cho tất cả các AI coding agents khi tham gia vào dự án.

---

## 1. TỔNG QUAN HỆ THỐNG & TECH STACK

Dự án **Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến** được kiến trúc theo mô hình phân tách độc lập:

* **Backend (`/BACKEND`, Port 3000):**
  * **Runtime / Framework:** Node.js v20+, Express.js 5.x.
  * **Database:** **MongoDB Native Driver v6.x (TUYỆT ĐỐI KHÔNG DÙNG MONGOOSE ODM)**. Kết nối qua `app/utils/mongodb.util.js`.
  * **Cache:** **Redis v6.x** (`app/utils/redis.util.js`). Caching dữ liệu đọc, tự động xóa cache khi ghi dữ liệu.
  * **AI:** Google Generative AI (`@google/generative-ai`) phục vụ gợi ý sách thông minh.
  * **Auth & Security:** JWT (Access/Refresh), Passport Google OAuth 2.0, RBAC (`/api/admin/*` vs `/api/user/*`).
  * **Indexes:** 17 compound/clustered indexes quản lý tại `app/utils/indexes.util.js` & `createIndexes.js`.
* **Frontend (`/frontend` - Dual SPAs):**
  * `user-web` (Port 5173 / Prod 80): Cổng độc giả tra cứu, mượn sách, voice search, OAuth.
  * `admin-web` (Port 5174 / Prod 8080): Cổng quản trị nhân viên/thủ thư, quản lý kho, duyệt mượn trả, phân quyền RBAC.
  * **Công nghệ UI:** Vue 3 (Composition API `<script setup>`), Vite, Pinia, Bootstrap 5.3, Vee-Validate + Yup.
* **Testing (`/tests`):**
  * Bộ test tự động 44 kịch bản tích hợp: `node tests/run-api-tests.js` hoặc file `tests/run-tests.bat`.

---

## 2. NGUYÊN TẮC CỐT LÕI (KARPATHY CODING GUIDELINES)

Các agent phải tuân thủ nghiêm ngặt 4 nguyên tắc sau trước khi viết bất kỳ dòng mã nào:

### ① Think Before Coding (Tư duy trước khi viết mã)
* Không ngầm đoán yêu cầu. Nêu rõ giả định trước khi làm.
* Nếu có nhiều phương án giải quyết, trình bày ưu/nhược điểm thay vì âm thầm chọn phương án phức tạp.
* Nếu điều gì chưa rõ trong codebase, hãy dừng lại và đặt câu hỏi.

### ② Simplicity First (Đơn giản là ưu tiên số một)
* Viết lượng code tối thiểu giải quyết triệt để vấn đề. Không suy diễn tính năng tương lai.
* Không tạo abstraction, helper, class dư thừa cho code chỉ dùng một lần.
* Không thêm cơ chế config hoặc xử lý lỗi cho các trường hợp không thể xảy ra.

### ③ Surgical Changes (Phẫu thuật chính xác)
* Chỉ chạm vào những dòng code thực sự cần thay đổi.
* Không tự ý format lại, refactor, hoặc "dọn dẹp" code/comment lân cận ngoài phạm vi task.
* Giữ đúng phong cách code hiện tại của file (indentation, naming convention).
* Khi xóa code, dọn dẹp các biến/import do chính mình làm thừa; không xóa dead code có từ trước trừ khi được yêu cầu.

### ④ Goal-Driven Execution (Hành động hướng mục tiêu)
* Biến mọi nhiệm vụ thành mục tiêu có thể kiểm chứng (Verifiable Goal).
* Quy trình: **Phân tích -> Đề ra bước thực hiện -> Thực hiện phẫu thuật -> Kiểm thử xác minh (Verify)**.
* Mọi thay đổi logic backend đều phải chạy lại bộ `tests/run-api-tests.js` để xác nhận không gây regression.

---

## 3. CÁC QUY TẮC BẮT BUỘC RIÊNG CHO CODEBASE CT449

1. **QUY TẮC MONGODB:**
   * CẤM cài đặt hoặc import `mongoose`. Toàn bộ truy vấn viết bằng MongoDB Native Driver:
     ```javascript
     const db = MongoDB.client.db();
     await db.collection("Sach").findOne({ _id: new ObjectId(id) });
     ```
   * Khi cập nhật tồn kho/hạn mức, LUÔN dùng toán tử nguyên tử (Atomic Operations) như `$inc`, `$set` hoặc session transaction để chống Race Condition/Overbooking.

2. **QUY TẮC REDIS CACHE:**
   * Khi tạo/sửa/xóa sách, danh mục hoặc trạng thái mượn trả: Bắt buộc gọi hàm xóa/làm mới cache tương ứng (ví dụ: `Redis.delByPattern("sach:*")`).
   * Luôn bọc thao tác Redis trong `try...catch` để hệ thống vẫn hoạt động (fallback về MongoDB) nếu Redis tạm thời mất kết nối.

3. **QUY TẮC FRONTEND (VUE 3):**
   * Sử dụng Composition API với `<script setup>`.
   * Sử dụng Bootstrap 5.3 sẵn có. Không tự ý thêm TailwindCSS hoặc UI framework khác.
   * Quản lý state tập trung bằng Pinia store. Xử lý form và validate bằng Vee-Validate và Yup.
   * Đảm bảo tính độc lập: API call từ `user-web` chỉ gọi đến `/api/user/*`, từ `admin-web` chỉ gọi đến `/api/admin/*`.

---

## 4. QUY TRÌNH KIỂM THỬ XÁC MINH (VERIFICATION)

Trước khi xác nhận hoàn thành một task liên quan tới backend:
1. Khởi động server (nếu chưa chạy): `npm start` trong thư mục `BACKEND`.
2. Chạy test suite:
   ```bash
   node tests/run-api-tests.js
   ```
3. Đảm bảo toàn bộ **44/44 Test Case PASS (100%)**. Nếu có case FAIL, phân tích log lỗi, sửa đúng điểm lỗi và chạy lại kiểm thử.

---

## 5. QUY CHUẨN VĂN PHONG HỌC THUẬT & TÀI LIỆU HÓA (`Cores/BaoCao.txt`)

Khi soạn thảo, giải thích, cập nhật hoặc hiệu đính tài liệu học thuật (đặc biệt là tệp `Cores/BaoCao.txt`):
* **Giọng văn chuẩn mực (Q1 Paper / Luận văn Thạc sĩ):** Khách quan, trung tính, sử dụng ngôn ngữ khoa học hình thức, mạch lạc, lập luận dựa trên bằng chứng và số liệu thực nghiệm.
* **Tuyệt đối không tự khen ngợi hay tâng bốc hệ thống (Zero Self-Praise):**
  * ❌ CẤM các tính từ cảm tính/tiếp thị: "vô cùng mạnh mẽ", "tuyệt vời", "đỉnh cao", "hoàn hảo", "vô vàn khó khăn", "bảo vệ tuyệt đối".
  * ✅ THAY THẾ bằng cơ chế kỹ thuật và định lượng: "sử dụng thao tác nguyên tử (atomic decrement) để giải quyết race condition", "độ trễ phản hồi 1.2ms - 2.5ms qua bộ đệm Redis", "đạt tỷ lệ 44/44 kịch bản kiểm thử (100%)".
* **Minh bạch về giới hạn:** Luôn thừa nhận khách quan các điểm đánh đổi (trade-offs) và hạn chế kỹ thuật hiện tại của hệ thống.

---

## 6. QUY TRÌNH VÒNG ĐỜI PHIÊN LÀM VIỆC (SESSION LIFECYCLE & `prompt.md`)

Mọi Agent (Codex, Gemini, Claude) phải tuân thủ nghiêm ngặt quy trình 2 đầu:

1. **Khi bắt đầu mỗi phiên làm việc mới:**
   * Bắt buộc đọc `Cores/checkpoint.md` và `Cores/next_step_guide.md` để nắm chắc trạng thái mới nhất, các lỗi đã từng gặp, và rào cản kỹ thuật trước khi làm việc.
2. **Sau khi hoàn thành một chức năng / module / bug fix:**
   * Tự động kích hoạt quy chuẩn tại `Cores/prompt.md`:
     - Cập nhật `Cores/checkpoint.md` (chỉ sửa/bổ sung, KHÔNG xóa/tạo mới, đính kèm Git commit message chuẩn).
     - Cập nhật `Cores/next_step_guide.md` (cập nhật prompt cho phiên kế tiếp).
     - Cập nhật `Cores/BaoCao.txt` (văn phong học thuật Q1, đầy đủ, khách quan, không tự khen).
     - Cập nhật `Cores/Chienluoc.md` (nếu có thay đổi DB/kiến trúc).
     - Cập nhật `README.md` (song ngữ EN/VI, làm nổi bật điểm sáng kỹ thuật phục vụ CV).



