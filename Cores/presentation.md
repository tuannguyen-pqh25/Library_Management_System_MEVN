# TÀI LIỆU TOÀN DIỆN BẢO VỆ ĐỒ ÁN — PHÁT TRIỂN ỨNG DỤNG WEB (CT449)

**Đề tài:** XÂY DỰNG WEBSITE QUẢN LÝ ĐĂNG KÝ MƯỢN SÁCH ONLINE  
**Học phần:** CT449 - Phát triển ứng dụng Web (Đại học Cần Thơ)  
**Giảng viên hướng dẫn:** Ths.GVC Nguyễn Minh Trung  
**Sinh viên thực hiện:** Nguyễn Minh Tuấn — **MSSV:** B2306598  
**Công nghệ:** MEVN Stack (Native MongoDB Driver, Express.js, Vue 3 Composition API, Node.js, Redis, Gemini AI, NGINX, PM2)

---

## MỤC LỤC TÀI LIỆU
1. **Phần 1:** Dàn ý Slide Thuyết trình (12 Slides chuẩn mực & Lời bình chi tiết)
2. **Phần 2:** Kịch bản Demo Trực tiếp (Live Demo Script — 5 đến 7 phút vàng)
3. **Phần 3:** Bộ 15 Câu hỏi Phản biện Chuyên sâu của Giảng viên & Lời giải Senior
4. **Phần 4:** Checklist Kỹ thuật 10 phút trước giờ Bảo vệ

---

# PHẦN 1: DÀN Ý SLIDE THUYẾT TRÌNH (12 SLIDES CHUẨN MỰC)

### Slide 1: Bìa Đề Tài & Thông Tin Dự Án
- **Tiêu đề lớn:** HỆ THỐNG QUẢN LÝ ĐĂNG KÝ MƯỢN TRẢ SÁCH TRỰC TUYẾN
- **Chuyên ngành:** Công nghệ Thông tin & Truyền thông — Trường CNTT&TT, Đại học Cần Thơ
- **Học phần:** CT449 — Phát triển ứng dụng Web
- **Giảng viên hướng dẫn:** Ths.GVC Nguyễn Minh Trung
- **Sinh viên thực hiện:** Nguyễn Minh Tuấn — MSSV: B2306598
- **Tech Stack Badge:** MongoDB Native | Express.js | Vue 3 | Node.js | Redis | Bootstrap 5 | NGINX | PM2

### Slide 2: Đặt Vấn Đề & Mục Tiêu Đề Tài
- **Bối cảnh & Hạn chế của thư viện truyền thống:**
  - Ghi chép sổ sách thủ công, tốn thời gian tra cứu, dễ thất thoát và nhầm lẫn.
  - Độc giả không biết trước sách còn hay hết trước khi đến thư viện.
  - Thủ thư gặp khó khăn trong việc kiểm soát sách quá hạn, tình trạng giữ sách ảo (overbooking).
- **Mục tiêu giải pháp:**
  - Xây dựng hệ thống Web mượn sách trực tuyến hiện đại theo kiến trúc **MEVN Stack**.
  - Tách biệt 2 không gian trải nghiệm: Cổng Độc giả (User-Web) & Cổng Quản trị (Admin-Web).
  - Tự động hóa 100% quy trình: Đặt mượn $\rightarrow$ Duyệt kho $\rightarrow$ Gia hạn $\rightarrow$ Trả sách & Cảnh báo quá hạn.

### Slide 3: Kiến Trúc Tổng Thể Hệ Thống (System Architecture)
- **Mô hình triển khai:** 1 Backend API tập trung + 2 Single Page Applications (SPA) độc lập.
- **Sơ đồ luồng:**
  - Client Độc giả (`port 5173` / Prod: NGINX `port 80`) $\rightarrow$ Reverse Proxy NGINX $\rightarrow$ Backend API (`port 3000`).
  - Client Thủ thư/Admin (`port 5174` / Prod: NGINX `port 8080`) $\rightarrow$ Reverse Proxy NGINX $\rightarrow$ Backend API (`port 3000`).
  - Backend API kết nối: MongoDB Server (CSDL chính) + Redis Server (In-memory Caching).
- **Process Manager:** PM2 quản lý tiến trình `library-backend` (Auto-restart, memory threshold 500MB, zero-downtime).

### Slide 4: Thiết Kế Cơ Sở Dữ Liệu & Chiến Lược Hybrid ID
- **5 Collections chuẩn hóa theo yêu cầu Giảng viên:**
  1. `DOCGIA`: Thông tin độc giả, tài khoản, trạng thái khóa, mã độc giả.
  2. `SACH`: Thông tin sách, số lượng tổng, số quyển còn lại, đơn giá, mã NXB.
  3. `NHAXUATBAN`: Thông tin nhà xuất bản.
  4. `THEODOIMUONSACH`: Nhật ký mượn/trả, hạn trả, ngày hẹn trả, lịch sử gia hạn.
  5. `NHANVIEN`: Thông tin thủ thư, quản trị viên, chức vụ (RBAC).
- **Điểm sáng kỹ thuật — Chiến lược Hybrid ID:**
  - `_id (ObjectId)`: Khóa chính nội bộ BSON, tận dụng Clustered Index (~0.1ms) phục vụ URL routing, foreign key nội bộ và phép join `$lookup`.
  - `Mã nghiệp vụ (MaSach, MaDocGia, MSNV, MaNXB)`: Phục vụ hiển thị UI thân thiện cho người dùng, tìm kiếm báo cáo.
  - Thiết lập **17 Unique & Compound Indexes** trên MongoDB native để đảm bảo toàn vẹn dữ liệu tuyệt đối.

### Slide 5: Quy Trình Nghiệp Vụ Cốt Lõi (Vòng Đời Phiếu Mượn)
- **Sơ đồ máy trạng thái (State Machine):**
  - `Chờ duyệt` $\rightarrow$ `Đang mượn` $\rightarrow$ `Chờ gia hạn` $\rightarrow$ `Đang chờ trả` $\rightarrow$ `Đã trả`.
  - Rẽ nhánh: `Từ chối` (khi hết sách hoặc vi phạm) hoặc `Quá hạn` (khi trễ hạn trả).
- **Các quy tắc nghiệp vụ vàng:**
  - Hạn mức mượn tối đa: **10 quyển / độc giả** (tính trên tổng số sách đang chờ duyệt + đã duyệt + đang mượn).
  - Lazy-check Quá hạn: Tự động cập nhật trạng thái phiếu mượn sang `Quá hạn` khi có bất kỳ truy vấn nào liên quan, đảm bảo dữ liệu luôn đúng thời gian thực mà không phụ thuộc background cronjob nặng nề.

### Slide 6: Nghiệp Vụ Chống Overbooking & Đảm Bảo Toàn Vẹn Kho Sách
- **Bài toán Overbooking:** Khi nhiều độc giả cùng gửi yêu cầu mượn 1 cuốn sách duy nhất còn lại trong kho.
- **Giải pháp First-Come, First-Served tại thời điểm duyệt:**
  - Lúc tạo phiếu (`Chờ duyệt`): Không trừ sách trong kho, tránh hiện tượng "giữ chỗ ảo" làm đóng băng kho sách.
  - Lúc Thủ thư duyệt (`Approve`): Hệ thống kiểm tra số lượng tồn kho theo thời gian thực (`SoQuyenConLai >= soLuong`).
  - Nếu đủ: Trừ kho tự động, chuyển trạng thái `Đang mượn`.
  - Nếu không đủ (do người khác đã được duyệt trước): Hệ thống từ chối duyệt, báo lỗi rõ ràng và yêu cầu thủ thư từ chối phiếu.

### Slide 7: Nghiệp Vụ Gia Hạn Mượn Sách Có Kiểm Soát (Renewal Rules)
- **4 Ràng buộc nghiệp vụ khắt khe:**
  1. Phiếu phải ở trạng thái `Đang mượn` và **chưa bị quá hạn**.
  2. **Quy tắc 3 ngày:** Độc giả chỉ được xin gia hạn khi hạn trả còn **ít nhất 3 ngày** (`ngayTra - today >= 3`). Tránh tình trạng để cận ngày hoặc quá hạn mới xin gia hạn.
  3. Giới hạn số lần: Tối đa **2 lần gia hạn** cho mỗi cuốn sách.
  4. Phê duyệt bắt buộc: Yêu cầu chuyển sang trạng thái `Chờ gia hạn` và phải được Thủ thư kiểm tra, duyệt trước khi chính thức tăng ngày hẹn trả (+7 hoặc +14 ngày).

### Slide 8: Phân Quyền Chi Tiết RBAC 3 Cấp Độ (Role-Based Access Control)
- **Bảo mật 2 lớp:**
  - **Lớp 1 (Frontend):** Vue Router Navigation Guards + dynamic Sidebar dựa trên claims trong JWT token.
  - **Lớp 2 (Backend API):** Middleware `verifyAdminToken` + `requireRole([...])`.
- **3 Vai trò rõ ràng:**
  1. `Admin`: Toàn quyền hệ thống, quản lý tài khoản nhân viên, quản lý tài khoản độc giả (khóa/mở khóa), xem thống kê báo cáo.
  2. `NhanVienQuanLySach`: Quản lý kho sách (Thêm/Sửa/Xóa/Tìm kiếm) và Nhà xuất bản.
  3. `NhanVienDuyetMuon`: Quản lý danh sách mượn trả, duyệt mượn, duyệt gia hạn, xác nhận trả sách và theo dõi quá hạn.

### Slide 9: Các Điểm Sáng Kỹ Thuật Nâng Cao (Advanced Features)
- **Redis Caching:** Caching danh sách sách người dùng và Dashboard thống kê (TTL 5 phút), tự động xóa cache (Cache Invalidation) khi có thao tác Thêm/Sửa/Xóa sách hoặc Duyệt/Trả sách.
- **In-App Notification Bell:** Chuông thông báo nhắc hẹn trả sách với thuật toán **Deterministic ID** (loại bỏ hoàn toàn lỗi nhảy lại badge khi F5 reload trang).
- **Gemini AI Chatbot (Resilience 3 Lớp):** Tự động tư vấn tìm sách, xử lý lỗi 503/429 bằng cơ chế Exponential Backoff with Jitter, Model Fallback Chain và Multi-Key Rotation.
- **Voice Search AI:** Tìm kiếm sách rảnh tay qua giọng nói bằng Web Speech API.
- **OAuth 2.0:** Đăng nhập một chạm bằng Google OAuth 2.0 kèm chế độ Mock OAuth cho chấm thi offline.

### Slide 10: Tối Ưu Hóa & Đóng Gói Triển Khai (DevOps & Deploy)
- **Chuẩn hóa mã nguồn:** Loại bỏ 100% hardcoded emoji trong codebase (Zero-Emoji standard) đảm bảo tương thích đa nền tảng và văn phong kỹ thuật chuẩn mực.
- **NGINX Reverse Proxy:**
  - Cổng 80: Phục vụ `user-web/dist`, xử lý HTML5 History Mode (`try_files`), proxy `/api/` về port 3000.
  - Cổng 8080: Phục vụ `admin-web/dist`, proxy `/api/` về port 3000.
- **Tối ưu tự động hóa:** Bộ script `start.bat` và `stop.bat` chuẩn hóa CRLF Windows, khởi động đồng bộ Database, Backend và cả 2 Frontend chỉ bằng một cú click.

### Slide 11: Đánh Giá Kết Quả Đề Tài
- Hoàn thành **100% 11 giai đoạn** đề ra trong đề cương học phần CT449.
- Đáp ứng trọn vẹn và vượt mức yêu cầu quản lý thư viện của Giảng viên.
- Hệ thống hoạt động ổn định, mượt mà, phân quyền bảo mật chặt chẽ, sẵn sàng đưa vào vận hành thực tế.

### Slide 12: Lời Cảm Ơn & Sẵn Sàng Trả Lời Câu Hỏi
- Lời cảm ơn chân thành gửi đến Thầy Ths.GVC Nguyễn Minh Trung.
- Xin kính mời Quý Thầy/Cô trong Hội đồng đặt câu hỏi phản biện và chấm điểm đề tài.

---

# PHẦN 2: KỊCH BẢN DEMO TRỰC TIẾP (LIVE DEMO SCRIPT — 5 ĐẾN 7 PHÚT VÀNG)

> **Mẹo chuẩn bị trước khi lên bục:**
> 1. Mở sẵn 2 cửa sổ trình duyệt đặt cạnh nhau (hoặc 2 tab riêng):
>    - Cửa sổ Trái: `http://localhost:5173` (Cổng Độc giả User-Web).
>    - Cửa sổ Phải (Ẩn danh / Incognito): `http://localhost:5174` (Cổng Quản trị Admin-Web).
> 2. Đảm bảo Backend (`node server.js` hoặc PM2) và MongoDB, Redis đang chạy bình thường.

---

### BƯỚC 1: Mở Đầu & Giới Thiệu Cổng Độc Giả (0:00 - 1:00)
- **Hành động:** Đứng tại trang chủ `user-web`.
- **Lời thuyết trình:**
  > *"Kính thưa Thầy, đây là giao diện Cổng Độc giả được xây dựng bằng Vue 3 Composition API và Bootstrap 5. Độc giả chưa cần đăng nhập vẫn có thể tra cứu toàn bộ kho sách của thư viện. Hệ thống hỗ trợ bộ lọc thể loại đa dạng, tìm kiếm theo tên sách hoặc tên tác giả."*
- **Thao tác ấn tượng:**
  - Bấm vào icon Micro trên thanh tìm kiếm, nói to: *"Lập trình"* $\rightarrow$ Voice Search nhận diện và tự động lọc ra các cuốn sách lập trình.
  - Bấm mở Bong bóng Chatbot AI ở góc phải, hỏi: *"Gợi ý cho tôi sách hay về công nghệ"* $\rightarrow$ Chatbot Gemini AI phản hồi tức thì với văn phong thân thiện.

---

### BƯỚC 2: Đăng Nhập & Tạo Phiếu Mượn Sách (1:00 - 2:15)
- **Hành động:** Đăng nhập tài khoản Độc giả (có thể dùng tài khoản thường hoặc bấm nút Google/Mock OAuth).
- **Lời thuyết trình:**
  > *"Em tiến hành đăng nhập với tài khoản Độc giả. Khi đăng nhập thành công, Header lập tức cập nhật thông tin người dùng thông qua cơ chế EventBus mà không cần reload trang. Bây giờ em sẽ chọn mượn một cuốn sách."*
- **Thao tác:**
  - Vào xem chi tiết một cuốn sách (ví dụ: *Lập trình Web với Node.js*). Chỉ vào trường **Nhà Xuất Bản** để chứng minh: *"Ở đây tên NXB đã được join tự động hiển thị rõ ràng chứ không chỉ hiển thị mã NXB thô"*.
  - Bấm nút **Mượn sách** $\rightarrow$ Modal xuất hiện.
  - Chọn số lượng: 1 quyển. Chọn Ngày hẹn trả (mặc định cách 14-20 ngày).
  - Bấm **Xác nhận mượn** $\rightarrow$ Toast thông báo thành công.
  - Chuyển sang trang **Lịch sử mượn** $\rightarrow$ Phiếu mượn xuất hiện với trạng thái màu vàng: `Chờ duyệt`.

---

### BƯỚC 3: Cổng Thủ Thư — Duyệt Phiếu & Giải Thích Overbooking (2:15 - 3:30)
- **Hành động:** Chuyển sang cửa sổ Admin-Web (`localhost:5174`).
- **Lời thuyết trình:**
  > *"Bây giờ em chuyển sang Cổng Quản trị. Em đăng nhập bằng tài khoản Thủ thư có chức vụ `NhanVienDuyetMuon`. Như Thầy thấy, sidebar của tài khoản này chỉ hiển thị mục Quản lý Mượn Sách và Dashboard, hoàn toàn không thấy Quản lý Nhân viên — chứng minh phân quyền RBAC hoạt động chính xác."*
- **Thao tác:**
  - Vào menu **Quản lý mượn sách**. Thấy ngay phiếu mượn vừa tạo đang ở trạng thái `Chờ duyệt`.
  - Chọn thao tác trong Contextual Dropdown: chọn **Duyệt phiếu** $\rightarrow$ Bấm nút thực thi.
  - Toast xanh hiện lên: Duyệt thành công.
- **Lời giải thích "ăn điểm":**
  > *"Thưa Thầy, hệ thống của em áp dụng nguyên tắc **First-come, first-served tại thời điểm duyệt**. Lúc độc giả tạo phiếu mượn, kho sách chưa bị trừ để tránh tình trạng 'giữ chỗ ảo'. Chỉ khi Thủ thư bấm Duyệt, hệ thống mới kiểm tra lại số lượng tồn kho và thực hiện trừ kho thật sự. Nếu sách đã hết do người khác mượn trước, hệ thống sẽ chặn lại và báo lỗi ngay lập tức."*

---

### BƯỚC 4: Chuông Thông Báo & Nghiệp Vụ Gia Hạn Mượn Sách (3:30 - 4:45)
- **Hành động:** Quay lại cửa sổ User-Web.
- **Lời thuyết trình:**
  > *"Quay lại phía Độc giả, Thầy có thể thấy Icon Chuông thông báo trên Header lập tức rung lên và hiển thị Badge số 1. Bấm vào chuông, độc giả nhận được thông báo phiếu mượn đã được phê duyệt."*
- **Thao tác ấn tượng:**
  - Nhấn **F5 (Reload trang)** $\rightarrow$ Badge và trạng thái đã đọc vẫn giữ nguyên, không bị nhảy lại số.
  - Giải thích: *"Em đã giải quyết triệt để lỗi F5 hiện lại thông báo bằng thuật toán **Deterministic Notification ID** bất biến thay vì sinh timestamp ngẫu nhiên."*
  - Tại bảng Lịch sử, phiếu mượn đã chuyển sang `Đang mượn`.
  - Mở dropdown thao tác, chọn **Xin gia hạn**.
  - Modal gia hạn hiện lên với lựa chọn +7 ngày hoặc +14 ngày.
- **Lời giải thích:**
  > *"Theo quy tắc nghiệp vụ, độc giả chỉ được xin gia hạn khi sách còn hạn ít nhất 3 ngày và tối đa không quá 2 lần. Em chọn xin gia hạn thêm 7 ngày và gửi yêu cầu."*
- **Thao tác bên Admin:**
  - Quay lại Admin, lọc tab `Chờ gia hạn` $\rightarrow$ Thấy yêu cầu $\rightarrow$ Chọn **Duyệt gia hạn**.
  - Hạn trả của phiếu mượn lập tức được cộng thêm 7 ngày.

---

### BƯỚC 5: Trả Sách & Phô Diễn Kỹ Thuật (Redis & Dashboard) (4:45 - 6:00)
- **Hành động:** Hoàn tất chu trình mượn trả & mở Dashboard thống kê.
- **Thao tác:**
  - Phía User: Chọn thao tác **Hẹn trả sách** (nhập ngày mang sách đến).
  - Phía Admin: Chọn **Xác nhận trả sách** $\rightarrow$ Phiếu mượn chuyển thành `Đã trả`, số lượng sách trong kho tự động được cộng hoàn trả lại.
  - Đăng nhập tài khoản `Admin` tối cao (`ADMIN001`) $\rightarrow$ Menu hiển thị đầy đủ: Quản lý Nhân viên, Quản lý Độc giả (có tính năng Khóa tài khoản), và **Dashboard Thống kê**.
  - Mở trang Dashboard: Trình diễn 4 thẻ KPI và 3 biểu đồ Chart.js (cơ cấu mượn trả, xu hướng theo tháng, top sách được mượn nhiều nhất).
- **Thao tác Network Tab (Chứng minh Redis Caching):**
  - Mở F12 $\rightarrow$ Tab Network $\rightarrow$ F5 tải danh sách sách: Thời gian phản hồi chỉ **1 - 2ms** do dữ liệu được lấy trực tiếp từ **Redis Cache**.
- **Kết luận:**
  > *"Em đã hoàn thành toàn bộ chu trình mượn, gia hạn, trả sách và quản lý vận hành. Em xin kết thúc phần demo và sẵn sàng lắng nghe câu hỏi từ Thầy."*

---

# PHẦN 3: BỘ 15 CÂU HỎI PHẢN BIỆN "CHÍ MẠNG" & LỜI GIẢI SENIOR

### Câu 1: Tại sao em lại chọn MongoDB Native Driver mà không dùng Mongoose ODM?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, em chủ động chọn **Native MongoDB Driver** vì 3 lý do kỹ thuật lớn:
  > 1. **Hiệu năng & Resource Footprint:** Native driver giao tiếp trực tiếp với MongoDB qua BSON binary protocol mà không phải chịu overhead từ tầng trừu tượng (abstraction layer), schema casting, middleware hooks hay model hydration của Mongoose. Điều này giúp giảm lượng RAM tiêu thụ và tăng tốc độ xử lý I/O lên 20 - 30%.
  > 2. **Linh hoạt & Hiểu sâu bản chất:** Sử dụng native driver đòi hỏi lập trình viên phải tự viết các câu lệnh truy vấn, Aggregation Pipelines (`$lookup`, `$match`, `$group`, `$facet`) và tự quản lý index. Điều này giúp em nắm vững kiến thức cốt lõi về hệ quản trị CSDL NoSQL thay vì phụ thuộc vào thư viện bao bọc.
  > 3. **Phù hợp kiến trúc Service-oriented:** Toàn bộ business logic và validation được em đóng gói chặt chẽ trong tầng Service (`sach.service.js`, `muonsach.service.js`), đảm bảo tính trong sáng của mã nguồn (Clean Architecture)."*

---

### Câu 2: Em hãy giải thích Chiến lược Hybrid ID? Tại sao trong CSDL vừa có `_id` vừa có `MaSach`, `MaDocGia`? Bỏ một cái có được không?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, em áp dụng **Chiến lược Hybrid (Lai)** để phân tách rạch ròi giữa 2 vai trò:
  > - **`_id` (BSON ObjectId 12-byte):** Đóng vai trò là Khóa chính vật lý (Physical Primary Key). MongoDB tự động tạo Clustered Index trên `_id`, giúp truy vấn tìm kiếm đạt tốc độ tối đa (~0.1ms). `_id` được dùng cho URL routing nội bộ (`/sach/:id`), các phép join `$lookup` giữa các collection, và lưu trữ trong JWT token.
  > - **Mã nghiệp vụ (`MaSach`, `MaDocGia`, `MSNV`, `MaNXB`):** Đóng vai trò là Khóa logic nghiệp vụ (Logical Business Key). Mã này ngắn gọn, có ý nghĩa gợi nhớ (ví dụ: `SACH001`, `DG001`), dùng để in lên thẻ thư viện, hiển thị cho độc giả tra cứu và làm báo cáo.
  > 
  > Nếu bỏ `_id` mà dùng Mã làm khóa chính: MongoDB sẽ phải tái tạo lại index trên chuỗi string dài, làm giảm hiệu năng join `$lookup`. Ngược lại, nếu bỏ Mã mà bắt độc giả nhớ chuỗi ObjectId 24 ký tự hex (`654a1b...`) thì trải nghiệm người dùng (UX) rất kém. Do đó, việc duy trì cả hai và thiết lập **Unique Index** cho các Mã là giải pháp chuẩn công nghiệp tối ưu nhất."*

---

### Câu 3: Khi có 2 độc giả cùng gửi yêu cầu mượn 1 cuốn sách duy nhất còn lại, hệ thống xử lý thế nào để tránh Overbooking?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, hệ thống của em giải quyết bài toán này theo mô hình **First-Come, First-Served tại thời điểm Phê Duyệt**:
  > 1. **Giai đoạn tạo phiếu:** Khi cả 2 độc giả bấm mượn, hệ thống cho phép tạo phiếu ở trạng thái `Chờ duyệt` mà **chưa trừ kho**. Điều này ngăn ngừa tình trạng một độc giả bấm mượn rồi bỏ quên làm đóng băng kho sách của thư viện.
  > 2. **Giai đoạn phê duyệt:** Khi Thủ thư duyệt phiếu cho độc giả A, Backend thực hiện kiểm tra điều kiện nguyên tử: `SoQuyenConLai >= soLuong`. Vì còn 1 cuốn, hệ thống trừ kho (`SoQuyenConLai = 0`) và chuyển phiếu A sang `Đang mượn`.
  > 3. **Khi thủ thư bấm duyệt phiếu B:** Backend tiếp tục kiểm tra kho, lúc này `SoQuyenConLai = 0 < 1`. Service lập tức ném ra lỗi `ApiError(400, 'Số lượng sách trong kho không đủ để duyệt')`. Giao diện Admin hiển thị cảnh báo đỏ và khóa nút duyệt, bắt buộc Thủ thư phải bấm 'Từ chối' phiếu của độc giả B.
  > Nhờ vậy, kho sách không bao giờ bị âm và dữ liệu luôn nhất quán tuyệt đối."*

---

### Câu 4: Làm thế nào hệ thống biết được một phiếu mượn đã bị "Quá hạn"? Tại sao em không dùng CronJob hay `setInterval`?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, hệ thống của em áp dụng cơ chế **Lazy-check (Kiểm tra lười)** thông qua hàm `_checkAndUpdateOverdue()` trong `muonsach.service.js`:
  > - **Cách hoạt động:** Bất cứ khi nào có một truy vấn lấy danh sách mượn sách (`find`, `findById`, `findByDocGia`, `findAllPopulated`), trước khi trả dữ liệu về, hệ thống sẽ thực hiện một lệnh `updateMany` tự động: quét tất cả các phiếu có trạng thái `đang mượn` hoặc `đã duyệt` mà có `ngayHenTra < hôm nay`, tự động đổi trạng thái sang `quá hạn`.
  > - **Tại sao không dùng CronJob / setInterval:**
  >   1. CronJob chạy nền định kỳ sẽ tiêu tốn CPU và kết nối database liên tục ngay cả khi không có người dùng truy cập.
  >   2. Nếu server bị restart đúng vào thời điểm cronjob chuẩn bị chạy, các phiếu quá hạn sẽ bị bỏ sót cho đến chu kỳ tiếp theo.
  >   3. Với Lazy-check, dữ liệu luôn đảm bảo 'Fresh' 100% tại đúng thời điểm người dùng nhìn thấy, chi phí truy vấn bằng 0 khi hệ thống rảnh rỗi."*

---

### Câu 5: Quy tắc gia hạn mượn sách trước 3 ngày được kiểm soát ở đâu? Nếu người dùng cố tình dùng Postman gọi API thì sao?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, quy tắc này được bảo vệ nghiêm ngặt ở **Tầng Service của Backend** (`muonsach.service.js`), Frontend chỉ đóng vai trò hỗ trợ giao diện:
  > - Trong hàm `requestExtension()`, Backend thực hiện phép tính:
  >   ```javascript
  >   const diffDays = Math.ceil((new Date(record.ngayTra) - new Date()) / (1000 * 60 * 60 * 24));
  >   if (diffDays < 3) {
  >       throw new ApiError(400, "Chỉ được gia hạn trước ngày hẹn trả ít nhất 3 ngày");
  >   }
  >   ```
  > - Kèm theo đó là kiểm tra: `record.soLanGiaHan >= 2` và `record.trangThai !== 'đang mượn'`.
  > Dù kẻ gian có bypass frontend bằng Postman hay Curl, Backend vẫn kiểm tra ngày tháng thực tế trên server và từ chối request với mã lỗi HTTP 400."*

---

### Câu 6: Em tích hợp Redis Caching vào những API nào? Làm sao đảm bảo dữ liệu trong cache không bị cũ (Stale Data)?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, em áp dụng Redis Cache vào 2 vị trí có tần suất đọc (Read) cực lớn nhưng ít ghi (Write):
  > 1. **API Danh sách sách độc giả (`/api/user/sach`):** Cache kết quả tìm kiếm, phân trang và thể loại với TTL 10 phút.
  > 2. **API Thống kê Dashboard Admin (`/api/admin/dashboard/stats`):** Cache số liệu tính toán tổng hợp với TTL 5 phút.
  > 
  > **Cơ chế chống Stale Data (Cache Invalidation):**
  > Em thiết lập cơ chế xóa bộ đệm chủ động theo sự kiện:
  > - Khi Admin thực hiện Thêm/Sửa/Xóa sách $\rightarrow$ Service tự động gọi lệnh xóa toàn bộ key dạng `user:sach:*`.
  > - Khi Thủ thư thực hiện Duyệt/Trả/Từ chối mượn sách $\rightarrow$ Service tự động xóa cache thống kê `admin:dashboard:stats`.
  > Nhờ vậy, độc giả và thủ thư luôn nhận được dữ liệu mới nhất ngay khi có thay đổi."*

---

### Câu 7: Tại sao trước đây Chuông thông báo bị lỗi F5 reload thì badge hiện lại số, và em đã xử lý triệt để như thế nào?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, đây là một lỗi rất thú vị về mặt Frontend State Persistence:
  > - **Nguyên nhân:** Trước đây, ID thông báo (`notifId`) được tạo bằng cách nối chuỗi với `new Date().toISOString()`. Do đó mỗi khi người dùng nhấn F5, component khởi tạo lại và sinh ra một timestamp mới hoàn toàn. Vì ID mới này không khớp với danh sách ID đã đọc lưu trong `localStorage`, hệ thống tưởng đó là thông báo mới và badge lại nhảy số.
  > - **Giải pháp triệt để:** Em chuyển sang áp dụng **Deterministic Notification ID (Định danh tất định)**:
  >   - Thông báo duyệt mượn: `${item._id}_approved`
  >   - Thông báo duyệt gia hạn: `${item._id}_ext_approved_${giaHanCount}`
  >   - Thông báo sắp hết hạn: `${item._id}_soon_${item.ngayTra}`
  >   Các ID này chỉ phụ thuộc vào dữ liệu cố định trong CSDL. Khi F5, ID sinh ra giống hệt 100%, hệ thống đối chiếu với `localStorage` thấy đã đọc nên badge giữ nguyên chính xác."*

---

### Câu 8: Chatbot Gemini AI làm thế nào để không bị treo hoặc sập khi gặp lỗi 503 Quá tải hoặc 429 Quota?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, em đã xây dựng **Kiến trúc Resilience 3 lớp** trong `chatbot.service.js`:
  > 1. **Lớp 1 — Exponential Backoff with Jitter:** Khi gặp lỗi mạng hoặc HTTP 503/500, hệ thống tự động retry tối đa 3 lần với thời gian chờ tăng dần (1s $\rightarrow$ 2s $\rightarrow$ 4s) cộng thêm một khoảng ngẫu nhiên $\pm 25\%$ (Jitter) để chống thundering herd.
  > 2. **Lớp 2 — Model Fallback Chain:** Nếu model chính `gemini-3.8-flash` vẫn bị quá tải sau 3 lần retry, hệ thống tự động chuyển vùng fallback sang model nhẹ hơn là `gemini-3.5-flash-lite`.
  > 3. **Lớp 3 — Multi-Key Rotation:** Khi gặp lỗi 429 (Hết Quota) hoặc 403, hệ thống tự động xoay vòng sang API Key dự phòng tiếp theo trong danh sách cấu hình.
  > Phía giao diện còn có countdown tự thử lại sau 30s giúp trải nghiệm người dùng luôn liền mạch."*

---

### Câu 9: Tại sao em lại tách thành 2 Frontend riêng biệt (`user-web` và `admin-web`) thay vì gộp chung vào 1 dự án?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, việc tách 2 Frontend độc lập mang lại 3 ưu điểm vượt trội:
  > 1. **Bảo mật bề mặt tấn công (Attack Surface Separation):** Toàn bộ mã nguồn, logic duyệt mượn, quản lý kho và quản lý nhân viên của Admin hoàn toàn không bị bundle vào file JavaScript của người dùng. Kẻ gian không thể dịch ngược (reverse-engineer) code quản trị từ trình duyệt người dùng.
  > 2. **Tối ưu hóa tải trang (Bundle Size):** `user-web` chỉ chứa các component phục vụ độc giả, giúp file bundle nhẹ, thời gian First Contentful Paint (FCP) nhanh hơn.
  > 3. **Độc lập triển khai (Independent Deployment):** Quản trị viên và người dùng chạy trên 2 cổng mạng khác nhau (port 80 và 8080), có thể bảo trì hoặc deploy nâng cấp cổng User mà không ảnh hưởng đến công việc nội bộ của Thủ thư."*

---

### Câu 10: Vai trò của NGINX và PM2 trong đồ án này là gì? Khác gì so với chạy lệnh `npm run dev`?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy:
  > - **Lúc phát triển (Dev):** Chúng ta dùng `nodemon` và Vite dev server. Chế độ này có hot-reload nhưng đơn luồng, tốn tài nguyên và dễ sập khi có uncaught exception.
  > - **Lúc triển khai (Production):**
  >   - **PM2:** Quản lý tiến trình Node.js Backend chạy nền (background daemon), tự động restart nếu tiến trình bị crash, tự khởi động cùng hệ điều hành khi máy chủ reboot, và giám sát bộ nhớ (tối đa 500MB).
  >   - **NGINX:** Đóng vai trò là **Reverse Proxy** và Web Server phục vụ static files (`dist/`). NGINX nhận request port 80/8080, xử lý nén Gzip, cache file tĩnh, định tuyến `/api/*` về Node.js (port 3000) và xử lý `try_files` hỗ trợ Vue Router HTML5 History Mode không bị lỗi 404 khi F5."*

---

### Câu 11: MongoDB không có Foreign Key (Ràng buộc khóa ngoại), làm thế nào em đảm bảo toàn vẹn dữ liệu giữa các bảng?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, vì MongoDB là CSDL NoSQL không hỗ trợ ràng buộc khóa ngoại ở tầng database engine, em đảm bảo toàn vẹn dữ liệu qua 3 giải pháp:
  > 1. **Ràng buộc duy nhất bằng Index:** Khởi tạo 17 Unique Indexes trên các trường Mã (`MaSach`, `MaDocGia`, `MSNV`, `MaNXB`, `Email`), ngăn chặn 100% dữ liệu trùng lặp.
  > 2. **Kiểm tra tham chiếu ở Tầng Service (Application-level Integrity):** Trước khi tạo phiếu mượn, service kiểm tra xem `MaDocGia` có tồn tại trong `DOCGIA` không, `MaSach` có tồn tại trong `SACH` không. Trước khi xóa một NXB, service kiểm tra xem có cuốn sách nào đang trỏ tới `MaNXB` đó không, nếu có thì chặn lại.
  > 3. **Atomic Operations (Thao tác nguyên tử):** Sử dụng các toán tử cập nhật nguyên tử của MongoDB như `$inc` (tăng giảm số lượng sách), `$set` kết hợp điều kiện query để đảm bảo không bị tranh chấp dữ liệu (Race Condition)."*

---

### Câu 12: Hệ thống phân quyền RBAC 3 vai trò được bảo vệ như thế nào nếu người dùng sửa LocalStorage hoặc gửi request Postman?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, LocalStorage trên trình duyệt chỉ phục vụ cho việc ẩn/hiện menu trên giao diện Vue (Client-side UI).
  > Hệ thống bảo mật thực sự nằm ở **Backend API**:
  > - Mỗi request gửi lên đều mang theo JWT Token trong header `Authorization: Bearer <token>`.
  > - Token này được ký bằng `JWT_SECRET` trên server và chứa claim `Chucvu` của nhân viên. Kẻ gian sửa LocalStorage thì chữ ký JWT không đổi; nếu tự ý sửa token thì chữ ký bị sai và middleware `verifyAdminToken` sẽ trả về lỗi HTTP 401 ngay lập tức.
  > - Middleware `requireRole(['Admin'])` giải mã token và kiểm tra quyền hạn thực tế. Nếu nhân viên duyệt mượn cố tình gọi API xóa nhân viên, hệ thống sẽ chặn đứng với mã lỗi HTTP 403 Forbidden."*

---

### Câu 13: Đăng nhập Google OAuth 2.0 hoạt động như thế nào và liên kết với collection `DOCGIA` ra sao?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, luồng OAuth 2.0 diễn ra như sau:
  > 1. Độc giả bấm nút đăng nhập Google $\rightarrow$ Chuyển hướng sang Google Authentication Server.
  > 2. Sau khi xác thực, Google redirect về Backend callback kèm Authorization Code.
  > 3. Passport.js trên Backend đổi code lấy Profile (Email, Họ tên, Google ID).
  > 4. Hàm `findOrCreateByOAuth()` trong `docgia.service.js` sẽ tìm Email trong collection `DOCGIA`:
  >    - Nếu email đã có: Kiểm tra tài khoản không bị khóa, liên kết `oauthId`.
  >    - Nếu chưa có: Tự động sinh `MaDocGia` mới (ví dụ: `DG_GG_xxxxxx`), lưu thông tin với `Password: null` (vì xác thực qua bên thứ 3) và gán trạng thái `BinhThuong`.
  > 5. Backend cấp phát JWT token nội bộ của hệ thống và redirect về Frontend với token, đảm bảo các request sau đó hoạt động đồng bộ hệt như tài khoản thường."*

---

### Câu 14: Tại sao trong schema Yup Validation, các trường như `MoTa`, `SoTrang`, `TheLoai`, `AnhBia` lại đặt là `.nullable()` mà không phải `.required()`?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, đây là một bài học thực tế rất quan trọng về tính tương thích dữ liệu:
  > - Lược đồ CSDL ban đầu của Giảng viên (`Tieuchiduan.md`) cho bảng `SACH` chỉ có các trường: `MaSach`, `TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`, `MaNXB`, `NguonGoc/TacGia`.
  > - Các trường `MoTa`, `SoTrang`, `TheLoai`, `AnhBia` là các trường mở rộng mà em bổ sung thêm để giao diện đẹp hơn.
  > - Khi import dữ liệu mẫu của Thầy hoặc khi sửa sách cũ, các trường mở rộng này có thể bị `null` hoặc `undefined`. Nếu trong Yup schema đặt là `.required()`, form VeeValidate sẽ âm thầm chặn submit mà không đưa ra cảnh báo rõ ràng.
  > Vì vậy, em đặt các trường này là `.nullable()` hoặc `.optional()`, vừa tôn trọng 100% CSDL của Thầy vừa đảm bảo form hoạt động mượt mà."*

---

### Câu 15: Mục đích của việc chuẩn hóa "Zero Emoji in Code" trong dự án là gì?
- **Trả lời chuẩn Senior:**
  > *"Dạ thưa Thầy, việc loại bỏ 100% emoji trong mã nguồn và giao diện quản trị nhằm 3 mục đích:
  > 1. **Tính tương thích đa nền tảng:** Một số hệ điều hành, server Linux cũ hoặc console terminal Windows không hỗ trợ font Unicode emoji đầy đủ, dễ gây ra lỗi vỡ font hoặc lỗi encoding UTF-8 khi chạy batch script.
  > 2. **Chuẩn mực mã nguồn:** Các dự án phần mềm chuyên nghiệp sử dụng Icon Font chuẩn hóa (FontAwesome SVG icons) thay vì chèn các ký tự emoji ngẫu nhiên vào text và options.
  > 3. **Tác phong học thuật:** Đảm bảo đồ án tốt nghiệp có phong cách trang nhã, nghiêm túc và đạt chuẩn mực đánh giá cao nhất của Hội đồng chấm thi."*

---

# PHẦN 4: CHECKLIST KỸ THUẬT 10 PHÚT TRƯỚC GIỜ BẢO VỆ

- [ ] **1. Môi trường Cơ sở dữ liệu:**
  - MongoDB Server đã khởi động (`mongod` hoặc service MongoDB chạy ổn định).
  - Redis Server đã bật (nếu có cài Redis) hoặc xác nhận Backend chạy cơ chế Graceful Fallback an toàn.
- [ ] **2. Khởi động Hệ thống:**
  - Chạy `start.bat` để bật Backend (port 3000), `user-web` (port 5173) và `admin-web` (port 5174).
  - Hoặc kiểm tra trạng thái PM2: `pm2 status` $\rightarrow$ `library-backend` hiển thị `online`.
- [ ] **3. Kiểm tra Dữ liệu mẫu (Seeded Data):**
  - Tài khoản Admin: `ADMIN001` / Mật khẩu: `Admin@123`
  - Đảm bảo có ít nhất 1 cuốn sách có số lượng bằng 1 để demo kịch bản Overbooking.
  - Đảm bảo có 1 phiếu mượn đang mượn còn hạn $\ge 3$ ngày để demo tính năng Gia hạn.
- [ ] **4. Chuẩn bị Trình duyệt:**
  - Mở sẵn 1 tab Chrome thường (`localhost:5173`) cho Độc giả.
  - Mở sẵn 1 tab Chrome Ẩn danh Incognito (`localhost:5174`) cho Thủ thư/Admin.
  - Xóa cache trình duyệt hoặc mở sẵn Network tab để sẵn sàng phô diễn tốc độ API.
- [ ] **5. Tâm thế tự tin:**
  - Nắm vững 3 từ khóa cốt lõi: **MEVN Native Driver**, **First-Come First-Served Overbooking**, và **Deterministic Notification ID**.
  - Trình bày dõng dạc, tự tin, nhấn mạnh vào các giải pháp kỹ thuật do chính mình tự giải quyết.
