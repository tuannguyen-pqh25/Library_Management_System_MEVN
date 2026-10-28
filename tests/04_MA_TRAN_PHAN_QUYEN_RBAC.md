# MA TRẬN PHÂN QUYỀN HỆ THỐNG (RBAC ACCESS CONTROL MATRIX)

> **Kiến trúc bảo mật:** Role-Based Access Control (RBAC)  
> **Các cấp xác thực:**  
> - **Client-side:** Vue Router Navigation Guards (`beforeEach`)  
> - **Server-side:** Express.js Middlewares (`verifyToken`, `verifyAdminToken`, `checkRole`, `requireRole`)  
> - **Token Payload:** Phân định rõ ràng giữa Audience Độc giả (`aud: "user"`) và Audience Nhân viên (`aud: "admin"`).

---

## 1. DANH SÁCH 5 VAI TRÒ TRONG HỆ THỐNG

| Ký hiệu | Tên vai trò | CSDL lưu trữ | Mô tả phạm vi quyền hạn |
| :---: | :--- | :---: | :--- |
| **GUEST** | Khách vãng lai | *(Không lưu)* | Người dùng chưa đăng nhập, chỉ có quyền xem thông tin công khai (Sách, NXB, Đánh giá, Tìm kiếm giọng nói). |
| **READER** | Độc giả thư viện | Collection `DOCGIA` | Người dùng đã đăng ký/đăng nhập. Có quyền mượn sách, xin gia hạn, hẹn trả sách, đánh giá, yêu thích. |
| **STAFF_BOOK** | Thủ thư Quản lý Sách (`NhanVienQuanLySach`) | Collection `NHANVIEN` | Cán bộ phụ trách kho sách: CRUD Sách, CRUD Nhà xuất bản, xem Dashboard. *Không duyệt mượn, không quản lý nhân viên*. |
| **STAFF_LOAN** | Thủ thư Duyệt Mượn (`NhanVienDuyetMuon`) | Collection `NHANVIEN` | Cán bộ phụ trách thủ tục mượn trả: Duyệt phiếu mượn, giao sách, duyệt gia hạn, xác nhận trả sách, Dashboard. *Không sửa sách/NXB, không quản lý nhân viên*. |
| **ADMIN** | Quản trị viên Tối cao (`Admin`) | Collection `NHANVIEN` | Toàn quyền kiểm soát hệ thống: Quản lý Nhân viên, Quản lý Độc giả (Khóa/Mở/Reset), Quản lý Sách, NXB, Mượn trả và Dashboard. |

---

## 2. MA TRẬN PHÂN QUYỀN TRÊN GIAO DIỆN (FRONTEND ROUTER GUARDS)

Ký hiệu:
- ✅ **Cho phép (Allow):** Truy cập bình thường.
- 🔄 **Chuyển hướng Login (Redirect Login):** Bị chặn do chưa có token, chuyển về trang `/login`.
- ⛔ **Chặn quyền (Redirect Default):** Đã đăng nhập nhưng không đủ quyền, tự động chuyển về trang mặc định theo vai trò.
- ❌ **Không khả dụng (N/A):** Menu bị ẩn hoàn toàn trên giao diện.

### 2.1. Cổng Độc giả (User Web — `localhost:5173`)

| Đường dẫn Route | Tên Component | Khách (GUEST) | Độc giả (READER) | Nhân viên / Admin (STAFF / ADMIN) |
| :--- | :--- | :---: | :---: | :---: |
| `/` | `HomeUser.vue` | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| `/sach` | `BookList.vue` | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| `/sach/:id` | `BookDetail.vue` | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| `/login` | `LoginUser.vue` | ✅ Cho phép | ⛔ Về `/` (Đã login) | ✅ Cho phép |
| `/register` | `RegisterUser.vue` | ✅ Cho phép | ⛔ Về `/` (Đã login) | ✅ Cho phép |
| `/lich-su` | `BorrowHistory.vue` | 🔄 Chuyển hướng `/login` | ✅ Cho phép | 🔄 Chuyển hướng `/login` (Cần token `user`) |
| `/profile` | `ProfileUser.vue` | 🔄 Chuyển hướng `/login` | ✅ Cho phép | 🔄 Chuyển hướng `/login` (Cần token `user`) |
| `/yeuthich` | `WishlistUser.vue` | 🔄 Chuyển hướng `/login` | ✅ Cho phép | 🔄 Chuyển hướng `/login` (Cần token `user`) |
| `/gio-muon` | `CartUser.vue` | 🔄 Chuyển hướng `/login` | ✅ Cho phép | 🔄 Chuyển hướng `/login` (Cần token `user`) |

---

### 2.2. Cổng Quản trị (Admin Web — `localhost:5174`)

| Đường dẫn Route | Tên Component | Khách (GUEST) | Độc giả (READER) | Thủ thư Sách (`STAFF_BOOK`) | Thủ thư Mượn (`STAFF_LOAN`) | Quản trị (`ADMIN`) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `/login` | `Login.vue` | ✅ Cho phép | ✅ Cho phép | ⛔ Về `/sach` | ⛔ Về `/muonsach` | ⛔ Về `/dashboard` |
| `/dashboard` | `StaffDashboard.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ⛔ Về `/sach` | ✅ Cho phép | ✅ Cho phép |
| `/sach` | `StaffSachManagement.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ✅ Cho phép | ⛔ Về `/muonsach` | ✅ Cho phép |
| `/sach/add` | `SachAdd.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ✅ Cho phép | ⛔ Về `/muonsach` | ✅ Cho phép |
| `/sach/edit/:id` | `SachEdit.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ✅ Cho phép | ⛔ Về `/muonsach` | ✅ Cho phép |
| `/nxb` | `StaffNhaXuatBanManagement.vue`| 🔄 Về `/login` | 🔄 Về `/login` | ✅ Cho phép | ⛔ Về `/muonsach` | ✅ Cho phép |
| `/muonsach` | `MuonSachManagement.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ⛔ Về `/sach` | ✅ Cho phép | ✅ Cho phép |
| `/nhanvien` | `NhanVienManagement.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ⛔ Về `/sach` | ⛔ Về `/muonsach` | ✅ Cho phép |
| `/docgia` | `DocGiaManagement.vue` | 🔄 Về `/login` | 🔄 Về `/login` | ⛔ Về `/sach` | ⛔ Về `/muonsach` | ✅ Cho phép |

---

## 3. MA TRẬN PHÂN QUYỀN API BACKEND (MIDDLEWARE HTTP STATUS CODES)

Quy ước mã phản hồi HTTP:
- `200` / `201`: Thao tác thành công.
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ / hết hạn.
- `403 Forbidden`: Đã đăng nhập nhưng không đủ quyền thực hiện thao tác này.
- `400 Bad Request`: Sai dữ liệu đầu vào hoặc vi phạm quy tắc nghiệp vụ.

### 3.1. Nhóm API Phía Độc Giả (`/api/user/...`)

| Phương thức & Endpoint | Chức năng nghiệp vụ | Middleware áp dụng | GUEST | READER | STAFF_BOOK | STAFF_LOAN | ADMIN |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/user/auth/register` | Đăng ký tài khoản độc giả | Public | `201` | `201` | `201` | `201` | `201` |
| `POST /api/user/auth/login` | Đăng nhập độc giả | `loginLimiter` | `200` | `200` | `200` | `200` | `200` |
| `GET /api/user/sach` | Lấy danh sách sách | Public (Redis Cache) | `200` | `200` | `200` | `200` | `200` |
| `GET /api/user/sach/:id` | Xem chi tiết 1 cuốn sách | Public (Join Tên NXB) | `200` | `200` | `200` | `200` | `200` |
| `GET /api/user/profile` | Xem thông tin hồ sơ cá nhân | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `PUT /api/user/profile` | Cập nhật thông tin cá nhân | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `PUT /api/user/profile/password` | Đổi mật khẩu độc giả | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `POST /api/user/muon` | Tạo phiếu mượn sách mới | `verifyToken`, `checkRole(["DocGia"])` | `401` | `201` | `403` | `403` | `403` |
| `GET /api/user/muon/lich-su` | Xem lịch sử mượn sách | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `DELETE /api/user/muon/:id` | Hủy phiếu mượn chờ duyệt | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `POST /api/user/muon/:id/gia-han` | Xin gia hạn mượn sách | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `POST /api/user/muon/:id/request-return` | Hẹn ngày mang trả sách | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `POST /api/user/yeuthich/:id/toggle` | Thêm / Bỏ yêu thích sách | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |
| `POST /api/user/danhgia/:id` | Viết đánh giá nhận xét sách | `verifyToken`, `checkRole(["DocGia"])` | `401` | `200` | `403` | `403` | `403` |

---

### 3.2. Nhóm API Phía Quản Trị (`/api/admin/...`)

| Phương thức & Endpoint | Chức năng nghiệp vụ | Middleware áp dụng | GUEST | READER | STAFF_BOOK | STAFF_LOAN | ADMIN |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/admin/auth/login` | Đăng nhập nhân viên/admin | `loginLimiter` | `200` | `200` | `200` | `200` | `200` |
| `GET /api/admin/dashboard/stats` | Thống kê KPI Dashboard | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `GET /api/admin/sach` | Danh sách sách quản trị | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `200` | `403` | `200` |
| `POST /api/admin/sach` | Thêm sách mới vào kho | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `201` | `403` | `201` |
| `PUT /api/admin/sach/:id` | Cập nhật thông tin sách | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `200` | `403` | `200` |
| `DELETE /api/admin/sach/:id` | Xóa sách khỏi hệ thống | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `200` | `403` | `200` |
| `GET /api/admin/nxb` | Danh sách Nhà Xuất Bản | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `200` | `403` | `200` |
| `POST /api/admin/nxb` | Thêm Nhà Xuất Bản mới | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `201` | `403` | `201` |
| `DELETE /api/admin/nxb/:id` | Xóa Nhà Xuất Bản | `verifyAdminToken`, `requireRole([Admin, NhanVienQuanLySach])` | `401` | `403` | `200` | `403` | `200` |
| `GET /api/admin/muonsach` | Danh sách mượn sách | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `PUT /api/admin/muonsach/:id/approve` | **Duyệt phiếu mượn (Trừ kho)** | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `PUT /api/admin/muonsach/:id/reject` | Từ chối phiếu mượn | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `PUT /api/admin/muonsach/:id/handover` | Giao sách cho độc giả | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `PUT /api/admin/muonsach/:id/approve-extend` | Duyệt gia hạn mượn sách | `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `PUT /api/admin/muonsach/:id/confirm-return` | **Xác nhận trả sách (Hoàn kho)**| `verifyAdminToken`, `requireRole([Admin, NhanVienDuyetMuon])` | `401` | `403` | `403` | `200` | `200` |
| `DELETE /api/admin/muonsach/:id` | Xóa bản ghi mượn sách | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `GET /api/admin/docgia` | Danh sách độc giả | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `PUT /api/admin/docgia/:id/status` | **Khóa / Mở tài khoản độc giả**| `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `PUT /api/admin/docgia/:id/reset-password` | Đặt lại mật khẩu độc giả | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `GET /api/admin/nhanvien` | Danh sách nhân viên | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `POST /api/admin/nhanvien` | Thêm nhân viên mới | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `201` |
| `PUT /api/admin/nhanvien/:id` | Cập nhật thông tin nhân viên | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |
| `DELETE /api/admin/nhanvien/:id` | Xóa nhân viên khỏi hệ thống | `verifyAdminToken`, `requireRole([Admin])` | `401` | `403` | `403` | `403` | `200` |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ TÍNH TOÀN VẸN BẢO MẬT

1. **Ngăn chặn Leo quyền Ngang (Horizontal Privilege Escalation):**
   - Độc giả A không thể xem lịch sử mượn hay sửa hồ sơ của Độc giả B vì backend luôn trích xuất `req.user._id` từ JWT đã được ký mật mã, không dựa vào client gửi ID tùy ý.
2. **Ngăn chặn Leo quyền Dọc (Vertical Privilege Escalation):**
   - Token của Độc giả (`aud: "user"`) khi gọi sang endpoint `/api/admin/...` lập tức bị chặn bởi middleware `verifyAdminToken` với mã lỗi `403 Forbidden`.
   - Nhân viên chức vụ `NhanVienQuanLySach` không thể can thiệp vào quy trình duyệt mượn; ngược lại `NhanVienDuyetMuon` không thể chỉnh sửa dữ liệu kho sách.
3. **Cơ chế Chống Đăng Nhập Brute-Force:**
   - Middleware `loginLimiter` bảo vệ các route `/login` của cả User và Admin, chặn các cuộc tấn công dò quét mật khẩu tự động.
