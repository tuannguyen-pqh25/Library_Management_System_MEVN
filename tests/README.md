# BỘ KỊCH BẢN KIỂM THỬ TOÀN DIỆN HỆ THỐNG QUẢN LÝ MƯỢN SÁCH (CT449)

> **Dự án:** Website Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến  
> **Học phần:** CT449 - Phát triển ứng dụng Web (Đại học Cần Thơ)  
> **Kiến trúc:** MEVN Stack (MongoDB Native, Express.js, Vue 3 Composition API, Node.js, Redis, Gemini AI)  
> **Phiên bản:** Hoàn thiện 100% (Sẵn sàng Kiểm thử & Bảo vệ đồ án)

---

## 📂 Danh Mục Tài Liệu & Công Cụ Trong Thư Mục `tests/`

Thư mục này chứa toàn bộ tài liệu đặc tả kịch bản kiểm thử, ma trận phân quyền, công cụ kiểm thử tự động và bộ test collection chuyên nghiệp:

| Tên Tệp / Thư mục | Định dạng | Mô Tả Chức Năng |
| :--- | :---: | :--- |
| [README.md](file:///d:/Project/CT449/Project/tests/README.md) | Markdown | Tài liệu hướng dẫn tổng quan và hướng dẫn sử dụng bộ kiểm thử |
| [01_KICH_BAN_KIEM_THU_TONG_THE.md](file:///d:/Project/CT449/Project/tests/01_KICH_BAN_KIEM_THU_TONG_THE.md) | Markdown | Danh mục tổng thể 60+ Test Cases chuẩn hóa (Mã TC, Điều kiện, Bước thực hiện, Kết quả mong đợi, Mức ưu tiên) |
| [02_KICH_BAN_USER_WEB.md](file:///d:/Project/CT449/Project/tests/02_KICH_BAN_USER_WEB.md) | Markdown | Kịch bản kiểm thử chi tiết phía Độc giả (User Web - 9 Modules, Luồng Đăng ký/Đăng nhập, Mượn sách, Giới hạn 10 cuốn, Chuông thông báo, Gia hạn, Voice Search, Profile) |
| [03_KICH_BAN_ADMIN_WEB.md](file:///d:/Project/CT449/Project/tests/03_KICH_BAN_ADMIN_WEB.md) | Markdown | Kịch bản kiểm thử chi tiết phía Quản trị (Admin Web - 10 Modules, RBAC 3 cấp, CRUD Sách/NXB, Quản lý Nhân viên, Khóa tài khoản Độc giả, Duyệt mượn/trả, Chống Overbooking) |
| [04_MA_TRAN_PHAN_QUYEN_RBAC.md](file:///d:/Project/CT449/Project/tests/04_MA_TRAN_PHAN_QUYEN_RBAC.md) | Markdown | Bảng ma trận phân quyền chi tiết (RBAC Testing Matrix: 5 vai trò trên toàn bộ Router Frontend & API Endpoints Backend) |
| [05_KIEM_THU_NANG_CAO_REDIS_AI.md](file:///d:/Project/CT449/Project/tests/05_KIEM_THU_NANG_CAO_REDIS_AI.md) | Markdown | Kịch bản kiểm thử chuyên sâu tính năng cao cấp: Redis Cache Hit 1-2ms, Invalidation, Voice Search Web Speech API & Google OAuth |
| [06_CHECKLIST_KIEM_THU_5PHUT_BAO_VE.md](file:///d:/Project/CT449/Project/tests/06_CHECKLIST_KIEM_THU_5PHUT_BAO_VE.md) | Markdown | Bảng checklist 10 bước kiểm thử nhanh 5 phút vàng trước khi bước vào phòng bảo vệ đồ án |
| [run-api-tests.js](file:///d:/Project/CT449/Project/tests/run-api-tests.js) | JavaScript | Script Node.js tự động chạy 35+ bài kiểm thử API tích hợp liên hoàn (Automated API Test Suite) |
| [run-tests.bat](file:///d:/Project/CT449/Project/tests/run-tests.bat) | Batch Script | File thực thi 1-Click trên Windows để chạy tự động toàn bộ API tests và hiển thị báo cáo |
| [postman_collection.json](file:///d:/Project/CT449/Project/tests/postman_collection.json) | JSON | Bộ sưu tập Postman v2.1 với đầy đủ 40+ endpoints, kèm Pre-request scripts và Tests assertions tự động trích xuất Token |

---

## 🚀 Hướng Dẫn Thực Hiện Kiểm Thử

### Cách 1: Chạy Kiểm Thử Tự Động (Automated API Testing - Khuyên dùng)

1. **Khởi động hệ thống:**
   Chạy file [start.bat](file:///d:/Project/CT449/Project/start.bat) tại thư mục gốc để khởi động Redis, Backend (port 3000), User-Web (port 5173) và Admin-Web (port 5174).

2. **Thực thi bộ test tự động:**
   - **Cách 1 (Click đúp chuột):** Mở thư mục `tests` và click đúp vào file [run-tests.bat](file:///d:/Project/CT449/Project/tests/run-tests.bat).
   - **Cách 2 (Dòng lệnh Terminal):**
     ```powershell
     cd d:\Project\CT449\Project
     node tests/run-api-tests.js
     ```

3. **Xem kết quả:**
   Script sẽ tự động chạy liên hoàn các bài kiểm thử:
   - ✅ Kiểm tra Healthcheck Backend & Public Sách API
   - ✅ Đăng ký & Đăng nhập Độc giả
   - ✅ Cập nhật Profile & Đổi mật khẩu
   - ✅ Yêu thích sách (Wishlist) & Viết đánh giá nhận xét (Reviews)
   - ✅ Đăng nhập Quản trị viên (Admin)
   - ✅ Thêm nhân viên mới & Kiểm tra ẩn trường Password
   - ✅ Phân quyền RBAC chéo giữa 3 chức vụ nhân viên (bắt buộc trả 403 Forbidden đúng quyền)
   - ✅ Thêm Nhà xuất bản & Thêm Sách mới
   - ✅ Tạo phiếu mượn & **Kiểm thử chống Overbooking nguyên tử** (2 user cùng mượn 1 sách duy nhất)
   - ✅ Quy trình Xin gia hạn & Duyệt gia hạn
   - ✅ Quy trình Xác nhận trả sách & Hoàn trả tồn kho
   - ✅ Khóa tài khoản độc giả & Xác minh chặn thao tác
   - ✅ Thống kê Dashboard & Phân tích KPI
   - 📊 Xuất bảng tổng kết trực quan: **Số lượng Pass, Fail và Tỷ lệ thành công**.

---

### Cách 2: Kiểm Thử Bằng Postman / Thunder Client (API Manual & Automation)

1. Mở phần mềm **Postman** (hoặc Extension **Thunder Client** trong VS Code).
2. Chọn **Import** $\rightarrow$ Chọn tệp [postman_collection.json](file:///d:/Project/CT449/Project/tests/postman_collection.json).
3. Collection đã cấu hình sẵn biến môi trường:
   - `baseUrl`: `http://localhost:3000`
   - `adminToken`: Tự động cập nhật sau khi gọi request Login Admin.
   - `userToken`: Tự động cập nhật sau khi gọi request Login User.
4. Có thể nhấn nút **Run Collection** để chạy toàn bộ hoặc gửi từng request để kiểm tra chi tiết phản hồi JSON.

---

### Cách 3: Kiểm Thử Giao Diện Thủ Công (Manual E2E Testing)

Mở 2 trình duyệt độc lập hoặc 1 tab thường và 1 tab ẩn danh (Incognito):
- **Cổng Độc giả (User Web):** `http://localhost:5173`
- **Cổng Quản trị (Admin Web):** `http://localhost:5174`

Thực hiện kiểm thử theo các kịch bản chi tiết trong:
- [02_KICH_BAN_USER_WEB.md](file:///d:/Project/CT449/Project/tests/02_KICH_BAN_USER_WEB.md)
- [03_KICH_BAN_ADMIN_WEB.md](file:///d:/Project/CT449/Project/tests/03_KICH_BAN_ADMIN_WEB.md)

---

## 🔑 Danh Sách Tài Khoản Kiểm Thử Mặc Định (Test Accounts)

| Phân hệ / Vai trò | Tên Đăng Nhập / Email | Mật Khẩu | Quyền Hạn / Phạm Vi Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| **Admin Tối Cao** | `ADMIN001` | `Admin@123` | Toàn quyền: Nhân viên, Độc giả (Khóa/Mở), Sách, NXB, Mượn trả, Dashboard |
| **Thủ Thư Quản Lý Sách** | `NV_SACH01` | `Staff@123` | Chỉ quản lý Sách (CRUD), NXB (CRUD), Dashboard. *Không được duyệt mượn, không quản lý nhân viên* |
| **Thủ Thư Duyệt Mượn** | `NV_MUON01` | `Staff@123` | Chỉ duyệt mượn, duyệt gia hạn, trả sách, Dashboard. *Không được CRUD sách/NXB, không quản lý nhân viên* |
| **Độc Giả 1 (Có sẵn)** | `docgia1@gmail.com` | `DocGia@123` | Đăng ký mượn sách, xin gia hạn, đánh giá, yêu thích, profile |
| **Độc Giả 2 (Test Overbooking)** | `docgia2@gmail.com` | `DocGia@123` | Dùng để mô phỏng 2 người cùng tranh chấp 1 cuốn sách duy nhất |
| **Độc Giả Bị Khóa (Test Ban)** | `banned@gmail.com` | `DocGia@123` | Tài khoản đã bị Admin khóa để kiểm tra chặn đăng nhập / chặn mượn |
| **Google Mock OAuth** | Bấm nút *"Google Sign-In (Mock)"* | *(Không cần mật khẩu)* | Phục vụ kiểm thử nhanh tính năng OAuth 2.0 khi không có internet |

---

## 🛡️ Điểm Sáng Kỹ Thuật Cần Nhấn Mạnh Khi Kiểm Thử

Khi thực hiện kiểm thử và trình diễn trước Hội đồng chấm thi, cần làm nổi bật các cơ chế kỹ thuật sau:
1. **Kiểm soát Overbooking bằng Thao tác Nguyên tử (Atomic Operation):**
   Lúc User bấm mượn ("chờ duyệt") kho chưa bị trừ. Chỉ khi Thủ thư bấm Duyệt ("đã duyệt"), hệ thống mới kiểm tra điều kiện `SoQuyenConLai >= soLuong` và trừ kho nguyên tử. Tránh hoàn toàn tình trạng giữ chỗ ảo và race condition.
2. **Chiến lược Hybrid Identifier:**
   Dùng `_id` (ObjectId) làm Clustered Index nội bộ cho URL routing và `$lookup` join nhanh ~0.1ms; Dùng `MaSach`, `MaDocGia`, `MSNV` cho hiển thị UI và tìm kiếm thân thiện người dùng.
3. **Bộ đệm Redis Cache & Invalidation:**
   Dữ liệu danh mục sách được cache tại Redis (`1-2ms`). Bất kỳ thao tác Thêm / Sửa / Xóa sách nào ở Admin sẽ kích hoạt hàm xóa cache (`invalidateCache`), đảm bảo tính nhất quán dữ liệu tuyệt đối.
4. **Deterministic Notification ID:**
   Chuông thông báo phía User sử dụng ID bất biến (`${loanId}_approved`) thay cho timestamp ngẫu nhiên. Khi F5 reload trang, badge thông báo không bao giờ bị nhảy lại.
5. **Tìm Kiếm Bằng Giọng Nói (Voice Search Web Speech API):**
   Tích hợp nhận diện giọng nói tiếng Việt thời gian thực trực tiếp từ trình duyệt, tự động chuẩn hóa và tìm kiếm sách thông minh.
