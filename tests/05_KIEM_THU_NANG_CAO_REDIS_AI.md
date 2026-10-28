# HƯỚNG DẪN KIỂM THỬ TÍNH NĂNG NÂNG CAO (REDIS CACHE, VOICE SEARCH & GOOGLE OAUTH 2.0)

> **Mục tiêu:** Kiểm chứng và đo lường các giải pháp kỹ thuật nâng cao vượt khung chương trình, làm điểm nhấn công nghệ cho bài bảo vệ đồ án CT449.

---

## 1. KIỂM THỬ BỘ ĐỆM REDIS CACHE (HIỆU NĂNG 1 - 2MS)

### 1.1. Đo lường Độ trễ Truy vấn (Latency Benchmark)

#### Kịch bản 1: Đo lường Cache Miss (Lần đọc đầu tiên)
1. Đảm bảo dịch vụ Redis Server đang chạy tại cổng `6379`.
2. Mở trình duyệt, bật Developer Tools bằng phím **F12**, chuyển sang tab **Network**.
3. Bấm tổ hợp phím **Ctrl + Shift + R** (Hard Reload) tại trang danh mục sách `http://localhost:5173/sach`.
4. Tìm đến request `GET /api/user/sach`:
   - **Cơ chế:** Dữ liệu chưa có trên RAM Redis $\rightarrow$ Backend phải kết nối và query MongoDB $\rightarrow$ Thực hiện `$lookup` join Nhà Xuất Bản $\rightarrow$ Lưu kết quả vào Redis với TTL (Time-To-Live).
   - **Thời gian phản hồi (Time):** Khoảng **35ms - 60ms**.
   - **Header kiểm tra:** Response trả về từ máy chủ MongoDB.

#### Kịch bản 2: Đo lường Cache Hit (Các lần đọc tiếp theo)
1. Nhấn phím **F5** để tải lại trang lần 2, lần 3, lần 4.
2. Tiếp tục quan sát request `GET /api/user/sach`:
   - **Cơ chế:** Backend tìm thấy key `cache:sach:all` trong RAM Redis $\rightarrow$ Phục vụ dữ liệu ngay lập tức mà không cần chạm vào ổ đĩa hay MongoDB server.
   - **Thời gian phản hồi (Time):** Giảm ngoạn mục xuống còn **1ms - 2ms** (Nhanh gấp **30 đến 50 lần**)!
   - **Kết quả:** Trải nghiệm người dùng tức thì, giảm tải 95% I/O cho CSDL chính.

---

### 1.2. Kiểm thử Tính Nhất Quán Dữ Liệu & Cache Invalidation

#### Mục tiêu:
Chứng minh khi dữ liệu trong CSDL thay đổi, hệ thống tự động xóa cache (Invalidate) để độc giả luôn nhìn thấy dữ liệu mới nhất, không bao giờ gặp lỗi dữ liệu cũ (Stale Data).

#### Các bước thực hiện:
1. Đang mở User Web ở trạng thái Cache Hit (danh sách sách đang hiển thị).
2. Mở tab Admin Web `http://localhost:5174/sach`:
   - Bấm Sửa một cuốn sách (ví dụ: đổi Tên sách thành *"Dế Mèn Phiêu Lưu Ký (Tái bản 2026)"*).
   - Bấm **"Lưu thay đổi"**.
   - **Cơ chế Backend:** Hàm `sachService.update()` thực hiện update MongoDB đồng thời gọi `redisClient.del("cache:sach:all")`.
3. Quay lại User Web, nhấn F5:
   - Request lần này là Cache Miss: Dữ liệu được query mới từ MongoDB $\rightarrow$ Tên sách *"Dế Mèn Phiêu Lưu Ký (Tái bản 2026)"* xuất hiện ngay lập tức.
   - Các lần F5 tiếp theo lại quay về Cache Hit 1-2ms.
   - **Đánh giá:** Tính nhất quán dữ liệu đạt chuẩn tuyệt đối!

---

### 1.3. Kiểm thử Khả năng Chịu Lỗi (Redis Fallback Resilient)

#### Mục tiêu:
Chứng minh nếu máy chủ Redis gặp sự cố hoặc bị tắt, hệ thống vẫn hoạt động bình thường nhờ cơ chế Fallback tự động, không gây sập ứng dụng (Graceful Degradation).

#### Các bước thực hiện:
1. Mở Task Manager hoặc cửa sổ CMD Redis Server $\rightarrow$ Đóng cửa sổ Redis Server (tắt port 6379).
2. Quay lại trình duyệt User Web hoặc Admin Web, bấm F5 tải lại danh sách sách.
3. **Quan sát Console Backend:**
   - Backend ghi log cảnh báo: `[Redis] Cannot connect - Fallback to direct MongoDB queries`.
4. **Quan sát Giao diện:**
   - Trang web vẫn tải sách bình thường từ MongoDB, không bị lỗi màn hình trắng hay treo ứng dụng.

---

## 2. KIỂM THỬ TÌM KIẾM BẰNG GIỌNG NÓI (VOICE SEARCH)

### Mục tiêu:
Kiểm chứng tính năng nhận diện giọng nói tiếng Việt thời gian thực thông qua Web Speech API (SpeechRecognition).

### Các bước thực hiện:
1. Mở User Web trên trình duyệt Google Chrome hoặc Microsoft Edge (các trình duyệt hỗ trợ Speech Recognition chuẩn).
2. Bấm vào icon **Micro** trên thanh tìm kiếm.
3. Cho phép quyền truy cập Microphone khi trình duyệt hỏi.
4. Phát âm các cụm từ tiếng Việt mẫu:
   - *"Lập trình"*
   - *"Đắc Nhân Tâm"*
   - *"Nguyễn Nhật Ánh"*
5. **Quan sát:**
   - Hệ thống tự động chuyển âm thanh thành văn bản hiển thị trên ô tìm kiếm.
   - Tự động kích hoạt hàm tìm kiếm và lọc danh sách sách tương ứng trên màn hình.

---

## 3. KIỂM THỬ XÁC THỰC GOOGLE OAUTH 2.0 & MOCK OAUTH

### 3.1. Kiểm thử Google OAuth 2.0 Thật (Online Mode)
1. Kết nối internet, bấm nút **"Đăng nhập với Google"**.
2. Trình duyệt chuyển hướng sang màn hình đồng thuận OAuth của Google (Project `ASALib`).
3. Đăng nhập bằng tài khoản Gmail kiểm thử (đã thêm vào Test Users trên Google Cloud Console).
4. Google xác thực thành công $\rightarrow$ Chuyển hướng về `/oauth-callback` $\rightarrow$ Backend tự động kiểm tra:
   - Nếu email chưa có trong `DOCGIA`: Tự động tạo bản ghi mới với mã độc giả ngẫu nhiên và ảnh đại diện từ Google.
   - Nếu đã có: Tự động đăng nhập và sinh JWT token.

### 3.2. Kiểm thử Google Mock OAuth (Offline Mode - Phục vụ thi và chấm điểm)
1. Tại màn hình `/login`, bấm nút: **"Google Sign-In (Mock)"**.
2. **Cơ chế:** Endpoint `/api/user/auth/mock-oauth` tự động cấp JWT token cho tài khoản độc giả Google mẫu (`google.mock@ct449.test`).
3. Độc giả đăng nhập thành công ngay lập tức mà không cần kết nối internet hay phụ thuộc vào máy chủ Google bên ngoài, đảm bảo buổi bảo vệ đồ án diễn ra an toàn 100%!
