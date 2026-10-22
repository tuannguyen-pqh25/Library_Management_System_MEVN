# KIỂM TRA TRẠNG THÁI DỰ ÁN (CHECKPOINT)

Đây là file lưu trữ thông tin về tiến độ mới nhất của dự án và các quyết định kiến trúc quan trọng đã được thống nhất. AI bắt buộc phải tham khảo file này để biết chính xác điểm bắt đầu trước khi code.

> **Điểm bắt đầu cho phiên kế tiếp (cập nhật 2026-09-30):** Giai đoạn 1–6 đã hoàn thành (RBAC ba vai trò, E2E flow mượn trả). Đã xác nhận code qua các bài test và commit an toàn vào nhánh main. **Giai đoạn tiếp theo là Giai đoạn 7 (Quản lý độc giả, xử lý vi phạm).** Đọc phần “Cập nhật 2026-09-30 — Hoàn tất Giai đoạn 6” cuối file trước khi làm tiếp. Không khởi tạo lại dự án.

## 1. Tiến độ hiện tại

- **Đã hoàn thành:**
  - GIAI ĐOẠN 1 (Khởi tạo Backend API & Kết nối Database).
  - GIAI ĐOẠN 2 (Auth Admin + CRUD Sách/NXB cho Backend).
  - GIAI ĐOẠN 3 (Khởi tạo Frontend admin-web, cấu hình Vue 3 + Vite, chuyển giao diện Admin).
  - GIAI ĐOẠN 4 (User backend: auth, sách, lịch sử mượn, profile, middleware xác thực theo role).
  - GIAI ĐOẠN 5: Hoàn thành frontend user-web và bổ sung màn hình quản lý admin còn thiếu.
  - **GIAI ĐOẠN TÍCH HỢP UI/UX:** Đã áp dụng `UI_Migration_Strategy.md` để đồng bộ thiết kế Figma.

- **Đã bổ sung / sửa trong phiên 2026-09-26 (sáng):**
  - Đã cập nhật Design System vào `style.css` của cả `admin-web` và `user-web`.
  - Xây dựng xong bộ thư viện Base Components: `<BaseInput>`, `<BaseButton>`, `<BaseCard>`.
  - Tái cấu trúc (refactor) toàn bộ trang sang Composition API + BaseComponents.
  - Tạo layout mới cho Admin (`AdminLayout.vue`) và User (`AppHeader.vue`).

- **Đã bổ sung / sửa trong phiên 2026-09-26 (chiều) — BUG FIX QUAN TRỌNG:**

  ### [BUG FIX 1] `app.js` — Thứ tự mount route sai (CRITICAL)
  - **Triệu chứng:** `user-web` không hiển thị danh sách sách dù API có dữ liệu. Mọi call đến `/api/user/sach` đều bị lỗi 401 "Không có token xác thực".
  - **Nguyên nhân:** `userProfileRouter` (mount tại `/api/user`) có `router.use(verifyToken)` áp dụng cho toàn bộ router. Do được mount TRƯỚC `userSachRouter`, Express khớp prefix `/api/user` trước → chạy `verifyToken` → chặn luôn.
  - **Fix — Thứ tự đúng trong `app.js`:**
    ```js
    app.use("/api/user/auth", userAuthRouter);   // 1. Auth không cần token
    app.use("/api/user/sach", userSachRouter);   // 2. Sách public — TRƯỚC profile
    app.use("/api/user/muon", userMuonRouter);   // 3. Muon — TRƯỚC profile
    app.use("/api/user", userProfileRouter);     // 4. Profile (có verifyToken) — SAU CÙNG
    ```

  ### [BUG FIX 2] `StaffSachManagement.vue` — VeeValidate chặn form submit âm thầm
  - **Triệu chứng:** Nhấn "Lưu thay đổi" không có phản hồi gì — hàm `saveSach` không bao giờ được gọi.
  - **Nguyên nhân:** Schema Yup bắt buộc `SoTrang`, `MoTa`, `NgonNgu`, `TheLoai` nhưng dữ liệu CSDL của thầy không có các field này → validation thất bại âm thầm.
  - **Fix:**
    - Đổi các field trên thành `.nullable()` trong Yup schema (không bắt buộc).
    - Thêm `:key="formKey"` và `:initial-values="formData"` vào `<Form>` để VeeValidate re-init đúng khi chuyển giữa thêm/sửa.
    - `formKey.value++` mỗi lần gọi `openAddModal()` hoặc `openEditModal()`.

  ### [BUG FIX 3] `StaffSachManagement.vue` — Nút X đóng modal chi tiết sách không hoạt động
  - **Nguyên nhân:** Vừa có `data-bs-dismiss="modal"` vừa có `@click="closeDetailModal"` gây xung đột. `closeDetailModal()` gọi `Modal.getInstance()` có thể trả về null.
  - **Fix:** Chỉ dùng `data-bs-dismiss="modal"` cho nút X. Rewrite `closeDetailModal()` có try/catch với fallback thủ công dọn dẹp backdrop (xóa class `show`, `.modal-backdrop`).

  ### [BUG FIX 4] `admin/sach.controller.js` — Field name sai
  - **Nguyên nhân:** Controller kiểm tra `req.body?.TENSACH` (viết HOA kiểu CSDL thầy) nhưng frontend gửi `TenSach` → create luôn trả lỗi 400.
  - **Fix:** Đổi thành `req.body?.TenSach`.

- **Lưu ý đặc biệt về CSDL của thầy (không thay đổi được):**
  - CSDL gốc của thầy dùng field viết HOA (`TENSACH`, `DONGIA`, v.v.) trong collection `SACH`.
  - Service `sach.service.js` đã được viết lại để dùng camelCase (`TenSach`, `DonGia`) phù hợp frontend.
  - Các field `SoTrang`, `MoTa`, `NgonNgu`, `TheLoai`, `HinhAnh`, `TacGia` là field **mở rộng** thêm vào — CSDL thầy không có → KHÔNG được đặt là required trong Yup.
  - Field `DonGia` trong context sách thư viện = "giá trị sách", giữ nguyên vì là CSDL thầy.

- **Đã bổ sung / sửa trong phiên 2026-09-30 (Giai đoạn 6 & Khôi phục ngữ cảnh):**
  - **Khôi phục ngữ cảnh:** Đã đọc lại toàn bộ working tree (`git diff`) sau khi AI bị gián đoạn. Xác nhận các thay đổi về phân quyền nhân viên (`adminRoles.js`), xử lý state đăng nhập qua `eventBus.js`, và logic chặt chẽ của `muonsach.service.js` đều đã được code thành công. Các thay đổi này hiện đang ở trạng thái chưa commit.
  - Tạo `BACKEND/app/routes/admin/muonsach.route.js` — Admin muonsach route với `verifyAdminToken` + `requireRole`.
  - Tạo `BACKEND/app/controllers/admin/muonsach.controller.js` — 5 action: `findAll` (filter by trangThai), `findOne`, `duyet`, `tuChoi`, `xacNhanTra`, `delete`.
  - Thêm method `findAllPopulated()` vào `BACKEND/app/services/muonsach.service.js` — populate đầy đủ sách (TenSach, HinhAnh, MaSach, TenNXB), độc giả (TenDocGia, EmailDocGia, DienThoaiDocGia), nhân viên (TenNhanVien), sort ngayMuon giảm dần.
  - Cập nhật `BACKEND/app.js`: mount `adminMuonRouter` tại `/api/admin/muonsach`, đổi legacy route thành `/api/admin/muonsach-legacy`.
  - Cập nhật `frontend/admin-web/src/services/muonsach.service.js`: dùng đúng endpoint `/muonsach`, thêm `duyet()`, `tuChoi()`, `xacNhanTra()`.
  - Viết lại hoàn toàn `frontend/admin-web/src/views/MuonSachManagement.vue`:
    - Filter theo trạng thái (chờ duyệt, đã duyệt, đang mượn, đang chờ trả, đã trả, từ chối)
    - Tìm kiếm theo tên sách / tên độc giả / email
    - Badge thống kê nhanh (số phiếu theo trạng thái)
    - Bảng hiển thị đầy đủ: avatar độc giả, ảnh sách thumbnail, isOverdue warning
    - Action buttons: Duyệt (green), Từ chối (red), Xác nhận trả (yellow) — hiện theo điều kiện trạng thái
    - Modal chi tiết phiếu mượn (đầy đủ thông tin sách, độc giả, phiếu)
    - Modal từ chối (nhập lý do tùy chọn)
    - Toast success/error notification
    - Pagination 10 record/trang
    - Build thành công ✅
  - **Refactor (Clean Code):** Đổi toàn bộ tên hàm/method, action, endpoint liên quan đến mượn sách sang tiếng Anh để đảm bảo chuẩn mực (`duyet` → `approve`, `tuChoi` → `reject`, `xacNhanTra` → `confirmReturn`).
  - **Cập nhật cổng kết nối:** Đã đồng bộ `http-common.js` ở cả hai frontend (`user-web`, `admin-web`) trỏ về `http://localhost:3000` thay vì `8080`.
  - **Hoàn thiện UI/UX phía User (`user-web`):**
    - `RegisterUser.vue`: Thêm regex bắt buộc mật khẩu mạnh (chữ hoa, thường, số, ký tự đặc biệt, min 8) + trường "Xác nhận mật khẩu" + nút ẩn/hiện mật khẩu (👁).
    - `BookDetail.vue`: Cho phép người dùng chọn số lượng sách muốn mượn qua pill-button (1, 2, 3...). Giới hạn số lượng chọn tối đa là **10** hoặc bằng số tồn kho nếu `< 10`.
    - `BookDetail.vue`: **Tính năng Modal xác nhận mượn sách mới** với DatePickers cho Ngày đến mượn và Ngày trả (Mặc định 20 ngày).
    - `AppHeader.vue` & `LoginUser.vue`: Cập nhật logic state auth bằng **eventBus (mitt)** thay cho `window.storage`, giúp thanh header reload tên người dùng lập tức trong cùng 1 tab ngay khi login xong.
- **Quy tắc Hạn Mức Mượn Sách:**
  - **Giới hạn Tổng số sách:** Tối đa 10 quyển/1 Độc giả. (Bao gồm tất cả sách đang chờ duyệt + đã duyệt + đang mượn).
  - **Giới hạn Đầu sách (ĐÃ HỦY BỎ):** Đã xóa bỏ giới hạn "Mỗi cuốn chỉ được mượn tối đa 3 quyển". Giờ đây độc giả có quyền tự do phân bổ hạn mức 10 quyển của mình tuỳ ý.

- **Logic Nghiệp vụ Quan trọng (Overbooking / Duyệt mượn sách):**
  - Hệ thống sử dụng nguyên tắc **First-come, first-served tại thời điểm duyệt**.
  - Lúc user tạo phiếu mượn (trạng thái "chờ duyệt"): Hệ thống **không trừ số lượng sách**, chỉ kiểm tra số lượng hiện tại. Nhờ vậy, nhiều user có thể cùng lúc yêu cầu mượn 1 cuốn sách duy nhất.
  - Lúc admin **Duyệt** phiếu (`approve`): Hệ thống kiểm tra lại kho một lần nữa và **tiến hành trừ sách**. Nếu sách đã hết (do người khác được duyệt trước), admin sẽ bị chặn lại bởi lỗi "Không đủ sách để duyệt" và buộc phải chọn "Từ chối" phiếu đó. Logic này chống deadlock tài nguyên rất tốt.

- **Giai đoạn hiện tại / cấu hình cần đối chiếu:**
  - Backend API phân lớp namespace `/api/user/` và `/api/admin/`. `BACKEND/app/config/index.js` và `.env.example` mặc định port 8080; hai `http-common.js` frontend hiện gọi `http://localhost:3000`. Trước khi test tích hợp phải xác nhận `PORT` thực trong `.env` và thống nhất URL API.
  - `user-web` chạy port 5173, `admin-web` chạy port 5174 (hoặc 5172).
  - Cả 2 project đã đồng nhất về giao diện (UI/UX) và đồng bộ kiến trúc Composition API.
  - Không sử dụng Tailwind, mọi styling qua Bootstrap 5 grid/utilities và Custom CSS.

- **Việc còn lại / tiếp theo:**
  - Tinh chỉnh xử lý lỗi/empty-state tốt hơn trên UI (toast, loading state).
  - Kiểm tra RBAC bằng đăng nhập thật cho các vai trò `Admin`, `NhanVienQuanLySach`, `NhanVienDuyetMuon`; bài test HTTP với DB giả lập đã có, chưa thay thế kiểm thử thực tế.
  - Test toàn bộ luồng end-to-end: user đăng ký → mượn sách → admin duyệt → user thấy trạng thái.
  - Chưa tích hợp Redis/Gemini — không làm trong giai đoạn này.

## 2. Quyết định kiến trúc & Cấu trúc thư mục (Quan trọng)

- **KHÔNG SỬ DỤNG Mongoose**, KHÔNG tạo thư mục `models/`. Dùng native `mongodb` driver.
- Thao tác Database đặt trực tiếp trong `app/services/`.
- Cấu trúc thư mục Backend:
  ```text
  BACKEND/
  ├── app.js
  ├── server.js
  ├── package.json
  ├── .env             # Bị gitignore
  ├── .env.example
  └── app/
      ├── api-error.js
      ├── config/index.js
      ├── utils/mongodb.util.js
      ├── services/
      │   ├── sach.service.js
      │   ├── docgia.service.js
      │   ├── nhaxuatban.service.js
      │   ├── muonsach.service.js
      │   └── nhanvien.service.js
      ├── controllers/
      │   ├── admin/   # sach, nxb, muonsach, nhanvien, auth
      │   └── user/    # sach, muonsach, profile, auth
      ├── middlewares/
      │   ├── auth.js          # verifyAdminToken, verifyUserToken
      │   ├── verifyToken.js   # cho user routes
      │   ├── checkRole.js
      │   └── requireRole.js
      └── routes/
          ├── admin/
          └── user/
  ```

## 3. Lỗi / Vấn đề cần tránh (Đã phát sinh thực tế — RẤT QUAN TRỌNG)

| # | Vấn đề | Cách tránh |
|---|--------|-----------|
| 1 | **Thứ tự mount route `app.js`** | Route prefix rộng (có middleware auth) PHẢI mount SAU route cụ thể hơn. Ví dụ: `/api/user/sach` phải trước `/api/user`. |
| 2 | **VeeValidate silent fail** | Field trong Yup schema mà CSDL không chắc có → dùng `.nullable()` hoặc `.optional()`, không dùng `.required()`. |
| 3 | **VeeValidate re-init khi edit** | Dùng `:key="formKey"` + `:initial-values="formData"` + `formKey++` mỗi lần mở modal. |
| 4 | **Bootstrap Modal conflict** | Không vừa dùng `data-bs-dismiss="modal"` vừa `@click` handler trên cùng nút. Dùng một cái. |
| 5 | **Field name case mismatch** | Frontend dùng `TenSach` (camelCase), không dùng `TENSACH` (viết HOA). Controller và Service phải nhất quán. |
| 6 | **npm install** | Thư viện chính → `dependencies`; công cụ dev (`nodemon`, `morgan`) → `devDependencies`. |

## 4. Quản lý Git & Môi trường

- File `.env` chứa secret key (JWT_SECRET, CSDL) không được push lên Github.
- Thư mục `Cores/` tuyệt đối không được push lên Github (đã cấu hình `.gitignore`).

## 5. Nhiệm vụ tiếp theo

1. Tinh chỉnh UI: toast notification rõ ràng hơn, loading states, empty states có hướng dẫn.
2. Kiểm tra RBAC với ba tài khoản thật: menu, route trực tiếp, API và thao tác tạo/sửa/xóa nhân viên. Đối chiếu vai trò cũ `Staff` nếu dữ liệu đã có; code mới dùng ba giá trị `ChucVu` nêu trên.
3. Test end-to-end toàn bộ luồng mượn/trả.
4. Không mở rộng vào Redis/Gemini trong giai đoạn hiện tại.

## Cập nhật 2026-09-30 — Hoàn tất Giai đoạn 6, phân quyền nhân viên
- Đã thêm `/api/admin/nhanvien` với JWT admin và quyền `Admin`, dùng controller/service native MongoDB.
- Trang quản lý nhân viên cho phép Admin thêm, sửa chức vụ, xóa. Không cho xóa tài khoản đang đăng nhập.
- Sidebar và Vue Router phân quyền từ role trong JWT: `Admin` xem toàn bộ; `NhanVienQuanLySach` xem Sách/NXB; `NhanVienDuyetMuon` xem Dashboard/Mượn sách.
- Đã chạy `node --test test/admin-rbac.test.js` và `test/integration-flow.test.js` (E2E Test) thành công.
- Đã commit thành công Giai đoạn 6 vào nhánh main.

### Chuẩn bị Giai đoạn 7 — Quản lý Độc giả và Vi phạm
- **Nhiệm vụ sắp tới:** Tạo giao diện "Quản lý Độc giả" bên `admin-web` (dành cho role Admin).
- Thêm chức năng Khóa tài khoản (`TrangThaiTaiKhoan`) và theo dõi Vi Phạm (sách quá hạn, mất sách).
- Backend API `/api/admin/docgia` đã có nền tảng cơ bản, cần bổ sung endpoint để khóa/mở khóa tài khoản.

## Cập nhật 2026-09-30 (tối) — Giai đoạn 7 Phần 1: Quản lý Độc Giả
- **Backend API đã hoàn chỉnh (từ trước):**
  - `BACKEND/app/controllers/admin/docgia.controller.js`: 4 action — `findAll` (filter search + trạng thái), `findOne` (kèm thống kê mượn), `toggleAccountStatus` (khóa/mở khóa), `getBorrowHistory` (lịch sử mượn + lookup SACH).
  - `BACKEND/app/routes/admin/docgia.route.js`: 4 endpoint — `GET /`, `GET /:id`, `PUT /:id/status`, `GET /:id/history`. Middleware: `verifyAdminToken` + `requireRole(["Admin"])`.
  - `BACKEND/app.js`: đã mount `adminDocGiaRouter` tại `/api/admin/docgia`.
- **Frontend `admin-web` — `DocGiaManagement.vue` hoàn toàn mới:**
  - Badge thống kê: Tổng độc giả, Bình thường, Bị khóa, Đang mượn sách (click để lọc nhanh).
  - Thanh tìm kiếm client-side (debounced) theo tên/email/mã + dropdown lọc trạng thái tài khoản.
  - Bảng danh sách: Avatar initials, thông tin liên hệ, badge trạng thái, số lượng đang mượn, action buttons (chi tiết / lịch sử / khóa / mở khóa).
  - **Modal Chi Tiết Độc Giả**: Profile card + thông tin cá nhân + cảnh báo khóa (nếu có) + thống kê mượn sách (ChờDuyệt/ĐangMượn/QuáHạn/ĐãTrả) + link xem lịch sử.
  - **Modal Khóa Tài Khoản**: Cảnh báo + ô nhập lý do khóa + xác nhận.
  - **Modal Lịch Sử Mượn Sách**: Bảng chi tiết (ảnh sách, tên, ngày mượn, ngày hẹn trả, ngày trả, trạng thái badge).
  - Pagination 10 record/trang.
  - Toast notification success/error.
  - Build thành công ✅, không lỗi.
- **Sidebar + Router đã có sẵn** link `/docgia` cho role Admin (từ Giai đoạn 6).
- **Frontend service** `admin-web/src/services/docgia.service.js` đã có sẵn 4 method: `getAll()`, `get(id)`, `toggleAccountStatus(id, data)`, `getBorrowHistory(id)`.

## Cập nhật 2026-09-30 (tối) — Giai đoạn 7 Phần 2: Khóa người dùng và Quá hạn
- **Backend API:**
  - `docgia.service.js`: Hàm `login` đã có sẵn tính năng trả về lỗi 403 khi `TrangThaiTaiKhoan === "BiKhoa"`.
  - `muonsach.service.js`: Thêm kiểm tra ở hàm `create()` chặn user mượn sách nếu tài khoản bị khóa.
  - Bổ sung hàm `_checkAndUpdateOverdue()` (lazy-check) tự động quét và đổi trạng thái các phiếu mượn sang `"quá hạn"` nếu `ngayTra < today`. Hàm này được gọi tự động ở đầu các truy vấn `find`, `findById`, `findByDocGia`, `findAllPopulated`. Cập nhật `allowedTransitions` và `validStates` cho trạng thái `"quá hạn"`.
- **Frontend `user-web` & `admin-web`:**
  - Đồng bộ hiển thị UI cho trạng thái `"quá hạn"` (sử dụng màu danger/red). Thêm `"quá hạn"` vào dropdown lọc trạng thái của `MuonSachManagement.vue`.

## Cập nhật 2026-09-30 (tối muộn) — Giai đoạn 7 Phần 3: Bug Fixes & UX Improvements
- **Bug Fix 1 (Thống kê Đang mượn):** Sửa lỗi hiển thị số 0 ở cột Đang Mượn bằng cách đổi `$sum: 1` thành `$sum: "$soLuong"`, và gộp chung các trạng thái `chờ duyệt`, `đã duyệt`, `đang mượn`, `đang chờ trả` vào nhóm đang giữ sách.
- **Bug Fix 2 (Lịch sử mượn trống):** Sửa lỗi thẻ Lịch sử mượn sách ở cả Admin (`DocGiaManagement.vue`) và User (`BorrowHistory.vue`) không hiển thị ngày tháng và trạng thái do vẫn gọi biến in hoa (NgayMuon, TrangThai). Đã đổi đồng bộ thành camelCase (ngayMuon, trangThai).
- **Bug Fix 3 (Bootstrap JS):** Phát hiện và bổ sung `import "bootstrap/dist/js/bootstrap.bundle.min.js"` vào `main.js` của cả hai Frontend, giúp Dropdown Menu của User và Modal của Admin hoạt động chuẩn xác.
- **Bug Fix 4 (Quá hạn của "Đã duyệt"):** Sửa thuật toán `_checkAndUpdateOverdue()` ở Backend để quét cả những phiếu mượn `"đã duyệt"` (chưa lấy sách) chuyển thành `"quá hạn"` nếu trễ hạn.
- **UX Improvement:** Sửa lại nút "Đăng nhập" cứng trên Hero Banner của `user-web`. Giờ đây nếu user đã login, nút sẽ tự động chuyển thành "Lịch sử mượn sách".

### Giai đoạn tiếp theo (Giai đoạn 8) — Dashboard thống kê + UI hoàn thiện
- Dashboard admin: tổng sách, tổng độc giả, đang mượn, quá hạn
- Biểu đồ Chart.js: top sách, mượn/trả theo thời gian
- Responsive, loading states, thông báo lỗi rõ ràng

## Cập nhật 2026-10-01 — Giai đoạn 8 Phần 1: Tinh chỉnh UI/UX Mượn Trả
- **Backend API:** 
  - Đã cập nhật chức năng `requestReturn` (`/api/user/muonsach/:id/request-return`) để nhận thêm trường `ngayDuKienTra` (Ngày dự kiến mang sách đến trả) từ Độc giả.
  - Cập nhật `muonsach.service.js` (update method) cho phép cập nhật `ngayDuKienTra` vào CSDL.
- **Frontend `user-web`:**
  - Trang Lịch sử mượn sách (`BorrowHistory.vue`): Đã bổ sung cột "Thao tác" và nút "Xin trả sách".
  - Chuyển đổi từ hàm `prompt` mặc định sang sử dụng Bootstrap Modal sang trọng hơn cho chức năng "Xin trả sách". Tích hợp Datepicker (`<input type="date">`) giúp người dùng chọn ngày dự kiến dễ dàng hơn.
  - Đổi màu nút "Xin trả sách" thành warning đậm chữ đen để nổi bật và dễ nhìn hơn.
- **Frontend `admin-web`:**
  - Đã bổ sung hiển thị trường "Ngày hẹn mang sách trả" vào trong Modal Chi tiết phiếu mượn (đối với các phiếu có trạng thái "đang chờ trả") để Thủ thư dễ dàng theo dõi.
- **Tính năng dời lại (Deferred):**
  - Tính năng "Quên mật khẩu" và "Hiển thị thông báo (Notification)" sẽ tạm gác lại, không làm liền, dời sang các giai đoạn sau cùng hoặc mở rộng.

## Cập nhật 2026-10-02 — Giai đoạn 8 Phần 2: Dashboard Admin + UI User & Seeding Data
- **Backend API:**
  - Cập nhật pp.js cấu hình phục vụ static file từ public/uploads để hỗ trợ hiển thị ảnh từ local server.
  - Cập nhật user/sach.controller.js hỗ trợ query filter TheLoai.
- **Dữ liệu (Seeding):**
  - Viết seeder (seed_books.js) copy 100+ ảnh bìa từ thư mục dự án cũ sang public/uploads.
  - Sinh tự động dữ liệu 103 quyển sách đa dạng thể loại và import vào MongoDB.
- **Frontend user-web (Giao diện người dùng):**
  - Bổ sung UI Loading State (Skeleton loading) khi gọi API ở BookList.vue.
  - Bổ sung Toast Notification xử lý lỗi.
  - Thêm Bộ lọc Thể loại Sách (Category filter) vào thanh tìm kiếm và kết nối Backend. 
- **Frontend dmin-web (Dashboard Thống Kê):**
  - Giao diện Dashboard hoàn chỉnh với 4 KPI và 3 biểu đồ Chart.js (Line, Doughnut, Bar).
- **Trạng thái hiện tại:**
  - Đã hoàn thành 100% Giai đoạn 8.
  - Các tính năng mở rộng (Redis, Gemini AI, OAuth2) được dời sang Giai đoạn 10.
  - Bước tiếp theo: Giai đoạn 9 - Kiểm thử E2E và Deploy.

## Cập nhật 2026-10-03 — Giai đoạn 9: Kiểm thử E2E, Củng cố UI và Fix Bug Khắt khe
- **Backend API & Service (Đồng bộ CSDL khắt khe):** 
  - Đã rà soát và tái cấu trúc toàn bộ các file service (`docgia.service.js`, `nhanvien.service.js`, `sach.service.js`) và controller để gỡ bỏ hoàn toàn các biến fallback (`?? payload.maDocGia`, `?? payload.password`).
  - Ép buộc 100% hệ thống từ API đến Database phải sử dụng tên thuộc tính chuẩn theo Schema gốc của Giảng viên (Ví dụ: `MaDocGia`, `Password`, `HoLot`, `Ten`, `NgaySinh`).
- **Frontend `user-web` & `admin-web` (Fix Bug UI/UX):**
  - **Bug 1 (Hiển thị tên sau đăng xuất):** Đã tích hợp EventBus để dọ## Cập nhật 2026-10-09 — Giai đoạn 10: Tích hợp Redis Cache và Hoàn thiện Báo Cáo
- **Backend API (`redis.util.js`)**:
  - Triển khai Redis Client để hỗ trợ tính năng caching.
  - Tích hợp kết nối Redis tự động khi khởi động server trong `server.js`, tự động fallback nếu không chạy Redis server.
  - Bổ sung cấu hình linh hoạt cho Redis (URL, Timeout) vào `config/index.js`.
- **Tối ưu hóa hiệu năng (Caching)**:
  - Áp dụng caching vào API lấy danh sách sách (`/api/user/sach`) giúp trả về JSON ngay lập tức mà không cần query tới MongoDB, đặc biệt hữu ích khi user tìm kiếm và load trang.
  - Áp dụng caching vào Dashboard Thống kê của Admin (`/api/admin/dashboard/stats`) với thời gian sống (TTL) 5 phút, giúp giảm tải cực lớn cho database khi tính toán các số liệu tổng hợp mượn trả và top sách.
- **Xóa bộ đệm (Cache Invalidation)**:
  - Quản trị viên khi thao tác Create/Update/Delete sách thì bộ đệm danh sách sách (`user:sach:*`) tự động bị xóa, bảo đảm độc giả luôn thấy thông tin mới nhất.
  - Các thao tác Duyệt/Trả/Từ chối mượn sách cũng sẽ tự động xóa bộ đệm Dashboard để thủ thư luôn nhận được cập nhật tức thời về tình trạng số lượng sách.
- **Báo cáo cuối kỳ (`BaoCao.txt`)**:
  - Đã soạn thảo báo cáo cuối kỳ đầy đủ, văn phong học thuật, bao quát toàn bộ chức năng, nghiệp vụ và các tính năng nâng cao (AI, Redis). Sẵn sàng để bảo vệ và nộp bài.
- **Trạng thái**: Đã hoàn tất 100% GIAI ĐOẠN 10 và sẵn sàng đóng gói dự án. DỰ ÁN KẾT THÚC.n thiện.
  - Tự động gọi API chatbot và tự động parse response từ `res.data.reply`.
  - Tích hợp thành công vào Layout toàn cục `App.vue` để người dùng gọi mọi lúc mọi nơi.

## Cập nhật 2026-10-06 — Cải thiện Chatbot Gemini: Resilience & Fallback
- **Vấn đề gốc:** API Gemini trả về HTTP 503 (Service Unavailable / overloaded) liên tục, chatbot không sử dụng được.
- **Backend (`chatbot.service.js`) — Giải pháp 3 lớp:**
  1. **Exponential Backoff with Jitter:** Tự động retry khi gặp lỗi 503/500/502/504 với delay tăng dần (1s → 2s → 4s, max 15s) + jitter ±25% chống thundering herd. Tối đa 3 retry/model.
  2. **Model Fallback Chain:** Khi model `gemini-3.8-flash` bị quá tải liên tục (hết 3 retry), tự động chuyển xuống `gemini-3.5-flash-lite` (model nhẹ, nhanh, ít tải hơn). Model bị overload sẽ bị cooldown 5 phút rồi thử lại.
  3. **Multi-Key Rotation (giữ nguyên):** Khi gặp 429/403 (quota), tự động đổi sang key tiếp theo trong danh sách `GEMINI_API_KEYS`.
- **Config mới (`config/index.js` + `.env.example`):**
  - `GEMINI_MODEL_CHAIN` — Danh sách model fallback (mặc định: `gemini-3.8-flash,gemini-3.5-flash-lite`).
  - `GEMINI_MAX_RETRIES` (default: 3), `GEMINI_INITIAL_DELAY_MS` (default: 1000), `GEMINI_MAX_DELAY_MS` (default: 15000).
- **Chatbot Route (`chatbot.route.js`):** Đổi từ `loginLimiter` (15req/30s) sang `chatLimiter` riêng (30req/60s) — giảm false-positive rate limit cho chat.
- **Frontend `ChatWidget.vue` — UX cải thiện:**
  - Hiển thị "Đang xử lý... AI cần thêm thời gian ⏳" nếu response \> 6s.
  - Nút "Thử lại ngay" và "Hủy" khi gặp lỗi 503/429/offline.
  - Auto-retry sau 30s với countdown hiển thị trực tiếp trong bong bóng lỗi.
  - Phân loại lỗi (quá tải / mất mạng / lỗi khác) và hiển thị thông báo phù hợp.
- **Syntax check:** Tất cả các file sửa đổi (`chatbot.service.js`, `config/index.js`, `chatbot.route.js`) đều pass `node -c` ✅.

## Cập nhật 2026-10-09 — Giai đoạn 10: Tích hợp Redis Cache và Hoàn thiện Báo Cáo
- **Backend API (`redis.util.js`)**: Triển khai Redis Client để hỗ trợ tính năng caching, tự động fallback nếu không chạy Redis server.
- **Tối ưu hóa hiệu năng (Caching)**: Caching API `/api/user/sach` và `/api/admin/dashboard/stats`.
- **Xóa bộ đệm (Cache Invalidation)**: Tự động xóa/cập nhật bộ đệm khi dữ liệu thay đổi.
- **Báo cáo cuối kỳ**: Đã được hoàn thiện đầy đủ tại `Cores/BaoCao.txt`.
- **Trạng thái**: Đã hoàn tất 100% GIAI ĐOẠN 10 và sẵn sàng nộp bài. DỰ ÁN KẾT THÚC.

## Cập nhật 2026-10-09 — Giai đoạn 10: Tích hợp Redis Cache và Hoàn thiện Báo Cáo
- **Backend API (`redis.util.js`)**:
  - Triển khai Redis Client để hỗ trợ tính năng caching.
  - Tích hợp kết nối Redis tự động khi khởi động server trong `server.js`.
  - Bổ sung cấu hình linh hoạt cho Redis (URL, Timeout) vào `config/index.js`.
- **Tối ưu hóa hiệu năng (Caching)**:
  - Áp dụng caching vào API lấy danh sách sách (`/api/user/sach`) giúp trả về JSON ngay lập tức mà không cần query tới MongoDB, đặc biệt hữu ích khi user tìm kiếm và load trang.
  - Áp dụng caching vào Dashboard Thống kê của Admin (`/api/admin/dashboard/stats`) với thời gian sống (TTL) 5 phút, giúp giảm tải cực lớn cho database khi tính toán các số liệu tổng hợp mượn trả và top sách.
- **Tính năng mở rộng (Voice Search AI)**:
  - Tích hợp Web Speech API vào thanh tìm kiếm của `user-web` (BookList.vue).
  - Cho phép người dùng tìm kiếm rảnh tay qua micro với hiệu ứng UI (Pulse animation) hiện đại, tự động submit sau khi nhận dạng.
- **Xóa bộ đệm (Cache Invalidation)**:
  - Quản trị viên khi thao tác Create/Update/Delete sách thì bộ đệm danh sách sách (`user:sach:*`) tự động bị xóa, bảo đảm độc giả luôn thấy thông tin mới nhất.
  - Các thao tác Duyệt/Trả/Từ chối mượn sách cũng sẽ tự động xóa bộ đệm Dashboard để thủ thư luôn nhận được cập nhật tức thời về tình trạng số lượng sách.
- **Báo cáo cuối kỳ (`BaoCao.txt`)**:
  - Đã soạn thảo báo cáo cuối kỳ đầy đủ, văn phong học thuật, bao quát toàn bộ chức năng, nghiệp vụ và các tính năng nâng cao (AI, Redis). Sẵn sàng để bảo vệ và nộp bài.
- **Trạng thái**: Đã hoàn tất 100% GIAI ĐOẠN 10 và sẵn sàng đóng gói dự án.

## Cập nhật 2026-10-12 — Giai đoạn 11 (Deploy): Phân tích kiến trúc & Chuẩn bị triển khai

### Quyết định kiến trúc: ObjectId (_id) vs Mã nghiệp vụ (MaSach, MaDocGia...)
> Đây là quyết định thiết kế đã được phân tích và thống nhất — AI PHẢI tuân thủ trong mọi phiên sau.

**Kết luận đã thống nhất (Hybrid Strategy):**
- `_id` (ObjectId) → Dùng cho: URL routing (`/api/admin/sach/:id`), aggregate `$lookup`, foreign key nội bộ trong document, JWT session. Đây là key truy vấn nhanh nhất (clustered index, ~0.1ms).
- `MaSach`/`MaDocGia`/`MaNXB`/`MSNV` → Dùng cho: Hiển thị UI, tìm kiếm nghiệp vụ của user, báo cáo. Phải tạo **unique index** thủ công vì native mongodb driver không tự enforce.
- **VIỆC CÒN LẠI (chưa làm):** Thêm unique index cho các `Mã` khi khởi động server trong `mongodb.util.js` hoặc `server.js`:
  ```js
  await db.collection('DOCGIA').createIndex({ MaDocGia: 1 }, { unique: true });
  await db.collection('SACH').createIndex({ MaSach: 1 }, { unique: true });
  await db.collection('NHAXUATBAN').createIndex({ MaNXB: 1 }, { unique: true });
  await db.collection('NHANVIEN').createIndex({ MSNV: 1 }, { unique: true });
  await db.collection('THEODOIMUONSACH').createIndex(
    { MaDocGia: 1, MaSach: 1, NgayMuon: 1 }, { unique: true }
  );
  ```

### Kế hoạch Deploy (theo giáo trình thầy — nginx + PM2)
Thầy yêu cầu deploy theo mô hình on-premise/VPS với nginx + PM2 (khác với Render/Vercel ban đầu).

**Kiến trúc deploy:**
```
Internet (port 80/443)
    │
  [NGINX] ← Reverse Proxy
    ├── /api/* ─────► [PM2: Node.js] (port 3000)
    └── /* ─────────► [Vue dist/] (static files)
```

**3 thành phần cần cấu hình:**
1. **PM2** — Process Manager cho Node.js: giữ server không chết khi crash, auto-restart, chạy background.
2. **NGINX** — Reverse proxy: nhận request port 80, phân loại `/api/*` → Node, `/*` → Vue dist.
3. **Proxy trong Dev mode** (`vite.config.js`) — CHỈ dùng lúc development để tránh CORS; **KHÔNG dùng khi production** (nginx đã xử lý).

**Trạng thái**: Chưa thực hiện. Đây là bước tiếp theo cần làm.

**Thứ tự thực hiện:**
1. `npm run build` cho cả `user-web` và `admin-web` → sinh ra thư mục `dist/`
2. `pm2 start server.js --name "library-api"` + `pm2 save` + `pm2 startup`
3. Cấu hình nginx: serve `user-web/dist/` tại port 80, `admin-web/dist/` tại port 8080, proxy `/api/` → `localhost:3000`
4. `sudo nginx -t && sudo systemctl reload nginx`
5. Cập nhật `VITE_API_BASE_URL=/api` trong `.env.production` của cả 2 frontend trước khi build

**Lưu ý CORS khi deploy:** Sau khi có nginx, không cần Vite proxy nữa. Backend CORS whitelist phải thêm domain/IP thật của server.

## Cập nhật 2026-10-12 (Tối) — Hoàn thành Tính năng Đăng nhập Ủy quyền OAuth 2.0 (Google & Facebook)

### 1. Kiến trúc Xác thực Ủy quyền (OAuth 2.0 + Internal JWT)
- **Mục tiêu**: Cho phép Độc giả đăng nhập nhanh vào `user-web` bằng tài khoản Google hoặc Facebook. Tuyệt đối **không áp dụng cho `admin-web`** để bảo vệ an toàn bề mặt quản trị.
- **Mô hình kiến trúc**:
  ```
  [User Web: LoginUser.vue] ──(Redirect)──► [Backend: /api/user/auth/google hoặc facebook]
                                                   │ (Passport.js)
                                                   ▼
                                        [OAuth Provider: Google / Meta]
                                                   │ (User Profile + Email)
                                                   ▼
                                        [Backend: Callback URL]
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        [Tìm thấy Email trong DOCGIA]                                   [Chưa có tài khoản]
                   │                                                               │
                   ├───────────────────────────────────┬───────────────────────────┤
                   ▼                                   ▼                           ▼
        [Kiểm tra TrangThaiTaiKhoan]           [Cập nhật Provider]      [Tự động tạo DOCGIA mới]
                   │                                                         (MaDocGia, Password=null)
                   └───────────────────────────────────┬───────────────────────────┘
                                                       ▼
                                            [Cấp phát JWT nội bộ]
                                         (sub: _id, aud: "user", role: "DocGia")
                                                       ▼
                                 [Redirect: /oauth-callback?token=JWT]
                                                       ▼
                              [User Web: lưu localStorage + eventBus + Home/Sách]
  ```

### 2. Các thành phần đã triển khai
1. **Backend Service (`BACKEND/app/services/docgia.service.js`)**:
   - Thêm phương thức `findOrCreateByOAuth(profileData)`:
     - Chuẩn hóa Email (trim, toLowerCase).
     - Nếu đã tồn tại: kiểm tra tài khoản không bị khóa (`BiKhoa` -> reject 403), liên kết `oauthProvider` và `oauthId`.
     - Nếu chưa tồn tại: tự động sinh `MaDocGia` (`DG_GG_xxxxxx` cho Google, `DG_FB_xxxxxx` cho Facebook), lưu họ tên từ OAuth, gán `TrangThaiTaiKhoan: "BinhThuong"`, `Password: null`.
2. **Passport Configuration (`BACKEND/app/config/passport.js`)**:
   - Tích hợp `passport`, `passport-google-oauth20` và `passport-facebook`.
   - Cơ chế kiểm tra an toàn (`isGoogleConfigured()`, `isFacebookConfigured()`): Khi máy chủ chưa điền Client ID / Secret thì hệ thống vẫn khởi động bình thường, không gây sập (crash) server, đồng thời redirect kèm thông báo lỗi thân thiện cho người dùng.
3. **Controller & Route (`BACKEND/app/controllers/user/auth.controller.js` & `auth.route.js`)**:
   - `GET /api/user/auth/google`: Khởi tạo luồng Google OAuth.
   - `GET /api/user/auth/google/callback`: Nhận profile, phát hành JWT token nội bộ có `aud: "user"`.
   - `GET /api/user/auth/facebook`: Khởi tạo luồng Facebook OAuth.
   - `GET /api/user/auth/facebook/callback`: Nhận profile Facebook, phát hành JWT token.
   - `GET /api/user/auth/mock-oauth`: Chế độ Mock OAuth dành cho việc chấm thi hoặc demo offline mà không cần kết nối Google/Facebook Developer Console.
4. **Middleware Express (`BACKEND/app.js`)**:
   - Đăng ký `passport.initialize()`.
5. **Frontend User Web (`frontend/user-web`)**:
   - `src/views/LoginUser.vue`: Bổ sung 2 nút đăng nhập mạng xã hội (Google với chuẩn icon SVG đa sắc, Facebook với màu thương hiệu `#1877F2`), kèm divider "hoặc tiếp tục với" tinh tế. Xử lý hiển thị thông báo lỗi nếu nhận `query.error`.
   - `src/views/OAuthCallback.vue`: Màn hình trung chuyển hiện đại với thanh tiến trình mượt mà, nhận JWT token, tự động fetch profile (`/api/user/profile`), lưu vào `localStorage`, kích hoạt `eventBus.emit('auth-change')` và điều hướng về `/sach`.
   - `src/router/index.js`: Thêm route `/oauth-callback`.

### 3. Hướng dẫn cấu hình biến môi trường (.env)
Thêm các biến sau vào `BACKEND/.env` khi đưa vào sử dụng thực tế:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/user/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/user/auth/facebook/callback

OAUTH_CLIENT_REDIRECT_URL=http://localhost:5173/oauth-callback
```

### 4. Git Commit Message chuẩn (Conventional Commits)
```git
feat(auth): implement OAuth 2.0 Google and Facebook authentication for user web

- Add findOrCreateByOAuth method to DocGiaService with auto-linking and code generation
- Configure Passport.js with Google and Facebook strategies and graceful fallback
- Mount OAuth initiation, callback, and dev mock endpoints in user auth routes
- Create OAuthCallback.vue view with animated progress and auto-profile sync
- Enhance LoginUser.vue with branded Google and Facebook social login buttons
- Document OAuth 2.0 flow and environment configurations in checkpoint and report
```

## Cập nhật 2026-10-22 — Hoàn thành Hệ thống Thông báo (Notification Bell), Tái cấu trúc UX Action Dropdown và Chuẩn hóa Toàn diện Mã nguồn

### 1. Tổng quan công việc hoàn thành
Trong phiên làm việc này, hệ thống đã được nâng cấp 3 hạng mục trọng điểm nhằm tối ưu hóa trải nghiệm người dùng (UX) và chuẩn hóa chất lượng mã nguồn đạt chuẩn học thuật trước khi bảo vệ:
1. **In-App Notification Bell (`user-web`)**: Hệ thống chuông thông báo trên thanh điều hướng cho độc giả, tự động phát hiện sách quá hạn và sắp đến hạn trả mà không tạo thêm gánh nặng cho cơ sở dữ liệu.
2. **Refactor Action Dropdown (`admin-web` & `user-web`)**: Thay thế cụm nút bấm icon rời rạc bằng dropdown select theo ngữ cảnh trạng thái phiếu mượn, đi kèm nút kích hoạt đồng bộ.
3. **Chuẩn hóa & Làm sạch Mã nguồn (Zero Emoji in Code)**: Rà soát và loại bỏ 100% các biểu tượng cảm xúc (emoji) trong mã nguồn, option dropdown, câu thông báo và log hệ thống, đảm bảo phong cách lập trình trang nhã, tương thích đa nền tảng và tránh lỗi hiển thị/encoding khi chấm thi.

### 2. Chi tiết kỹ thuật triển khai

#### A. In-App Notification Bell trên User Web
- **Service (`frontend/user-web/src/services/muonsach.service.js`)**:
  - Bổ sung hàm `getNotifications()`: Tận dụng trực tiếp dữ liệu từ `getHistory()` (không cần tạo thêm endpoint backend mới, giảm tải DB).
  - Logic phân loại cảnh báo:
    - `alertType: 'overdue'`: Trạng thái `đang mượn` hoặc `quá hạn` có ngày hẹn trả đã qua so với ngày hiện tại (`daysRemaining < 0`).
    - `alertType: 'soon'`: Sách sắp hết hạn trong khoảng 0 đến 2 ngày (`0 <= daysRemaining <= 2`).
    - Sử dụng chuẩn `record.ngayHenTra` (hoặc fallback `record.ngayTra`) để tính toán chính xác số ngày.
- **Header Component (`frontend/user-web/src/components/AppHeader.vue`)**:
  - Bổ sung nút Icon Chuông (`fas fa-bell`) kèm Badge số lượng nổi bật.
  - Hiệu ứng rung chuông sinh động (`@keyframes bellShake`) kích hoạt tự động khi phát hiện có sách cần xử lý.
  - Panel Dropdown thông báo:
    - Header phong cách Gradient sang trọng, hiển thị tổng số thông báo cần lưu ý.
    - Danh sách phiếu mượn kèm ảnh bìa sách thu nhỏ (thumbnail), tiêu đề sách và chip trạng thái màu sắc trực quan (Đỏ: Quá hạn X ngày; Vàng cam: Hạn trả hôm nay / Còn X ngày).
    - Footer chuyển hướng nhanh độc giả đến trang Lịch sử mượn (`/lich-su`).
    - Trạng thái trống (Empty State) thân thiện khi không có sách đến hạn.
  - Tự động thăm dò dữ liệu (Auto-polling) mỗi 5 phút một lần, tự dọn dẹp bộ đếm thời gian khi component unmount (`clearInterval`).
  - Hỗ trợ đóng mở linh hoạt: Click vào icon chuông để mở, click ra ngoài (`clickOutside`) tự động đóng panel.

#### B. Tái cấu trúc UX/UI Thao tác Mượn Sách (Contextual Action Dropdown)
- **Admin Web (`frontend/admin-web/src/views/MuonSachManagement.vue`)**:
  - Thay thế cụm nút bấm tròn nhỏ rời rạc (khó bấm, khó hiểu nghĩa icon) thành `<select>` dropdown động kết hợp nút bấm thực thi (`.action-exec-btn`).
  - Hàm `getActionOptions(trangThai)` chỉ trả về các hành động hợp lệ theo nghiệp vụ:
    - `chờ duyệt` → `Duyệt phiếu`, `Từ chối`
    - `đã duyệt` → `Giao sách`, `Xác nhận trả`
    - `đang mượn` / `quá hạn` / `đang chờ trả` → `Xác nhận trả`
    - `đã trả` / `từ chối` → Không hiển thị thao tác (hiển thị ký tự `—`)
  - Màu sắc nút bấm tự động biến đổi trực quan theo thao tác được chọn (`getExecBtnClass`).
  - Tự động reset giá trị dropdown sau khi thực thi hành động để tránh người dùng thao tác nhầm lẫn.
- **User Web (`frontend/user-web/src/views/BorrowHistory.vue`)**:
  - Tương tự Admin, bảng lịch sử mượn sách của Độc giả được trang bị hệ thống `<select>` thao tác:
    - `chờ duyệt` → `Sửa số lượng`, `Hủy yêu cầu`
    - `đã duyệt` / `đang mượn` / `quá hạn` → `Hẹn trả sách`
    - `đang chờ trả` → Hiển thị Badge "Đang chờ" trạng thái tĩnh.
  - Phân tách rõ ràng giữa các luồng mở modal (`Xin trả sách`, `Sửa số lượng`) và xác nhận hủy yêu cầu.

#### C. Chuẩn hóa & Làm sạch Mã nguồn (Zero Emoji in Code)
- Loại bỏ toàn bộ emoji trong nhãn option dropdown của `getActionOptions()` và `getUserActionOptions()`.
- Rà soát và loại bỏ ký tự emoji trong:
  - `frontend/admin-web/src/views/DocGiaManagement.vue` (trạng thái tài khoản: `Bị khóa` / `Bình thường`).
  - `frontend/admin-web/src/services/export.service.js` (ghi chú Excel: `QUÁ HẠN`).
  - `frontend/user-web/src/components/ui/ChatWidget.vue` (thông báo lỗi kết nối và quá tải AI).
  - `frontend/user-web/src/views/BookDetail.vue` (thay ký tự unicode sao bằng icon FontAwesome `<i class="fas fa-star"></i>`).
  - Backend `chatbot.route.js`, `chatbot.service.js`, `redis.util.js`, `seedData.js`.
- Kết quả quét kiểm tra tự động: **0 emoji trong toàn bộ mã nguồn**. Cả 2 dự án frontend đều build thành công 100% (`npm run build`).

### 3. Git Commit Message chuẩn (Conventional Commits)
#### D. Thiết lập Toàn diện Unique Indexes & Query Indexes cho MongoDB
- **Mục tiêu**: Đảm bảo toàn vẹn dữ liệu nghiệp vụ, ngăn chặn hoàn toàn việc tạo trùng Mã (MaSach, MaDocGia, MSNV, MaNXB, Email), và tối ưu hóa tối đa tốc độ truy vấn mượn/trả và tìm kiếm sách.
- **Thực thi**:
  - Tạo tiện ích `BACKEND/app/utils/indexes.util.js` quản lý tập trung 17 definitions:
    - `SACH`: `uniq_MaSach` (Unique), `idx_TenSach`, `idx_TheLoai`, `idx_MaNXB`.
    - `DOCGIA`: `uniq_MaDocGia` (Unique), `uniq_Email` (Unique, Sparse), `idx_oauth` (Sparse).
    - `NHANVIEN`: `uniq_MSNV` (Unique), `uniq_EMAIL` (Unique, Sparse).
    - `NHAXUATBAN`: `uniq_MaNXB` (Unique), `uniq_TenNXB` (Unique).
    - `THEODOIMUONSACH`: `idx_muon_docgia_trangthai`, `idx_muon_masach`, `idx_muon_trangthai`, `idx_muon_ngayhentra`.
    - `DANHGIA` & `CHAT_HISTORY`: `idx_danhgia_sach_docgia`, `idx_chat_docgia_time`.
  - Tạo script CLI độc lập: `BACKEND/createIndexes.js` (gọi qua `npm run db:indexes`).
  - Tự động gọi `ensureIndexes()` trong `server.js` khi máy chủ khởi động (có bọc try-catch an toàn).
  - Kết quả kiểm chứng thực tế: 17 indexes đã được tạo và kích hoạt thành công 100%.

### 3. Git Commit Message chuẩn (Conventional Commits)
```git
feat(db): establish unique and query indexes for all MongoDB collections

- Implement centralized index definitions and ensureIndexes utility in indexes.util.js
- Add standalone createIndexes.js migration script and npm run db:indexes command
- Create unique indexes for MaSach, MaDocGia, MSNV, MaNXB, and Email
- Add compound indexes for borrow queries, status filtering, and chat history
- Integrate graceful index assertion into backend server startup in server.js
- Update project checkpoint and roadmap documents in Cores directory
```



