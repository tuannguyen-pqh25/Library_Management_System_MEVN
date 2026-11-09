# Library Management System (MEVN Stack)
### Nền Tảng Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x_(Composition_API)-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Native_Driver-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-In--Memory_Cache-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Automated Tests](https://img.shields.io/badge/Tests-44%2F44_PASS_(100%25)-success?logo=checkmarx&logoColor=white)](https://github.com/)
[![NGINX](https://img.shields.io/badge/NGINX-Reverse_Proxy-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![PM2](https://img.shields.io/badge/PM2-Process_Manager-2B037A?logo=pm2&logoColor=white)](https://pm2.keymetrics.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An online library management platform built on the **MEVN Stack** (MongoDB Native Driver, Express.js, Vue 3, Node.js). Features dual independent Single Page Applications (SPAs), native database operations with 17 clustered and compound indexes, event-driven Redis caching, an automated integration testing suite (44 scenarios, 100% pass rate), concurrency-safe inventory allocation, and production deployment configurations with NGINX reverse proxy and PM2 process supervision.

---

## Language Navigation / Chuyển Đổi Ngôn Ngữ
- [English Version](#-english-version) (Architecture, Technical Specifications, Setup & Deployment)
- [Bản Tiếng Việt](#-bản-tiếng-việt) (Tổng quan kiến trúc, Đặc tả kỹ thuật, Cài đặt & Vận hành)

---

# 🌐 ENGLISH VERSION

## 1. System Overview & Architecture

The system digitizes library book lending workflows, covering catalog discovery, reservation queueing, quota validation, multi-stage approval, loan renewals, and return reconciliation.

### Core Architectural Components
- **Dual Decoupled Frontends**:
  - `user-web` (Client portal, Port 5173 / Prod Port 80): Catalog browsing, voice search, Google OAuth 2.0, reservation booking, book extension, and notification center.
  - `admin-web` (Management portal, Port 5174 / Prod Port 8080): Administrative surface isolated from the public client bundle. Role-based dashboards, inventory lifecycle, loan approvals, reader moderation, and staff delegation.
- **Unified RESTful API Gateway** (`BACKEND`, Port 3000):
  - Layered routing architecture with strict middleware enforcement (`/api/user/*` and `/api/admin/*`).
  - Native driver communication protocol without Object-Document Mapping (ODM) abstraction layers.
- **Production Reverse Proxy & Process Control**:
  - NGINX serving static Vue bundles via HTML5 History Mode (`try_files`), offloading SSL/Gzip, and proxying API traffic.
  - PM2 daemon manager providing automatic recovery, cluster monitoring, and memory threshold management (500MB cap).

```text
                      INTERNET / CLIENT TRAFFIC
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼ (Port 80)                                 ▼ (Port 8080)
     [NGINX: User Web]                         [NGINX: Admin Web]
     - Serves user-web/dist                    - Serves admin-web/dist
     - Gzip Compression & Cache                - Restricted management IP
           │                                           │
           └───────────────────┬───────────────────────┘
                               │ Reverse Proxy /api/* & /uploads/*
                               ▼
                   [PM2: Node.js Backend API] (Port 3000)
                     Express.js Service-Oriented Core
                               │
           ┌───────────────────┴───────────────────┐
           ▼                                       ▼
  [MongoDB Native Driver]                 [Redis Cache Engine]
  - 5 Core Collections                    - In-Memory Key-Value Cache
  - 17 Clustered & Compound Indexes       - Sub-millisecond Read Response
  - Atomic $inc & $set Operations         - Event-Driven Cache Invalidation
```

---

## 2. Technical Specifications & Implementation Details

### 1. Native MongoDB Driver & Hybrid Identifier Design
- **No ODM Abstraction**: Implemented using the official `mongodb` native driver (no Mongoose). Eliminates schema hydration and internal middleware overhead.
- **Hybrid Key Model**:
  - `_id` (`ObjectId`): Utilized as the physical clustered index (~0.1ms lookup), internal foreign key, URL parameter routing, and `$lookup` aggregation joins.
  - `MaSach` / `MaDocGia` / `MSNV` / `MaNXB`: Structured business identifiers displayed on UI, cards, and printed reports.
- **17 Custom Database Indexes**: Automated index verification on server boot (`indexes.util.js` & `createIndexes.js`) enforcing unique constraints and compound query acceleration, with automated migration handling conflicting legacy index keys (error code 85).

### 2. Concurrency Control & Overbooking Prevention
- **Deferred Decrement**: Creating a borrow request does not prematurely decrement stock while in the `chờ duyệt` (pending approval) state, preventing unapproved reservations from freezing physical inventory.
- **Atomic Stock Verification**: Stock decrement occurs strictly during librarian approval (`approve`). The system atomically validates `SoQuyenConLai >= soLuong`. If stock is depleted by a concurrent approval, the request is rejected with HTTP 400.

### 3. Book Renewal Workflow (3-Day Lead Time Policy)
- Extension requests are governed by operational constraints:
  1. Record must be actively loaned (`đang mượn`) and not overdue.
  2. Must be requested **at least 3 days before the due date** (`ngayTra - today >= 3`).
  3. Maximum ceiling of **2 renewals per book** (+7 or +14 days).
  4. Requires formal librarian review and approval before the return date is updated.

### 4. Redis In-Memory Caching & Event-Driven Invalidation
- **Caching Layer**: Public book catalog queries (`/api/user/sach`) and administrative analytics (`/api/admin/dashboard/stats`) are cached in Redis with configurable TTLs.
- **Latency Reduction**: Catalog endpoint response times decrease from ~65ms to 1-2ms under cache hits.
- **Event-Driven Invalidation**: Mutations on book entities (Create/Update/Delete) immediately purge `user:sach:*` keys. Loan approvals, returns, and rejections immediately flush `admin:dashboard:stats`.

### 5. Automated Integration Testing (44 Scenarios)
- **Native Test Runner**: Custom test suite (`tests/run-api-tests.js`) built with native Node.js and fetch, executing all 44 integration tests sequentially in 1-2 seconds.
- **Full-Lifecycle Coverage (9 Groups)**:
  1. *Healthcheck & Public Endpoints*: Server availability and public book discovery.
  2. *Authentication & User Profile*: Reader registration, duplicate email prevention, bcrypt password hashing, JWT verification, and profile updates.
  3. *Three-Tier RBAC & Route Security*: 403 Forbidden enforcement across `Admin`, `NhanVienQuanLySach`, and `NhanVienDuyetMuon`.
  4. *Atomic Overbooking Concurrency*: Simulates two concurrent readers borrowing a single physical book copy; guarantees one succeeds and the second receives HTTP 400.
  5. *Review Guarding*: Requires an approved loan record before submitting a book review.
  6. *Borrow/Renewal/Return Lifecycle*: Loan creation, +7-day extension request & approval, return confirmation, and atomic stock replenishment.
  7. *Account Moderation*: Reader suspension $\rightarrow$ borrow blocking $\rightarrow$ account reinstatement.
  8. *Administrative Analytics*: Real-time KPI aggregation and Dashboard metrics verification.
- **Execution**: Run via `npm test` inside `BACKEND` or `node tests/run-api-tests.js`.

### 6. Deterministic In-App Notifications & Account Moderation
- **Deterministic ID Generation**: Generates immutable event identifiers (`${item._id}_approved`, `${item._id}_ext_approved_${count}`, `account_locked_${docGiaId}`) to prevent notification badge recalculation upon page refresh.
- **Automated Overdue Account Suspension**: Suspends reader accounts (`TrangThaiTaiKhoan = "BiKhoa"`) when overdue duration exceeds 7 days or accumulated fines reach $\ge$ 100,000 VND (5,000 VND/day/book).
- **Multi-Tiered Warnings**: Dispatches 3-day and 1-day pre-lock warnings, alongside 50,000 VND and 75,000 VND threshold notices.
- **Locked Borrowing Enforcement**: Readers with suspended accounts are blocked from submitting new borrow requests.
- **Post-Return Moderation Prompt**: Upon book return confirmation, staff are prompted with a dedicated dialog to evaluate whether to reinstate the reader's account or maintain the suspension.

### 7. Search Mechanisms: Hot Search, Live Typeahead & Web Speech API
- **Multi-Term Hot Search & Typeahead**: As-you-type search (250ms debounce) filtering across book titles and authors via safe regex lookaheads `(?=.*word1)(?=.*word2)`, accompanied by real-time suggestion dropdowns.
- **Web Speech API Integration**: Browser-native speech recognition supporting Vietnamese (`vi-VN`) in both User Web and Admin Web search bars.
- **Lifecycle Management**: Aborts previous recognition sessions and instantiates fresh `SpeechRecognition` objects to eliminate Chromium `DOMException: InvalidStateError`.

### 8. Authentication & Role-Based Access Control (RBAC)
- **Google OAuth 2.0**: Social login integration linking external identity with internal `DOCGIA` records without passwords, auto-issuing scoped JWTs (`aud: "user"`). Supports dynamic client origin redirection via OAuth `state` (RFC 6749) across production and development environments.
- **Dual Identifiers**: Authenticate via registered Email or Phone Number with matching Bcrypt verification.
- **Three-Tier RBAC**:
  - `Admin`: System-wide access, staff delegation, reader suspension, audit reports.
  - `NhanVienQuanLySach`: Catalog inventory and publishing house management.
  - `NhanVienDuyetMuon`: Loan approvals, extension evaluations, returns, and overdue tracking.

### 9. Pagination & Table Management
- **Configurable Page Sizes**: Standardized 10, 20, 50, 100 rows/page selector across all management dashboards.
- **State Guard**: Resets `currentPage = 1` upon switching page sizes to prevent out-of-bound blank displays.

### 10. Data Integrity & Active Loan Deletion Guard
- **Integrity Validation**: `DELETE /api/admin/docgia/:id` inspects active circulation records in `THEODOIMUONSACH` (`chờ duyệt`, `đã duyệt`, `đang mượn`, `đang chờ trả`, `quá hạn`, `chờ gia hạn`). Rejects deletion with HTTP 400 if active loans exist.
- **Bulk Operations**: Multi-select checkbox tools supporting bulk lock, bulk unlock, and bulk deletion.

### 11. Catalog Sorting & ISO 8601 Timestamps
- **Timestamp Tracking**: Automatic recording of `createdAt` and `updatedAt` on book records.
- **Catalog Sorting**: Orders books by `Math.max(updatedAt, createdAt)` with a 4-byte MongoDB ObjectId timestamp fallback, coupled with Redis cache invalidation.

---

## 3. Technology Stack Breakdown

| Layer | Technologies & Libraries |
|---|---|
| **Frontend Clients** | Vue 3 (Composition API, `<script setup>`), Vite, Vue Router 4, Pinia, Axios, Bootstrap 5.3, FontAwesome 6, Chart.js, VeeValidate 4 + Yup |
| **Backend API** | Node.js (v20+), Express.js 4, Native MongoDB Driver (v6), Bcrypt.js, JsonWebToken, Passport.js, Morgan, Cors |
| **Databases & Cache** | MongoDB (Document Store), Redis (In-Memory Key-Value Store) |
| **External & Web APIs** | Web Speech API (W3C Standard - Voice Search), Google OAuth 2.0 |
| **DevOps & Production** | NGINX (Reverse Proxy, Gzip, History Mode), PM2 (Process Supervisor) |

---

## 4. Setup & Execution Guide

### Prerequisites
- **Node.js (v20+)** and **MongoDB** installed.
- MongoDB service running on default port `27017`.
- (Optional) Redis Server running on port `6379`. If unavailable, the backend activates a graceful fallback mode.

### Development Mode Setup

1. **Backend API**:
   ```bash
   cd BACKEND
   npm install
   cp .env.example .env
   # Configure connection strings and JWT_SECRET in .env
   npm run seed        # Seed initial sample data and admin account
   npm run db:indexes  # Provision 17 Unique & Compound Indexes in MongoDB
   npm run dev         # Starts server at http://localhost:3000
   ```

2. **Reader Portal (User Web)**:
   ```bash
   cd frontend/user-web
   npm install
   npm run dev         # Starts client at http://localhost:5173
   ```

3. **Management Portal (Admin Web)**:
   ```bash
   cd frontend/admin-web
   npm install
   npm run dev         # Starts client at http://localhost:5174
   ```

4. **Run Automated Test Suite**:
   ```bash
   # Option 1: Native test runner from project root
   node tests/run-api-tests.js

   # Option 2: Standard npm script inside BACKEND
   cd BACKEND && npm test

   # Option 3 (Windows): Double-click tests/run-tests.bat
   ```

---

## 5. Production Deployment (NGINX & PM2)

### Step 1: Build Frontend Single Page Applications
```bash
# 1. Build Reader Portal (outputs to frontend/user-web/dist)
cd frontend/user-web
npm run build

# 2. Build Management Portal (outputs to frontend/admin-web/dist)
cd ../admin-web
npm run build
cd ../..
```

### Step 2: Manage Backend Process with PM2
```bash
# Install PM2 globally if not present
npm install -g pm2

# Start Backend daemon using configuration file
cd BACKEND
pm2 start ecosystem.config.js

# Configure PM2 startup hook for system reboots
pm2 save
pm2 startup
```

### Step 3: Run & Configure NGINX Reverse Proxy

#### Windows:
```cmd
:: Start NGINX pointing to project configuration (from project root)
nginx -c ./nginx.conf

:: Reload NGINX configuration without downtime
nginx -s reload

:: Stop NGINX
nginx -s quit
```

#### Linux / Ubuntu VPS:
```bash
# Test configuration syntax
sudo nginx -t -c /path/to/project/nginx.conf

# Copy configuration to NGINX directory
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Verify Production Endpoints
- **Reader Portal (User Web)**: `http://localhost/` (Port 80)
- **Management Portal (Admin Web)**: `http://localhost:8080/` (Port 8080)
- **API & Uploads**: Reverse-proxied to `http://127.0.0.1:3000` via `/api/*` and `/uploads/*`. Vue Router HTML5 History Mode is handled via `try_files`.

---

# 🇻🇳 BẢN TIẾNG VIỆT

## 1. Tổng Quan Hệ Thống & Đặc Tả Nghiệp Vụ

Hệ thống **Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến** được xây dựng trên nền tảng **MEVN Stack** (MongoDB, Express.js, Vue 3, Node.js). Hệ thống số hóa toàn diện quy trình mượn trả sách thư viện: tra cứu danh mục, đăng ký mượn, kiểm soát hạn mức mượn, duyệt phiếu mượn, gia hạn theo quy định, xử lý quá hạn và hoàn kho tài liệu.

### Kiến Trúc Hệ Thống:
- **Hai Ứng Dụng Frontend Độc Lập**:
  - `user-web` (Cổng Độc giả, Cổng 5173 / Production Cổng 80): Tra cứu sách, tìm kiếm giọng nói, đăng nhập Google OAuth 2.0, đăng ký mượn, xin gia hạn và chuông thông báo cá nhân.
  - `admin-web` (Cổng Quản trị, Cổng 5174 / Production Cổng 8080): Tách biệt hoàn toàn khỏi phân hệ người dùng. Cung cấp bảng điều khiển thống kê, quản lý kho sách, duyệt mượn trả, quản lý độc giả và phân quyền nhân viên.
- **Cổng Giao Tiếp Backend API Tập Trung** (`BACKEND`, Cổng 3000):
  - Kiến trúc phân tầng (Controller - Service - Route), kiểm soát quyền truy cập qua middleware (`/api/user/*` và `/api/admin/*`).
  - Giao tiếp trực tiếp với cơ sở dữ liệu qua MongoDB Native Driver, không sử dụng ODM (Mongoose).
- **Hạ Tầng Triển Khai NGINX & PM2**:
  - NGINX đóng vai trò Reverse Proxy phục vụ tệp tĩnh, nén Gzip, xử lý Vue Router History Mode qua `try_files` và chuyển tiếp yêu cầu API.
  - PM2 quản lý tiến trình Node.js Backend, tự động khởi động lại khi có lỗi hoặc khi khởi động lại máy chủ.

---

## 2. Đặc Tả Kỹ Thuật Chi Tiết

### 1. MongoDB Native Driver & Chiến Lược Hybrid Identifier
- **Không Sử Dụng Mongoose (ODM)**: Toàn bộ thao tác cơ sở dữ liệu sử dụng trực tiếp thư viện chính thức `mongodb` v6.x, loại bỏ tầng trung gian schema hydration và middleware overhead của ODM.
- **Chiến Lược Hybrid Key**:
  - `_id` (`ObjectId`): Sử dụng làm khóa chính vật lý (clustered index ~0.1ms), khóa ngoại liên kết nội bộ, tham số URL và phép nối `$lookup`.
  - `MaSach` / `MaDocGia` / `MSNV` / `MaNXB`: Mã định danh nghiệp vụ chuẩn hóa hiển thị trên giao diện và các báo cáo.
- **17 Chỉ Mục (Indexes) MongoDB**: Khởi tạo tự động khi khởi động máy chủ (`indexes.util.js` & `createIndexes.js`), kiểm soát ràng buộc duy nhất (unique) và tăng tốc các truy vấn kết hợp (compound), tích hợp cơ chế tự động xử lý xung đột quy cách chỉ mục cũ (mã lỗi 85).

### 2. Kiểm Soát Đồng Thời & Chống Overbooking
- **Cơ Chế Trừ Kho Tại Thời Điểm Duyệt**: Khi độc giả tạo phiếu mượn, phiếu ở trạng thái `chờ duyệt` và hệ thống chưa trừ tồn kho, tránh việc đặt giữ chỗ làm đóng băng kho sách.
- **Thao Tác Nguyên Tử Khi Phê Duyệt**: Tồn kho chỉ được trừ khi thủ thư bấm duyệt phiếu (`approve`). Hệ thống kiểm tra điều kiện `SoQuyenConLai >= soLuong` bằng thao tác nguyên tử. Nếu số lượng sách không đủ do yêu cầu khác đã được duyệt trước, hệ thống từ chối yêu cầu và trả về lỗi HTTP 400.

### 3. Quy Trình Gia Hạn Sách (Quy Tắc 3 Ngày)
- Yêu cầu gia hạn được kiểm soát theo các điều kiện nghiệp vụ:
  1. Phiếu mượn ở trạng thái `đang mượn` và chưa quá hạn.
  2. Phải được gửi **trước ngày hẹn trả ít nhất 3 ngày** (`ngayTra - today >= 3`).
  3. Giới hạn tối đa **2 lần gia hạn cho mỗi phiếu** (+7 hoặc +14 ngày/lần).
  4. Cần thủ thư phê duyệt trước khi hạn trả mới có hiệu lực.

### 4. Bộ Đệm Redis In-Memory Cache & Cơ Chế Xóa Cache Theo Sự Kiện
- **Tầng Đệm Redis**: Dữ liệu danh mục sách công khai (`/api/user/sach`) và số liệu thống kê quản trị (`/api/admin/dashboard/stats`) được lưu bộ đệm với thời gian sống (TTL) phù hợp.
- **Giảm Độ Trễ**: Thời gian phản hồi API danh mục sách giảm từ ~65ms xuống 1-2ms khi trúng cache.
- **Xóa Cache Theo Sự Kiện**: Thao tác tạo/sửa/xóa sách xóa sạch khóa `user:sach:*`. Thao tác duyệt mượn, trả sách hoặc từ chối tự động làm mới `admin:dashboard:stats`.

### 5. Bộ Kiểm Thử Tích Hợp Tự Động (44 Kịch Bản Kiểm Thử)
- **Script Kiểm Thử Độc Lập**: Xây dựng script kiểm thử API (`tests/run-api-tests.js`) bằng Node.js thuần, thực thi tuần tự 44 kịch bản kiểm thử trong khoảng 1-2 giây.
- **Phạm Vi Kiểm Thử (9 Nhóm Nghiệp Vụ)**:
  1. *Kiểm tra trạng thái & API công khai*: Kiểm tra tính sẵn sàng của máy chủ và danh mục sách.
  2. *Xác thực & Thông tin độc giả*: Đăng ký, chặn trùng email, băm mật khẩu bcrypt, kiểm tra JWT và cập nhật hồ sơ.
  3. *Phân quyền RBAC 3 vai trò*: Kiểm tra mã lỗi HTTP 403 khi truy cập trái quyền giữa `Admin`, `NhanVienQuanLySach` và `NhanVienDuyetMuon`.
  4. *Kiểm tra Overbooking đồng thời*: Mô phỏng 2 yêu cầu mượn đồng thời 1 quyển sách duy nhất; bảo đảm 1 yêu cầu thành công và yêu cầu còn lại nhận mã lỗi 400.
  5. *Ràng buộc đánh giá sách*: Yêu cầu có phiếu mượn đã duyệt trước khi gửi đánh giá sách.
  6. *Chu trình Mượn/Gia hạn/Trả sách*: Tạo phiếu mượn, gửi và duyệt gia hạn +7 ngày, xác nhận trả sách và hoàn lại tồn kho ban đầu.
  7. *Xử lý vi phạm tài khoản*: Khóa tài khoản độc giả $\rightarrow$ chặn quyền mượn $\rightarrow$ mở khóa tài khoản.
  8. *Thống kê báo cáo*: Kiểm tra các phép tổng hợp KPI trên Dashboard quản trị.
- **Cách Chạy**: Lệnh `npm test` trong `BACKEND` hoặc chạy file `tests/run-api-tests.js`.

### 6. Chuông Thông Báo Cá Nhân & Khóa Tài Khoản Quá Hạn
- **Mã Định Danh Bất Biến (Deterministic ID)**: Sử dụng cấu trúc định danh cố định (`${item._id}_approved`, `${item._id}_ext_approved_${count}`, `account_locked_${docGiaId}`) giúp đồng bộ chính xác trạng thái đã đọc, không bị nhảy lại số lượng thông báo khi tải lại trang.
- **Tự Động Khóa Tài Khoản Vi Phạm**: Tự động chuyển trạng thái độc giả sang `BiKhoa` khi thời gian quá hạn vượt quá 7 ngày hoặc tổng tiền phạt trễ hạn tích lũy $\ge$ 100.000 VNĐ (5.000 VNĐ/ngày/quyển).
- **Cảnh Báo Trước Vi Phạm**: Gửi thông báo cảnh báo trước 3 ngày, trước 1 ngày và tại các mốc tiền phạt 50.000 VNĐ, 75.000 VNĐ.
- **Chặn Mượn Khi Bị Khóa**: Độc giả có tài khoản bị khóa bị chặn không cho phép gửi yêu cầu mượn mới trên cả giao diện chi tiết sách và giỏ mượn.
- **Hộp Thoại Xử Lý Mở Khóa Sau Khi Trả Sách**: Khi thủ thư xác nhận trả sách, hệ thống hiển thị modal đề xuất mở khóa tài khoản để thủ thư xem xét xử lý.

### 7. Cơ Chế Tìm Kiếm: Hot Search, Live Typeahead & Giọng Nói
- **Tìm Kiếm Tức Thì (Typeahead)**: Tìm kiếm thời gian thực (debounce 250ms) theo từng ký tự và từng từ trên tiêu đề và tác giả qua regex lookahead an toàn `(?=.*word1)(?=.*word2)`, đi kèm dropdown gợi ý kết quả.
- **Nhận Diện Giọng Nói (Web Speech API)**: Hỗ trợ tìm kiếm bằng giọng nói tiếng Việt (`vi-VN`) trực tiếp trên trình duyệt ở cả hai phân hệ.
- **Quản Lý Vòng Đời Instance**: Tự động hủy phiên cũ và tạo mới đối tượng `SpeechRecognition` để loại bỏ lỗi `DOMException: InvalidStateError` trên Chromium.

### 8. Xác Thực & Phân Quyền Vai Trò (RBAC)
- **Google OAuth 2.0**: Đăng nhập bằng tài khoản Google liên kết với hồ sơ `DOCGIA`, cấp phát JWT nội bộ (`aud: "user"`). Hỗ trợ điều hướng động đa cổng qua tham số `state` (RFC 6749) tương thích cả Production (cổng 80) và Development (cổng 5173).
- **Đăng Nhập Linh Hoạt**: Đăng nhập bằng Email hoặc Số điện thoại kết hợp mật khẩu mã hóa Bcrypt.
- **Phân Quyền 3 Cấp Quản Trị**:
  - `Admin`: Toàn quyền hệ thống, phân quyền nhân sự, khóa/mở khóa độc giả, báo cáo thống kê.
  - `NhanVienQuanLySach`: Quản lý danh mục sách và nhà xuất bản.
  - `NhanVienDuyetMuon`: Duyệt phiếu mượn, duyệt gia hạn, tiếp nhận trả sách và theo dõi quá hạn.

### 9. Phân Trang Động Bảng Dữ Liệu
- **Tùy Chọn Kích Thước Trang**: Bộ chọn 10, 20, 50, 100 dòng trên tất cả các bảng quản trị Admin Web.
- **Bảo Vệ Chỉ Số Trang**: Tự động đưa về trang 1 khi thay đổi kích thước trang để tránh lỗi hiển thị trang rỗng.

### 10. Toàn Vẹn Dữ Liệu Khi Xóa & Thao Tác Hàng Loạt
- **Kiểm Soát Ràng Buộc Khi Xóa**: `DELETE /api/admin/docgia/:id` kiểm tra các trạng thái mượn đang lưu thông trong `THEODOIMUONSACH` (`chờ duyệt`, `đã duyệt`, `đang mượn`, `đang chờ trả`, `quá hạn`, `chờ gia hạn`). Chặn xóa (HTTP 400) nếu còn phiếu mượn chưa hoàn tất.
- **Thao Tác Hàng Loạt**: Hỗ trợ chọn nhiều dòng qua checkbox để Khóa, Mở khóa, hoặc Xóa hàng loạt an toàn.

### 11. Ghi Nhận Thời Gian & Sắp Xếp Danh Mục
- **Dấu Vết Thời Gian (ISO 8601)**: Thuộc tính `createdAt` và `updatedAt` tự động ghi nhận khi tạo hoặc sửa sách.
- **Sắp Xếp Sách Mới Cập Nhật**: Sắp xếp theo `Math.max(updatedAt, createdAt)` với cơ chế fallback trích xuất timestamp từ MongoDB ObjectId.

---

## 3. Cấu Trúc Thư Mục Dự Án

```text
Library_Management_System_MEVN/
├── BACKEND/                     # Máy chủ API Node.js / Express.js
│   ├── app/
│   │   ├── config/              # Cấu hình môi trường, Passport OAuth2
│   │   ├── controllers/         # Tầng điều khiển (admin/ & user/)
│   │   ├── middlewares/         # Xác thực JWT, phân quyền RBAC 3 cấp
│   │   ├── routes/              # Khai báo định tuyến RESTful
│   │   ├── services/            # Tầng xử lý nghiệp vụ & MongoDB Native Driver
│   │   └── utils/               # mongodb.util.js, redis.util.js, indexes.util.js
│   ├── app.js                   # Khởi tạo Express, CORS, static uploads
│   ├── server.js                # Điểm khởi động server, kiểm tra indexes
│   ├── seed.js                  # Dữ liệu mẫu ban đầu
│   ├── ecosystem.config.js      # Cấu hình PM2 Process Manager
│   └── package.json             # Quản lý dependencies & scripts (npm test)
├── frontend/
│   ├── user-web/                # Cổng thông tin Độc giả (Port 5173 / Prod Port 80)
│   │   ├── src/
│   │   │   ├── components/      # Header, Navigation, Voice Search
│   │   │   ├── views/           # Home, BookList, BookDetail, BorrowHistory...
│   │   │   ├── services/        # Axios API Client & Pinia Stores
│   │   │   └── router/          # Vue Router HTML5 History Mode
│   │   └── package.json
│   └── admin-web/               # Cổng Quản trị Thư viện (Port 5174 / Prod Port 8080)
│       ├── src/
│       │   ├── layouts/         # AdminLayout, Dynamic Sidebar theo RBAC
│       │   ├── views/           # Dashboard, Sach, NXB, MuonSach, DocGia, NhanVien
│       │   └── services/        # Axios API Client quản trị
│       └── package.json
├── tests/                       # Bộ kiểm thử tích hợp tự động
│   ├── run-api-tests.js         # Script kiểm thử liên hoàn 44 ca API
│   ├── run-tests.bat            # Script chạy kiểm thử 1-click trên Windows
│   ├── postman_collection.json  # Bộ sưu tập Postman v2.1
│   └── README.md                # Hướng dẫn chi tiết bộ kiểm thử
├── nginx.conf                   # Cấu hình Reverse Proxy NGINX cho môi trường Production
└── README.md                    # Tài liệu giới thiệu hệ thống
```

---

## 4. Ma Trận Phân Quyền Hệ Thống (RBAC Matrix)

| Chức Năng Nghiệp Vụ | Độc Giả (User) | Quản Trị Viên (Admin) | NV Quản Lý Sách | NV Duyệt Mượn |
|---|:---:|:---:|:---:|:---:|
| **Tra cứu sách & Voice Search** | ✅ | ✅ | ✅ | ✅ |
| **Đăng ký mượn & Xin gia hạn** | ✅ | ❌ | ❌ | ❌ |
| **Chuông thông báo cá nhân** | ✅ | ❌ | ❌ | ❌ |
| **Yêu thích & Đánh giá sách** | ✅ | ❌ | ❌ | ❌ |
| **Quản lý Danh mục Sách & NXB** | ❌ | ✅ | ✅ | ❌ |
| **Duyệt mượn / Duyệt gia hạn** | ❌ | ✅ | ❌ | ✅ |
| **Xác nhận trả & Xử lý quá hạn** | ❌ | ✅ | ❌ | ✅ |
| **Quản lý Độc giả (Khóa tài khoản)** | ❌ | ✅ | ❌ | ❌ |
| **Quản lý Nhân viên & Gán chức vụ** | ❌ | ✅ | ❌ | ❌ |
| **Dashboard Thống kê Chart.js** | ❌ | ✅ | ❌ | ✅ |

---

## 5. Hướng Dẫn Cài Đặt & Khởi Động Dự Án

### Yêu Cầu Môi Trường
- **Node.js (v20+)** và **MongoDB**.
- Dịch vụ MongoDB chạy tại cổng mặc định `27017`.
- (Tùy chọn) Redis Server chạy tại cổng `6379`. Nếu không có Redis, Backend kích hoạt cơ chế Graceful Fallback.

### Hướng Dẫn Khởi Động (Development Mode)

1. **Khởi động Máy chủ Backend API**:
   ```bash
   cd BACKEND
   npm install
   cp .env.example .env
   # Thiết lập chuỗi kết nối và JWT_SECRET trong tệp .env
   npm run seed        # Tạo dữ liệu mẫu và tài khoản quản trị ban đầu
   npm run db:indexes  # Thiết lập 17 Unique và Compound Indexes trên MongoDB
   npm run dev         # Khởi chạy máy chủ tại http://localhost:3000
   ```

2. **Khởi động Cổng Độc giả (User Web)**:
   ```bash
   cd frontend/user-web
   npm install
   npm run dev         # Khởi chạy cổng độc giả tại http://localhost:5173
   ```

3. **Khởi động Cổng Quản trị (Admin Web)**:
   ```bash
   cd frontend/admin-web
   npm install
   npm run dev         # Khởi chạy cổng quản trị tại http://localhost:5174
   ```

4. **Thực thi Bộ kiểm thử tự động (Automated API Testing - 44/44 PASS)**:
   ```bash
   # Cách 1: Chạy từ thư mục gốc qua Node.js
   node tests/run-api-tests.js

   # Cách 2: Chạy qua npm test trong thư mục BACKEND
   cd BACKEND && npm test

   # Cách 3 (Windows): Click đúp chuột vào file tests/run-tests.bat
   ```

---

## 6. Hướng Dẫn Triển Khai Production Với NGINX & PM2

### Bước 1: Đóng gói mã nguồn 2 Frontend (Production Build)
```bash
# 1. Đóng gói Cổng Độc giả (sinh ra thư mục frontend/user-web/dist)
cd frontend/user-web
npm run build

# 2. Đóng gói Cổng Quản trị (sinh ra thư mục frontend/admin-web/dist)
cd ../admin-web
npm run build
cd ../..
```

### Bước 2: Quản lý tiến trình Backend với PM2
```bash
# Cài đặt PM2 toàn cục nếu chưa có
npm install -g pm2

# Khởi chạy daemon Backend tại cổng nội bộ 3000
cd BACKEND
pm2 start ecosystem.config.js

# Thiết lập tự động khởi chạy lại PM2 khi máy chủ reboot
pm2 save
pm2 startup
```

**Các câu lệnh PM2 thường dùng:**
- Xem trạng thái máy chủ: `pm2 status` hoặc `pm2 monit`
- Xem log thời gian thực: `pm2 logs library-backend`
- Khởi động lại dịch vụ: `pm2 restart library-backend`
- Dừng tiến trình Backend: `pm2 stop library-backend`

### Bước 3: Khởi chạy và Nạp cấu hình NGINX Reverse Proxy

#### Trên môi trường Windows:
```cmd
:: Khởi chạy NGINX trỏ vào tệp cấu hình của dự án (từ thư mục gốc)
nginx -c ./nginx.conf

:: Nạp lại cấu hình NGINX
nginx -s reload

:: Dừng NGINX
nginx -s quit
```

#### Trên môi trường Linux / VPS Ubuntu:
```bash
# Kiểm tra cú pháp tệp cấu hình
sudo nginx -t -c /path/to/project/nginx.conf

# Sao chép cấu hình vào thư mục NGINX của máy chủ
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4: Kiểm tra Truy cập Hệ thống
Sau khi NGINX và PM2 hoạt động:
- **Cổng Độc giả (User Web)**: `http://localhost/` (Cổng 80).
- **Cổng Quản trị (Admin Web)**: `http://localhost:8080/` (Cổng 8080).
- **Định tuyến API & Tải ảnh**: Toàn bộ yêu cầu `/api/*` và `/uploads/*` được NGINX tự động Reverse Proxy về Node.js (cổng 3000). Chỉ thị `try_files` xử lý Vue Router History Mode, tránh lỗi 404 khi làm mới trang.

---

## 7. Tài Khoản Thử Nghiệm Mặc Định (Demo Accounts)

| Vai trò | Mã đăng nhập | Mật khẩu | Phạm vi quyền hạn |
|---|---|---|---|
| **Quản trị viên tối cao** | `ADMIN001` | `Admin@123` | Toàn quyền quản trị, phân quyền nhân sự, khóa tài khoản, xem thống kê |
| **Nhân viên Quản lý Sách** | `NV002` | `Staff@123` | Quản lý kho sách, tải ảnh bìa, quản lý danh mục Nhà xuất bản |
| **Nhân viên Duyệt Mượn** | `NV003` | `Staff@123` | Tiếp nhận duyệt mượn, duyệt gia hạn, nhận trả sách, xem báo cáo mượn trả |
| **Độc giả mẫu** | `user1@gmail.com` | `User@123` | Tra cứu sách, đăng ký mượn, xin gia hạn, nhận chuông thông báo |

---

## 8. Tác Giả & Giấy Phép (Author & License)

- **Tác giả**: Nguyễn Minh Tuấn
- **Giấy phép**: Phát hành theo chuẩn [Giấy phép MIT](LICENSE). Toàn bộ mã nguồn mở tự do phục vụ mục đích học tập và nghiên cứu.
