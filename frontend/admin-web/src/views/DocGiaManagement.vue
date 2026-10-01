<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Độc Giả
          </h2>
          <p class="text-muted-custom mb-0">Quản lý tài khoản và theo dõi hoạt động mượn sách của độc giả</p>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="toast.show" class="alert alert-dismissible fade show" :class="toast.type === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="fas me-2" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ toast.message }}
        <button type="button" class="btn-close" @click="toast.show = false"></button>
      </div>

      <!-- Statistics Badges -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 p-3 h-100" @click="filterByStatus('')">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-users fa-lg"></i>
              </div>
              <div>
                <div class="stat-number fw-bold fs-4 text-dark">{{ stats.total }}</div>
                <div class="stat-label text-muted small">Tổng độc giả</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 p-3 h-100" @click="filterByStatus('BinhThuong')">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-user-check fa-lg"></i>
              </div>
              <div>
                <div class="stat-number fw-bold fs-4 text-dark">{{ stats.active }}</div>
                <div class="stat-label text-muted small">Bình thường</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 p-3 h-100" @click="filterByStatus('BiKhoa')">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-danger-subtle text-danger rounded-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-user-lock fa-lg"></i>
              </div>
              <div>
                <div class="stat-number fw-bold fs-4 text-dark">{{ stats.locked }}</div>
                <div class="stat-label text-muted small">Bị khóa</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 p-3 h-100">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon bg-warning-subtle text-warning rounded-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-book-reader fa-lg"></i>
              </div>
              <div>
                <div class="stat-number fw-bold fs-4 text-dark">{{ stats.borrowing }}</div>
                <div class="stat-label text-muted small">Đang mượn sách</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <BaseCard class="border-0 shadow-sm rounded-4 mb-4">
        <div class="d-flex flex-wrap gap-3 align-items-center">
          <div class="flex-grow-1">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Tìm theo tên, email hoặc mã độc giả..."
                @input="onSearchDebounced"
              />
              <button v-if="searchQuery" class="btn btn-outline-secondary" @click="clearSearch">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div>
            <select v-model="statusFilter" class="form-select" @change="fetchDocGia" style="min-width: 180px;">
              <option value="">Tất cả trạng thái</option>
              <option value="BinhThuong">Bình thường</option>
              <option value="BiKhoa">Bị khóa</option>
            </select>
          </div>
          <button class="btn btn-outline-primary" @click="fetchDocGia" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          </button>
        </div>
      </BaseCard>

      <!-- Data Table -->
      <BaseCard class="border-0 shadow-sm rounded-4 overflow-hidden p-0">
        <div class="bg-white pt-4 pb-3 px-4 border-bottom">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <div class="bg-primary-subtle text-primary rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-user-graduate fa-lg"></i>
              </div>
              <div>
                <h5 class="mb-0 fw-bold text-dark">Danh sách Độc Giả</h5>
                <small class="text-muted">{{ filteredPaginated.length }} / {{ filteredList.length }} hiển thị</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Đang tải danh sách độc giả...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredList.length" class="text-center py-5 text-muted">
          <div class="mb-3"><i class="fas fa-user-slash fa-3x opacity-25"></i></div>
          <p class="mb-1 fw-medium">Không tìm thấy độc giả nào</p>
          <p class="mb-0 small">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0" id="docgia-table">
            <thead class="table-light text-muted-custom">
              <tr>
                <th class="fw-semibold text-uppercase small ps-4 py-3">STT</th>
                <th class="fw-semibold text-uppercase small py-3">Độc giả</th>
                <th class="fw-semibold text-uppercase small py-3">Liên hệ</th>
                <th class="fw-semibold text-uppercase small py-3 text-center">Trạng thái</th>
                <th class="fw-semibold text-uppercase small py-3 text-center">Đang mượn</th>
                <th class="fw-semibold text-uppercase small py-3 text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dg, index) in filteredPaginated" :key="dg._id">
                <td class="text-muted fw-bold ps-4">{{ (currentPage - 1) * pageSize + index + 1 }}</td>

                <!-- Cột Độc Giả -->
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                         :class="dg.TrangThaiTaiKhoan === 'BiKhoa' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
                      {{ getInitials(dg) }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">{{ getFullName(dg) }}</div>
                      <small class="text-muted">
                        <span class="badge bg-light text-secondary border border-light-subtle px-2 py-1 rounded-pill font-monospace">
                          {{ dg.MaDocGia || '—' }}
                        </span>
                      </small>
                    </div>
                  </div>
                </td>

                <!-- Cột Liên hệ -->
                <td>
                  <div>
                    <div class="text-dark small">
                      <i class="fas fa-envelope me-1 text-muted opacity-50"></i>
                      {{ dg.Email || '—' }}
                    </div>
                    <div v-if="dg.DienThoai || dg.DIENTHOAI" class="text-muted small mt-1">
                      <i class="fas fa-phone me-1 opacity-50"></i>
                      {{ dg.DienThoai || dg.DIENTHOAI }}
                    </div>
                  </div>
                </td>

                <!-- Cột Trạng thái -->
                <td class="text-center">
                  <span class="badge rounded-pill px-3 py-2"
                        :class="dg.TrangThaiTaiKhoan === 'BiKhoa' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'">
                    <i class="fas me-1" :class="dg.TrangThaiTaiKhoan === 'BiKhoa' ? 'fa-lock' : 'fa-check-circle'"></i>
                    {{ dg.TrangThaiTaiKhoan === 'BiKhoa' ? 'Bị khóa' : 'Bình thường' }}
                  </span>
                </td>

                <!-- Cột Đang mượn -->
                <td class="text-center">
                  <span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-2">
                    {{ dg._borrowingCount ?? '—' }}
                  </span>
                </td>

                <!-- Cột Thao tác -->
                <td class="text-end pe-4">
                  <div class="d-flex gap-1 justify-content-end">
                    <button class="btn btn-sm btn-outline-primary" @click="viewDetail(dg)" title="Xem chi tiết">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="viewHistory(dg)" title="Lịch sử mượn">
                      <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" @click="resetPassword(dg)" title="Cấp lại mật khẩu">
                      <i class="fas fa-key"></i>
                    </button>
                    <button
                      v-if="dg.TrangThaiTaiKhoan !== 'BiKhoa'"
                      class="btn btn-sm btn-outline-danger"
                      @click="openLockModal(dg)"
                      title="Khóa tài khoản"
                    >
                      <i class="fas fa-lock"></i>
                    </button>
                    <button
                      v-else
                      class="btn btn-sm btn-outline-success"
                      @click="unlockAccount(dg)"
                      title="Mở khóa tài khoản"
                      :disabled="actionLoading"
                    >
                      <i class="fas fa-unlock"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light">
          <small class="text-muted">
            Hiển thị {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredList.length) }}
            trên tổng {{ filteredList.length }} độc giả
          </small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </BaseCard>
    </div>

    <!-- ========== MODAL: Chi Tiết Độc Giả ========== -->
    <div class="modal fade" id="detailModal" tabindex="-1" aria-labelledby="detailModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold" id="detailModalLabel">
              <i class="fas fa-user-circle text-primary me-2"></i>Chi Tiết Độc Giả
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body px-4 pb-4" v-if="selectedDocGia">
            <!-- Profile Card -->
            <div class="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4">
              <div class="avatar-circle-lg d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                   :class="selectedDocGia.TrangThaiTaiKhoan === 'BiKhoa' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
                {{ getInitials(selectedDocGia) }}
              </div>
              <div>
                <h5 class="fw-bold text-dark mb-1">{{ getFullName(selectedDocGia) }}</h5>
                <span class="badge bg-light text-secondary border border-light-subtle px-2 py-1 rounded-pill font-monospace me-2">
                  {{ selectedDocGia.MaDocGia || '—' }}
                </span>
                <span class="badge rounded-pill px-3 py-1"
                      :class="selectedDocGia.TrangThaiTaiKhoan === 'BiKhoa' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'">
                  {{ selectedDocGia.TrangThaiTaiKhoan === 'BiKhoa' ? '🔒 Bị khóa' : '✅ Bình thường' }}
                </span>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <div class="info-item">
                  <label class="form-label text-muted small mb-1"><i class="fas fa-envelope me-1"></i>Email</label>
                  <p class="mb-0 fw-medium">{{ selectedDocGia.Email || '—' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <label class="form-label text-muted small mb-1"><i class="fas fa-phone me-1"></i>Điện thoại</label>
                  <p class="mb-0 fw-medium">{{ selectedDocGia.DienThoai || selectedDocGia.DIENTHOAI || '—' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <label class="form-label text-muted small mb-1"><i class="fas fa-map-marker-alt me-1"></i>Địa chỉ</label>
                  <p class="mb-0 fw-medium">{{ selectedDocGia.DiaChi || selectedDocGia.DIACHI || '—' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <label class="form-label text-muted small mb-1"><i class="fas fa-birthday-cake me-1"></i>Ngày sinh</label>
                  <p class="mb-0 fw-medium">{{ formatDate(selectedDocGia.NgaySinh || selectedDocGia.NGAYSINH) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <label class="form-label text-muted small mb-1"><i class="fas fa-venus-mars me-1"></i>Giới tính</label>
                  <p class="mb-0 fw-medium">{{ selectedDocGia.Phai || selectedDocGia.GIOITINH || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Khóa info nếu bị khóa -->
            <div v-if="selectedDocGia.TrangThaiTaiKhoan === 'BiKhoa'" class="alert alert-danger d-flex align-items-start gap-3 rounded-4 mb-4">
              <i class="fas fa-ban mt-1"></i>
              <div>
                <strong>Tài khoản đang bị khóa</strong>
                <p class="mb-0 mt-1 small">
                  <strong>Lý do:</strong> {{ selectedDocGia.LyDoKhoa || 'Không rõ' }}<br/>
                  <strong>Ngày khóa:</strong> {{ formatDate(selectedDocGia.NgayKhoa) }}
                </p>
              </div>
            </div>

            <!-- Borrow Stats -->
            <div v-if="detailLoading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span class="ms-2 text-muted small">Đang tải thống kê...</span>
            </div>
            <div v-else-if="detailStats" class="mb-3">
              <h6 class="fw-bold text-dark mb-3"><i class="fas fa-chart-bar me-2 text-primary"></i>Thống kê mượn sách</h6>
              <div class="row g-2">
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-warning-subtle rounded-3">
                    <div class="fw-bold fs-5 text-warning">{{ detailStats.choDuyet }}</div>
                    <small class="text-muted">Chờ duyệt</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-info-subtle rounded-3">
                    <div class="fw-bold fs-5 text-info">{{ detailStats.dangMuon }}</div>
                    <small class="text-muted">Đang mượn</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-danger-subtle rounded-3">
                    <div class="fw-bold fs-5 text-danger">{{ detailStats.quaHan }}</div>
                    <small class="text-muted">Quá hạn</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-success-subtle rounded-3">
                    <div class="fw-bold fs-5 text-success">{{ detailStats.daTra }}</div>
                    <small class="text-muted">Đã trả</small>
                  </div>
                </div>
              </div>
              <div class="mt-2 text-center">
                <small class="text-muted">
                  Tổng đang giữ: <strong class="text-dark">{{ detailStats.tongDangGiu }} / 10</strong> quyển
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-outline-warning" @click="resetPassword(selectedDocGia)" :disabled="!selectedDocGia">
              <i class="fas fa-key me-1"></i>Cấp lại mật khẩu
            </button>
            <button type="button" class="btn btn-outline-info" @click="viewHistoryFromDetail" :disabled="!selectedDocGia">
              <i class="fas fa-history me-1"></i>Xem lịch sử
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== MODAL: Khóa Tài Khoản ========== -->
    <div class="modal fade" id="lockModal" tabindex="-1" aria-labelledby="lockModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold text-danger" id="lockModalLabel">
              <i class="fas fa-lock me-2"></i>Khóa Tài Khoản
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body px-4 pb-2" v-if="lockTarget">
            <div class="alert alert-warning d-flex align-items-start gap-2 rounded-3 mb-3">
              <i class="fas fa-exclamation-triangle mt-1"></i>
              <div>
                Bạn đang khóa tài khoản của <strong>{{ getFullName(lockTarget) }}</strong>.
                Độc giả sẽ không thể đăng nhập hoặc mượn sách khi tài khoản bị khóa.
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium" for="lockReason">Lý do khóa</label>
              <textarea
                v-model="lockReason"
                id="lockReason"
                class="form-control"
                rows="3"
                placeholder="Nhập lý do khóa tài khoản (ví dụ: sách quá hạn, mất sách...)"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmLock" :disabled="actionLoading">
              <span v-if="actionLoading" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-lock me-1"></i>
              Xác nhận khóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== MODAL: Lịch Sử Mượn Sách ========== -->
    <div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold" id="historyModalLabel">
              <i class="fas fa-history text-info me-2"></i>
              Lịch sử mượn sách
              <span v-if="historyTarget" class="text-muted fw-normal ms-1">— {{ getFullName(historyTarget) }}</span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body px-4 pb-4">
            <!-- Loading -->
            <div v-if="historyLoading" class="text-center py-4">
              <div class="spinner-border text-info" role="status"></div>
              <p class="text-muted mt-2 mb-0">Đang tải lịch sử...</p>
            </div>

            <!-- Empty -->
            <div v-else-if="!historyRecords.length" class="text-center py-4 text-muted">
              <i class="fas fa-inbox fa-3x opacity-25 mb-3 d-block"></i>
              <p class="mb-0">Độc giả chưa có lịch sử mượn sách nào.</p>
            </div>

            <!-- History Table -->
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="small fw-semibold text-uppercase py-3">STT</th>
                    <th class="small fw-semibold text-uppercase py-3">Sách</th>
                    <th class="small fw-semibold text-uppercase py-3">Ngày mượn</th>
                    <th class="small fw-semibold text-uppercase py-3">Ngày hẹn trả</th>
                    <th class="small fw-semibold text-uppercase py-3">Ngày trả</th>
                    <th class="small fw-semibold text-uppercase py-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, idx) in historyRecords" :key="record._id || idx">
                    <td class="text-muted">{{ idx + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img
                          v-if="record.sach?.HinhAnh || record.sach?.AnhBia"
                          :src="record.sach.HinhAnh || record.sach.AnhBia"
                          class="rounded-2 flex-shrink-0"
                          style="width: 40px; height: 55px; object-fit: cover;"
                          :alt="record.sach?.TenSach"
                        />
                        <div v-else class="bg-light rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 55px;">
                          <i class="fas fa-book text-muted"></i>
                        </div>
                        <div>
                          <div class="fw-medium text-dark small">{{ record.sach?.TenSach || record.MaSach || '—' }}</div>
                          <small class="text-muted font-monospace">{{ record.sach?.MaSach || '' }}</small>
                        </div>
                      </div>
                    </td>
                    <td class="small">{{ formatDate(record.ngayMuon) }}</td>
                    <td class="small">{{ formatDate(record.ngayTra) }}</td>
                    <td class="small">{{ formatDate(record.ngayTraThucTe) }}</td>
                    <td class="text-center">
                      <span class="badge rounded-pill px-3 py-2" :class="statusBadgeClass(record.trangThai)">
                        {{ statusLabel(record.trangThai) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import DocGiaService from '@/services/docgia.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import { Modal } from 'bootstrap'

// =========== STATE ===========
const docGiaList = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

const toast = ref({ show: false, message: '', type: 'success' })

// Detail modal
const selectedDocGia = ref(null)
const detailLoading = ref(false)
const detailStats = ref(null)

// Lock modal
const lockTarget = ref(null)
const lockReason = ref('')

// History modal
const historyTarget = ref(null)
const historyRecords = ref([])
const historyLoading = ref(false)

// =========== COMPUTED ===========
const stats = computed(() => {
  const list = docGiaList.value
  return {
    total: list.length,
    active: list.filter(d => d.TrangThaiTaiKhoan !== 'BiKhoa').length,
    locked: list.filter(d => d.TrangThaiTaiKhoan === 'BiKhoa').length,
    borrowing: list.reduce((sum, d) => sum + (d._borrowingCount || 0), 0),
  }
})

const filteredList = computed(() => {
  let result = docGiaList.value
  if (statusFilter.value) {
    if (statusFilter.value === 'BiKhoa') {
      result = result.filter(d => d.TrangThaiTaiKhoan === 'BiKhoa')
    } else {
      result = result.filter(d => d.TrangThaiTaiKhoan !== 'BiKhoa')
    }
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(d => {
      const name = getFullName(d).toLowerCase()
      const email = (d.Email || '').toLowerCase()
      const code = (d.MaDocGia || '').toLowerCase()
      return name.includes(q) || email.includes(q) || code.includes(q)
    })
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize))

const filteredPaginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// =========== FETCH ===========
const fetchDocGia = async () => {
  loading.value = true
  try {
    const params = {}
    if (statusFilter.value) params.trangThai = statusFilter.value
    // Note: search is done client-side for responsiveness, server-side search also supported
    const response = await DocGiaService.getAll(params)
    const data = Array.isArray(response.data) ? response.data : []
    // Enrich with borrowing count (from the detail endpoint later if needed, or approximate)
    docGiaList.value = data.map(d => ({
      ...d,
      _borrowingCount: d.thongKeMuon?.tongDangGiu ?? 0,
    }))
    currentPage.value = 1
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể tải danh sách độc giả.', 'error')
  } finally {
    loading.value = false
  }
}

// =========== SEARCH ===========
let searchTimeout = null
const onSearchDebounced = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const filterByStatus = (status) => {
  statusFilter.value = status
  currentPage.value = 1
}

// =========== DETAIL MODAL ===========
const viewDetail = async (dg) => {
  selectedDocGia.value = { ...dg }
  detailStats.value = null
  detailLoading.value = true
  await nextTick()
  openModal('detailModal')
  try {
    const response = await DocGiaService.get(dg._id)
    if (response.data) {
      selectedDocGia.value = { ...response.data }
      detailStats.value = response.data.thongKeMuon || null
    }
  } catch (_) {
    detailStats.value = null
  } finally {
    detailLoading.value = false
  }
}

// =========== LOCK / UNLOCK ===========
const openLockModal = (dg) => {
  lockTarget.value = { ...dg }
  lockReason.value = ''
  openModal('lockModal')
}

const confirmLock = async () => {
  if (!lockTarget.value) return
  actionLoading.value = true
  try {
    await DocGiaService.toggleAccountStatus(lockTarget.value._id, {
      TrangThaiTaiKhoan: 'BiKhoa',
      LyDoKhoa: lockReason.value || 'Vi phạm nội quy thư viện'
    })
    showToast(`Đã khóa tài khoản của ${getFullName(lockTarget.value)}`, 'success')
    closeModal('lockModal')
    await fetchDocGia()
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể khóa tài khoản.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const unlockAccount = async (dg) => {
  if (!confirm(`Bạn có chắc muốn mở khóa tài khoản của ${getFullName(dg)}?`)) return
  actionLoading.value = true
  try {
    await DocGiaService.toggleAccountStatus(dg._id, {
      TrangThaiTaiKhoan: 'BinhThuong'
    })
    showToast(`Đã mở khóa tài khoản của ${getFullName(dg)}`, 'success')
    await fetchDocGia()
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể mở khóa tài khoản.', 'error')
  } finally {
    actionLoading.value = false
  }
}

const resetPassword = async (dg) => {
  if (!confirm(`Bạn có chắc muốn cấp lại mật khẩu cho độc giả ${getFullName(dg)} về mặc định không?`)) return
  actionLoading.value = true
  try {
    const res = await DocGiaService.resetPassword(dg._id)
    showToast(`Đã cấp lại mật khẩu thành công. Mật khẩu mới: ${res.data.newPassword}`, 'success')
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể cấp lại mật khẩu.', 'error')
  } finally {
    actionLoading.value = false
  }
}

// =========== HISTORY MODAL ===========
const viewHistory = async (dg) => {
  historyTarget.value = { ...dg }
  historyRecords.value = []
  historyLoading.value = true
  openModal('historyModal')
  try {
    const response = await DocGiaService.getBorrowHistory(dg._id)
    historyRecords.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    showToast('Không thể tải lịch sử mượn sách.', 'error')
  } finally {
    historyLoading.value = false
  }
}

const viewHistoryFromDetail = () => {
  if (!selectedDocGia.value) return
  closeModal('detailModal')
  setTimeout(() => viewHistory(selectedDocGia.value), 300)
}

// =========== HELPERS ===========
const getFullName = (dg) => {
  const hoLot = dg.HoLot || dg.HOLOT || ''
  const ten = dg.Ten || dg.TEN || ''
  const full = `${hoLot} ${ten}`.trim()
  return full || dg.Email || 'Không rõ'
}

const getInitials = (dg) => {
  const name = getFullName(dg)
  if (!name || name === 'Không rõ') return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const statusLabel = (status) => {
  const map = {
    'chờ duyệt': 'Chờ duyệt',
    'đã duyệt': 'Đã duyệt',
    'đang mượn': 'Đang mượn',
    'đang chờ trả': 'Chờ trả',
    'đã trả': 'Đã trả',
    'quá hạn': 'Quá hạn',
    'từ chối': 'Từ chối',
    'mat': 'Mất sách',
  }
  return map[String(status).toLowerCase()] || status || '—'
}

const statusBadgeClass = (status) => {
  const map = {
    'chờ duyệt': 'bg-warning-subtle text-warning-emphasis',
    'đã duyệt': 'bg-primary-subtle text-primary-emphasis',
    'đang mượn': 'bg-info-subtle text-info-emphasis',
    'đang chờ trả': 'bg-orange text-white',
    'đã trả': 'bg-success-subtle text-success-emphasis',
    'quá hạn': 'bg-danger text-white',
    'từ chối': 'bg-danger-subtle text-danger-emphasis',
    'mat': 'bg-danger text-white',
  }
  return map[String(status).toLowerCase()] || 'bg-secondary-subtle text-secondary'
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}

// =========== BOOTSTRAP MODAL HELPERS ===========
let modalInstances = {}

const openModal = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  if (!modalInstances[id]) {
    modalInstances[id] = new Modal(el)
  }
  modalInstances[id].show()
}

const closeModal = (id) => {
  if (modalInstances[id]) {
    modalInstances[id].hide()
  }
}

// =========== LIFECYCLE ===========
onMounted(() => {
  fetchDocGia()
})
</script>

<style scoped>
.page-shell {
  background-color: #f3f6f9;
  min-height: 100vh;
}

.stat-card {
  cursor: pointer;
  transition: all 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08) !important;
}

.avatar-circle {
  width: 42px;
  height: 42px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.avatar-circle-lg {
  width: 60px;
  height: 60px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.info-item {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
}

.table > :not(caption) > * > * {
  padding: 0.85rem 0.5rem;
}

.table tbody tr {
  transition: background-color 0.15s ease;
}

.btn-sm {
  padding: 0.35rem 0.6rem;
}

.pagination .page-link {
  border-radius: 0.5rem;
  margin: 0 2px;
  border: none;
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  color: white;
}
</style>
