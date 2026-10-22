# HƯỚNG DẪN TRIỂN KHAI TỪNG GIAI ĐOẠN

## Dự án Quản Lý Mượn Sách — MEVN Stack (CT449)

> **Nguyên tắc:** Làm theo giai đoạn, mỗi giai đoạn có kết quả cụ thể kiểm chứng được.
> **Stack cốt lõi:** MongoDB + Express.js + Vue 3 + Node.js (KHÔNG thay đổi).
> **CSDL:** Giữ nguyên 100% tên bảng và tên thuộc tính đã thiết kế trong `Cores/Chienluoc.md`; đối chiếu mã nguồn khi tài liệu lịch sử khác hiện trạng.
> **Frontend:** Vue 3 (Composition API) là chính, Bootstrap 5 là phụ trợ layout.
> **Trạng thái hiện tại (2026-10-12):** Dự án HOÀN THÀNH 100% tất cả 10 giai đoạn. Bước tiếp theo là Giai đoạn 11 (Deploy) theo giáo trình thầy: nginx + PM2 (on-premise/VPS). Phần roadmap lịch sử bên dưới KHÔNG phải danh sách việc phải làm lại. `Cores/checkpoint.md` là nhật ký mới nhất và đầy đủ nhất.

---

## 🤖 PROMPT DÀNH CHO AI (Dùng cho phiên làm việc mới)

> **Hướng dẫn cho bạn:** Bất cứ khi nào bạn mở một phiên chat mới với AI (Claude, ChatGPT, Gemini, v.v.), hãy copy nội dung trong khối code bên dưới và gửi cho AI. Điều này giúp AI ngay lập tức nắm bắt toàn bộ ngữ cảnh, nguyên tắc code và không làm sai lệch kiến trúc.

```text
Đóng vai là một Senior Full-Stack Developer (MEVN Stack). Chúng ta đang làm dự án Quản Lý Mượn Sách (Học phần CT449) — đã HOÀN THÀNH 100% tính năng, đang ở giai đoạn Deploy & Chuẩn bị bảo vệ.

[YÊU CẦU CỐT LÕI - TUYỆT ĐỐI KHÔNG ĐƯỢC VI PHẠM]
1. Tech stack: MongoDB (native driver, KHÔNG Mongoose), Express.js, Vue 3 (Composition API), Node.js.
2. Kiến trúc: 1 Backend API dùng chung (port 3000), 2 Frontend độc lập (`frontend/user-web` port 5173 và `frontend/admin-web` port 5174).
3. Cơ sở dữ liệu: Giữ nguyên 100% tên bảng và tên thuộc tính. Service layer dùng camelCase (TenSach, DonGia). KHÔNG đổi ngược lại VIẾT HOA.
   - Các field mở rộng (SoTrang, MoTa, NgonNgu, TheLoai, HinhAnh, TacGia) KHÔNG có trong CSDL thầy → KHÔNG đặt là required trong Yup.
4. Giao diện: Vue 3 core logic + Bootstrap 5 layout. TUYỆT ĐỐI KHÔNG DÙNG TAILWIND.
5. Hạn mức mượn: 10 quyển tổng cộng/độc giả. Phiếu chờ duyệt chưa trừ kho; trừ kho lúc Admin duyệt.

[CẢNH BÁO LỖI ĐÃ GẶP - ĐỌC TRƯỚC KHI CODE]
- app.js route order: Route prefix rộng (có middleware) PHẢI mount SAU route cụ thể. Sai thứ tự → 401.
- VeeValidate: Dùng :key="formKey" + :initial-values="formData" + formKey++ khi mở modal. Field tùy chọn → .nullable().
- Bootstrap JS/Modal: Phải import `bootstrap.bundle.min.js` trong `main.js`. Không dùng đồng thời data-bs-dismiss và @click trên cùng nút.
- camelCase nhất quán: Controller và Vue component PHẢI dùng camelCase (ngayMuon, trangThai), không dùng VIẾT HOA.
- PORT: BACKEND chạy port 3000. Hai frontend http-common.js gọi localhost:3000. Xác nhận trước khi test.
- Chatbot Gemini: Dùng gemini-3.8-flash trở lên. Handle HTTP 503 bằng Exponential Backoff + Model Fallback Chain.

[QUYẾT ĐỊNH KIẾN TRÚC ĐÃ THỐNG NHẤT — KHÔNG THAY ĐỔI]
- _id (ObjectId): URL routing, aggregate $lookup, FK nội bộ. Nhanh nhất (clustered index ~0.1ms).
- MaSach/MaDocGia/MSNV/MaNXB: Hiển thị UI, tìm kiếm nghiệp vụ, báo cáo. Cần unique index thủ công.
- Chiến lược Hybrid: Giữ CẢ HAI, phân vai rõ ràng. KHÔNG disable _id, KHÔNG replace _id bằng Mã.

[TRẠNG THÁI DỰ ÁN — 2026-10-12]
- ✅ Hoàn thành: Giai đoạn 1–10 (RBAC 3 vai trò, E2E mượn/trả, Dashboard Chart.js, Redis Cache, Gemini AI Chatbot với Resilience Architecture, Voice Search AI, và Đăng nhập ủy quyền OAuth 2.0 Google & Facebook).
- 🔄 Tiếp theo: Giai đoạn 11 — Deploy theo giáo trình thầy (nginx + PM2, on-premise/VPS).
- 📌 Kế hoạch tính năng phụ (chỉ làm khi rảnh/cần UI): Nhắc hẹn trả sách dạng In-App UI (icon chuông + badge số sách sắp hết hạn trên Header), KHÔNG cần làm Web Push phức tạp.
- 📋 Việc còn lại trước deploy: Thêm unique index cho các Mã (xem checkpoint.md mục 2026-10-12).

[KIẾN TRÚC DEPLOY — NGINX + PM2]
Internet → NGINX (port 80) → proxy /api/* → Node.js qua PM2 (port 3000)
                           → serve /* → Vue dist/ (static files)
Admin web: NGINX (port 8080) → serve admin-web/dist/
Proxy trong vite.config.js CHỈ dùng lúc DEV, KHÔNG dùng khi production.
Sau khi deploy: VITE_API_BASE_URL=/api trong .env.production của cả 2 frontend.

[HÀNH ĐỘNG ĐẦU TIÊN CỦA BẠN]
1. Đọc Cores/checkpoint.md để biết trạng thái chi tiết + kế hoạch deploy đầy đủ.
2. Hỏi người dùng muốn làm gì trong phiên này: deploy nginx/PM2, fix bug, chuẩn bị bảo vệ, hay thắc mắc kỹ thuật.
3. KHÔNG tự ý triển khai thêm tính năng nghiệp vụ mới. Chỉ hỗ trợ deploy, bảo trì, review, giải đáp.
```

---

## TRẠNG THÁI CẬP NHẬT (2026-09-30 — xem checkpoint để có kết quả mới nhất)

Dự án đã hoàn tất GIAI ĐOẠN 5 và **Giai đoạn Tích hợp UI/UX**. Phiên chiều 2026-09-26 đã fix 4 bug nghiêm trọng:

- **Bug 1 FIXED:** `app.js` mount route sai thứ tự → user-web không hiển thị sách (401).
- **Bug 2 FIXED:** VeeValidate validation block form submit âm thầm → không lưu được sách.
- **Bug 3 FIXED:** Nút X modal chi tiết sách không đóng được (conflict data-bs-dismiss + @click).
- **Bug 4 FIXED:** Controller kiểm tra `TENSACH` thay vì `TenSach` → không tạo sách mới được.

### TRẠNG THÁI CÁC TÍNH NĂNG

| Tính năng                             | Trạng thái                                                    |
| ------------------------------------- | ------------------------------------------------------------- |
| user-web: Xem danh sách sách          | ✅ Hoạt động (không cần đăng nhập)                            |
| user-web: Xem chi tiết sách           | ✅ Hoạt động                                                  |
| user-web: Đăng ký / Đăng nhập         | ✅ Hoạt động                                                  |
| admin-web: Đăng nhập                  | ✅ Hoạt động                                                  |
| admin-web: CRUD Sách                  | ✅ Đã fix (thêm/sửa/xóa đều hoạt động)                        |
| admin-web: Modal chi tiết đóng bằng X | ✅ Đã fix                                                     |
| admin-web: CRUD NXB                   | ✅ Hoạt động                                                  |
| admin-web: Quản lý mượn/trả sách      | ✅ Hoạt động (Đã hoàn thiện UI, logic Duyệt/Từ chối/Trả sách) |
| user-web: Mượn sách & Xem lịch sử     | ⚠️ Cần kiểm tra lại toàn diện sau các cập nhật API            |

### BƯỚC TIẾP THEO

- **Bước 5.1:** Tinh chỉnh xử lý lỗi (Error Handling), Empty States trên toàn dự án nếu cần.
- **Bước 5.2 (đã triển khai code, cần kiểm chứng thật):** RBAC cho `Admin`, `NhanVienQuanLySach`, `NhanVienDuyetMuon`; đã có route API, menu, router guard và bài test HTTP. Cần đăng nhập từng vai trò để xác nhận UI và API với MongoDB thật.
- **Bước 5.3 (E2E Test):** Test toàn bộ luồng end-to-end: user đăng ký → mượn sách → admin duyệt → user thấy trạng thái đã duyệt → admin xác nhận trả. Hỗ trợ mô phỏng Overbooking để kiểm chứng.

> Redis/Gemini: Không tích hợp trong giai đoạn hiện tại.

### NGUYÊN TẮC CHO CÁC PHIÊN SAU

1. **Đọc `checkpoint.md` TRƯỚC** — Luôn có các bug đã biết và pattern đúng.
2. **Tuân thủ Design System**: Bootstrap BaseComponents, không dùng Tailwind.
3. **MongoDB native driver**, không dùng Mongoose.
4. **Route order trong `app.js`**: Cụ thể trước, tổng quát sau.
5. **VeeValidate**: Luôn dùng `:key` + `:initial-values` + `.nullable()` cho field tùy chọn.

---

## GIAI ĐOẠN 1 — NỀN TẢNG BACKEND + SERVICES + KẾT NỐI DB (đã xong)

### Mục tiêu

Server Node.js/Express chạy được, kết nối MongoDB thành công, 5 Service thao tác CSDL cơ bản đã khởi tạo.

### Công việc chi tiết

#### 1.1. Khởi tạo cấu trúc dự án

```
CT449/
├── backend/
│   ├── app/
│   │   ├── config/          # index.js
│   │   ├── middlewares/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/        # 5 services gốc
│   │   ├── utils/           # mongodb.util.js
│   │   └── api-error.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── admin-web/           # (tạo sẵn thư mục rỗng, khởi tạo Vue sau)
│   └── user-web/            # (tạo sẵn thư mục rỗng, khởi tạo Vue sau)
└── Cores/
    ├── Chienluoc.md
    └── next_step_guide.md
```

#### 1.2. Backend — package.json & dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "cors": "^2.8.5",
    "dotenv": "^16.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "morgan": "^1.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

#### 1.3. Kết nối MongoDB (`app/utils/mongodb.util.js` & `app/config/index.js`)

- Thiết lập config db URI trong `index.js`
- Sử dụng `mongodb` driver thuần, bọc connection logic trong class `MongoDB` tại `mongodb.util.js` giống hệt bài mẫu.

#### 1.4. Khai báo 5 Service xử lý CSDL (`app/services/`)

Sử dụng trực tiếp `mongodb` driver để thao tác CSDL. Khởi tạo 5 service cơ bản có hàm constructor nhận `client` để truy xuất DB. Đảm bảo mapping đúng các field (kể cả field mở rộng).

| Service file                 | Collection        | Các field gốc (BẮT BUỘC giữ nguyên tên)                              | Field mở rộng bắt buộc                            |
| ---------------------------- | ----------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| `docgia.service.js`          | `DOCGIA`          | MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai              | Email, MatKhau (hash), TrangThaiTaiKhoan          |
| `sach.service.js`            | `SACH`            | MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc_TacGia | SoQuyenConLai, AnhBia                             |
| `nhaxuatban.service.js`      | `NHAXUATBAN`      | MaNXB, TenNXB, DiaChi                                                | —                                                 |
| `theodoimuonsach.service.js` | `THEODOIMUONSACH` | MaDocGia, MaSach, NgayMuon, NgayTra                                  | NgayHenTra, TrangThai (enum), SoLanGiaHan, GhiChu |
| `nhanvien.service.js`        | `NHANVIEN`        | MSNV, HoTenNV, Password (hash), Chucvu (enum), Diachi, SoDienThoai   | —                                                 |

#### 1.5. Tạo `app.js` và `server.js`

- `app.js`: khởi tạo Express, dùng `cors()`, `express.json()`, `morgan('dev')`
- `server.js`: gọi `connectDB()` rồi `app.listen(PORT)`
- Tham khảo pattern từ bài 10 điểm: tách `app.js` và `server.js` riêng

### ✅ Kết quả kiểm chứng Giai đoạn 1

- [x] Chạy `npm run dev` → server khởi động không lỗi
- [x] Console log: `MongoDB connected successfully`
- [x] Truy cập backend tại cổng cấu hình ở thời điểm kiểm thử lịch sử (8080) → trả về JSON `{ message: "Resource not found" / "API is running" }`. Kiểm tra lại `PORT` hiện hành trước lần chạy tiếp theo.
- [x] 5 services import được

> Trạng thái thực tế: Đã kiểm chứng backend chạy thành công trên cổng 8080 và kết nối DB ổn định.

---

## GIAI ĐOẠN 2 — AUTH ADMIN + CRUD SÁCH/NXB (BACKEND API)

### Mục tiêu

Admin đăng nhập được bằng JWT, CRUD sách và NXB hoạt động qua Postman.

### Công việc chi tiết

#### 2.1. Middleware xác thực

- `middlewares/auth.js`: verify JWT token từ header `Authorization: Bearer <token>`
- `middlewares/requireRole.js`: nhận mảng roles cho phép, kiểm tra `req.user.Chucvu`
- `middlewares/errorHandler.js`: bắt lỗi toàn cục, trả JSON format thống nhất

#### 2.2. API Auth Admin (`/api/admin/auth`)

| Method | Endpoint                  | Mô tả                                          |
| ------ | ------------------------- | ---------------------------------------------- |
| POST   | `/api/admin/auth/login`   | Đăng nhập NhanVien (MSNV + Password) → trả JWT |
| POST   | `/api/admin/auth/refresh` | Refresh token                                  |
| POST   | `/api/admin/auth/logout`  | Logout (xóa cookie)                            |

- Tham khảo: bài 10 điểm dùng `bcryptjs` + `jsonwebtoken`
- JWT payload: `{ sub: _id, role: Chucvu, aud: "admin" }`

#### 2.3. Seed dữ liệu Admin mặc định

- Script `seed.js`: tạo 1 tài khoản Admin ban đầu (MSNV: "ADMIN001", Password hash)
- Tạo sẵn ~5 NXB mẫu, ~10-20 sách mẫu

#### 2.4. API CRUD Sách (`/api/admin/sach`)

| Method | Endpoint              | Middleware                                         | Mô tả                                 |
| ------ | --------------------- | -------------------------------------------------- | ------------------------------------- |
| GET    | `/api/admin/sach`     | auth + requireRole(['Admin','NhanVienQuanLySach']) | Danh sách sách (phân trang, tìm kiếm) |
| GET    | `/api/admin/sach/:id` | auth + requireRole                                 | Chi tiết sách                         |
| POST   | `/api/admin/sach`     | auth + requireRole                                 | Thêm sách mới                         |
| PUT    | `/api/admin/sach/:id` | auth + requireRole                                 | Sửa sách                              |
| DELETE | `/api/admin/sach/:id` | auth + requireRole                                 | Xóa sách                              |

- Pattern tham khảo từ bài 10 điểm: `Controller → Service → Model`
- Bài tham khảo dùng service với `mongodb` driver; dự án này cũng dùng **native `mongodb` driver**, controller gọi service trong `BACKEND/app/services/`. Không tạo Mongoose models.

#### 2.5. API CRUD NXB (`/api/admin/nxb`)

- Tương tự CRUD Sách, với model `NhaXuatBan`
- Middleware: `requireRole(['Admin','NhanVienQuanLySach'])`

### ✅ Kết quả kiểm chứng Giai đoạn 2

- [x] Postman: POST `/api/admin/auth/login` → nhận được JWT token với payload `aud: "admin"`
- [x] Postman: GET `/api/admin/sach` với Bearer token → danh sách sách
- [x] Postman: POST/PUT/DELETE sách hoạt động đúng và yêu cầu quyền Admin/NhanVienQuanLySach
- [x] Postman: Gửi request không có token → bị 401
- [x] Lệnh `node seed.js` tạo thành công tài khoản `ADMIN001` - mật khẩu `Admin@123`

> Trạng thái thực tế: Đã kiểm chứng API Admin hoạt động trơn tru qua UI.

---

## GIAI ĐOẠN 3 — ADMIN-WEB (Vue 3 SPA) — GIAO DIỆN QUẢN TRỊ CƠ BẢN

### Mục tiêu

Giao diện admin chạy trên port riêng (5174), đăng nhập + CRUD sách/NXB hoàn chỉnh trên UI.

### Công việc chi tiết

#### 3.1. Khởi tạo `admin-web` bằng Vite

```bash
cd admin-web
npm create vite@latest ./ -- --template vue
npm install vue-router@4 pinia axios bootstrap@5
```

#### 3.2. Cấu trúc thư mục admin-web

```
admin-web/src/
├── assets/              # CSS, images
├── components/          # Shared components (Sidebar, Header, Modal...)
├── layouts/             # AdminLayout.vue
├── views/
│   ├── LoginAdmin.vue
│   ├── DashboardAdmin.vue (placeholder)
│   ├── SachManagement.vue
│   ├── SachForm.vue     (thêm/sửa dùng chung)
│   └── NXBManagement.vue
├── services/            # API calls (axios instances)
│   ├── api.js           # axios instance với baseURL + interceptor
│   ├── auth.service.js
│   ├── sach.service.js
│   └── nxb.service.js
├── stores/              # Pinia stores
│   └── authStore.js
├── router/
│   └── index.js
├── App.vue
└── main.js
```

#### 3.3. Các trang cần làm

1. **LoginAdmin.vue**: form đăng nhập (MSNV + Password), gọi API login, lưu token vào Pinia store
2. **AdminLayout.vue**: sidebar navigation + header + router-view, protected route
3. **SachManagement.vue**: bảng danh sách sách, nút thêm/sửa/xóa, tìm kiếm
4. **SachForm.vue**: form thêm/sửa sách (validate bằng HTML5 hoặc VeeValidate sau)
5. **NXBManagement.vue**: bảng CRUD nhà xuất bản

#### 3.4. Tham khảo giao diện từ bài 10 điểm

- Bài 10 điểm có ~33 file views rất chi tiết → ta đơn giản hơn ở giai đoạn này
- Lấy ý tưởng layout: sidebar trái + content phải, bảng dữ liệu có pagination
- Bài 10 điểm dùng Bootstrap + FontAwesome → ta cũng dùng Bootstrap 5 hỗ trợ

### ✅ Kết quả kiểm chứng Giai đoạn 3

- [x] Truy cập `http://localhost:5174` (hoặc port của frontend) → trang login admin
- [x] Đăng nhập thành công → redirect sang Dashboard
- [x] Trang Sách: hiển thị danh sách, thêm/sửa/xóa sách hoạt động
- [x] Trang NXB: hiển thị danh sách, thêm/sửa/xóa NXB hoạt động
- [x] Logout → quay về login, token bị xóa

> Trạng thái thực tế: **Đã hoàn thành Giai đoạn 3.** Các tính năng CRUD quản trị hoạt động trơn tru.

---

## GIAI ĐOẠN 4 — API NGHIỆP VỤ MƯỢN/TRẢ + AUTH USER

### Mục tiêu

API mượn/trả sách hoạt động, user (độc giả) đăng ký/đăng nhập được, luồng mượn sách end-to-end test qua Postman.

### Công việc chi tiết

#### 4.1. API Auth User (`/api/user/auth`)

| Method | Endpoint                  | Mô tả                                                        |
| ------ | ------------------------- | ------------------------------------------------------------ |
| POST   | `/api/user/auth/register` | Đăng ký DocGia mới (tạo bản ghi DocGia + Email/MatKhau hash) |
| POST   | `/api/user/auth/login`    | Đăng nhập DocGia → JWT với `aud: "user"`                     |
| POST   | `/api/user/auth/refresh`  | Refresh token                                                |
| POST   | `/api/user/auth/logout`   | Logout                                                       |

#### 4.2. API Sách cho User (`/api/user/sach`)

| Method | Endpoint                 | Mô tả                                      |
| ------ | ------------------------ | ------------------------------------------ |
| GET    | `/api/user/sach`         | Danh sách sách (tìm kiếm, lọc, phân trang) |
| GET    | `/api/user/sach/:maSach` | Chi tiết sách (hiển thị SoQuyenConLai)     |

#### 4.3. API Mượn Sách cho User (`/api/user/muon`)

| Method | Endpoint                 | Mô tả                                                          |
| ------ | ------------------------ | -------------------------------------------------------------- |
| POST   | `/api/user/muon`         | Gửi yêu cầu mượn (tạo TheoDoiMuonSach, TrangThai = "ChoDuyet") |
| GET    | `/api/user/muon/lich-su` | Xem lịch sử mượn của chính mình                                |

#### 4.4. API Quản lý mượn/trả cho Admin (`/api/admin/muon`)

| Method | Endpoint                           | Middleware                                        | Mô tả                                                               |
| ------ | ---------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/admin/muon`                  | auth + requireRole(['Admin','NhanVienDuyetMuon']) | Danh sách toàn bộ yêu cầu (lọc trạng thái)                          |
| PUT    | `/api/admin/muon/:id/duyet`        | auth + requireRole                                | Duyệt yêu cầu mượn → TrangThai = "DangMuon", trừ SoQuyenConLai      |
| PUT    | `/api/admin/muon/:id/tu-choi`      | auth + requireRole                                | Từ chối yêu cầu                                                     |
| PUT    | `/api/admin/muon/:id/xac-nhan-tra` | auth + requireRole                                | Xác nhận trả → TrangThai = "DaTra", cộng SoQuyenConLai, set NgayTra |

- **Tham khảo logic từ bài 10 điểm**: `muonsach.service.js` có kiểm tra SOQUYEN, giảm/tăng khi duyệt/trả — ta áp dụng tương tự cho SoQuyenConLai
- Bài 10 điểm dùng trạng thái tiếng Việt có dấu ("chờ duyệt", "đã duyệt"...) → ta dùng enum không dấu theo ChienLuoc.md ("ChoDuyet", "DangMuon", "DaTra", "QuaHan", "Mat")

### ✅ Kết quả kiểm chứng Giai đoạn 4

- [x] Postman / Frontend: đăng ký user mới → thành công
- [x] Postman / Frontend: đăng nhập user → nhận JWT token (aud = "user")
- [x] Postman / Frontend: tạo yêu cầu mượn sách → TrangThai = "ChoDuyet"
- [x] Postman / Frontend: admin duyệt → TrangThai = "DangMuon", SoQuyenConLai giảm
- [x] Postman / Frontend: admin xác nhận trả → TrangThai = "DaTra", SoQuyenConLai tăng
- [x] Postman / Frontend: dùng token user gọi `/api/admin/*` → bị 403 (kiểm tra aud)

> Trạng thái thực tế: **Đã hoàn thành Giai đoạn 4.** API Backend cho mượn/trả và JWT phân tách hai role User/Admin hoạt động đúng.

---

## GIAI ĐOẠN 5 — USER-WEB (Vue 3 SPA) + HOÀN THIỆN ADMIN-WEB

### Mục tiêu

Giao diện user chạy trên port riêng (5173), luồng end-to-end hoàn chỉnh trên UI: user đăng ký → mượn → admin duyệt → user thấy lịch sử.

### Công việc chi tiết

#### 5.1. Khởi tạo `user-web` bằng Vite (tương tự admin-web)

#### 5.2. Các trang User-Web

1. **HomeUser.vue**: trang chủ, giới thiệu thư viện
2. **RegisterUser.vue**: form đăng ký độc giả
3. **LoginUser.vue**: form đăng nhập
4. **BookList.vue**: danh sách sách + tìm kiếm + phân trang
5. **BookDetail.vue**: chi tiết sách + nút "Mượn sách"
6. **BorrowHistory.vue**: lịch sử mượn (đang mượn / đã trả / quá hạn)
7. **ProfileUser.vue**: cập nhật hồ sơ, đổi mật khẩu

#### 5.3. Bổ sung Admin-Web

1. **MuonSachManagement.vue**: bảng yêu cầu mượn, lọc trạng thái, nút duyệt/từ chối/xác nhận trả
2. **NhanVienManagement.vue**: CRUD nhân viên (chỉ Admin)

### ✅ Kết quả kiểm chứng Giai đoạn 5

- [x] User đăng ký tài khoản trên UI → thành công
- [x] User đăng nhập → thấy danh sách sách, header cập nhật auth state ngay lập tức (eventBus)
- [x] User bấm mượn sách → Modal xác nhận (chọn số lượng, ngày mượn, ngày trả) → Yêu cầu tạo thành công
- [x] Admin thấy yêu cầu mới trên trang quản lý mượn (`MuonSachManagement.vue` đầy đủ filter, tính năng duyệt)
- [x] Admin duyệt → user thấy trạng thái "Đang mượn" trong lịch sử
- [x] Admin xác nhận trả → user thấy "Đã trả"
- [x] 2 web chạy trên 2 port khác nhau (5173 và 5174)

> Trạng thái thực tế: **Đã hoàn thành toàn diện Giai đoạn 5.** Hệ thống đã có thể chạy demo end-to-end trơn tru từ góc nhìn Khách Hàng (User) đến Quản Trị Viên (Admin).

---

## CÁC GIAI ĐOẠN TIẾP THEO (triển khai sau khi 5 giai đoạn trên hoàn tất)

> Sẽ được cập nhật chi tiết sau khi hoàn thành Giai đoạn 5. Dưới đây là tóm tắt:

### GIAI ĐOẠN 6 — Phân quyền chi tiết 3 cấp (Đã hoàn thành)

- Đã thêm `/api/admin/nhanvien` chỉ cho Admin, UI thêm/sửa/xóa nhân viên và gán `ChucVu`.
- Đã giới hạn menu và Vue Router theo role JWT.
- Đã chạy E2E testing, test thủ công ổn định và commit an toàn vào nhánh main.

### GIAI ĐOẠN 7 — Chức năng nâng cao (Giới hạn mượn + Quá hạn + Vi phạm)

- Hạn mức tổng **10 quyển/độc giả** đã có trong nghiệp vụ hiện tại (gồm chờ duyệt/đã duyệt/đang mượn); không áp lại giới hạn 5 quyển trong roadmap cũ. Đối chiếu mọi cấu hình/hằng số còn mâu thuẫn trước khi mở rộng.
- Job/lazy-check đánh dấu quá hạn (TrangThai = "QuaHan")
- Bảng ViPham, khóa tài khoản theo quy tắc
- Gia hạn mượn sách (YeuCauGiaHan)

### GIAI ĐOẠN 8 — Dashboard thống kê + UI hoàn thiện

- Dashboard admin: tổng sách, tổng độc giả, đang mượn, quá hạn
- Biểu đồ Chart.js: top sách, mượn/trả theo thời gian
- Responsive, loading states, thông báo lỗi rõ ràng

### GIAI ĐOẠN 9 — Kiểm thử + Deploy + Báo cáo

- Test toàn bộ kịch bản end-to-end
- Deploy lên Render/Vercel/Atlas
- Soạn slide, quay video demo

---

## ĐIỂM TIẾP TỤC HIỆN TẠI

> **Bước tiếp theo (Cập nhật 2026-10-12):**
>
> 1. Dự án MEVN Stack "Quản Lý Mượn Sách" đã CHÍNH THỨC HOÀN THÀNH 100% tất cả 10 giai đoạn nghiệp vụ.
> 2. Các công nghệ tiên tiến (Redis Caching, Chatbot Gemini AI có Resilience Architecture, Voice Search AI) đã tích hợp thành công.
> 3. Toàn bộ logic (Overbooking, RBAC 3 cấp, Quá hạn lazy-check) đã kiểm thử và hoạt động trơn tru.
> 4. **GIAI ĐOẠN 11 (TIẾP THEO): Deploy theo giáo trình thầy — nginx + PM2**. Xem kế hoạch chi tiết trong `Cores/checkpoint.md` mục "Cập nhật 2026-10-12".

---

## GIAI ĐOẠN 11 — DEPLOY (nginx + PM2, theo giáo trình thầy)

### Mục tiêu
Triển khai toàn bộ ứng dụng lên môi trường production theo đúng yêu cầu giáo trình: nginx làm reverse proxy, PM2 làm process manager cho Node.js.

### Kiến trúc
```
Internet (port 80 / 8080)
    │
  [NGINX]
    ├── port 80  → User Web  → proxy /api/* → Node.js (PM2, port 3000)
    │                        → serve user-web/dist/ (tĩnh)
    └── port 8080 → Admin Web → proxy /api/* → Node.js (PM2, port 3000)
                             → serve admin-web/dist/ (tĩnh)
```

### Thứ tự thực hiện

#### Bước 1 — Build Vue frontend
```bash
cd frontend/user-web && npm run build    # → dist/
cd ../admin-web && npm run build         # → dist/
```
> ⚠️ Trước khi build: tạo `.env.production` trong mỗi frontend với `VITE_API_BASE_URL=/api`

#### Bước 2 — PM2 chạy Backend
```bash
cd BACKEND
pm2 start server.js --name "library-api"
pm2 save
pm2 startup   # tạo service auto-start khi reboot
```

#### Bước 3 — Cấu hình NGINX
```nginx
# /etc/nginx/sites-available/library-user (port 80)
server {
    listen 80;
    server_name localhost;
    root /path/to/frontend/user-web/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# /etc/nginx/sites-available/library-admin (port 8080)
server {
    listen 8080;
    root /path/to/frontend/admin-web/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:3000; }
}
```

#### Bước 4 — Kích hoạt
```bash
sudo nginx -t                     # kiểm tra config
sudo systemctl reload nginx
```

### Lưu ý quan trọng
- Proxy trong `vite.config.js` CHỈ dùng lúc DEV — **KHÔNG ảnh hưởng** đến production build.
- Sau khi dùng nginx proxy, frontend không cần gọi `localhost:3000` nữa, chỉ cần `/api/`.
- Backend CORS whitelist phải thêm domain/IP thật của server nếu khác localhost.
- Unique index cho các `Mã` nên thêm trước khi deploy (xem checkpoint.md).

### ✅ Kết quả kiểm chứng Giai đoạn 11
- [ ] `pm2 list` hiển thị `library-api` trạng thái `online`
- [ ] Truy cập `http://server-ip/` → User Web hiển thị đúng
- [ ] Truy cập `http://server-ip:8080/` → Admin Web hiển thị đúng
- [ ] Đăng nhập, mượn sách, duyệt mượn hoạt động qua nginx proxy
- [ ] Reload trang không bị 404 (do `try_files` xử lý Vue Router history mode)

---

## 📌 TÍNH NĂNG DỰ KIẾN (CHƯA LÀM NGAY): Nhắc Hẹn Trả Sách Dạng Giao Diện (In-App UI Notification)

> **Ghi chú định hướng:** Khi người dùng có nhu cầu bổ sung giao diện thông báo, chỉ triển khai ở mức **In-App UI** (gọn nhẹ, không làm Web Push Service Worker phức tạp). Hiện tại **chưa cần làm liền**, lưu lại đặc tả dưới đây để dùng khi cần.

### 1. Ý tưởng thiết kế
- Tận dụng trực tiếp API lịch sử mượn sách có sẵn của độc giả (`GET /api/user/muon/lich-su`), không cần can thiệp Database backend.
- Trên thanh điều hướng `AppHeader.vue`: Thêm một nút biểu tượng **Cái chuông (`fas fa-bell`)** kèm huy hiệu số lượng (Badge đỏ).

### 2. Chi tiết hiển thị (Dropdown Thông báo)
- **Huy hiệu số lượng (Badge)**: Bằng tổng số phiếu mượn thỏa mãn một trong hai điều kiện:
  1. 🔴 **Quá hạn**: `NgayHenTra < hôm nay` (và trạng thái là `DangMuon` hoặc `QuaHan`).
  2. 🟡 **Sắp hết hạn**: `0 <= (NgayHenTra - hôm nay) <= 2 ngày`.
- **Nội dung bên trong Dropdown**:
  - Tiêu đề: "Thông báo mượn trả sách".
  - Danh sách từng sách cần lưu ý:
    - Thumbnail ảnh bìa sách nhỏ + Tên sách.
    - Cảnh báo trạng thái: "Đã quá hạn X ngày" (màu đỏ) hoặc "Hết hạn vào ngày mai/kia" (màu cam).
    - Nút thao tác nhanh: Click vào để chuyển thẳng đến trang `/lich-su` để bấm "Xin trả sách" hoặc gia hạn.
  - Nếu không có sách nào sắp hết hạn: Hiển thị trạng thái trống thân thiện ("Bạn không có sách nào sắp đến hạn trả").


