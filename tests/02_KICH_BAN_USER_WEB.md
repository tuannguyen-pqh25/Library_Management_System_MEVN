# HƯỚNG DẪN KIỂM THỬ GIAO DIỆN ĐỘC GIẢ (USER WEB TEST GUIDE)

> **Cổng Độc giả:** `http://localhost:5173`  
> **Đối tượng người dùng:** Khách vãng lai (Chưa đăng nhập) & Độc giả thư viện (Đã đăng nhập)  
> **Kiến trúc:** Vue 3 (Composition API) + Bootstrap 5 + EventBus (mitt) + Native Fetch

---

## MỤC LỤC KỊCH BẢN KIỂM THỬ USER WEB

1. [Kịch bản 1: Trải Nghiệm Khách Vãng Lai & Tra Cứu Sách](#kịch-bản-1-trải-nghiệm-khách-vãng-lai--tra-cứu-sách)
2. [Kịch bản 2: Tìm Kiếm Bằng Giọng Nói Tiếng Việt (Voice Search Web Speech API)](#kịch-bản-2-tìm-kiếm-bằng-giọng-nói-tiếng-việt-voice-search-web-speech-api)
3. [Kịch bản 3: Đăng Ký Tài Khoản Độc Giả Mới (Form Validation)](#kịch-bản-3-đăng-ký-tài-khoản-độc-giả-mới-form-validation)
4. [Kịch bản 4: Đăng Nhập Tài Khoản & Google Mock OAuth](#kịch-bản-4-đăng-nhập-tài-khoản--google-mock-oauth)
5. [Kịch bản 5: Xem Chi Tiết Sách & Tên Nhà Xuất Bản Join](#kịch-bản-5-xem-chi-tiết-sách--tên-nhà-xuất-bản-join)
6. [Kịch bản 6: Sách Yêu Thích (Wishlist) & Viết Đánh Giá (Review 5 Sao)](#kịch-bản-6-sách-yêu-thích-wishlist--viết-đánh-giá-review-5-sao)
7. [Kịch bản 7: Tạo Phiếu Mượn Sách & Giới Hạn 10 Quyển](#kịch-bản-7-tạo-phiếu-mượn-sách--giới-hạn-10-quyển)
8. [Kịch bản 8: Chuông Thông Báo & Thuật Toán Deterministic ID](#kịch-bản-8-chuông-thông-báo--thuật-toán-deterministic-id)
9. [Kịch bản 9: Xin Gia Hạn Mượn Sách (+7/+14 Ngày & Ràng Buộc 3 Ngày)](#kịch-bản-9-xin-gia-hạn-mượn-sách-714-ngày--ràng-buộc-3-ngày)
10. [Kịch bản 10: Hẹn Trả Sách, Quản Lý Hồ Sơ & Router Guard](#kịch-bản-10-hẹn-trả-sách-quản-lý-hồ-sơ--router-guard)

---

## KỊCH BẢN 1: TRẢI NGHIỆM KHÁCH VÃNG LAI & TRA CỨU SÁCH

### Mục tiêu
Kiểm tra người dùng chưa đăng nhập vẫn có thể tra cứu sách tự do, xem danh sách, lọc và phân trang mượt mà mà không bị lỗi 401.

### Các bước thực hiện:
1. Mở trình duyệt ẩn danh (Incognito), truy cập: `http://localhost:5173`.
2. Quan sát trang chủ (`HomeUser.vue`):
   - Banner chào mừng thư viện nổi bật, các thẻ thống kê nhanh (Tổng đầu sách, Độc giả thân thiết, Sách mượn nhiều).
   - Phần "Sách Nổi Bật / Sách Mới" hiển thị đầy đủ hình ảnh bìa, tên sách, tác giả, giá trị sách và số lượng còn lại.
3. Bấm vào menu **"Danh mục Sách"** trên thanh Header (chuyển sang `/sach`):
   - Kiểm tra danh sách sách hiển thị dạng lưới thẻ (Grid Cards).
   - Kiểm tra bộ lọc bên trái: Chọn một Nhà Xuất Bản (ví dụ: *Nhà Xuất Bản Trẻ*) $\rightarrow$ Danh sách lập tức lọc đúng các sách thuộc NXB đó.
   - Nhập từ khóa tìm kiếm vào ô text (ví dụ: *"Lập trình"* hoặc *"Code"*) $\rightarrow$ Danh sách cập nhật ngay lập tức.
   - Kiểm tra thanh phân trang (Pagination) nếu số lượng sách vượt quá 8 cuốn/trang.

> **Kết quả mong đợi:** Khách vãng lai xem và lọc sách bình thường, không có bất kỳ thông báo lỗi 401 nào xuất hiện.

---

## KỊCH BẢN 2: TÌM KIẾM BẰNG GIỌNG NÓI TIẾNG VIỆT (VOICE SEARCH WEB SPEECH API)

### Mục tiêu
Kiểm tra tính năng tìm kiếm bằng giọng nói thời gian thực trực tiếp từ trình duyệt hỗ trợ trải nghiệm độc giả nhanh chóng và hiện đại.

### Các bước thực hiện Voice Search:
1. Tại ô tìm kiếm ở Header hoặc trang Sách, quan sát **icon Micro** màu xanh/xám.
2. Bấm vào icon Micro $\rightarrow$ Trình duyệt hiện thông báo xin quyền truy cập Microphone $\rightarrow$ Chọn **"Allow" (Cho phép)**.
3. Icon Micro nhấp nháy màu đỏ biểu thị đang lắng nghe.
4. Nói to rõ ràng bằng tiếng Việt: *"Tôi thấy hoa vàng"* hoặc *"Lập trình"*.
5. **Quan sát:** Web Speech API tự động chuyển giọng nói thành văn bản, tự điền vào ô tìm kiếm và kích hoạt tìm kiếm tức thì.
6. Kết quả lọc chính xác các đầu sách tương ứng hiển thị ngay trên màn hình.

---

## KỊCH BẢN 3: ĐĂNG KÝ TÀI KHOẢN ĐỘC GIẢ MỚI (FORM VALIDATION)

### Mục tiêu
Xác minh tính chặt chẽ của form đăng ký: Ràng buộc mật khẩu mạnh, chống trùng lặp email và tự động chuẩn hóa dữ liệu.

### Các bước thực hiện:
1. Bấm **"Đăng ký"** trên Header (chuyển sang `/register`).
2. **Kiểm tra Validation Mật khẩu yếu:**
   - Họ lót: `Trần Thị`, Tên: `Mai`
   - Email: `mai.tran@test.com`
   - Mật khẩu: `123456`
   - Quan sát: Báo lỗi đỏ dưới trường mật khẩu: *"Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"*. Nút Đăng ký bị vô hiệu hóa hoặc chặn submit.
3. **Kiểm tra Mật khẩu xác nhận không khớp:**
   - Mật khẩu: `MaiTran@2026`
   - Xác nhận mật khẩu: `MaiTran@9999`
   - Quan sát: Báo lỗi *"Mật khẩu xác nhận không trùng khớp"*.
4. **Kiểm tra nút Ẩn/Hiện Mật khẩu (👁):**
   - Bấm vào icon con mắt bên cạnh ô mật khẩu $\rightarrow$ Chuyển đổi giữa dạng chấm tròn (`type="password"`) và chữ hiển thị (`type="text"`).
5. **Thực hiện Đăng ký thành công:**
   - Nhập đầy đủ thông tin chuẩn xác:
     - Họ lót: `Nguyễn Văn`
     - Tên: `Bình`
     - Email: `binh.nguyen@test.com`
     - Điện thoại: `0912345678`
     - Mật khẩu: `Binh@123456`
     - Xác nhận MK: `Binh@123456`
   - Bấm **"Đăng ký tài khoản"**.
   - Quan sát Toast xanh hiện lên: *"Đăng ký tài khoản thành công! Vui lòng đăng nhập"*.
   - Hệ thống tự động chuyển hướng sang trang `/login`.

---

## KỊCH BẢN 4: ĐĂNG NHẬP TÀI KHOẢN & GOOGLE MOCK OAUTH

### Mục tiêu
Kiểm tra cơ chế xác thực JWT, cập nhật trạng thái Header tức thì bằng EventBus (không reload trang) và chế độ đăng nhập Google OAuth.

### Các bước thực hiện Đăng nhập thường:
1. Tại trang `/login`, nhập tài khoản vừa tạo:
   - Email: `binh.nguyen@test.com`
   - Mật khẩu: `Binh@123456`
2. Bấm **"Đăng nhập"**:
   - Toast thông báo: *"Đăng nhập thành công!"*.
   - Hệ thống lưu token vào `localStorage` (`aud: "user"`).
   - **Điểm sáng EventBus (mitt):** Thanh Header lập tức cập nhật Avatar và hiển thị tên *"Nguyễn Văn Bình"* cùng icon Chuông thông báo mà **hoàn toàn không cần nhấn F5 reload trình duyệt**.
   - Chuyển hướng người dùng về Trang chủ.

### Các bước thực hiện Đăng nhập Google Mock OAuth (Dành cho thi offline):
1. Bấm Đăng xuất tài khoản hiện tại.
2. Tại trang `/login`, quan sát nút: **"Đăng nhập với Google (Mock OAuth)"**.
3. Bấm nút Mock OAuth:
   - Không cần mở popup Google thật, hệ thống tự động sinh JWT cho tài khoản Google kiểm thử (`google.mock@ct449.test`).
   - Chuyển tiếp mượt mà qua trang `/oauth-callback` và vào thẳng trang chủ với tư cách độc giả đã xác thực.

---

## KỊCH BẢN 5: XEM CHI TIẾT SÁCH & TÊN NHÀ XUẤT BẢN JOIN

### Mục tiêu
Chứng minh kiến trúc **Chiến lược Hybrid Identifier** và Aggregation `$lookup` hiển thị Tên NXB rõ ràng.

### Các bước thực hiện:
1. Tại trang danh mục sách, bấm vào một cuốn sách bất kỳ (ví dụ: *Clean Code* hoặc *Dế Mèn Phiêu Lưu Ký*).
2. Kiểm tra đường dẫn URL: Trình duyệt chuyển sang `/sach/65...` sử dụng `_id` (BSON ObjectId) để truy vấn tối ưu.
3. Quan sát các trường thông tin trên màn hình:
   - Ảnh bìa sách chất lượng cao.
   - Tên sách, Tác giả, Năm xuất bản, Thể loại, Số trang, Ngôn ngữ.
   - **Trường Nhà Xuất Bản:** Hiển thị rõ tên đầy đủ: *"Nhà Xuất Bản Trẻ"* hoặc *"Nhà Xuất Bản Kim Đồng"* (Tuyệt đối không chỉ để mã thô `NXB01`).
   - Huy hiệu tình trạng: Badge xanh *"Còn sách trong kho (Số lượng: X)"* hoặc Badge đỏ *"Tạm thời hết sách"*.

---

## KỊCH BẢN 6: SÁCH YÊU THÍCH (WISHLIST) & VIẾT ĐÁNH GIÁ (REVIEW 5 SAO)

### Mục tiêu
Kiểm tra các tương tác gắn kết độc giả với thư viện.

### Các bước thực hiện Yêu thích sách (Wishlist):
1. Tại trang chi tiết sách, quan sát nút **"Thêm vào yêu thích"** (Icon Trái tim).
2. Bấm vào icon Trái tim:
   - Icon lập tức đổi sang màu đỏ rực rỡ, kèm hiệu ứng rung nhẹ.
   - Toast thông báo: *"Đã thêm vào danh sách yêu thích"*.
3. Bấm vào menu **"Yêu thích"** trên Header (chuyển sang `/yeuthich`):
   - Thấy ngay cuốn sách vừa thêm hiển thị trong danh mục.
4. Bấm icon Trái tim lần thứ hai (Toggle):
   - Sách được gỡ bỏ khỏi wishlist, Toast báo: *"Đã xóa khỏi danh sách yêu thích"*.

### Các bước thực hiện Viết Đánh giá & Nhận xét:
1. Tại trang chi tiết sách, cuộn xuống mục **"Đánh giá từ độc giả"**.
2. Chọn số sao đánh giá: Click vào ngôi sao thứ 5 (Đánh giá 5 sao).
3. Nhập nội dung nhận xét: *"Sách in đẹp, nội dung kinh điển rất đáng đọc để nâng cao tư duy code!"*.
4. Bấm **"Gửi đánh giá"**:
   - Đánh giá của bạn xuất hiện ngay đầu danh sách nhận xét kèm thời gian và tên độc giả.
   - Điểm đánh giá trung bình của cuốn sách lập tức được tính toán lại.

---

## KỊCH BẢN 7: TẠO PHIẾU MƯỢN SÁCH & GIỚI HẠN 10 QUYỂN

### Mục tiêu
Kiểm chứng luồng mượn sách, DatePicker hẹn ngày trả và cơ chế chặn vượt hạn mức 10 quyển.

### Các bước thực hiện Mượn sách:
1. Tại trang chi tiết một cuốn sách còn hàng, bấm nút lớn: **"Mượn sách này"**.
2. **Modal Xác Nhận Mượn Sách xuất hiện:**
   - Mục chọn số lượng: Chọn qua các pill-button (1, 2, 3...). Chọn: **1 quyển**.
   - Mục Ngày đến mượn: Mặc định là ngày hôm nay.
   - Mục Ngày hẹn trả: Hệ thống tự động gợi ý ngày hẹn trả sau **14 đến 20 ngày** (có DatePicker cho phép chỉnh sửa).
3. Bấm **"Xác nhận gửi yêu cầu"**:
   - Toast xanh thông báo: *"Gửi yêu cầu mượn sách thành công! Vui lòng chờ Thủ thư phê duyệt"*.
4. Chuyển sang trang **"Lịch sử mượn"** (`/lich-su`):
   - Phiếu mượn xuất hiện ở dòng đầu tiên với huy hiệu màu vàng: **`Chờ duyệt`**.
   - **Xác minh kho:** Quay lại trang chi tiết cuốn sách đó $\rightarrow$ **Số lượng sách trong kho VẪN GIỮ NGUYÊN** (Chưa bị trừ vì đang chờ duyệt).
5. **Kiểm tra Hủy yêu cầu khi Chờ duyệt:**
   - Tại dòng phiếu mượn chờ duyệt, bấm nút **"Hủy yêu cầu"**.
   - Hệ thống hiển thị hộp thoại xác nhận $\rightarrow$ Chọn "Đồng ý".
   - Phiếu mượn lập tức bị hủy, danh sách cập nhật sạch sẽ.

---

## KỊCH BẢN 8: CHUÔNG THÔNG BÁO & THUẬT TOÁN DETERMINISTIC ID

### Mục tiêu
Kiểm chứng tính ổn định của chuông thông báo In-App và xác nhận giải quyết triệt để lỗi F5 nhảy lại badge thông báo.

### Các bước thực hiện:
1. Độc giả tạo 1 phiếu mượn sách mới (trạng thái: Chờ duyệt).
2. Chuyển sang cửa sổ Admin Web bằng tài khoản Thủ thư mượn $\rightarrow$ Bấm **"Duyệt phiếu"**.
3. Quay lại cửa sổ User Web:
   - **Quan sát:** Icon **Chuông thông báo** trên Header lập tức rung lên và hiển thị chấm đỏ với Badge số `1`.
4. Bấm vào icon Chuông:
   - Dropdown thông báo trượt xuống: *"Yêu cầu mượn sách [Tên sách] của bạn đã được phê duyệt! Hãy đến thư viện nhận sách"*.
   - Badge đỏ biến mất do độc giả đã mở xem thông báo.
5. **BƯỚC KIỂM THỬ QUAN TRỌNG (NHẤN F5):**
   - Nhấn phím **F5** để tải lại toàn bộ trang web.
   - **Quan sát kết quả:** Chuông thông báo **VẪN Ở TRẠNG THÁI ĐÃ ĐỌC, KHÔNG BỊ NHẢY LẠI SỐ 1**.
   - *Giải thích kỹ thuật:* Hệ thống sử dụng thuật toán **Deterministic Notification ID** (`${loanId}_approved`) bất biến thay vì timestamp động ngẫu nhiên, giúp trạng thái đã đọc được lưu trữ bền vững.

---

## KỊCH BẢN 9: XIN GIA HẠN MƯỢN SÁCH (+7/+14 NGÀY & RÀNG BUỘC 3 NGÀY)

### Mục tiêu
Kiểm chứng nghiệp vụ xin gia hạn mượn sách trực tuyến của độc giả.

### Các bước thực hiện:
1. Tại trang `/lich-su`, tìm đến phiếu mượn có trạng thái **`Đang mượn`** (sách đã được thủ thư giao).
2. Tại cột Thao tác, bấm vào dropdown action $\rightarrow$ Chọn **"Xin gia hạn"**.
3. **Modal Gia Hạn Sách hiển thị:**
   - Hệ thống hiển thị ngày hẹn trả hiện tại.
   - Cho phép chọn thời gian gia hạn thêm: `+7 ngày` hoặc `+14 ngày`.
   - Lựa chọn: **+7 ngày**.
4. Bấm **"Gửi yêu cầu gia hạn"**:
   - Toast thông báo thành công.
   - Phiếu mượn chuyển trạng thái sang huy hiệu màu tím: **`Chờ gia hạn`**.
5. **Kiểm tra Ràng buộc Nghiệp vụ:**
   - Nếu sách đã quá hạn: Nút gia hạn bị khóa hoặc hiển thị cảnh báo đỏ *"Không thể gia hạn sách đã quá hạn"*.
   - Nếu phiếu mượn đã gia hạn đủ 2 lần: Hệ thống thông báo *"Đã hết số lần gia hạn cho phép (tối đa 2 lần)"*.

---

## KỊCH BẢN 10: HẸN TRẢ SÁCH, QUẢN LÝ HỒ SƠ & ROUTER GUARD

### Mục tiêu
Kiểm tra chức năng hẹn trả sách, chỉnh sửa thông tin cá nhân và tính bảo mật của Vue Router Navigation Guards.

### Các bước thực hiện Hẹn trả sách:
1. Tại trang `/lich-su`, với phiếu mượn đang mượn, chọn thao tác: **"Hẹn trả sách"**.
2. Nhập ngày dự kiến mang sách đến quầy thư viện (ví dụ: ngày mai) $\rightarrow$ Bấm Xác nhận.
3. Phiếu mượn ghi nhận thông tin hẹn trả giúp thủ thư dễ dàng theo dõi.

### Các bước thực hiện Quản lý Hồ sơ (`/profile`):
1. Bấm vào Avatar góc phải $\rightarrow$ Chọn **"Hồ sơ cá nhân"**.
2. Trang thông tin hiển thị: Mã độc giả, Họ tên, Email, Số điện thoại, Địa chỉ, Ngày tạo thẻ.
3. Thử đổi Số điện thoại và Địa chỉ mới $\rightarrow$ Bấm **"Lưu thay đổi"** $\rightarrow$ Toast báo cập nhật thành công.
4. Chuyển sang tab **"Đổi mật khẩu"**:
   - Nhập Mật khẩu cũ, Mật khẩu mới và Xác nhận mật khẩu mới.
   - Bấm Đổi mật khẩu $\rightarrow$ Đăng xuất và đăng nhập lại bằng mật khẩu mới để kiểm chứng.

### Các bước kiểm tra Vue Router Guard:
1. Đăng xuất tài khoản ra khỏi hệ thống.
2. Gõ trực tiếp trên thanh địa chỉ trình duyệt: `http://localhost:5173/lich-su` hoặc `http://localhost:5173/profile`.
3. **Quan sát:** Vue Router Guard phát hiện chưa có token hợp lệ $\rightarrow$ **Tự động chuyển hướng ngay lập tức về trang `/login`**, bảo vệ an toàn các tài nguyên cá nhân của độc giả.
