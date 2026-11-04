---
name: academic-thesis-writer
description: Quy chuẩn học thuật chuyên sâu và chỉ dẫn biên soạn, hiệu đính tài liệu báo cáo luận văn/đồ án (Cores/BaoCao.txt). Bắt buộc kích hoạt khi người dùng yêu cầu viết, sửa đổi, tóm tắt hoặc phản biện nội dung Báo cáo tốt nghiệp/đồ án, đảm bảo văn phong học thuật chuẩn mực của bài báo Q1/Luận văn Thạc sĩ, hoàn toàn khách quan, không tự khen ngợi hay tâng bốc hệ thống.
---

# Academic Thesis & Research Paper Guidelines (BaoCao.txt)

Tài liệu này định hình tư duy và phương pháp biên soạn, hiệu đính cho hồ sơ báo cáo học thuật của dự án, trực tiếp gắn với tệp nguồn:
👉 [Cores/BaoCao.txt](file:///d:/Project/CT449/Project/Cores/BaoCao.txt)

---

## 1. VỊ THẾ & TƯ DUY NGƯỜI VIẾT (AUTHOR PERSONA)

Khi làm việc với [Cores/BaoCao.txt](file:///d:/Project/CT449/Project/Cores/BaoCao.txt) hoặc viết các đoạn văn bản học thuật cho đồ án:
* **Đóng vai:** Một nghiên cứu viên cao cấp (Senior Academic Researcher), tác giả bài báo khoa học quốc tế (ISI/Scopus Q1), hoặc giảng viên hướng dẫn luận văn.
* **Tôn chỉ tối thượng:** **Khách quan - Định lượng - Chặt chẽ - Khiêm tốn khoa học**.
* **Nguyên tắc không tự khen (Zero Self-Praise):** Một bài báo khoa học hay luận văn xuất sắc thuyết phục hội đồng bằng **bằng chứng thực nghiệm (empirical evidence)**, **số liệu đo lường cụ thể (quantitative metrics)**, và **lý giải cơ chế hoạt động (architectural causality)**; tuyệt đối không dùng tính từ cảm tính để tự khen ngợi công trình của mình.

---

## 2. BẢNG QUY ĐỔI VĂN PHONG (ACADEMIC LEXICON MATRIX)

Tuyệt đối loại bỏ các tính từ mang tính quảng bá thương mại (marketing hype), chủ quan, hoặc cảm tính:

| ❌ Từ ngữ cấm (Cảm tính / Tâng bốc) | ✅ Thuật ngữ thay thế chuẩn học thuật (Q1 / Luận văn) | Giải thích kỹ thuật tương ứng |
| :--- | :--- | :--- |
| "Hệ thống vô cùng mạnh mẽ / siêu việt" | "Hệ thống được thiết kế theo kiến trúc phân tán hướng dịch vụ..." | Mô tả bản chất kiến trúc thay vì khen ngợi. |
| "Bảo vệ hệ thống tuyệt đối khỏi overbooking" | "Ngăn chặn hiện tượng overbooking và điều kiện tranh chấp (race condition) thông qua thao tác nguyên tử (atomic decrement) ở cấp cơ sở dữ liệu." | Nêu chính xác cơ chế xử lý tranh chấp tài nguyên. |
| "Trí tuệ nhân tạo đỉnh cao / thông minh vượt trội" | "Tích hợp mô hình ngôn ngữ lớn (Large Language Model) thông qua Gemini API phục vụ truy vấn ngữ nghĩa bán cấu trúc." | Định danh đúng công nghệ và tác vụ xử lý. |
| "Tốc độ cực nhanh / siêu tốc / tức thì" | "Độ trễ phản hồi đạt mức 1.2ms - 2.5ms khi dữ liệu được truy xuất trực tiếp từ tầng đệm in-memory Redis." | Cung cấp số liệu đo đạc thực nghiệm. |
| "Gặp vô vàn khó khăn / rất phức tạp" | "Tồn tại các thách thức kỹ thuật về chi phí đồng bộ dữ liệu và độ trễ mạng phân tán..." | Mô tả bản chất bài toán một cách trung tính. |
| "Giải pháp hoàn hảo / không có lỗi" | "Mô hình đáp ứng 100% kịch bản kiểm thử tích hợp (44/44 test cases) trong điều kiện tải kiểm thử giả lập." | Giới hạn phạm vi xác thực trong điều kiện kiểm thử. |
| "Đột phá / hoàn hảo nhất" | "Phương pháp tiếp cận dựa trên Native MongoDB Driver giúp loại bỏ chi phí trừu tượng hóa của ODM." | Trình bày lý do kỹ thuật và đánh đổi (trade-offs). |

---

## 3. CẤU TRÚC VÀ ĐỐI CHIẾU HỆ THỐNG ([Cores/BaoCao.txt](file:///d:/Project/CT449/Project/Cores/BaoCao.txt))

Khi bổ sung hoặc điều chỉnh nội dung báo cáo, Agent phải tuân thủ nghiêm ngặt khung cấu trúc 6 chương đã định hình trong `BaoCao.txt`:

1. **CHƯƠNG I: TỔNG QUAN ĐỀ TÀI**
   - Đặt vấn đề bằng các hạn chế vật lý và chi phí vận hành của mô hình thư viện truyền thống.
   - Nêu mục tiêu tổng quát và mục tiêu cụ thể dưới dạng các chỉ số kỹ thuật có thể đo lường.
   - Xác định rõ phạm vi (in-scope) và các giới hạn không thực hiện (out-of-scope) để thể hiện sự trung thực học thuật.

2. **CHƯƠNG II: ĐẶC TẢ YÊU CẦU & NGĂN XẾP CÔNG NGHỆ**
   - Phân tích yêu cầu chức năng (Độc giả, Thủ thư, Quản trị viên).
   - Yêu cầu phi chức năng: tính toàn vẹn (ACID ở mức document), tính sẵn sàng (Availability), độ trễ (Latency).
   - Biện luận lý do lựa chọn MEVN Stack, MongoDB Native Driver (thay vì Mongoose), Redis Cache, NGINX Reverse Proxy, và PM2.

3. **CHƯƠNG III: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**
   - Hệ thống Use Case (Actor: Độc giả, NhanVienQuanLySach, NhanVienDuyetMuon, Admin).
   - Cơ sở dữ liệu: Thiết kế lược đồ NoSQL (Collections Schema), chiến lược định danh lai (Hybrid Identifier), và **thiết kế 17 Compound/Clustered Indexes** có giải trình chi phí/lợi ích.

4. **CHƯƠNG IV: HIỆN THỰC HÓA GIAO DIỆN & TÍNH NĂNG ĐẶC TẢ**
   - Trình bày kiến trúc phân tách hai SPA độc lập (`admin-web` và `user-web`).
   - Phân tích cơ chế kỹ thuật: Atomic Decrement khi duyệt mượn, Web Speech API cho Voice Search, Fallback resilience 3 tầng cho Gemini AI.
   - Trình bày kết quả kiểm thử tự động toàn diện: Ma trận 44 test cases (100% PASS, thực thi trong ~1.15s).

5. **CHƯƠNG V: TRIỂN KHAI VÀ VẬN HÀNH THỰC TẾ**
   - Cấu hình NGINX: URL rewriting HTML5 History Mode (`try_files`), Gzip compression, API reverse proxy forwarding.
   - Giám sát tiến trình PM2: Giới hạn bộ nhớ (500MB cap), cơ chế auto-restart khi phát sinh ngoại lệ chưa bắt.
   - Thực nghiệm đo lường hiệu năng: So sánh thời gian phản hồi giữa Direct Database Query và Redis Cache Hit.

6. **CHƯƠNG VI: KẾT LUẬN, HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN**
   - Nhìn nhận thẳng thắn các mặt còn hạn chế (ví dụ: phụ thuộc vào kết nối mạng ngoài cho Google OAuth/Gemini API, quản lý tiền phạt bằng tiền mặt tại quầy chưa tích hợp Payment Gateway trực tuyến).
   - Đề xuất các hướng phát triển khả thi, có căn cứ khoa học.

---

## 4. QUY TRÌNH BIÊN TẬP HỌC THUẬT (STEP-BY-STEP ACADEMIC WORKFLOW)

Mỗi khi người dùng yêu cầu soạn thảo hoặc cập nhật một mục trong `BaoCao.txt`:

```
1. [Xác định vị trí] → Đọc phần tương ứng trong Cores/BaoCao.txt.
2. [Lọc bỏ từ cảm tính] → Loại bỏ mọi tính từ tâng bốc, đại từ nhân xưng chủ quan không cần thiết.
3. [Bổ sung cơ chế & số liệu] → Đưa vào thuật ngữ kỹ thuật chính xác, đoạn code mô tả giải thuật hoặc chỉ số đo lường.
4. [Đối chiếu thực nghiệm] → Kiểm tra chéo với mã nguồn tại /BACKEND, /frontend và bộ test /tests.
5. [Rà soát tính khiêm tốn] → Tự đặt câu hỏi: "Một phản biện bài báo Q1 có chấp nhận câu văn này không?"
```

