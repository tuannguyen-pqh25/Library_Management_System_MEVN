# CHIẾN LƯỢC XÂY DỰNG DỰ ÁN

> **Lưu ý cập nhật 2026-09-30:** Đây là tài liệu chiến lược lịch sử, có ví dụ Mongoose, tên field, hạn mức và kế hoạch cũ không còn phản ánh code hiện tại. Khi tiếp tục triển khai, đọc `Cores/checkpoint.md` và `Cores/next_step_guide.md` trước. Yêu cầu hiện hành: native `mongodb` driver + service layer, không Mongoose/models; giữ nguyên tên field/collection gốc, dùng `TenSach`/`DonGia` và `ChucVu` trong service/controller hiện có; hạn mức tổng 10 quyển/độc giả. Không làm theo các đoạn Mongoose hoặc lộ trình 5 quyển còn ở dưới.

## Hệ thống Quản lý Mượn Sách Online (MEVN Stack) — Học phần CT449

---

## 🤖 PROMPT DÀNH CHO AI (Dùng cho phiên làm việc mới)

> **Hướng dẫn cho bạn:** Bất cứ khi nào bạn mở một phiên chat mới với AI (Claude, ChatGPT, Gemini, v.v.), hãy copy nội dung trong khối code bên dưới và gửi cho AI. Điều này giúp AI ngay lập tức nắm bắt toàn bộ ngữ cảnh, nguyên tắc code và không làm sai lệch kiến trúc.

```text
Đóng vai là một Senior Full-Stack Developer (MEVN Stack). Chúng ta đang xây dựng dự án Quản Lý Mượn Sách (Học phần CT449).

[YÊU CẦU CỐT LÕI - TUYỆT ĐỐI KHÔNG ĐƯỢC VI PHẠM]
1. Tech stack: MongoDB, Express.js, Vue 3 (Composition API), Node.js.
2. Kiến trúc: 1 Backend API dùng chung, 2 Frontend độc lập (đặt trong thư mục `frontend/user-web` và `frontend/admin-web`).
3. Cơ sở dữ liệu: Giữ nguyên 100% tên bảng và tên thuộc tính của 5 bảng gốc (DocGia, Sach, NhaXuatBan, TheoDoiMuonSach, NhanVien). Chỉ được phép thêm field mới, KHÔNG sửa/xóa field cũ dù là nhỏ nhất.
4. Giao diện: Dùng Vue 3 làm core logic, Bootstrap 5 dùng phụ trợ layout/grid. TUYỆT ĐỐI KHÔNG DÙNG TAILWIND. Đọc chiến lược UI tại `frontend/UI_Migration_Strategy.md`.
5. Code mẫu: Tham khảo cách viết logic tại "D:\Phát Triển Ứng Dụng Web\Tham khảo\B2303836_LamKhanhNha_QuanLyMuonSach" (đặc biệt pattern Controller -> Service -> Model và logic quản lý kho sách).

[HÀNH ĐỘNG ĐẦU TIÊN CỦA BẠN]
1. Đọc (view_file) các file tài liệu sau: `Cores/Chienluoc.md`, `Cores/next_step_guide.md`, `Cores/checkpoint.md` và `frontend/UI_Migration_Strategy.md`.
2. Kiểm tra source code hiện tại để xác định chúng ta đã hoàn thành đến Giai đoạn nào trong `next_step_guide.md` (hoặc xem tóm tắt trong `checkpoint.md`).
3. Bắt đầu thực hiện bước đầu tiên của Giai đoạn TIẾP THEO chưa hoàn thành. Luôn code theo từng phần nhỏ, chạy thử ổn định rồi mới code tiếp.
```

---

## 0. Tóm tắt điều hành

Dự án xây dựng **hệ thống quản lý mượn sách trực tuyến** gồm hai ứng dụng frontend tách biệt (Admin Portal và User Portal) dùng chung một backend API, triển khai theo stack **MongoDB – Express.js – Vue.js – Node.js (MEVN)**. Hệ thống đáp ứng đầy đủ yêu cầu tối thiểu của đề bài (đăng ký/đăng nhập, mượn sách, tra cứu, lịch sử; quản lý sách, quản lý mượn/trả, phân quyền nhiều cấp) và bổ sung các chức năng nâng cao: xử lý sách mất/quá hạn, giới hạn số sách mượn đồng thời, gia hạn mượn có lý do, dashboard thống kê, bảo mật bằng JWT + tùy chọn OAuth 2.0.

Nguyên tắc xuyên suốt: **giữ nguyên 100% tên bảng và tên thuộc tính đã cho** trong lược đồ `QuanLyMuonSach`; mọi mở rộng đều là **bảng mới** hoặc **thuộc tính bổ sung** (không sửa/xóa thuộc tính gốc), được đánh dấu rõ ràng là "phần mở rộng — có thể triển khai sau".

## 0.1. Trạng thái thực tế mới nhất (2026-10-28)

Tính đến thời điểm hiện tại, toàn bộ 11 giai đoạn phát triển đã hoàn thành 100%:

- **Giai đoạn 1–10:** Hoàn thành toàn diện các phân hệ: Xác thực đa tầng (JWT + Passport OAuth 2.0 Google với project `ASALib`), CRUD Sách/NXB/Độc giả/Nhân viên, Nghiệp vụ Mượn - Trả đa trạng thái (Lazy-check quá hạn, chống Overbooking, hạn mức 10 quyển), Phân quyền RBAC 3 vai trò, Dashboard Chart.js, Redis Caching tốc độ cao (1-2ms), và Voice Search Web Speech API. Tích hợp Chuông thông báo In-App Notification Bell (Deterministic ID), Action Dropdowns ngữ cảnh và 17 Unique/Compound Indexes MongoDB.
- **Hoàn thiện Nghiệp vụ Nâng cao (2026-10-24):**
  - **Quy trình Gia hạn Mượn Sách (Book Renewal):** Độc giả có thể xin gia hạn trước hạn trả ít nhất 3 ngày (tối đa 2 lần, +7 hoặc +14 ngày kèm lý do). Trạng thái chuyển sang "Chờ gia hạn" và phải được Thủ thư thẩm định phê duyệt hoặc từ chối có lý do.
  - **Trải nghiệm Tra cứu NXB:** Tự động lookup/mapping để hiển thị trực quan Tên Nhà Xuất Bản (`TenNXB`) thay cho mã số kỹ thuật trên mọi màn hình chi tiết.
  - **Khắc phục Triệt để Badge Thông báo:** Áp dụng Deterministic Notification ID và bộ lọc tiền tố `isNotifRead` tại `localStorage` độc giả, giải quyết dứt điểm lỗi thông báo đã đọc bị nhảy số trở lại khi F5 refresh trang.
- **Giai đoạn 11 (Deploy & DevOps):** Hoàn tất toàn bộ cấu hình máy chủ Production theo giáo trình:
  - Máy chủ Web NGINX (Port 80 cho User Web, Port 8080 cho Admin Web, Reverse Proxy `/api/` và `/uploads/` về Node.js Port 3000, hỗ trợ Vue Router HTML5 History Mode và Gzip).
  - Quản lý tiến trình Backend Node.js qua PM2 (`ecosystem.config.js`).
  - Đóng gói Production (`.env.production`, `npm run build` thành công xuất sắc cho cả 2 Frontend).
- **Giai đoạn Đảm bảo Chất lượng & Kiểm thử Tự động (2026-10-28):**
  - **Gỡ bỏ hoàn toàn Chatbot AI:** Tinh gọn mã nguồn frontend và backend, loại bỏ sự phụ thuộc không ổn định vào bên thứ ba.
  - **Bộ kiểm thử tự động toàn diện (`tests/`):** Xây dựng 6 tài liệu đặc tả chuẩn hóa (`01` đến `06`), Postman Collection v2.1 (40+ endpoints) và script Node.js liên hoàn `tests/run-api-tests.js`.
  - **Kết quả thực nghiệm:** Đạt **44/44 PASS (100.0%)** chỉ trong **1.15 giây**, kiểm chứng tự động toàn bộ 9 nhóm nghiệp vụ (RBAC 3 cấp, Overbooking nguyên tử, Mượn/Gia hạn/Trả sách, Ràng buộc đánh giá, Khóa độc giả).
  - **Tối ưu vận hành:** Cung cấp file batch 1-click `tests/run-tests.bat` và ánh xạ lệnh `npm test` trong `BACKEND/package.json`.
- **Kế hoạch tiếp theo:** Chuẩn bị kịch bản bảo vệ đồ án (Defense Script), Slide thuyết trình và Bộ câu hỏi phản biện của Giảng viên.

> Lưu ý cho các phiên làm việc tiếp theo: Toàn bộ tính năng, kiểm thử tự động và cấu hình triển khai đã hoàn tất 100%. Không tự ý thêm tính năng nghiệp vụ mới. Chỉ tập trung hỗ trợ chuẩn bị bảo vệ đồ án và giải đáp kỹ thuật.

---

## 1. Mục tiêu & Phạm vi

### 1.1. Mục tiêu

- Xây dựng ứng dụng web quản lý mượn sách hoàn chỉnh, chạy được, có thể demo trực tiếp cho giảng viên.
- Thỏa 100% yêu cầu tối thiểu trước, sau đó mới đầu tư cho chức năng nâng cao.
- Đảm bảo tách bạch rõ ràng giữa cổng Admin và cổng User để tránh rủi ro bảo mật (dò tài khoản, brute-force, lộ route quản trị).
- Trình bày báo cáo/slide chuyên nghiệp, có sơ đồ kiến trúc, sơ đồ CSDL, luồng nghiệp vụ, demo mượt.

### 1.2. Phạm vi

- **Trong phạm vi:** toàn bộ 4 nhóm chức năng tối thiểu (đăng nhập/đăng ký, nghiệp vụ mượn sách, quản trị sách, quản trị mượn/trả, phân quyền), tối thiểu 3 chức năng nâng cao (giới hạn mượn, xử lý vi phạm, dashboard).
- **Có thể mở rộng nếu còn thời gian:** OAuth2 đăng nhập Google, gia hạn sách, đánh giá sách, thông báo, tìm kiếm nâng cao, export báo cáo PDF/Excel.
- **Ngoài phạm vi (không bắt buộc):** thanh toán tiền phạt online, app mobile riêng, real-time chat.

---

## 2. Kiến trúc tổng quan

### 2.1. Nguyên tắc tách Admin – User

Theo yêu cầu của giảng viên, **web Admin và web User phải là hai ứng dụng frontend độc lập**, không dùng chung domain/subdomain lộ liễu để tránh việc người dùng thường dò ra được đường link/API dành cho quản trị.

```
                         ┌─────────────────────────┐
                         │      MongoDB Atlas /      │
                         │      MongoDB local        │
                         └────────────▲───────────────┘
                                      │ Mongoose ODM
                         ┌────────────┴───────────────┐
                         │   Node.js + Express.js API   │
                         │        (1 backend duy nhất)  │
                         │  /api/user/...  /api/admin/..│
                         └──────┬─────────────┬────────┘
                                │ JWT (aud=user)│ JWT (aud=admin)
                     ┌──────────┴───┐     ┌─────┴──────────┐
                     │  User Web    │     │  Admin Web      │
                     │  (Vue 3 SPA) │     │  (Vue 3 SPA)    │
                     │ user.domain  │     │ admin.domain    │
                     │  hoặc :5173  │     │  hoặc :5174     │
                     └──────────────┘     └─────────────────┘
```

**Quyết định kiến trúc:**
| Khía cạnh | Lựa chọn | Lý do |
|---|---|---|
| Số backend | 1 backend duy nhất, chia namespace `/api/user/*` và `/api/admin/*` | Dễ bảo trì, tái sử dụng model/DB, vẫn tách được middleware phân quyền riêng cho từng namespace |
| Số frontend | 2 project Vue riêng biệt (`user-web`, `admin-web`) | Build ra 2 bundle JS khác nhau, khác domain/cổng, khác giao diện, không lộ route admin trong bundle của user |
| Triển khai | 2 subdomain khác nhau: `muonsach.example.com` (user) và `quantri-noidung-khac.example.com` (admin, đặt tên không đoán được) | Giảm khả năng bị dò URL quản trị; có thể thêm giới hạn IP/2FA cho domain admin |
| JWT | Access token ngắn hạn (15 phút) + Refresh token (7 ngày, HttpOnly cookie), có trường `aud` (audience) phân biệt token user/admin | Token của user dùng cho `/api/admin/*` sẽ bị middleware từ chối dù có bị lộ |
| CORS | Whitelist chính xác 2 origin (user-web, admin-web), không dùng `*` | Ngăn ứng dụng lạ gọi thẳng API |
| Rate limiting | `express-rate-limit` riêng cho `/api/*/auth/login`, đặc biệt chặt hơn ở admin | Chống brute-force dò mật khẩu |

### 2.2. Vì sao 1 backend nhưng vẫn "tách biệt" đủ an toàn?

Tách hoàn toàn 2 backend là dư thừa cho phạm vi môn học (2 codebase Express, 2 kết nối DB, khó đồng bộ). Thay vào đó ta tách về **domain, token, middleware, và code base frontend**, đó là các lớp phòng thủ quan trọng nhất theo góc nhìn bảo mật thực tế:

1. Không có bundle JS admin nào được gửi tới trình duyệt của user (Vue build riêng).
2. Không đoán được URL cổng admin nếu đặt tên ẩn (security through obscurity + có thể bổ sung xác thực IP/2FA sau).
3. Token của bên này không dùng được ở bên kia (audience check).
4. Toàn bộ route `/api/admin/*` bắt buộc `requireRole(['Admin','NhanVienQuanLySach','NhanVienDuyetMuon'])`.

_(Nếu thầy yêu cầu nghiêm ngặt "khác tên miền" ở mức hạ tầng, có thể dễ dàng tách thành 2 process Express từ cùng codebase bằng cách chỉ mount router tương ứng — kiến trúc namespace ở trên cho phép làm điều này chỉ với vài dòng thay đổi.)_

---

## 3. Công nghệ sử dụng

| Lớp        | Công nghệ                                                                                                             | Ghi chú                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| CSDL       | MongoDB (mongodb driver thuần)                                                                                        | Bắt buộc theo đề                                                           |
| Backend    | Node.js + Express.js                                                                                                  | Bắt buộc theo đề                                                           |
| Frontend   | Vue 3 (Composition API) + Vue Router + Pinia                                                                          | Vue là chính; Bootstrap 5 chỉ hỗ trợ layout/grid, không thay thế logic Vue |
| UI hỗ trợ  | Bootstrap 5 (hoặc Bootstrap-Vue-Next)                                                                                 | Chỉ dùng CSS/grid, component tương tác vẫn viết bằng Vue                   |
| Xác thực   | JWT (access + refresh token), bcrypt hash mật khẩu                                                                    | Chi tiết ở mục 8                                                           |
| Validate   | Joi hoặc express-validator (backend), VeeValidate (frontend)                                                          | Ràng buộc dữ liệu                                                          |
| Khác       | Multer (upload ảnh bìa sách), node-cron (job tự động đánh dấu quá hạn), Axios (gọi API), dotenv, morgan/winston (log) |                                                                            |
| Testing    | Postman/Thunder Client cho API; Vitest cho unit test Vue (tùy thời gian)                                              |                                                                            |
| Triển khai | Render/Railway (backend), Vercel/Netlify (2 frontend), MongoDB Atlas (DB)                                             | Miễn phí, đủ cho demo                                                      |

---

## 4. Thiết kế cơ sở dữ liệu

### 4.1. Nguyên tắc bắt buộc

- Giữ **nguyên văn** 5 bảng và toàn bộ thuộc tính gốc đã cho trong đề (không đổi tên bảng, không đổi tên cột).
- Vì dùng MongoDB (NoSQL) nhưng lược đồ gốc là quan hệ, ta ánh xạ: **mỗi bảng → 1 collection**, mỗi **khóa chính `Ma...`** vẫn được lưu là một trường **mã nghiệp vụ** (business key, kiểu String, `unique: true`, có thể tự sinh hoặc do người dùng nhập tùy bảng), song song với `_id` (ObjectId) mặc định của Mongo dùng cho quan hệ nội bộ (`ref`).
- **Lưu ý kỹ thuật:** thuộc tính `NguonGoc/TacGia` của bảng `Sach` chứa ký tự `/` — MongoDB/Mongoose **không cho phép ký tự `/` trong tên field**. Ta lưu field với tên `NguonGoc_TacGia` trong schema nhưng **giữ nguyên ngữ nghĩa và nhãn hiển thị "Nguồn gốc/Tác giả"** trên giao diện và tài liệu báo cáo — đây là điều chỉnh kỹ thuật bắt buộc, không phải đổi tên thuộc tính nghiệp vụ.

### 4.2. 5 bảng bắt buộc (giữ nguyên theo đề)

**`DocGia`** — độc giả
| Field | Kiểu | Ghi chú |
|---|---|---|
| MaDocGia | String, unique, PK nghiệp vụ | |
| HoLot | String | |
| Ten | String | |
| NgaySinh | Date | |
| Phai | String (enum: "Nam", "Nữ", "Khác") | |
| DiaChi | String | |
| DienThoai | String | |

**`Sach`** — sách
| Field | Kiểu | Ghi chú |
|---|---|---|
| MaSach | String, unique, PK nghiệp vụ | |
| TenSach | String | |
| DonGia | Number | |
| SoQuyen | Number | tổng số quyển đang sở hữu |
| NamXuatBan | Number | |
| MaNXB | ObjectId ref `NhaXuatBan` (kèm giữ field mã `MaNXB` dạng String để tra cứu) | |
| NguonGoc_TacGia | String | ánh xạ kỹ thuật của `NguonGoc/TacGia` (xem 4.1) |

**`NhaXuatBan`** — nhà xuất bản
| Field | Kiểu |
|---|---|
| MaNXB | String, unique, PK nghiệp vụ |
| TenNXB | String |
| DiaChi | String |

**`TheoDoiMuonSach`** — theo dõi mượn/trả (bảng trung tâm nghiệp vụ)
| Field | Kiểu | Ghi chú |
|---|---|---|
| MaDocGia | String | FK `DocGia` |
| MaSach | String | FK `Sach` |
| NgayMuon | Date | PK |
| NgayTra | Date, nullable | null nghĩa là chưa trả |

**`NhanVien`** — nhân viên/quản trị
| Field | Kiểu | Ghi chú |
|---|---|---|
| MSNV | String, unique, PK nghiệp vụ | |
| HoTenNV | String | |
| Password | String | **hash bcrypt**, không lưu plaintext |
| Chucvu | String enum | dùng làm **vai trò phân quyền**: `"Admin"`, `"NhanVienQuanLySach"`, `"NhanVienDuyetMuon"` |
| Diachi | String | |
| SoDienThoai | String | |

> `Chucvu` chính là cơ chế phân quyền yêu cầu ở mục 6 — không cần thêm bảng `PhanQuyen` riêng vì đề đã có sẵn field phù hợp; ta chỉ định nghĩa rõ **giá trị enum** và **ma trận quyền** tương ứng ở middleware.

### 4.3. Đề xuất mở rộng CSDL (triển khai sau, không bắt buộc ngay)

| Bảng mới                                                                                   | Mục đích                                                                 | Ưu tiên                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------- |
| `TheLoai (MaTheLoai, TenTheLoai)` + thêm field `MaTheLoai` (ref) vào `Sach`                | Phân loại sách, hỗ trợ tìm kiếm/lọc                                      | Trung bình                       |
| `YeuCauGiaHan (MaYeuCau, MaDocGia, MaSach, NgayYeuCau, LyDo, TrangThai)`                   | Độc giả gửi yêu cầu gia hạn kèm lý do trước khi bị xử lý quá hạn         | Cao (gắn với chức năng nâng cao) |
| `ViPham / BlackList (MaViPham, MaDocGia, LoaiViPham, MoTa, NgayGhiNhan, TrangThai, MucDo)` | Ghi nhận trễ hạn/mất sách, dùng để khóa tài khoản mượn                   | Cao                              |
| `ThongBao (MaThongBao, MaDocGia, NoiDung, NgayTao, DaDoc)`                                 | Nhắc hạn trả, thông báo duyệt mượn                                       | Thấp                             |
| `DanhGia (MaDanhGia, MaDocGia, MaSach, SoSao, NoiDung, NgayDanhGia)`                       | Đánh giá/nhận xét sách (tăng tính hoàn thiện sản phẩm)                   | Thấp                             |
| `CauHinhHeThong (Key, Value)`                                                              | Cấu hình động: số sách mượn tối đa, số ngày mượn mặc định, mức phạt/ngày | Trung bình                       |

**Đề xuất bổ sung thuộc tính vào bảng có sẵn (không đổi tên field gốc, chỉ thêm mới):**

- `Sach`: thêm `SoQuyenConLai` (Number) — số quyển còn có thể cho mượn, cập nhật mỗi khi mượn/trả; thêm `AnhBia` (String URL).
- `TheoDoiMuonSach`: thêm `NgayHenTra` (Date, = NgayMuon + N ngày, mặc định 14 ngày), `TrangThai` (enum: `"ChoDuyet" | "DangMuon" | "DaTra" | "QuaHan" | "Mat"`), `SoLanGiaHan` (Number, default 0), `GhiChu` (String).
- `DocGia`: thêm `Email`, `MatKhau` (hash), `TrangThaiTaiKhoan` (enum: `"BinhThuong" | "BiKhoa"`) để phục vụ đăng nhập user (bảng gốc đề chưa có tài khoản đăng nhập cho độc giả — bắt buộc phải bổ sung vì đề yêu cầu "user đăng ký/đăng nhập" mà không có sẵn field này).

> Ghi chú quan trọng để giải trình trong báo cáo: đề gốc không có field đăng nhập cho `DocGia`, nhưng yêu cầu chức năng "đăng ký/đăng nhập" của user. Do đó việc thêm `Email`/`MatKhau`/`TrangThaiTaiKhoan` vào `DocGia` là **bắt buộc phải có**, không thuộc diện "tùy chọn" — cần nêu rõ trong slide bảo vệ để tránh bị hỏi khó.

---

## 5. Kiến trúc thư mục dự án

```
QuanLyMuonSach/
├── backend/
│   ├── app/
│   │   ├── config/          (index.js)
│   │   ├── middlewares/     (auth.js, requireRole.js, errorHandler.js)
│   │   ├── controllers/
│   │   │   ├── user/
│   │   │   └── admin/
│   │   ├── routes/
│   │   │   ├── user.routes.js
│   │   │   └── admin.routes.js
│   │   ├── services/        (docgia.service.js, sach.service.js, nhaxuatban.service.js, theodoimuonsach.service.js, nhanvien.service.js)
│   │   ├── utils/           (mongodb.util.js)
│   │   └── api-error.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── user-web/        (Vue 3 SPA riêng cho độc giả)
│   │   └── src/{views,components,stores,router,services}
│   └── admin-web/       (Vue 3 SPA riêng cho quản trị)
│       └── src/{views,components,stores,router,services}
└── docs/
    ├── Chienluoc.md
    ├── ERD.png
    └── slide-baocao.pptx
```

---

## 6. Phân quyền & Vai trò

| Vai trò (`Chucvu`)     | Quyền hạn                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**              | Toàn quyền: quản lý sách, quản lý NXB, quản lý mượn/trả, quản lý nhân viên (tạo/khóa tài khoản NV), xem toàn bộ dashboard, cấu hình hệ thống       |
| **NhanVienQuanLySach** | Chỉ CRUD `Sach`, `NhaXuatBan`, `TheLoai`; **không** được duyệt/xử lý mượn sách, không quản lý nhân viên                                            |
| **NhanVienDuyetMuon**  | Chỉ xử lý nghiệp vụ `TheoDoiMuonSach` (duyệt yêu cầu mượn, xác nhận trả, xử lý quá hạn/mất sách, duyệt gia hạn); **không** được sửa thông tin sách |
| **DocGia (User)**      | Xem sách, gửi yêu cầu mượn, xem lịch sử mượn của chính mình, gửi yêu cầu gia hạn                                                                   |

Triển khai: middleware `requireRole(['Admin'])` hoặc `requireRole(['Admin','NhanVienQuanLySach'])` áp cho từng route admin cụ thể; middleware `authUser` riêng cho namespace `/api/user`.

---

## 7. Chức năng chi tiết

### 7.1. User (Độc giả) — tối thiểu bắt buộc

- [ ] Đăng ký tài khoản (tạo bản ghi `DocGia` mới kèm `Email`/`MatKhau` hash)
- [ ] Đăng nhập (JWT access + refresh)
- [ ] Xem danh sách sách (tìm kiếm theo tên, lọc theo thể loại/NXB, phân trang)
- [ ] Xem chi tiết sách (còn bao nhiêu quyển)
- [ ] Gửi yêu cầu mượn sách (tạo bản ghi `TheoDoiMuonSach`, `TrangThai = "ChoDuyet"`)
- [ ] Xem lịch sử mượn sách của bản thân (đang mượn / đã trả / quá hạn)
- [ ] Cập nhật hồ sơ cá nhân, đổi mật khẩu

### 7.2. Admin/Nhân viên — tối thiểu bắt buộc

- [ ] Đăng nhập riêng (namespace `/api/admin/auth`)
- [ ] Quản lý sách: thêm/sửa/xóa `Sach`, `NhaXuatBan`, cập nhật số lượng tồn
- [ ] Quản lý mượn sách: xem toàn bộ yêu cầu, lọc theo trạng thái
- [ ] Xử lý mượn sách: duyệt/từ chối yêu cầu mượn, xác nhận trả sách (cập nhật `NgayTra`, cộng lại `SoQuyenConLai`)
- [ ] Quản lý phân quyền: Admin tạo/sửa/khóa tài khoản `NhanVien`, gán `Chucvu`

### 7.3. Chức năng nâng cao (đề xuất triển khai theo thứ tự ưu tiên)

**Ưu tiên 1 — Giới hạn số sách mượn đồng thời**

- Cấu hình `SoLuongMuonToiDa` (mặc định 5, tối đa 10, có thể để Admin chỉnh trong `CauHinhHeThong`).
- Trước khi tạo yêu cầu mượn mới, backend đếm số bản ghi `TheoDoiMuonSach` của độc giả có `TrangThai` ∈ {`DangMuon`, `ChoDuyet`, `QuaHan`}; nếu ≥ giới hạn → từ chối, trả lỗi rõ ràng cho frontend hiển thị.

**Ưu tiên 2 — Xử lý quá hạn / mất sách**

- `node-cron` chạy mỗi ngày lúc 00:05: quét `TheoDoiMuonSach` có `NgayHenTra < hôm nay` và `TrangThai = "DangMuon"` → chuyển `TrangThai = "QuaHan"`.
- Nếu quá hạn **> 7 ngày** mà độc giả **không gửi `YeuCauGiaHan`** → tự động tạo bản ghi `ViPham` (loại "QuaHan"), cộng điểm vi phạm.
- Độc giả có thể tự báo **mất sách** qua giao diện (tạo `TrangThai = "Mat"` + lý do) → Nhân viên duyệt mượn xử lý (tính phí đền bù = `DonGia × hệ số`, ghi nhận `ViPham`).
- Quy tắc khóa tài khoản (đề xuất, có thể chỉnh số liệu):
  - Vi phạm lần 1–2: cảnh cáo, ghi nhận lịch sử.
  - Vi phạm lần 3: tạm khóa quyền mượn 30 ngày (`TrangThaiTaiKhoan = "BiKhoa"` có thời hạn).
  - Vi phạm ≥ 4 lần hoặc có 1 lần "Mất sách nghiêm trọng": khóa vĩnh viễn, cần Admin mở khóa thủ công.

**Ưu tiên 3 — Gia hạn mượn sách**

- Độc giả gửi `YeuCauGiaHan` kèm lý do **trước khi** hết hạn hoặc trong vòng 7 ngày quá hạn.
- Nhân viên duyệt mượn duyệt/từ chối; nếu duyệt → cộng thêm N ngày vào `NgayHenTra`, tăng `SoLanGiaHan` (giới hạn tối đa 1–2 lần/sách để tránh lạm dụng).

**Ưu tiên 4 — Dashboard & Thống kê**

- Số liệu tổng quan: tổng số sách, tổng độc giả, số đang mượn, số quá hạn hôm nay.
- Biểu đồ: top 10 sách được mượn nhiều nhất (theo tháng/quý), biểu đồ mượn/trả theo thời gian, tỉ lệ quá hạn/vi phạm theo tháng.
- Gợi ý thư viện: Chart.js hoặc ApexCharts (tích hợp Vue dễ dàng qua `vue-chartjs`).

**Ưu tiên 5 (tùy chọn nếu còn thời gian) — Đăng nhập Google (OAuth 2.0)** — xem mục 8.2.

---

## 8. Xác thực & Bảo mật (JWT và OAuth 2.0)

### 8.1. JWT — cơ chế chính, bắt buộc triển khai

- **Access Token**: thời hạn ngắn (10–15 phút), chứa payload tối thiểu (`sub` = id, `role`, `aud` = `"user"` hoặc `"admin"`), ký bằng `JWT_SECRET` (nên tách 2 secret khác nhau cho user/admin để tăng cách ly).
- **Refresh Token**: thời hạn dài (7 ngày), lưu dưới dạng **HttpOnly, Secure, SameSite=Strict cookie** (không lưu localStorage để tránh XSS đánh cắp token), có endpoint `/refresh` để cấp access token mới.
- **Logout**: xóa cookie refresh token phía client + (tùy chọn nâng cao) lưu danh sách token bị thu hồi (blacklist) trong Redis/Mongo nếu cần thu hồi tức thời.
- **Middleware kiểm tra `aud`**: token có `aud: "user"` gọi vào route `/api/admin/*` sẽ bị từ chối 403 ngay cả khi hợp lệ về chữ ký — đây là lớp phòng thủ cách ly Admin/User ở tầng token, bổ sung cho việc tách frontend.
- Mật khẩu: **bcrypt** với salt rounds ≥ 10, không bao giờ trả `Password`/`MatKhau` về client (dùng `.select('-Password')` trong Mongoose).

### 8.2. OAuth 2.0 — đề xuất mở rộng (không bắt buộc)

- Dùng cho **web User** (độc giả đăng nhập nhanh bằng Google), **không áp dụng cho Admin** (tài khoản quản trị nên do Admin cấp thủ công, không cho đăng nhập mạng xã hội để giảm bề mặt tấn công).
- Luồng: `Authorization Code Flow` với Google Identity Services → backend nhận `id_token`, xác thực qua thư viện `google-auth-library`, tạo/khớp bản ghi `DocGia` theo email, sau đó **vẫn phát hành JWT nội bộ như bình thường** (OAuth chỉ dùng để xác thực danh tính ban đầu, hệ thống vẫn tự quản lý phiên bằng JWT của chính mình).
- Lợi ích khi trình bày báo cáo: cho thấy hiểu biết về sự khác biệt giữa **Authentication (OAuth2/Google)** và **Authorization/Session management (JWT nội bộ)** — điểm cộng học thuật tốt nếu còn thời gian triển khai.

### 8.3. Các lớp bảo mật khác nên có

- Helmet.js (HTTP headers an toàn), `express-mongo-sanitize` (chống NoSQL injection), validate input hai lớp (frontend UX + backend bắt buộc), giới hạn kích thước upload ảnh bìa, HTTPS khi deploy.

---

## 9. Thiết kế API (rút gọn, namespace hóa)

```
/api/user/auth        POST /register, POST /login, POST /refresh, POST /logout
/api/user/sach         GET /            (tìm kiếm, phân trang, lọc)
                        GET /:maSach
/api/user/muon         POST /                (tạo yêu cầu mượn)
                        GET /lich-su          (lịch sử mượn của chính mình)
                        POST /gia-han         (gửi yêu cầu gia hạn)
                        POST /bao-mat-sach    (báo mất)

/api/admin/auth        POST /login, POST /refresh, POST /logout
/api/admin/sach        GET, POST, PUT/:id, DELETE/:id     (requireRole: Admin, NhanVienQuanLySach)
/api/admin/nxb         GET, POST, PUT/:id, DELETE/:id     (requireRole: Admin, NhanVienQuanLySach)
/api/admin/muon        GET /                       (danh sách toàn bộ yêu cầu, lọc theo trạng thái)
                        PUT /:id/duyet             (requireRole: Admin, NhanVienDuyetMuon)
                        PUT /:id/xac-nhan-tra
                        PUT /:id/xu-ly-vi-pham
                        PUT /:id/duyet-gia-han
/api/admin/nhanvien    GET, POST, PUT/:id, DELETE/:id     (requireRole: Admin — duy nhất)
/api/admin/thongke     GET /dashboard              (số liệu tổng quan + biểu đồ)
```

---

## 10. Lộ trình triển khai chi tiết — 4 tuần (deadline thực tế)

Nguyên tắc phân bổ: **Tuần 1 dồn lực cho nền tảng + Admin trước** (đúng yêu cầu "admin phải xây trước"), **Tuần 2 mới mở sang User**, **Tuần 3 xử lý toàn bộ chức năng nâng cao**, **Tuần 4 chỉ kiểm thử + hoàn thiện báo cáo — không code tính năng mới**. Mỗi tuần chia thành 2–3 giai đoạn nhỏ (mốc 3–4 ngày) để dễ theo dõi tiến độ và có điểm dừng kiểm tra (checkpoint) rõ ràng, tránh dồn việc vào cuối.

### 🗓️ TUẦN 1 — Nền tảng + Backend + Admin core

**Mục tiêu cuối tuần:** Có backend chạy được, DB kết nối, Admin đăng nhập và CRUD sách/NXB được qua Postman lẫn UI thô.

| Giai đoạn | Ngày     | Công việc                                                                                                                                                                                                     | Checkpoint                                                                            |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1.1       | Ngày 1–2 | Khởi tạo repo (backend + admin-web + user-web rỗng); viết Mongoose models cho 5 bảng gốc + các field mở rộng bắt buộc (Email/MatKhau ở DocGia, TrangThai/NgayHenTra ở TheoDoiMuonSach); kết nối MongoDB Atlas | Server chạy, `mongoose.connect` thành công, models không lỗi schema                   |
| 1.2       | Ngày 3–4 | Xây middleware `authAdmin` (JWT), `requireRole`; API `/api/admin/auth` (login); API CRUD `/api/admin/sach`, `/api/admin/nxb`                                                                                  | Test được toàn bộ CRUD sách qua Postman với token admin                               |
| 1.3       | Ngày 5–7 | Dựng `admin-web` (Vue 3 + Bootstrap khung layout): trang login admin, trang danh sách/thêm/sửa/xóa sách và NXB, seed dữ liệu mẫu (~20 sách, 5 NXB)                                                            | **Checkpoint tuần 1:** Admin đăng nhập và quản lý sách hoàn chỉnh trên giao diện thật |

### 🗓️ TUẦN 2 — Nghiệp vụ mượn/trả + Frontend User

**Mục tiêu cuối tuần:** Luồng end-to-end cơ bản chạy được: user đăng ký → mượn sách → admin duyệt → user thấy lịch sử.

| Giai đoạn | Ngày       | Công việc                                                                                                                                                              | Checkpoint                                                                                                                                           |
| --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1       | Ngày 8–9   | API `/api/admin/muon` (xem danh sách yêu cầu, duyệt/từ chối, xác nhận trả — có transaction cập nhật `SoQuyenConLai`); API `/api/user/auth` (đăng ký/đăng nhập độc giả) | Test Postman: tạo yêu cầu mượn → admin duyệt → số quyển giảm đúng                                                                                    |
| 2.2       | Ngày 10–11 | API `/api/user/sach` (danh sách, tìm kiếm, phân trang), `/api/user/muon` (tạo yêu cầu, xem lịch sử)                                                                    | Toàn bộ API user hoàn chỉnh, test qua Postman                                                                                                        |
| 2.3       | Ngày 12–14 | Dựng `user-web`: trang đăng ký/đăng nhập, danh sách sách + tìm kiếm, nút mượn sách, trang lịch sử mượn                                                                 | **Checkpoint tuần 2:** demo được luồng đầy đủ user↔admin, đây là mốc bắt buộc phải xong — nếu trễ ở đây thì tuần 3–4 phải cắt bớt chức năng nâng cao |

### 🗓️ TUẦN 3 — Phân quyền chi tiết + toàn bộ chức năng nâng cao

**Mục tiêu cuối tuần:** Hệ thống "đầy đủ tính năng", chỉ còn dò lỗi và làm đẹp giao diện.

| Giai đoạn | Ngày       | Công việc                                                                                                                                                                      | Checkpoint                                                                                                                            |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1       | Ngày 15–16 | Hoàn thiện phân quyền 3 cấp (Admin / NhanVienQuanLySach / NhanVienDuyetMuon): API + UI quản lý nhân viên (chỉ Admin thấy); áp `requireRole` chính xác cho từng route còn thiếu | Test chéo: đăng nhập bằng từng vai trò, xác nhận đúng bị chặn/được phép                                                               |
| 3.2       | Ngày 17–18 | Giới hạn số sách mượn tối đa (chặn ở API tạo yêu cầu mượn); job "lazy-check" hoặc cron đánh dấu quá hạn (`TrangThai = QuaHan`)                                                 | Test: mượn đủ giới hạn bị chặn; chỉnh `NgayHenTra` giả lập quá hạn, xác nhận trạng thái tự cập nhật                                   |
| 3.3       | Ngày 19–21 | Xử lý vi phạm/mất sách (bảng `ViPham`, khóa tài khoản theo quy tắc mục 7.3), gia hạn mượn (`YeuCauGiaHan`), dashboard thống kê (biểu đồ Chart.js)                              | **Checkpoint tuần 3:** toàn bộ tính năng trong đề (tối thiểu + nâng cao ưu tiên 1–4) đã hoạt động, không còn tính năng "đang code dở" |

### 🗓️ TUẦN 4 — Kiểm thử, hoàn thiện, đóng gói báo cáo (không thêm tính năng mới)

**Mục tiêu cuối tuần:** Sản phẩm ổn định để demo trực tiếp + bộ báo cáo/slide sẵn sàng nộp.

| Giai đoạn | Ngày       | Công việc                                                                                                                                                                                               | Checkpoint                                                                                                 |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 4.1       | Ngày 22–24 | Test toàn bộ kịch bản đầu-cuối (mục 11), sửa bug phát hiện được; tối ưu UI/UX (responsive, thông báo lỗi rõ ràng, loading state); deploy backend + 2 frontend lên môi trường thật (Render/Vercel/Atlas) | Ứng dụng chạy ổn định trên môi trường deploy, không còn lỗi chặn luồng chính                               |
| 4.2       | Ngày 25–26 | (Tùy chọn nếu dư thời gian) OAuth2 Google login cho user — **là hạng mục đầu tiên bị cắt nếu tuần 4 không đủ thời gian**                                                                                | Không bắt buộc cho checkpoint cuối                                                                         |
| 4.3       | Ngày 27–28 | Soạn slide báo cáo (kiến trúc, ERD, giải trình quyết định thiết kế theo mục 12), quay video demo dự phòng, luyện tập kịch bản demo trực tiếp + câu hỏi phản biện                                        | **Checkpoint cuối cùng:** sẵn sàng nộp mã nguồn + slide, demo chạy trơn tru cả bản live lẫn video dự phòng |

### Nguyên tắc "van an toàn" khi bị trễ tiến độ

Nếu đến cuối mỗi tuần chưa đạt checkpoint, áp dụng thứ tự cắt giảm sau (từ ít quan trọng nhất trở đi), **tuyệt đối không cắt các mục ở phần 1.2 "Tối thiểu bắt buộc"**:

1. OAuth2 Google login (4.2)
2. Đánh giá sách, thông báo, thể loại sách (các bảng mở rộng phụ)
3. Dashboard nâng cao (giữ lại số liệu cơ bản, bỏ biểu đồ phức tạp)
4. Gia hạn mượn sách (giữ logic xử lý quá hạn/vi phạm, tạm bỏ luồng gia hạn)
5. Không bao giờ cắt: 5 bảng gốc, JWT, phân quyền 3 cấp, giới hạn số sách mượn, CRUD sách/mượn trả cơ bản

---

## 11. Kiểm thử

- **API**: viết bộ test case Postman/Thunder Client cho từng endpoint, đặc biệt các rule nghiệp vụ (giới hạn mượn, chặn mượn khi bị khóa, không cho NhanVienQuanLySach gọi route duyệt mượn...).
- **Phân quyền**: test chéo — dùng token `NhanVienQuanLySach` gọi route duyệt mượn phải trả 403; dùng token user gọi route admin phải trả 403.
- **Kịch bản nghiệp vụ đầu-cuối**: đăng ký → đăng nhập → mượn 5 sách (thành công) → mượn sách thứ 6 (phải bị chặn) → admin duyệt/từ chối → giả lập quá hạn (chỉnh `NgayHenTra` thủ công trong DB để test cron) → kiểm tra vi phạm được ghi nhận.

---

## 12. Chuẩn bị báo cáo & bảo vệ (40% điểm)

1. **Slide**: mở đầu bằng sơ đồ kiến trúc tổng thể (mục 2.1) và ERD mở rộng — giám khảo thường đánh giá cao khi thấy sinh viên hiểu rõ _lý do_ thiết kế, không chỉ _cái gì_ được làm.
2. **Giải trình các quyết định thiết kế** (rất quan trọng để tránh bị "vặn"):
   - Vì sao chọn 1 backend + 2 frontend thay vì 2 backend hoàn toàn tách biệt.
   - Vì sao phải thêm `Email/MatKhau` vào `DocGia` (đề gốc chưa có tài khoản đăng nhập cho độc giả).
   - Vì sao đổi tên field kỹ thuật `NguonGoc/TacGia` → `NguonGoc_TacGia` (giới hạn cú pháp Mongo, không phải đổi ngữ nghĩa).
3. **Demo trực tiếp** theo kịch bản: đăng ký user mới → mượn sách → admin duyệt → user xem lịch sử → mô phỏng quá hạn → xử lý vi phạm → xem dashboard. Chuẩn bị **video demo dự phòng** phòng khi lỗi mạng/server khi trình chiếu trực tiếp.
4. **Chuẩn bị trả lời câu hỏi thường gặp**: khác biệt SPA vs SSR (đã học ở chương giới thiệu môn), tại sao chọn MongoDB cho bài toán vốn quan hệ, cách đảm bảo toàn vẹn dữ liệu khi không có ràng buộc khóa ngoại cứng như SQL (giải pháp: kiểm tra tồn tại ở tầng ứng dụng/Mongoose middleware `pre-save`, cân nhắc dùng transaction của MongoDB khi thao tác nhiều collection cùng lúc, ví dụ khi duyệt mượn phải đồng thời trừ `SoQuyenConLai` và tạo `TheoDoiMuonSach`).

---

## 13. Rủi ro & phương án dự phòng

| Rủi ro                                                           | Ảnh hưởng                        | Phương án                                                                                                                                   |
| ---------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Chỉ 1 thành viên/nhóm nhưng khối lượng lớn                       | Trễ tiến độ                      | Ưu tiên nghiêm ngặt theo mục 1.2 — làm xong tối thiểu bắt buộc trước, nâng cao sau, cắt bớt nếu cần (OAuth2 là hạng mục có thể bỏ đầu tiên) |
| Cron job xử lý quá hạn phức tạp                                  | Tốn thời gian debug              | Có thể thay bằng: mỗi lần user/admin load trang, backend "lazy-check" hạn trả thay vì cron thực (đơn giản hơn, vẫn đúng nghiệp vụ)          |
| Đồng bộ dữ liệu khi thao tác nhiều collection (không có FK cứng) | Sai lệch số liệu `SoQuyenConLai` | Dùng MongoDB transaction (`session.withTransaction`) cho thao tác mượn/trả/duyệt                                                            |
| Deploy lúc gần deadline bị lỗi                                   | Không demo được                  | Deploy sớm từ tuần 9–10, test trên môi trường thật song song với dev local                                                                  |

---

## 14. Checklist cuối cùng trước khi nộp

- [ ] 5 bảng gốc giữ nguyên tên bảng/thuộc tính, có ghi chú rõ các mở rộng
- [ ] 2 web (admin, user) chạy độc lập, khác cổng/domain
- [ ] Đầy đủ chức năng user tối thiểu
- [ ] Đầy đủ chức năng admin tối thiểu + phân quyền 3 cấp
- [ ] Tối thiểu 3 chức năng nâng cao hoạt động được (giới hạn mượn, xử lý vi phạm, dashboard)
- [ ] JWT hoạt động đúng, mật khẩu được hash
- [ ] Slide + video demo dự phòng đã chuẩn bị
- [ ] Mã nguồn đã đẩy lên Git, không dùng lại code project cũ theo đúng yêu cầu môn học
