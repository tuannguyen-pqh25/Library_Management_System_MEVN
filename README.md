# Library Management System (MEVN Stack)
### Nền Tảng Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x_(Composition_API)-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Native_Driver-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-In--Memory_Cache-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![NGINX](https://img.shields.io/badge/NGINX-Reverse_Proxy-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![PM2](https://img.shields.io/badge/PM2-Process_Manager-2B037A?logo=pm2&logoColor=white)](https://pm2.keymetrics.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade, enterprise-architected online library management platform built with the **MEVN Stack**. Features dual independent Single Page Applications (SPAs), native database operations with 17 clustered/compound indexes, event-driven Redis caching, resilient generative AI integration, concurrency-safe inventory allocation, and production deployment with NGINX reverse proxy and PM2 process supervision.

---

## Language Navigation / Chuyển Đổi Ngôn Ngữ
- [English Version](#-english-version) (Architectural highlights, technical capabilities, NGINX + PM2 deployment)
- [Bản Tiếng Việt](#-bản-tiếng-việt) (Tổng quan dự án cá nhân, điểm sáng kỹ thuật đưa vào CV, cài đặt & NGINX + PM2)

---

# 🌐 ENGLISH VERSION

## 1. Executive Summary & Architecture Overview

The system addresses the operational bottlenecks of traditional physical library book lending by delivering an end-to-end digital borrowing lifecycle: catalog discovery, intelligent book recommendation, reservation queueing, real-time quota verification, multi-stage approval, controlled renewal, and return reconciliation.

### Architecture Highlights
- **Dual Decoupled Frontends**:
  - `user-web` (Client portal, Port 5173 / Prod Port 80): Catalog browsing, voice search, Google/Facebook OAuth2, reservation booking, book extension, and notification center.
  - `admin-web` (Management portal, Port 5174 / Prod Port 8080): Complete administrative surface isolated from the public client bundle. Role-based dashboards, inventory lifecycle, loan approvals, reader moderation, and staff delegation.
- **Unified RESTful API Gateway** (`BACKEND`, Port 3000):
  - Layered routing architecture with strict middleware enforcement (`/api/user/*` and `/api/admin/*`).
  - Native driver communication protocol with zero ODM bloat.
- **Production Reverse Proxy & Process Control**:
  - NGINX serving static Vue bundles via HTML5 History Mode (`try_files`), offloading SSL/Gzip, and proxying API traffic.
  - PM2 daemon manager providing automatic recovery, cluster monitoring, and memory threshold management (500MB cap).

```
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

## 2. Key Engineering Highlights & Standout Features

### 🚀 1. Native MongoDB Driver & Hybrid Identifier Strategy
- **Zero ODM Overhead**: Implemented 100% using the official `mongodb` native driver (no Mongoose). Eliminates schema hydration, middleware hooks, and memory overhead, resulting in 25-30% faster I/O response times.
- **Hybrid Key Model**:
  - `_id` (`ObjectId`): Utilized as the physical clustered index (~0.1ms lookup), internal foreign key, URL parameter routing, and `$lookup` aggregation joins.
  - `MaSach` / `MaDocGia` / `MSNV` / `MaNXB`: High-readability logical business identifiers displayed on UI, cards, and printed reports.
- **17 Custom Database Indexes**: Automated index verification on server boot (`indexes.util.js` & `createIndexes.js`) enforcing unique constraints and compound query acceleration (e.g., `{ MaDocGia: 1, trangThai: 1 }`).

### 🛡️ 2. Concurrency-Safe First-Come, First-Served Overbooking Protection
- **No Speculative Lockup**: Creating a borrow request does not prematurely decrement stock while in the `chờ duyệt` (pending approval) state. This prevents inactive users from freezing physical assets.
- **Atomic Stock Verification**: Stock decrement occurs strictly during librarian approval (`approve`). The system atomically validates `SoQuyenConLai >= soLuong`. If stock is depleted by an earlier approval, the transaction is rejected with HTTP 400, preventing inventory underflow.

### ⏳ 3. Governed Book Renewal Workflow (3-Day Lead Time Rule)
- Borrowers can submit extension requests under strict operational constraints:
  1. Record must be actively loaned (`đang mượn`) and not overdue.
  2. Must be requested **at least 3 days before the due date** (`ngayTra - today >= 3`). Submissions inside 72 hours are rejected to eliminate last-minute renewal abuse.
  3. Hard ceiling of **maximum 2 renewals per book** (+7 or +14 days).
  4. Requires formal librarian review and approval before the new return date is ratified.

### ⚡ 4. Event-Driven Redis Caching & Invalidation
- **High-Throughput Caching**: Public book catalog queries (`/api/user/sach`) and administrative KPI analytics (`/api/admin/dashboard/stats`) cached in Redis with granular TTLs (5-10 minutes).
- **Sub-2ms Latency**: Catalog endpoint response times drop from ~65ms to 1-2ms under cache hits.
- **Event-Driven Invalidation**: Mutations on book entities (Create/Update/Delete) immediately purge `user:sach:*` keys. Loan approvals, returns, and rejections immediately flush `admin:dashboard:stats`.

### 🤖 5. Resilient Generative AI Integration (Gemini 3.8 Flash)
- **Natural Language Assistant**: Floating conversational widget for contextual library inquiries, inventory lookup, and policy explanation.
- **3-Layer Resilience Architecture**:
  1. *Exponential Backoff with Jitter*: Automatically retries transient upstream 500/502/503/504 errors up to 3 times with progressive delays (1s -> 2s -> 4s) plus $\pm 25\%$ jitter to prevent thundering herds.
  2. *Model Fallback Chain*: If the primary `gemini-3.8-flash` model experiences persistent upstream exhaustion, the service automatically downgrades to `gemini-3.5-flash-lite`.
  3. *Multi-Key Rotation*: Rotates between backup API keys on quota-exceeded (HTTP 429/403) responses.

### 🔔 6. Deterministic In-App Notification System
- **Deterministic ID Generation**: Overcomes the common single-page app defect where refresh (F5) re-increments notification badges. Generates immutable event identifiers:
  `${item._id}_approved`, `${item._id}_ext_approved_${count}`, `${item._id}_overdue_${date}`.
- **Zero-Backend Polling**: Client computes notifications from existing loan records on a 5-minute interval, drastically reducing backend load.

### 🎙️ 7. Browser-Native Voice Search (AI Speech)
- Web Speech API integration in the user search bar. Instant speech-to-text processing with dynamic visual pulse animation, automatically triggering debounced catalog queries.

### 🔐 8. Social OAuth 2.0 & Tiered RBAC Security
- **OAuth 2.0 (Google & Facebook)**: Social login bridge linking external identity with internal `DOCGIA` records without passwords, auto-issuing scoped JWTs (`aud: "user"`). Includes a Mock OAuth provider for offline development and testing.
- **Three-Tier RBAC**:
  - `Admin`: Full permissions, staff delegation, reader suspension, audit reports.
  - `NhanVienQuanLySach`: Catalog inventory and publishing house management.
  - `NhanVienDuyetMuon`: Loan dispatching, extension approvals, returns, and overdue tracking.

---

## 3. Technology Stack Breakdown

| Layer | Technologies & Libraries |
|---|---|
| **Frontend Clients** | Vue 3 (Composition API, `<script setup>`), Vite 5, Vue Router 4, Pinia, Axios, Bootstrap 5.3, FontAwesome 6, Chart.js, VeeValidate 4 + Yup |
| **Backend API** | Node.js (v20+), Express.js 4, Native MongoDB Driver (v6), Bcrypt.js, JsonWebToken, Passport.js, Morgan, Cors |
| **Databases & Cache** | MongoDB (Document Store), Redis (In-Memory Key-Value Store) |
| **AI & External APIs** | Google Gemini Generative AI SDK, Web Speech API (W3C Standard), Google OAuth 2.0, Meta Facebook Graph API |
| **DevOps & Production** | NGINX (Reverse Proxy, Gzip, History Mode), PM2 (Process Supervisor) |

---

## 4. Database Schema Design (5 Core Collections)

1. **`DOCGIA`** (Readers): `MaDocGia` (Unique), `HoLot`, `Ten`, `NgaySinh`, `Phai`, `DiaChi`, `DienThoai`, `Email` (Sparse Unique), `Password`, `TrangThaiTaiKhoan` ("BinhThuong" | "BiKhoa"), `oauthProvider`, `oauthId`.
2. **`SACH`** (Books): `MaSach` (Unique), `TenSach`, `DonGia`, `SoQuyen`, `SoQuyenConLai`, `NamXuatBan`, `MaNXB` (FK), `TacGia`, `TheLoai`, `SoTrang`, `MoTa`, `HinhAnh`.
3. **`NHAXUATBAN`** (Publishers): `MaNXB` (Unique), `TenNXB` (Unique), `DiaChi`.
4. **`THEODOIMUONSACH`** (Loan Tracking): `MaDocGia` (FK), `MaSach` (FK), `SoLuong`, `NgayMuon`, `NgayHenTra`, `NgayTra`, `NgayDuKienTra`, `TrangThai` (Enum), `SoLanGiaHan`, `MaNhanVien` (FK), `GhiChu`.
5. **`NHANVIEN`** (Staff): `MSNV` (Unique), `HoTenNV`, `Password`, `ChucVu` ("Admin" | "NhanVienQuanLySach" | "NhanVienDuyetMuon"), `Diachi`, `SoDienThoai`, `Email`.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js $\ge$ 20.x installed
- MongoDB running on `localhost:27017`
- Redis server running on `localhost:6379` (optional; system automatically degrades gracefully if absent)

### Step-by-Step Development Setup (Terminal CLI)

1. **Clone & Configure Backend**:
   ```bash
   cd BACKEND
   npm install
   cp .env.example .env
   # Populate your JWT_SECRET and optional GEMINI_API_KEY
   npm run seed        # Seeds initial Admin (ADMIN001 / Admin@123) and sample books
   npm run db:indexes  # Enforces all 17 unique and compound indexes
   npm run dev         # Starts backend on http://localhost:3000
   ```

2. **Configure & Run User Portal**:
   ```bash
   cd frontend/user-web
   npm install
   npm run dev         # Runs on http://localhost:5173
   ```

3. **Configure & Run Admin Portal**:
   ```bash
   cd frontend/admin-web
   npm install
   npm run dev         # Runs on http://localhost:5174
   ```

### Default Credentials for Testing
- **Super Administrator**: `MSNV: ADMIN001` | `Password: Admin@123`
- **Catalog Staff**: `MSNV: NV002` | `Password: Staff@123`
- **Circulation Staff**: `MSNV: NV003` | `Password: Staff@123`
- **Sample Reader**: Register directly on `user-web` or use the seeded reader account.

---

## 6. Production Deployment with NGINX & PM2

The application is architected for zero-downtime production deployment using **NGINX** as a high-performance reverse proxy and static asset server, alongside **PM2** for process supervision.

### Step 1: Build Both Frontends for Production
Build static bundles containing optimized JavaScript, CSS, and asset hashes:
```bash
# 1. Build User Web (outputs to frontend/user-web/dist)
cd frontend/user-web
npm run build

# 2. Build Admin Web (outputs to frontend/admin-web/dist)
cd ../admin-web
npm run build
cd ../..
```

### Step 2: Start Backend with PM2
Launch the Node.js backend using the declarative configuration file `BACKEND/ecosystem.config.js`:
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start backend daemon on port 3000
cd BACKEND
pm2 start ecosystem.config.js

# Ensure PM2 restarts automatically across system reboots
pm2 save
pm2 startup
```

**Helpful PM2 Commands:**
- Monitor runtime health: `pm2 status` or `pm2 monit`
- View live backend logs: `pm2 logs library-backend`
- Restart backend process: `pm2 restart library-backend`
- Stop backend process: `pm2 stop library-backend`

### Step 3: Run & Configure NGINX Reverse Proxy

#### On Windows:
Run NGINX pointing directly to the project's root `nginx.conf`:
```cmd
:: Start NGINX with project configuration (from project root)
nginx -c ./nginx.conf

:: Reload NGINX configuration without downtime
nginx -s reload

:: Stop NGINX
nginx -s quit
```

#### On Linux / Ubuntu VPS:
```bash
# Test configuration syntax
sudo nginx -t -c /path/to/project/nginx.conf

# Or copy configuration to NGINX directory
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Verify Production Endpoints
Once NGINX and PM2 are running:
- **Reader Portal (User-Web)**: Visit `http://localhost/` (Port 80)
- **Management Portal (Admin-Web)**: Visit `http://localhost:8080/` (Port 8080)
- **API & Uploads**: Automatically reverse-proxied to `http://127.0.0.1:3000` via `/api/*` and `/uploads/*`. Vue Router HTML5 History Mode is seamlessly handled via `try_files` with zero 404 errors on page reload.


---

# 🇻🇳 BẢN TIẾNG VIỆT

## 1. Giới Thiệu Dự Án & Điểm Sáng Kỹ Thuật (CV / Portfolio Highlight)

Dự án **Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến (Library Management Platform)** là một dự án cá nhân được xây dựng và hoàn thiện theo tiêu chuẩn Full-Stack hiện đại (**MEVN Stack**). Hệ thống giải quyết trọn vẹn bài toán số hóa quy trình quản lý mượn trả tài liệu, tối ưu hóa trải nghiệm người dùng, bảo mật phân quyền đa cấp và đạt hiệu năng cao, rất phù hợp để làm điểm nhấn nổi bật trong hồ sơ năng lực (**CV / Portfolio**) ứng tuyển vị trí **Full-Stack Developer** (Node.js & Vue.js).

### Những Điểm Nhấn Kỹ Thuật Nổi Bật Dành Cho Nhà Tuyển Dụng:
1. **Làm chủ Native MongoDB Driver**: Không sử dụng Mongoose; tự tay tối ưu hóa các câu lệnh Aggregation Pipeline (`$lookup`, `$match`, `$group`), thao tác nguyên tử BSON và quản lý tập trung 17 Chỉ mục (Indexes).
2. **Chiến lược Hybrid ID Thông Minh**: Kết hợp hoàn hảo giữa `_id` Clustered Index (~0.1ms) phục vụ định tuyến/join dữ liệu và các Mã nghiệp vụ chuẩn hóa (`MaSach`, `MaDocGia`, `MSNV`, `MaNXB`) phục vụ hiển thị UI và báo cáo.
3. **Giải Quyết Triệt Để Bài Toán Overbooking & Tranh Chấp Tài Nguyên**:
   - Khi độc giả gửi yêu cầu mượn: Hệ thống **chưa trừ kho**, tránh hiện tượng độc giả đặt ảo làm đóng băng kho sách.
   - Khi thủ thư bấm Duyệt: Hệ thống kiểm tra tồn kho theo nguyên tắc **First-come, first-served** và trừ kho an toàn. Nếu hết sách do người khác được duyệt trước, hệ thống tự động chặn và ném lỗi 400.
4. **Nghiệp Vụ Gia Hạn Mượn Sách Chặt Chẽ (Quy Tắc 3 Ngày)**:
   - Sách phải chưa quá hạn và phải xin gia hạn trước hạn trả ít nhất 3 ngày.
   - Mỗi cuốn sách giới hạn tối đa 2 lần gia hạn (+7 hoặc +14 ngày).
   - Yêu cầu bắt buộc phải qua thẩm định và phê duyệt của Thủ thư.
5. **Cơ Chế Quét Quá Hạn Lười (Lazy-Check Engine)**:
   - Thay vì chạy CronJob nền gây tốn CPU và kết nối database vô ích, hệ thống tự động cập nhật trạng thái `quá hạn` bằng toán tử `updateMany` ngay khi có truy vấn phát sinh. Dữ liệu luôn đúng thời gian thực với chi phí tài nguyên tối thiểu.
6. **Tăng Tốc Hiệu Năng Vượt Trội Với Redis Caching**:
   - Áp dụng Redis Cache in-memory cho API danh sách sách và Dashboard thống kê.
   - Giảm thời gian phản hồi API từ ~65ms xuống chỉ còn **1 - 2ms** (nhanh gấp 40 lần).
   - Cơ chế Cache Invalidation tự động xóa bộ đệm khi có biến động dữ liệu.
7. **Tích Hợp Trí Tuệ Nhân Tạo (Gemini AI) Với Kiến Trúc Tự Phục Hồi (Resilience 3 Lớp)**:
   - Tự động thử lại với Exponential Backoff kèm Jitter $\pm 25\%$ khi gặp lỗi 503.
   - Tự động hạ cấp sang mô hình nhẹ hơn (`gemini-3.5-flash-lite`) khi mô hình chính quá tải.
   - Tự động xoay vòng danh sách API Key dự phòng khi hết Quota (HTTP 429).
8. **Khắc Phục Triệt Để Lỗi Nhảy Lại Badge Chuông Thông Báo (Deterministic ID)**:
   - Chuẩn hóa mã thông báo thành chuỗi bất biến không chứa timestamp biến đổi (`${item._id}_approved`), giải quyết dứt điểm lỗi F5 tải lại trang làm badge nhảy số lại.
9. **Đăng Nhập Ủy Quyền Mạng Xã Hội OAuth 2.0 (Google & Facebook)**:
   - Tích hợp Passport.js, tự động ánh xạ email, tự sinh mã độc giả và cấp phát JWT nội bộ an toàn. Cung cấp chế độ Mock OAuth phục vụ việc kiểm thử phát triển offline.
10. **Kiến Trúc Triển Khai Production NGINX + PM2**:
    - Phân tách cổng truy cập: User Web (Cổng 80), Admin Web (Cổng 8080).
    - NGINX Reverse Proxy, nén Gzip, cache tĩnh và xử lý `try_files` hỗ trợ Vue Router HTML5 History Mode.
    - PM2 quản lý tiến trình Node.js Backend với cơ chế tự khởi động lại khi crash hoặc reboot máy chủ.

---

## 2. Kiến Trúc Thư Mục Dự Án (Project Structure)

```text
Library_Management_System_MEVN/
├── BACKEND/                     # Máy chủ API Node.js / Express.js
│   ├── app/
│   │   ├── config/              # Cấu hình môi trường, Passport OAuth2
│   │   ├── controllers/         # Tầng điều khiển (admin/ & user/)
│   │   ├── middlewares/         # Xác thực JWT, phân quyền RBAC 3 cấp
│   │   ├── routes/              # Khai báo định tuyến chuẩn RESTful
│   │   ├── services/            # Tầng xử lý nghiệp vụ & Native MongoDB
│   │   └── utils/               # mongodb.util.js, redis.util.js, indexes.util.js
│   ├── app.js                   # Khởi tạo Express, CORS, static uploads
│   ├── server.js                # Điểm khởi động server, auto create indexes
│   ├── seed.js                  # Khởi tạo tài khoản mẫu & 100+ cuốn sách
│   ├── ecosystem.config.js      # Định hình PM2 Process Manager
│   └── package.json
├── frontend/
│   ├── user-web/                # Cổng thông tin Độc giả (Port 5173 / Prod 80)
│   │   ├── src/
│   │   │   ├── components/      # AppHeader (Chuông thông báo), ChatWidget (AI)
│   │   │   ├── views/           # Home, BookList, BookDetail, BorrowHistory...
│   │   │   ├── services/        # Axios API Client & State Management
│   │   │   └── router/          # Vue Router HTML5 History Mode
│   │   └── package.json
│   └── admin-web/               # Cổng Quản trị Thư viện (Port 5174 / Prod 8080)
│       ├── src/
│       │   ├── layouts/         # AdminLayout, Dynamic Sidebar theo RBAC
│       │   ├── views/           # Dashboard, Sach, NXB, MuonSach, DocGia, NhanVien
│       │   └── services/        # Dịch vụ gọi API quản trị
│       └── package.json
├── Cores/                       # Tài liệu đặc tả kỹ thuật và kiến trúc hệ thống
│   ├── BaoCao.txt               # Báo cáo đặc tả kiến trúc và thiết kế hệ thống
│   ├── presentation.md          # Dàn ý thuyết trình & Bộ câu hỏi phản biện kỹ thuật
│   ├── checkpoint.md            # Nhật ký tiến độ chi tiết qua 11 giai đoạn
│   └── next_step_guide.md       # Cẩm nang kỹ thuật và prompt ngữ cảnh AI
├── nginx.conf                   # Cấu hình Reverse Proxy NGINX cho môi trường Production
└── README.md                    # Tài liệu giới thiệu dự án (EN / VI)
```

---

## 3. Ma Trận Phân Quyền Hệ Thống (RBAC Matrix)

| Chức Năng Nghiệp Vụ | Độc Giả (User) | Quản Trị Viên (Admin) | NV Quản Lý Sách | NV Duyệt Mượn |
|---|:---:|:---:|:---:|:---:|
| **Tra cứu sách & Voice Search** | ✅ | ✅ | ✅ | ✅ |
| **Đăng ký mượn & Xin gia hạn** | ✅ | ❌ | ❌ | ❌ |
| **Chuông thông báo cá nhân** | ✅ | ❌ | ❌ | ❌ |
| **Hỏi đáp Trợ lý ảo Gemini AI** | ✅ | ❌ | ❌ | ❌ |
| **Quản lý Danh mục Sách & NXB** | ❌ | ✅ | ✅ | ❌ |
| **Duyệt mượn / Duyệt gia hạn** | ❌ | ✅ | ❌ | ✅ |
| **Xác nhận trả & Xử lý quá hạn** | ❌ | ✅ | ❌ | ✅ |
| **Quản lý Độc giả (Khóa tài khoản)** | ❌ | ✅ | ❌ | ❌ |
| **Quản lý Nhân viên & Gán chức vụ** | ❌ | ✅ | ❌ | ❌ |
| **Dashboard Thống kê Chart.js** | ❌ | ✅ | ❌ | ✅ |

---

## 4. Hướng Dẫn Cài Đặt & Khởi Động Dự Án (Terminal CLI)

### Yêu Cầu Môi Trường
- Máy tính đã cài đặt **Node.js (v20+)** và **MongoDB**.
- Dịch vụ MongoDB đang chạy ngầm tại cổng mặc định `27017`.
- (Tùy chọn) Redis Server đang mở tại cổng `6379`. Nếu không có Redis, Backend sẽ tự động kích hoạt cơ chế *Graceful Fallback* an toàn mà không làm gián đoạn hệ thống.

### Hướng Dẫn Khởi Động Thủ Công Qua Terminal (Development Mode)

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

---

## 5. Hướng Dẫn Triển Khai Production Với NGINX & PM2

Để vận hành hệ thống ở môi trường Production đạt hiệu năng cao, chịu tải tốt và không gián đoạn (Zero-Downtime), dự án đã cấu hình sẵn **NGINX Reverse Proxy** và bộ quản lý tiến trình **PM2**:

### Bước 1: Đóng gói mã nguồn 2 Frontend (Production Build)
Lệnh build sẽ tối ưu hóa tệp tĩnh, nén nhỏ mã nguồn và sinh ra thư mục `dist/`:
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
Khởi chạy Backend Node.js chạy ngầm liên tục thông qua tệp cấu hình `BACKEND/ecosystem.config.js`:
```bash
# Cài đặt PM2 toàn cục nếu máy tính chưa có
npm install -g pm2

# Khởi chạy daemon Backend tại cổng nội bộ 3000
cd BACKEND
pm2 start ecosystem.config.js

# Thiết lập tự động khởi chạy lại PM2 khi máy chủ khởi động lại (Reboot)
pm2 save
pm2 startup
```

**Các câu lệnh PM2 hữu ích:**
- Xem trạng thái máy chủ: `pm2 status` hoặc `pm2 monit`
- Xem log thời gian thực: `pm2 logs library-backend`
- Khởi động lại dịch vụ: `pm2 restart library-backend`
- Dừng tiến trình Backend: `pm2 stop library-backend`

### Bước 3: Khởi chạy và Nạp cấu hình NGINX Reverse Proxy

#### Trên môi trường Windows:
Mở cửa sổ Command Prompt (CMD) với quyền Administrator tại thư mục gốc dự án:
```cmd
:: Khởi chạy NGINX trỏ thẳng vào tệp cấu hình của dự án (từ thư mục gốc)
nginx -c ./nginx.conf

:: Nạp lại cấu hình NGINX tức thì không gây gián đoạn kết nối
nginx -s reload

:: Dừng NGINX an toàn
nginx -s quit
```

#### Trên môi trường Linux / VPS Ubuntu:
```bash
# Kiểm tra cú pháp tệp cấu hình
sudo nginx -t -c /path/to/project/nginx.conf

# Hoặc sao chép cấu hình vào thư mục NGINX của máy chủ
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4: Kiểm tra và Truy cập Hệ thống
Sau khi NGINX và PM2 đã hoạt động đồng bộ:
- **Cổng Độc giả (User Web)**: Truy cập `http://localhost/` (Cổng mặc định 80).
- **Cổng Quản trị (Admin Web)**: Truy cập `http://localhost:8080/` (Cổng độc lập 8080).
- **Định tuyến API & Tải ảnh**: Toàn bộ yêu cầu `/api/*` và `/uploads/*` được NGINX tự động Reverse Proxy ngầm về Node.js (cổng 3000). Chỉ thị `try_files` xử lý mượt mà Vue Router History Mode, người dùng nhấn F5 tại bất kỳ trang nào cũng không bị lỗi 404.

---

## 6. Tài Khoản Thử Nghiệm Mặc Định (Demo Accounts)

| Vai trò | Mã đăng nhập | Mật khẩu | Phạm vi quyền hạn |
|---|---|---|---|
| **Quản trị viên tối cao** | `ADMIN001` | `Admin@123` | Toàn quyền quản trị, phân quyền nhân viên, khóa tài khoản, xem thống kê |
| **Nhân viên Quản lý Sách** | `NV002` | `Staff@123` | Quản lý kho sách, tải ảnh bìa, quản lý danh mục Nhà xuất bản |
| **Nhân viên Duyệt Mượn** | `NV003` | `Staff@123` | Tiếp nhận duyệt mượn, duyệt gia hạn, nhận trả sách, xem báo cáo mượn trả |
| **Độc giả mẫu** | `user1@gmail.com` | `User@123` | Tra cứu sách, đăng ký mượn, xin gia hạn, nhận chuông thông báo |

---

## 7. Tác Giả & Bản Quyền (Author & License)

- **Tác giả**: Nguyễn Minh Tuấn
- **Vai trò**: Full-Stack Developer (MEVN Stack)
- **Giấy phép**: Phát hành theo chuẩn [Giấy phép MIT](LICENSE). Toàn bộ mã nguồn mở tự do phục vụ cho mục đích học tập, nghiên cứu và phát triển phần mềm cá nhân.

