/**
 * ======================================================================
 * AUTOMATED API INTEGRATION TEST SUITE (CT449 - QUAN LY MUON SACH)
 * ======================================================================
 * Ánh xạ trực tiếp 1-1 với: tests/01_KICH_BAN_KIEM_THU_TONG_THE.md
 * Hướng dẫn chạy:
 *   node tests/run-api-tests.js
 * hoặc click đúp file:
 *   tests/run-tests.bat
 * ======================================================================
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// ANSI Colors for beautiful terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testStartTime = Date.now();

// Helper test assertion function (Hỗ trợ gắn mã Test Case ID chuẩn hóa)
async function assertTest(tcId, name, fn) {
  if (typeof name === 'function') {
    fn = name;
    name = tcId;
    tcId = null;
  }
  totalTests++;
  const stepNumber = String(totalTests).padStart(2, '0');
  const tag = tcId ? `[${tcId}] ` : '';
  const title = `${tag}${name}`;
  process.stdout.write(`  [${stepNumber}] ${title.padEnd(68, '.')} `);
  try {
    const res = await fn();
    passedTests++;
    console.log(`${colors.green}${colors.bright}PASS${colors.reset}`);
    return res;
  } catch (err) {
    failedTests++;
    console.log(`${colors.red}${colors.bright}FAIL${colors.reset}`);
    console.log(`       ${colors.red}→ Lỗi: ${err.message}${colors.reset}`);
    return null;
  }
}

// Helper HTTP request function
async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    ...(options.redirect ? { redirect: options.redirect } : {}),
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  return { status: response.status, data, headers: response.headers };
}

// Unique test suffix based on timestamp
const timestamp = Date.now();
const testState = {
  adminToken: null,
  staffBookToken: null,
  staffLoanToken: null,
  user1Token: null,
  user1Id: null,
  user2Token: null,
  user2Id: null,
  testPublisherId: null,
  testPublisherCode: `NXB_T${timestamp.toString().slice(-4)}`,
  testBookId: null,
  testLoanId: null,
};

async function main() {
  console.log(`\n${colors.cyan}${colors.bright}======================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}   BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN HỆ THỐNG QUẢN LÝ MƯỢN SÁCH (CT449)${colors.reset}`);
  console.log(`${colors.dim}   Ánh xạ kịch bản : tests/01_KICH_BAN_KIEM_THU_TONG_THE.md${colors.reset}`);
  console.log(`${colors.dim}   Target URL      : ${BASE_URL}${colors.reset}`);
  console.log(`${colors.dim}   Thời gian chạy  : ${new Date().toLocaleString('vi-VN')}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}======================================================================${colors.reset}\n`);

  // ------------------------------------------------------------------
  // 0. HEALTHCHECK
  // ------------------------------------------------------------------
  console.log(`${colors.yellow}${colors.bright}▶ NHÓM 0: KIỂM TRA KẾT NỐI MÁY CHỦ (HEALTHCHECK)${colors.reset}`);
  const health = await assertTest('TC_SYS_01', 'Kiểm tra Backend Server đang chạy tại port 3000', async () => {
    try {
      const res = await api('/api/user/sach');
      if (res.status !== 200) {
        throw new Error(`Server phản hồi status ${res.status}`);
      }
      return true;
    } catch (err) {
      throw new Error(`Không thể kết nối đến ${BASE_URL}. Vui lòng khởi động backend bằng start.bat trước khi test!`);
    }
  });

  if (!health) {
    console.log(`\n${colors.red}${colors.bright}❌ DỪNG KIỂM THỬ: Không tìm thấy Backend đang hoạt động tại ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}Gợi ý: Hãy mở terminal và chạy lệnh:${colors.reset}`);
    console.log(`       cd BACKEND && npm start\n`);
    process.exit(1);
  }

  // ------------------------------------------------------------------
  // 1. PUBLIC APIS
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 1: PUBLIC APIS DÀNH CHO KHÁCH VÃNG LAI${colors.reset}`);
  await assertTest('TC_BOOK_U01', 'Xem danh sách sách công khai (GET /api/user/sach)', async () => {
    const res = await api('/api/user/sach');
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Status ${res.status}, dữ liệu không phải Array`);
    }
    if (res.data.length > 0) {
      testState.testBookId = res.data[0]._id;
    }
  });

  if (testState.testBookId) {
    await assertTest('TC_BOOK_U04', 'Xem chi tiết sách & Join Tên NXB (GET /api/user/sach/:id)', async () => {
      const res = await api(`/api/user/sach/${testState.testBookId}`);
      if (res.status !== 200 || !res.data) {
        throw new Error(`Status ${res.status}`);
      }
      if (!res.data.TenSach) {
        throw new Error('Dữ liệu sách thiếu trường TenSach');
      }
    });
  }

  // ------------------------------------------------------------------
  // 2. USER AUTHENTICATION & PROFILE
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 2: XÁC THỰC & HỒ SƠ ĐỘC GIẢ (USER AUTH & PROFILE)${colors.reset}`);
  const user1Email = `tester1_${timestamp}@ct449.test`;
  const user2Email = `tester2_${timestamp}@ct449.test`;
  const testPassword = 'Password@123';

  await assertTest('TC_AUTH_U01', 'Đăng ký tài khoản Độc giả 1 (POST /api/user/auth/register)', async () => {
    const res = await api('/api/user/auth/register', {
      method: 'POST',
      body: {
        Email: user1Email,
        Password: testPassword,
        MatKhau: testPassword,
        HoLot: 'Nguyễn Văn',
        Ten: `Tester A_${timestamp.toString().slice(-4)}`,
        DienThoai: '0912345678',
        DiaChi: 'Cần Thơ',
      },
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    testState.user1Id = res.data?.data?._id || res.data?.docGia?._id || res.data?._id;
  });

  await assertTest('TC_AUTH_U02', 'Chặn đăng ký trùng Email (Kỳ vọng trả về 400)', async () => {
    const res = await api('/api/user/auth/register', {
      method: 'POST',
      body: {
        Email: user1Email,
        Password: testPassword,
        MatKhau: testPassword,
        HoLot: 'Trùng',
        Ten: 'Email',
      },
    });
    if (res.status !== 400 && res.status !== 409) {
      throw new Error(`Kỳ vọng 400/409 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_AUTH_U01_B', 'Đăng ký tài khoản Độc giả 2 (phục vụ test Overbooking)', async () => {
    const res = await api('/api/user/auth/register', {
      method: 'POST',
      body: {
        Email: user2Email,
        Password: testPassword,
        MatKhau: testPassword,
        HoLot: 'Trần Thị',
        Ten: `Tester B_${timestamp.toString().slice(-4)}`,
        DienThoai: '0987654321',
        DiaChi: 'Hậu Giang',
      },
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    testState.user2Id = res.data?.data?._id || res.data?.docGia?._id || res.data?._id;
  });

  await assertTest('TC_AUTH_U04', 'Đăng nhập Độc giả 1 lấy JWT Token (POST /api/user/auth/login)', async () => {
    const res = await api('/api/user/auth/login', {
      method: 'POST',
      body: { Email: user1Email, Password: testPassword, MatKhau: testPassword },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error(`Status ${res.status}, không tìm thấy token`);
    }
    testState.user1Token = res.data.token;
    if (!testState.user1Id) {
      testState.user1Id = res.data.docGia?._id || res.data.data?._id || res.data.user?._id;
    }
  });

  await assertTest('TC_AUTH_U05', 'Chặn đăng nhập khi sai mật khẩu (Kỳ vọng trả về 401/400)', async () => {
    const res = await api('/api/user/auth/login', {
      method: 'POST',
      body: { Email: user1Email, Password: 'WrongPass@999', MatKhau: 'WrongPass@999' },
    });
    if (res.status !== 401 && res.status !== 400) {
      throw new Error(`Kỳ vọng 401/400 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_AUTH_U04_B', 'Đăng nhập Độc giả 2 lấy JWT Token', async () => {
    const res = await api('/api/user/auth/login', {
      method: 'POST',
      body: { Email: user2Email, Password: testPassword, MatKhau: testPassword },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error(`Status ${res.status}`);
    }
    testState.user2Token = res.data.token;
    if (!testState.user2Id) {
      testState.user2Id = res.data.docGia?._id || res.data.data?._id || res.data.user?._id;
    }
  });

  await assertTest('TC_USER_05', 'Lấy thông tin cá nhân Profile (GET /api/user/profile)', async () => {
    const res = await api('/api/user/profile', { token: testState.user1Token });
    if (res.status !== 200 || !res.data?.Email) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_USER_06', 'Cập nhật thông tin Profile (PUT /api/user/profile)', async () => {
    const res = await api('/api/user/profile', {
      method: 'PUT',
      token: testState.user1Token,
      body: { DiaChi: 'Số 1 Đại lộ Hòa Bình, Ninh Kiều, Cần Thơ' },
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_AUTH_U07', 'Đăng nhập Mock Google OAuth (GET /api/user/auth/mock-oauth)', async () => {
    const res = await api('/api/user/auth/mock-oauth', { redirect: 'manual' });
    if (res.status !== 302 && res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  // ------------------------------------------------------------------
  // 3. ADMIN AUTH & RBAC CROSS-ROLE AUTHORIZATION
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 3: ADMIN AUTH & PHÂN QUYỀN RBAC 3 CẤP VAI TRÒ${colors.reset}`);
  await assertTest('TC_AUTH_A01', 'Đăng nhập Quản trị viên ADMIN001 (POST /api/admin/auth/login)', async () => {
    const res = await api('/api/admin/auth/login', {
      method: 'POST',
      body: { MSNV: 'ADMIN001', Password: 'Admin@123', password: 'Admin@123' },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    testState.adminToken = res.data.token;
  });

  await assertTest('TC_MNG_05', 'Admin lấy danh sách nhân viên & bảo mật ẩn Password', async () => {
    const res = await api('/api/admin/nhanvien', { token: testState.adminToken });
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`Status ${res.status}`);
    }
    const hasPassword = res.data.some(nv => nv.Password || nv.password);
    if (hasPassword) {
      throw new Error('CẢNH BÁO BẢO MẬT: API để lộ trường Password!');
    }
  });

  const staffBookMSNV = `BK_${timestamp.toString().slice(-4)}`;
  const staffLoanMSNV = `LN_${timestamp.toString().slice(-4)}`;

  await assertTest('TC_MNG_04_A', 'Admin tạo nhân viên Quản Lý Sách (NhanVienQuanLySach)', async () => {
    const res = await api('/api/admin/nhanvien', {
      method: 'POST',
      token: testState.adminToken,
      body: {
        MSNV: staffBookMSNV,
        HoTenNV: 'Thủ Thư Quản Lý Sách Test',
        Password: 'Staff@123',
        password: 'Staff@123',
        ChucVu: 'NhanVienQuanLySach',
        SoDienThoai: '0901112233',
        DiaChi: 'Thư viện',
      },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_MNG_04_B', 'Admin tạo nhân viên Duyệt Mượn (NhanVienDuyetMuon)', async () => {
    const res = await api('/api/admin/nhanvien', {
      method: 'POST',
      token: testState.adminToken,
      body: {
        MSNV: staffLoanMSNV,
        HoTenNV: 'Thủ Thư Duyệt Mượn Test',
        Password: 'Staff@123',
        password: 'Staff@123',
        ChucVu: 'NhanVienDuyetMuon',
        SoDienThoai: '0904445566',
        DiaChi: 'Thư viện',
      },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_AUTH_A02', 'Đăng nhập tài khoản Thủ thư Quản Lý Sách', async () => {
    const res = await api('/api/admin/auth/login', {
      method: 'POST',
      body: { MSNV: staffBookMSNV, Password: 'Staff@123', password: 'Staff@123' },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error(`Status ${res.status}`);
    }
    testState.staffBookToken = res.data.token;
  });

  await assertTest('TC_AUTH_A03', 'Đăng nhập tài khoản Thủ thư Duyệt Mượn', async () => {
    const res = await api('/api/admin/auth/login', {
      method: 'POST',
      body: { MSNV: staffLoanMSNV, Password: 'Staff@123', password: 'Staff@123' },
    });
    if (res.status !== 200 || !res.data?.token) {
      throw new Error(`Status ${res.status}`);
    }
    testState.staffLoanToken = res.data.token;
  });

  // RBAC CROSS-TESTING
  await assertTest('TC_RBAC_04', 'RBAC: Thủ thư Sách gọi route Duyệt Mượn (Kỳ vọng 403)', async () => {
    const res = await api('/api/admin/muonsach', { token: testState.staffBookToken });
    if (res.status !== 403) {
      throw new Error(`Kỳ vọng 403 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_RBAC_05', 'RBAC: Thủ thư Mượn gọi route Quản lý Sách (Kỳ vọng 403)', async () => {
    const res = await api('/api/admin/sach', { token: testState.staffLoanToken });
    if (res.status !== 403) {
      throw new Error(`Kỳ vọng 403 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_RBAC_03', 'RBAC: Nhân viên thường gọi route Quản lý Nhân Viên (Kỳ vọng 403)', async () => {
    const res = await api('/api/admin/nhanvien', { token: testState.staffBookToken });
    if (res.status !== 403) {
      throw new Error(`Kỳ vọng 403 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_RBAC_06', 'RBAC: Token Độc giả gọi route Quản trị Admin (Kỳ vọng 403)', async () => {
    const res = await api('/api/admin/dashboard/stats', { token: testState.user1Token });
    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Kỳ vọng 403/401 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_RBAC_07', 'RBAC: Không gửi Token khi gọi route Admin (Kỳ vọng 401)', async () => {
    const res = await api('/api/admin/dashboard/stats');
    if (res.status !== 401) {
      throw new Error(`Kỳ vọng 401 nhưng nhận được ${res.status}`);
    }
  });

  // ------------------------------------------------------------------
  // 4. BOOKS & PUBLISHERS MANAGEMENT
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 4: QUẢN LÝ SÁCH & NHÀ XUẤT BẢN (CRUD ADMIN)${colors.reset}`);
  await assertTest('TC_NXB_A01', 'Thêm Nhà Xuất Bản mới (POST /api/admin/nxb)', async () => {
    const res = await api('/api/admin/nxb', {
      method: 'POST',
      token: testState.staffBookToken,
      body: {
        MaNXB: testState.testPublisherCode,
        TenNXB: `NXB Công Nghệ Mới ${timestamp.toString().slice(-4)}`,
        DiaChi: 'Hà Nội',
      },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    testState.testPublisherId = res.data?.data?._id || res.data?._id;
  });

  const testBookCode = `S_${timestamp.toString().slice(-4)}`;
  await assertTest('TC_BOOK_A01', 'Thêm Sách mới với số lượng đúng 1 cuốn (phục vụ test Overbooking)', async () => {
    const res = await api('/api/admin/sach', {
      method: 'POST',
      token: testState.staffBookToken,
      body: {
        MaSach: testBookCode,
        TenSach: `Kiểm Thử Tự Động Senior MEVN ${timestamp.toString().slice(-4)}`,
        DonGia: 150000,
        SoQuyen: 1, // CHỈ CÓ ĐÚNG 1 CUỐN DUY NHẤT
        NamXuatBan: 2026,
        MaNXB: testState.testPublisherCode,
        TacGia: 'Nguyễn Minh Tuấn',
        TheLoai: 'Công nghệ thông tin',
        MoTa: 'Sách kiểm thử mẫu phục vụ đồ án CT449',
      },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    testState.testBookId = res.data?.data?._id || res.data?._id;
    if (!testState.testBookId) {
      const list = await api('/api/user/sach');
      const found = list.data.find(b => b.MaSach === testBookCode);
      if (found) testState.testBookId = found._id;
    }
  });

  // ------------------------------------------------------------------
  // 5. USER INTERACTIONS: WISHLIST & REVIEW
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 5: TƯƠNG TÁC ĐỘC GIẢ (WISHLIST & ĐÁNH GIÁ SÁCH)${colors.reset}`);
  if (testState.testBookId) {
    await assertTest('TC_USER_01', 'Thêm sách vào Yêu thích (POST /api/user/yeuthich/:id/toggle)', async () => {
      const res = await api(`/api/user/yeuthich/${testState.testBookId}/toggle`, {
        method: 'POST',
        token: testState.user1Token,
      });
      if (res.status !== 200) {
        throw new Error(`Status ${res.status}`);
      }
    });

    await assertTest('TC_USER_02', 'Lấy danh sách yêu thích của Độc giả 1', async () => {
      const res = await api('/api/user/yeuthich', { token: testState.user1Token });
      if (res.status !== 200 || !Array.isArray(res.data)) {
        throw new Error(`Status ${res.status}`);
      }
    });

    await assertTest('TC_USER_03_BLOCKED', 'Chặn đánh giá sách khi chưa mượn sách (Kỳ vọng lỗi 400)', async () => {
      const res = await api(`/api/user/danhgia/${testState.testBookId}`, {
        method: 'POST',
        token: testState.user1Token,
        body: {
          soSao: 5,
          nhanXet: 'Sách hay chưa từng đọc',
        },
      });
      if (res.status !== 400) {
        throw new Error(`Kỳ vọng chặn 400 nhưng nhận ${res.status}`);
      }
    });
  }

  // ------------------------------------------------------------------
  // 6. COMPLETE BORROW LIFECYCLE & ATOMIC OVERBOOKING
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 6: QUY TRÌNH MƯỢN TRẢ & CHỐNG OVERBOOKING NGUYÊN TỬ${colors.reset}`);
  let loanUser1Id = null;
  let loanUser2Id = null;

  await assertTest('TC_LOAN_01', 'Độc giả 1 tạo phiếu mượn (Kho = 1, trạng thái: Chờ duyệt)', async () => {
    const res = await api('/api/user/muon', {
      method: 'POST',
      token: testState.user1Token,
      body: {
        sachId: String(testState.testBookId),
        soLuong: 1,
        ngayMuon: new Date().toISOString().slice(0, 10),
        ngayTra: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      },
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    loanUser1Id = res.data?.data?._id || res.data?._id;
  });

  await assertTest('TC_LOAN_01_B', 'Độc giả 2 cùng tạo phiếu mượn cuốn sách đó (Kho vẫn = 1, chưa trừ)', async () => {
    const res = await api('/api/user/muon', {
      method: 'POST',
      token: testState.user2Token,
      body: {
        sachId: String(testState.testBookId),
        soLuong: 1,
        ngayMuon: new Date().toISOString().slice(0, 10),
        ngayTra: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      },
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    loanUser2Id = res.data?.data?._id || res.data?._id;
  });

  await assertTest('TC_LOAN_04', 'Thủ thư duyệt phiếu Độc giả 1 (Thành công → Kho trừ từ 1 về 0)', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser1Id}/approve`, {
      method: 'PUT',
      token: testState.staffLoanToken,
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_LOAN_05', '★ CHỐNG OVERBOOKING: Thủ thư duyệt phiếu Độc giả 2 (Bắt buộc lỗi 400)', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser2Id}/approve`, {
      method: 'PUT',
      token: testState.staffLoanToken,
    });
    if (res.status !== 400) {
      throw new Error(`VI PHẠM OVERBOOKING: Kỳ vọng lỗi 400 nhưng nhận được status ${res.status}`);
    }
  });

  await assertTest('TC_LOAN_06', 'Thủ thư từ chối phiếu Độc giả 2 vì hết sách (PUT .../reject)', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser2Id}/reject`, {
      method: 'PUT',
      token: testState.staffLoanToken,
      body: { lyDo: 'Sách đã hết do độc giả khác được duyệt trước' },
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_LOAN_07', 'Thủ thư giao sách cho Độc giả 1 (chuyển sang "Đang mượn")', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser1Id}/handover`, {
      method: 'PUT',
      token: testState.staffLoanToken,
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_EXT_01', 'Độc giả 1 xin gia hạn thêm 7 ngày (POST .../gia-han)', async () => {
    const res = await api(`/api/user/muon/${loanUser1Id}/gia-han`, {
      method: 'POST',
      token: testState.user1Token,
      body: { soNgayGiaHan: 7 },
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_EXT_04', 'Thủ thư duyệt yêu cầu gia hạn (+7 ngày thành công)', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser1Id}/approve-extend`, {
      method: 'PUT',
      token: testState.staffLoanToken,
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_RET_02', 'Thủ thư xác nhận trả sách (Phiếu thành "Đã trả" → Hoàn kho về 1)', async () => {
    const res = await api(`/api/admin/muonsach/${loanUser1Id}/confirm-return`, {
      method: 'PUT',
      token: testState.staffLoanToken,
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  await assertTest('TC_RET_02_B', 'Xác minh số lượng tồn kho của sách đã được hoàn trả lại = 1', async () => {
    const res = await api(`/api/user/sach/${testState.testBookId}`);
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
    const soQuyen = res.data.SoQuyen ?? res.data.SoQuyenConLai;
    if (soQuyen < 1) {
      throw new Error(`Lỗi hoàn kho: Số quyển hiện tại là ${soQuyen}, kỳ vọng >= 1`);
    }
  });

  await assertTest('TC_USER_03', 'Độc giả 1 gửi đánh giá 5 sao sau khi hoàn tất mượn (POST .../danhgia/:id)', async () => {
    const res = await api(`/api/user/danhgia/${testState.testBookId}`, {
      method: 'POST',
      token: testState.user1Token,
      body: {
        soSao: 5,
        nhanXet: 'Sách trình bày rất logic, kịch bản test xuất sắc!',
      },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_USER_04', 'Lấy danh sách đánh giá công khai của sách (GET .../danhgia/:id)', async () => {
    const res = await api(`/api/user/danhgia/${testState.testBookId}`);
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  // ------------------------------------------------------------------
  // 7. READER ACCOUNT LOCK & UNLOCK
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 7: KHÓA TÀI KHOẢN ĐỘC GIẢ VI PHẠM (ADMIN DOCGIA)${colors.reset}`);
  await assertTest('TC_MNG_02', 'Admin khóa tài khoản Độc giả 2 (PUT /api/admin/docgia/:id/status)', async () => {
    const res = await api(`/api/admin/docgia/${testState.user2Id}/status`, {
      method: 'PUT',
      token: testState.adminToken,
      body: { TrangThaiTaiKhoan: 'BiKhoa', LyDoKhoa: 'Vi phạm quy chế kiểm thử' },
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await assertTest('TC_AUTH_U06', 'Độc giả bị khóa cố gắng mượn sách mới (Kỳ vọng bị chặn 403/400)', async () => {
    const res = await api('/api/user/muon', {
      method: 'POST',
      token: testState.user2Token,
      body: {
        sachId: String(testState.testBookId),
        soLuong: 1,
        ngayMuon: new Date().toISOString().slice(0, 10),
        ngayTra: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      },
    });
    if (res.status !== 403 && res.status !== 400) {
      throw new Error(`Kỳ vọng bị chặn 403/400 nhưng nhận được ${res.status}`);
    }
  });

  await assertTest('TC_MNG_03', 'Admin mở khóa tài khoản Độc giả 2 (Trở lại BinhThuong)', async () => {
    const res = await api(`/api/admin/docgia/${testState.user2Id}/status`, {
      method: 'PUT',
      token: testState.adminToken,
      body: { TrangThaiTaiKhoan: 'BinhThuong' },
    });
    if (res.status !== 200) {
      throw new Error(`Status ${res.status}`);
    }
  });

  // ------------------------------------------------------------------
  // 8. DASHBOARD ANALYTICS & STATS
  // ------------------------------------------------------------------
  console.log(`\n${colors.yellow}${colors.bright}▶ NHÓM 8: THỐNG KÊ DASHBOARD & BÁO CÁO QUẢN TRỊ${colors.reset}`);
  await assertTest('TC_DASH_01', 'Lấy số liệu KPI Dashboard Quản trị (GET /api/admin/dashboard/stats)', async () => {
    const res = await api('/api/admin/dashboard/stats', { token: testState.adminToken });
    if (res.status !== 200 || typeof res.data !== 'object') {
      throw new Error(`Status ${res.status}`);
    }
  });

  // ------------------------------------------------------------------
  // SUMMARY REPORT
  // ------------------------------------------------------------------
  const duration = ((Date.now() - testStartTime) / 1000).toFixed(2);
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n${colors.cyan}${colors.bright}======================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}                 BÁO CÁO KẾT QUẢ KIỂM THỬ TỔNG HỢP                     ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}======================================================================${colors.reset}`);
  console.log(`  • Tổng số ca kiểm thử đã chạy : ${colors.bright}${totalTests}${colors.reset}`);
  console.log(`  • Số ca kiểm thử THÀNH CÔNG   : ${colors.green}${colors.bright}${passedTests} PASS${colors.reset}`);
  console.log(`  • Số ca kiểm thử THẤT BẠI     : ${failedTests > 0 ? colors.red : colors.green}${colors.bright}${failedTests} FAIL${colors.reset}`);
  console.log(`  • Tỷ lệ đạt chuẩn             : ${colors.bright}${successRate}%${colors.reset}`);
  console.log(`  • Tổng thời gian thực thi     : ${duration} giây`);
  console.log(`${colors.cyan}${colors.bright}======================================================================${colors.reset}\n`);

  if (failedTests === 0) {
    console.log(`${colors.green}${colors.bright}🎉 XUẤT SẮC: 100% CÁC BÀI KIỂM THỬ ĐÃ ĐẠT CHUẨN!${colors.reset}`);
    console.log(`${colors.green}Hệ thống Quản lý mượn sách MEVN Stack đã sẵn sàng bảo vệ đồ án CT449 đạt điểm tối đa!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}⚠️ CẢNH BÁO: Có ${failedTests} ca kiểm thử không đạt. Vui lòng rà soát log ở trên.${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nLỗi nghiêm trọng không xác định:', err);
  process.exit(1);
});
