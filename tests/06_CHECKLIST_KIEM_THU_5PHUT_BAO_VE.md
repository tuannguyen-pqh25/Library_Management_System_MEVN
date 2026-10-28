# CHECKLIST KIỂM THỬ NHANH 5 PHÚT VÀNG TRƯỚC GIỜ BẢO VỆ ĐỒ ÁN

> **Thời điểm sử dụng:** 5 - 10 phút trước khi bước vào phòng hội đồng chấm thi hoặc trước khi bắt đầu bài thuyết trình Live Demo.  
> **Mục tiêu:** Rà soát toàn bộ các điểm chạm quan trọng, đảm bảo không có bất kỳ lỗi phát sinh bất ngờ nào trong quá trình trình diễn trước Giảng viên.

---

## 📋 BẢNG 10 BƯỚC RÀ SOÁT TỐC HÀNH

| Bước | Hạng mục kiểm tra | Thao tác thực hiện | Kết quả chuẩn | Đã kiểm tra |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Khởi động hệ thống** | Chạy file [start.bat](file:///d:/Project/CT449/Project/start.bat) | Đủ 4 cửa sổ cmd bật lên: Redis (6379), Backend (3000), User-Web (5173), Admin-Web (5174) | [ ] |
| **2** | **Kết nối CSDL & Redis** | Nhìn cửa sổ Backend console | Thấy dòng log: `Connected to MongoDB` và `Connected to Redis` (không báo lỗi đỏ) | [ ] |
| **3** | **Kiểm tra Voice Search** | Tại `localhost:5173`, bấm micro nói *"Lập trình"* | Nhận diện tiếng Việt chuẩn xác, tự động lọc danh sách sách tức thì | [ ] |
| **4** | **Kiểm tra Tên NXB Join** | Bấm vào xem chi tiết 1 cuốn sách bất kỳ | Mục "Nhà Xuất Bản" hiện tên đầy đủ (ví dụ: *NXB Trẻ*), **tuyệt đối không hiển thị mã thô `NXB01`** | [ ] |
| **5** | **Thử nghiệm Đăng nhập User** | Đăng nhập tài khoản độc giả hoặc bấm nút **Google Mock OAuth** | Header lập tức hiện tên độc giả (EventBus mitt); không cần bấm F5 | [ ] |
| **6** | **Tạo phiếu mượn sách** | Bấm mượn 1 cuốn sách (chọn ngày hẹn trả 14-20 ngày) | Phiếu xuất hiện tại `/lich-su` với trạng thái `Chờ duyệt` màu vàng; kho sách chưa bị trừ | [ ] |
| **7** | **Thủ thư Duyệt phiếu & Chuông** | Mở tab Admin `localhost:5174`, bấm Duyệt phiếu $\rightarrow$ Quay lại User Web xem chuông | Toast duyệt thành công; chuông bên User rung lên hiện số 1; **F5 trang chuông không bị nhảy lại** | [ ] |
| **8** | **Chuẩn bị kịch bản Overbooking** | Đảm bảo có 1 cuốn sách còn đúng 1 quyển để sẵn sàng biểu diễn nếu Thầy hỏi | Khi 2 user cùng mượn, duyệt người 1 thành công, duyệt người 2 ném lỗi 400 kho không đủ | [ ] |
| **9** | **Kiểm tra Dashboard Thống kê** | Đăng nhập tài khoản `ADMIN001` vào `/dashboard` | 4 thẻ KPI nhảy số đúng; 3 biểu đồ Chart.js vẽ đẹp mắt, không bị lỗi canvas rỗng | [ ] |
| **10** | **Mở sẵn F12 Network Tab** | Mở F12 tại User Web $\rightarrow$ Tab Network $\rightarrow$ Lọc Fetch/XHR $\rightarrow$ F5 | Thấy request `/api/user/sach` có thời gian phản hồi **1ms - 2ms** (Sẵn sàng phô diễn Redis) | [ ] |

---

## 💡 LỜI KHUYÊN TỪ SENIOR TRONG LÚC DEMO

1. **Chuẩn bị sẵn 2 cửa sổ trình duyệt song song:**
   - Nửa màn hình bên trái: **Cổng Độc giả (User Web)**
   - Nửa màn hình bên phải: **Cổng Thủ thư/Admin (Admin Web)**
   - *Lợi ích:* Giúp Giảng viên nhìn thấy ngay lập tức luồng dữ liệu thời gian thực: User tạo yêu cầu $\rightarrow$ Admin thấy ngay $\rightarrow$ Admin duyệt $\rightarrow$ User nhận chuông thông báo tức thì.
2. **Nếu hội đồng mất mạng Internet:**
   - Dùng nút **Google Mock OAuth** thay vì Google OAuth thật. Hệ thống hoàn toàn tự chủ offline.
3. **Luôn giữ tâm thế tự tin:**
   - Toàn bộ 11 giai đoạn nghiệp vụ đã được hoàn thiện 100%, mã nguồn sạch sẽ, xử lý ngoại lệ chu đáo và đã có sẵn kịch bản trả lời 15 câu hỏi phản biện chuyên sâu tại [presentation.md](file:///d:/Project/CT449/Project/Cores/presentation.md). Chúc bạn bảo vệ đạt điểm tuyệt đối 10/10!
