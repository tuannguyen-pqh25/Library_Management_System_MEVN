<template>
  <div class="page-shell py-4">
    <div class="container-fluid">

      <!-- ===== HEADER ===== -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Mượn Sách
          </h2>
          <p class="text-muted-custom mb-0 d-flex align-items-center flex-wrap gap-2">
            <span>Duyệt, từ chối và xác nhận trả sách cho độc giả</span>
            <span v-if="filterStatus === 'chờ duyệt' || filterStatus === 'chờ gia hạn'" class="badge bg-light text-primary border rounded-pill fw-normal" style="font-size:0.75rem;">
              <i class="fas fa-info-circle me-1 text-primary"></i>Phiếu mượn sắp xếp theo thứ tự đăng ký (Ai đăng ký trước duyệt trước)
            </span>
          </p>
        </div>
        <!-- Bộ lọc nhanh trạng thái (Interactive Quick Filter Pills) -->
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <!-- Tất cả -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === '' ? 'active-pill bg-primary text-white border-primary shadow-sm' : 'bg-light text-secondary border-secondary-subtle'"
            @click="toggleFilterStatus('')"
            :title="filterStatus === '' ? 'Đang hiển thị tất cả phiếu' : 'Nhấp để xem tất cả phiếu mượn'"
          >
            <i class="fas me-1" :class="filterStatus === '' ? 'fa-check-circle text-white' : 'fa-list text-muted'"></i>
            Tất cả: {{ records.length }}
          </button>

          <!-- Chờ duyệt -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'chờ duyệt' ? 'active-pill bg-warning text-dark border-warning shadow-sm' : 'bg-warning-subtle text-warning-emphasis border-warning-subtle'"
            @click="toggleFilterStatus('chờ duyệt')"
            :title="filterStatus === 'chờ duyệt' ? 'Đang lọc chờ duyệt (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Chờ duyệt'"
          >
            <i class="fas me-1" :class="filterStatus === 'chờ duyệt' ? 'fa-check-circle text-dark' : 'fa-hourglass-half'"></i>
            Chờ duyệt: {{ countStatus('chờ duyệt') }}
          </button>

          <!-- Chờ gia hạn -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'chờ gia hạn' ? 'active-pill bg-info text-dark border-info shadow-sm' : 'bg-info-subtle text-info-emphasis border-info-subtle'"
            @click="toggleFilterStatus('chờ gia hạn')"
            :title="filterStatus === 'chờ gia hạn' ? 'Đang lọc chờ gia hạn (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Chờ gia hạn'"
          >
            <i class="fas me-1" :class="filterStatus === 'chờ gia hạn' ? 'fa-check-circle text-dark' : 'fa-calendar-plus'"></i>
            Chờ gia hạn: {{ countStatus('chờ gia hạn') }}
          </button>

          <!-- Chờ nhận sách (đã duyệt) -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'đã duyệt' ? 'active-pill bg-primary text-white border-primary shadow-sm' : 'bg-primary-subtle text-primary-emphasis border-primary-subtle'"
            @click="toggleFilterStatus('đã duyệt')"
            :title="filterStatus === 'đã duyệt' ? 'Đang lọc chờ nhận (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Đã duyệt (Chờ độc giả đến nhận)'"
          >
            <i class="fas me-1" :class="filterStatus === 'đã duyệt' ? 'fa-check-circle text-white' : 'fa-hand-holding'"></i>
            Chờ nhận: {{ countStatus('đã duyệt') }}
          </button>

          <!-- Đang mượn -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'đang mượn' ? 'active-pill bg-success text-white border-success shadow-sm' : 'bg-success-subtle text-success-emphasis border-success-subtle'"
            @click="toggleFilterStatus('đang mượn')"
            :title="filterStatus === 'đang mượn' ? 'Đang lọc đang mượn (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Đang mượn'"
          >
            <i class="fas me-1" :class="filterStatus === 'đang mượn' ? 'fa-check-circle text-white' : 'fa-book-reader'"></i>
            Đang mượn: {{ countStatus('đang mượn') }}
          </button>

          <!-- Chờ trả -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'đang chờ trả' ? 'active-pill bg-secondary text-white border-secondary shadow-sm' : 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle'"
            @click="toggleFilterStatus('đang chờ trả')"
            :title="filterStatus === 'đang chờ trả' ? 'Đang lọc chờ trả (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Đang chờ trả'"
          >
            <i class="fas me-1" :class="filterStatus === 'đang chờ trả' ? 'fa-check-circle text-white' : 'fa-clock'"></i>
            Chờ trả: {{ countStatus('đang chờ trả') }}
          </button>

          <!-- Quá hạn -->
          <button
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'quá hạn' ? 'active-pill bg-danger text-white border-danger shadow-sm' : 'bg-danger-subtle text-danger border-danger-subtle'"
            @click="toggleFilterStatus('quá hạn')"
            :title="filterStatus === 'quá hạn' ? 'Đang lọc quá hạn (Nhấp để hủy lọc)' : 'Nhấp để lọc danh sách Quá hạn trả' + (totalOverdueFine > 0 ? ' - Tổng phạt: ' + formatCurrency(totalOverdueFine) : '')"
          >
            <i class="fas me-1" :class="filterStatus === 'quá hạn' ? 'fa-check-circle text-white' : 'fa-exclamation-triangle'"></i>
            Quá hạn: {{ countOverdue }}
            <span v-if="totalOverdueFine > 0" class="ms-1 opacity-90 fw-normal" style="font-size:0.72rem;">
              ({{ formatCurrency(totalOverdueFine) }})
            </span>
          </button>

          <!-- Quá hạn nhận (≥ 3 ngày) -->
          <button
            v-if="countPickupOverdue > 0"
            type="button"
            class="filter-pill badge rounded-pill px-3 py-2 fw-semibold border"
            :class="filterStatus === 'quá hạn nhận' ? 'active-pill bg-danger text-white border-danger shadow-sm' : 'bg-danger-subtle text-danger border-danger-subtle'"
            @click="toggleFilterStatus('quá hạn nhận')"
            :title="filterStatus === 'quá hạn nhận' ? 'Đang lọc quá hạn nhận (Nhấp để hủy lọc)' : 'Số phiếu mượn đã duyệt quá 3 ngày độc giả chưa đến nhận'"
          >
            <i class="fas me-1" :class="filterStatus === 'quá hạn nhận' ? 'fa-check-circle text-white' : 'fa-user-clock'"></i>
            Quá hạn nhận: {{ countPickupOverdue }}
          </button>
        </div>
      </div>

      <!-- Cảnh báo độc giả quá 3 ngày không đến nhận sách -->
      <div v-if="countPickupOverdue > 0" class="alert alert-warning border-warning border-2 d-flex align-items-center justify-content-between p-3 rounded-4 shadow-sm mb-4" role="alert">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center flex-shrink-0" style="width: 44px; height: 44px; font-size: 1.25rem;">
            <i class="fas fa-user-clock"></i>
          </div>
          <div>
            <h6 class="alert-heading fw-bold mb-1 text-dark">
              Phát hiện {{ countPickupOverdue }} phiếu mượn quá hạn nhận sách (≥ 3 ngày)!
            </h6>
            <p class="mb-0 text-muted small">
              Các phiếu này đã duyệt nhưng độc giả chưa đến nhận sách. Vui lòng chọn thao tác <strong>"Độc giả không đến nhận"</strong> để hủy phiếu và tự động hoàn trả số lượng sách về lại kho.
            </p>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-dark rounded-pill fw-semibold px-3 flex-shrink-0" @click="toggleFilterStatus('quá hạn nhận')">
          <i class="fas fa-filter me-1"></i>Lọc phiếu quá hạn nhận
        </button>
      </div>

      <!-- ===== FILTER BAR ===== -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 p-3">
        <div class="row g-3 align-items-center">
          <!-- Filter trạng thái -->
          <div class="col-md-4 col-lg-3">
            <div class="position-relative">
              <span class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style="pointer-events:none;z-index:5;">
                <i class="fas fa-filter"></i>
              </span>
              <select class="form-select shadow-none ps-5 rounded-3 bg-light border-0 custom-height" v-model="filterStatus" @change="onStatusChange">
                <option value="">Tất cả trạng thái ({{ records.length }})</option>
                <option value="chờ duyệt">Chờ duyệt ({{ countStatus('chờ duyệt') }})</option>
                <option value="chờ gia hạn">Chờ gia hạn ({{ countStatus('chờ gia hạn') }})</option>
                <option value="đã duyệt">Chờ nhận - Đã duyệt ({{ countStatus('đã duyệt') }})</option>
                <option value="đang mượn">Đang mượn ({{ countStatus('đang mượn') }})</option>
                <option value="đang chờ trả">Đang chờ trả ({{ countStatus('đang chờ trả') }})</option>
                <option value="đã trả">Đã trả ({{ countStatus('đã trả') }})</option>
                <option value="từ chối">Từ chối ({{ countStatus('từ chối') }})</option>
                <option value="quá hạn">Quá hạn ({{ countOverdue }})</option>
                <option v-if="countPickupOverdue > 0" value="quá hạn nhận">Quá hạn nhận ≥ 3 ngày ({{ countPickupOverdue }})</option>
              </select>
            </div>
          </div>
          <!-- Tìm kiếm -->
          <div class="col-md-8 col-lg-9">
            <div class="input-group">
              <input
                type="text"
                class="form-control custom-height shadow-none rounded-start-3 bg-light border-0 ps-4"
                placeholder="Tìm theo tên sách, tên độc giả, email, mã sách..."
                v-model="searchText"
              />
              <button class="btn btn-primary px-4 custom-height rounded-end-3 z-0" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== LOADING ===== -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="text-muted mt-3 fw-medium">Đang tải danh sách phiếu mượn...</p>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else-if="filteredRecords.length === 0" class="card border-0 shadow-sm rounded-4 text-center py-5">
        <div class="mb-3"><i class="fas fa-inbox fa-4x opacity-25 text-secondary"></i></div>
        <p class="text-muted fw-medium fs-5 mb-1">Không có phiếu mượn nào.</p>
        <small class="text-muted d-block mb-3">
          {{ filterStatus ? `Không có phiếu mượn với trạng thái "${filterStatus}".` : (searchText ? `Không tìm thấy phiếu mượn khớp với "${searchText}".` : 'Chưa có dữ liệu trong hệ thống.') }}
        </small>
        <div v-if="filterStatus || searchText">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold" @click="filterStatus = ''; searchText = ''; currentPage = 1">
            <i class="fas fa-undo-alt me-1"></i>Xem tất cả phiếu mượn
          </button>
        </div>
      </div>

      <!-- ===== TABLE ===== -->
      <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <!-- Result count & items per page -->
        <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small class="text-muted fw-semibold">
            Hiển thị {{ paginatedRecords.length }} / {{ filteredRecords.length }} phiếu
          </small>
          <div class="d-flex align-items-center gap-2">
            <label class="text-muted small fw-semibold text-nowrap">Hiển thị:</label>
            <select
              class="form-select form-select-sm w-auto bg-light border-0 fw-bold text-primary shadow-none cursor-pointer rounded-pill px-3"
              v-model="itemsPerPage"
              @change="currentPage = 1"
            >
              <option :value="10">10 dòng</option>
              <option :value="20">20 dòng</option>
              <option :value="50">50 dòng</option>
              <option :value="100">100 dòng</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="fw-semibold text-uppercase small ps-4 py-3" style="width:50px;">#</th>
                <th class="fw-semibold text-uppercase small py-3">Độc giả</th>
                <th class="fw-semibold text-uppercase small py-3">Sách</th>
                <th class="fw-semibold text-uppercase small py-3">Ngày mượn</th>
                <th class="fw-semibold text-uppercase small py-3">Hạn trả</th>
                <th class="fw-semibold text-uppercase small py-3">Trạng thái</th>
                <th class="fw-semibold text-uppercase small py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in paginatedRecords" :key="record._id" class="table-row-hover">
                <td class="text-muted fw-bold ps-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>

                <!-- Độc giả -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold">
                      {{ getInitial(record.TenDocGia) }}
                    </div>
                    <div>
                      <div class="fw-semibold text-dark small">{{ record.TenDocGia || '—' }}</div>
                      <div class="text-muted" style="font-size:0.75rem;">{{ record.EmailDocGia || '—' }}</div>
                    </div>
                  </div>
                </td>

                <!-- Sách -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      v-if="record.HinhAnh"
                      :src="record.HinhAnh"
                      class="rounded"
                      style="width:36px;height:50px;object-fit:cover;"
                      @error="(e) => { e.target.style.display='none' }"
                    />
                    <div class="book-placeholder rounded bg-light d-flex align-items-center justify-content-center" v-else style="width:36px;height:50px;">
                      <i class="fas fa-book text-muted" style="font-size:0.8rem;"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark small book-title-clamp" :title="record.TenSach">{{ record.TenSach || '—' }}</div>
                      <div class="text-muted" style="font-size:0.75rem;">SL: {{ record.soLuong || 1 }} quyển</div>
                    </div>
                  </div>
                </td>

                <!-- Ngày mượn -->
                <td>
                  <span class="text-dark small">{{ formatDate(record.ngayMuon) }}</span>
                </td>

                <!-- Hạn trả -->
                <td>
                  <span
                    class="small fw-medium"
                    :class="isOverdue(record) ? 'text-danger' : 'text-dark'"
                  >
                    {{ formatDate(record.ngayTra) }}
                    <span v-if="isOverdue(record)" class="d-block mt-1" style="font-size:0.72rem;">
                      <span class="text-danger fw-semibold">
                        <i class="fas fa-exclamation-triangle me-1"></i>Quá hạn <span v-if="getOverdueDays(record) > 0">({{ getOverdueDays(record) }} ngày)</span>
                      </span>
                      <span
                        class="d-block text-danger fw-bold mt-1"
                        style="font-size:0.75rem;"
                        :title="'Công thức: 5.000 VNĐ × ' + getOverdueDays(record) + ' ngày × ' + (record.soLuong || 1) + ' quyển'"
                      >
                        <i class="fas fa-coins text-warning me-1"></i>{{ formatCurrency(getOverdueFine(record)) }}
                        <span v-if="(record.soLuong || 1) > 1" class="text-muted fw-normal ms-1" style="font-size:0.68rem;">({{ record.soLuong }} quyển)</span>
                      </span>
                    </span>
                  </span>
                </td>

                <!-- Trạng thái -->
                <td>
                  <span class="badge rounded-pill px-3 py-2 fw-medium" :class="statusBadgeClass(record.trangThai)">
                    <i class="fas me-1" :class="statusIcon(record.trangThai)"></i>
                    {{ record.trangThai || '—' }}
                  </span>
                  <!-- Tiền phạt quá hạn -->
                  <div v-if="getOverdueFine(record) > 0" class="mt-1">
                    <span
                      class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill fw-bold"
                      style="font-size:0.72rem;"
                      :title="'Công thức: 5.000 VNĐ × ' + getOverdueDays(record) + ' ngày × ' + (record.soLuong || 1) + ' quyển'"
                    >
                      <i class="fas fa-coins text-warning me-1"></i>Phạt: {{ formatCurrency(getOverdueFine(record)) }}
                      <span v-if="(record.soLuong || 1) > 1" class="fw-normal ms-1 opacity-75" style="font-size:0.65rem;">({{ record.soLuong }} quyển)</span>
                    </span>
                  </div>
                  <!-- Cảnh báo quá hạn nhận sách >= 3 ngày -->
                  <div v-if="isPickupOverdue(record)" class="mt-1">
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill" style="font-size:0.7rem;">
                      <i class="fas fa-exclamation-triangle me-1"></i>Quá hạn nhận ({{ getPickupWaitingDays(record) }} ngày)
                    </span>
                  </div>
                  <div v-else-if="record.trangThai === 'đã duyệt'" class="text-muted mt-1" style="font-size:0.72rem;">
                    <i class="far fa-clock me-1"></i>Chờ nhận: {{ getPickupWaitingDays(record) === 0 ? 'Hôm nay' : getPickupWaitingDays(record) + ' ngày' }}
                  </div>
                  <div v-if="record.lyDoTuChoi" class="text-muted mt-1" style="font-size:0.72rem;" :title="record.lyDoTuChoi">
                    <i class="fas fa-comment-slash me-1"></i>{{ truncate(record.lyDoTuChoi, 30) }}
                  </div>
                </td>

                <!-- Thao tác -->
                <td class="text-center" style="min-width:190px;">
                  <div class="d-flex align-items-center gap-1 justify-content-center">
                    <!-- Xem chi tiết -->
                    <button
                      class="btn btn-sm btn-light text-primary rounded-circle action-btn flex-shrink-0"
                      title="Xem chi tiết"
                      @click="openDetail(record)"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <!-- Action dropdown -->
                    <template v-if="getActionOptions(record.trangThai, record).length > 0">
                      <select
                        class="form-select form-select-sm action-select"
                        v-model="actionSelected[record._id]"
                        :id="'action-select-' + record._id"
                      >
                        <option value="" disabled>--- Chọn ---</option>
                        <option
                          v-for="opt in getActionOptions(record.trangThai, record)"
                          :key="opt.value"
                          :value="opt.value"
                        >{{ opt.label }}</option>
                      </select>
                      <button
                        class="btn btn-sm action-exec-btn flex-shrink-0"
                        :class="getExecBtnClass(actionSelected[record._id])"
                        :disabled="!actionSelected[record._id] || processingId === record._id"
                        @click="executeAction(record)"
                        :title="actionSelected[record._id] ? '' : 'Chọn thao tác trước'"
                      >
                        <i class="fas" :class="processingId === record._id ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                      </button>
                    </template>
                    <span v-else class="text-muted" style="font-size:0.75rem;">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-top d-flex justify-content-center" v-if="totalPages > 1">
          <div class="btn-group shadow-sm rounded-pill overflow-hidden">
            <button class="btn btn-white border" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left text-secondary"></i>
            </button>
            <span class="btn btn-white border-top border-bottom fw-semibold px-4 text-primary bg-light" style="pointer-events:none;">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button class="btn btn-white border" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right text-secondary"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ===== MODAL CHI TIẾT ===== -->
  <div class="modal fade" id="detailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" v-if="selectedRecord">
        <div class="modal-header bg-primary text-white py-3 px-4 border-0">
          <h5 class="modal-title fw-bold"><i class="fas fa-file-alt me-2"></i>Chi tiết phiếu mượn</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-4">
            <!-- Thông tin sách -->
            <div class="col-md-6">
              <div class="p-3 bg-light rounded-4 h-100">
                <h6 class="fw-bold text-primary small text-uppercase mb-3"><i class="fas fa-book me-2"></i>Thông tin sách</h6>
                <div class="d-flex align-items-start gap-3">
                  <img
                    v-if="selectedRecord.HinhAnh"
                    :src="selectedRecord.HinhAnh"
                    class="rounded-3 shadow-sm"
                    style="width:60px;height:85px;object-fit:cover;"
                  />
                  <div>
                    <div class="fw-bold text-dark">{{ selectedRecord.TenSach || '—' }}</div>
                    <div class="text-muted small mt-1">Mã sách: <span class="fw-medium">{{ selectedRecord.MaSach || '—' }}</span></div>
                    <div class="text-muted small">NXB: <span class="fw-medium">{{ selectedRecord.TenNXB || '—' }}</span></div>
                    <div class="text-muted small mt-1">Số lượng: <span class="badge bg-primary rounded-pill">{{ selectedRecord.soLuong || 1 }} quyển</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thông tin độc giả -->
            <div class="col-md-6">
              <div class="p-3 bg-light rounded-4 h-100">
                <h6 class="fw-bold text-success small text-uppercase mb-3"><i class="fas fa-user me-2"></i>Độc giả</h6>
                <div class="mb-2">
                  <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Họ tên</small>
                  <span class="fw-semibold text-dark">{{ selectedRecord.TenDocGia || '—' }}</span>
                </div>
                <div class="mb-2">
                  <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Email</small>
                  <span class="text-dark">{{ selectedRecord.EmailDocGia || '—' }}</span>
                </div>
                <div>
                  <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Điện thoại</small>
                  <span class="text-dark">{{ selectedRecord.DienThoaiDocGia || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Thông tin phiếu -->
            <div class="col-12">
              <div class="p-3 border rounded-4">
                <h6 class="fw-bold text-secondary small text-uppercase mb-3"><i class="fas fa-calendar me-2"></i>Thông tin phiếu mượn</h6>
                <div class="row g-3">
                  <div class="col-sm-4">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Ngày mượn</small>
                    <span class="fw-semibold">{{ formatDate(selectedRecord.ngayMuon) }}</span>
                  </div>
                  <div class="col-sm-4">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Hạn trả</small>
                    <span class="fw-semibold" :class="isOverdue(selectedRecord) ? 'text-danger' : ''">
                      {{ formatDate(selectedRecord.ngayTra) }}
                    </span>
                  </div>
                  <div class="col-sm-4" v-if="selectedRecord.ngayTraThucTe">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Ngày trả thực tế</small>
                    <span class="fw-semibold text-success">{{ formatDate(selectedRecord.ngayTraThucTe) }}</span>
                  </div>
                  <div class="col-sm-4" v-else-if="selectedRecord.ngayDuKienTra">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Ngày hẹn mang sách trả</small>
                    <span class="fw-semibold text-warning">{{ formatDate(selectedRecord.ngayDuKienTra) }}</span>
                  </div>
                  <div class="col-sm-4">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Trạng thái</small>
                    <span class="badge rounded-pill px-3 py-2" :class="statusBadgeClass(selectedRecord.trangThai)">
                      {{ selectedRecord.trangThai || '—' }}
                    </span>
                  </div>
                  <div class="col-sm-4" v-if="selectedRecord.tienPhat || getOverdueFine(selectedRecord) > 0">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Tiền phạt</small>
                    <span class="fw-bold text-danger">
                      {{ formatCurrency(getOverdueFine(selectedRecord)) }}
                      <small v-if="getOverdueDays(selectedRecord) > 0" class="text-muted fw-normal ms-1">({{ getOverdueDays(selectedRecord) }} ngày trễ)</small>
                    </span>
                  </div>
                  <div class="col-sm-4" v-if="selectedRecord.TenNhanVien">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Nhân viên xử lý</small>
                    <span class="fw-semibold">{{ selectedRecord.TenNhanVien }}</span>
                  </div>
                  <div class="col-12" v-if="selectedRecord.yeuCauGiaHan">
                    <div class="alert alert-info py-2 px-3 small rounded-3 mb-0">
                      <div class="fw-bold mb-1"><i class="fas fa-calendar-plus me-1 text-primary"></i>Yêu cầu gia hạn sách:</div>
                      <div>Xin gia hạn thêm: <strong>{{ selectedRecord.yeuCauGiaHan.soNgayGiaHan }} ngày</strong> (Hạn mới: <strong>{{ formatDate(selectedRecord.yeuCauGiaHan.ngayTraMoi) }}</strong>).</div>
                      <div v-if="selectedRecord.yeuCauGiaHan.lyDo" class="text-muted mt-1">Lý do: <em>"{{ selectedRecord.yeuCauGiaHan.lyDo }}"</em></div>
                      <div class="mt-1">Trạng thái yêu cầu: <span class="badge bg-primary">{{ selectedRecord.yeuCauGiaHan.trangThai }}</span></div>
                    </div>
                  </div>
                  <div class="col-12" v-if="selectedRecord.lyDoTuChoi">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Lý do từ chối</small>
                    <span class="text-danger">{{ selectedRecord.lyDoTuChoi }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons trong modal chi tiết -->
        <div class="modal-footer border-top pt-3 justify-content-between">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Đóng</button>
          <div class="d-flex gap-2">
            <button
              v-if="selectedRecord.trangThai === 'chờ duyệt'"
              class="btn btn-success rounded-pill px-4 fw-bold"
              :disabled="processingId === selectedRecord._id"
              @click="handleAction(selectedRecord, 'approve', true)"
            >
              <i class="fas fa-check me-2"></i>Duyệt
            </button>
            <button
              v-if="selectedRecord.trangThai === 'chờ duyệt'"
              class="btn btn-outline-danger rounded-pill px-4 fw-bold"
              @click="openRejectModal(selectedRecord, true)"
            >
              <i class="fas fa-times me-2"></i>Từ chối
            </button>
            <button
              v-if="selectedRecord.trangThai === 'chờ gia hạn'"
              class="btn btn-success rounded-pill px-4 fw-bold"
              :disabled="processingId === selectedRecord._id"
              @click="handleAction(selectedRecord, 'approve-extend', true)"
            >
              <i class="fas fa-check me-2"></i>Duyệt gia hạn
            </button>
            <button
              v-if="selectedRecord.trangThai === 'chờ gia hạn'"
              class="btn btn-outline-danger rounded-pill px-4 fw-bold"
              @click="openRejectModal(selectedRecord, true, true)"
            >
              <i class="fas fa-times me-2"></i>Từ chối gia hạn
            </button>
            <button
              v-if="selectedRecord.trangThai === 'đã duyệt'"
              class="btn btn-primary rounded-pill px-4 fw-bold"
              :disabled="processingId === selectedRecord._id"
              @click="handleAction(selectedRecord, 'handover', true)"
            >
              <i class="fas fa-hand-holding me-2"></i>Giao sách
            </button>
            <button
              v-if="selectedRecord.trangThai === 'đã duyệt'"
              class="btn btn-outline-danger rounded-pill px-4 fw-bold"
              :disabled="processingId === selectedRecord._id"
              @click="openNotCollectedModal(selectedRecord, true)"
            >
              <i class="fas fa-user-times me-2"></i>Độc giả không đến nhận
            </button>
            <button
              v-if="['đang chờ trả', 'đang mượn', 'quá hạn'].includes(selectedRecord.trangThai)"
              class="btn btn-warning rounded-pill px-4 fw-bold"
              :disabled="processingId === selectedRecord._id"
              @click="handleAction(selectedRecord, 'confirm-return', true)"
            >
              <i class="fas fa-undo-alt me-2"></i>Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL TỪ CHỐI ===== -->
  <div class="modal fade" id="tuChoiModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-danger text-white py-3 px-4 border-0">
          <h5 class="modal-title fw-bold"><i class="fas fa-ban me-2"></i>Từ chối phiếu mượn</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <p class="text-muted mb-3">
            Bạn đang từ chối phiếu mượn sách <strong>{{ rejectTarget?.TenSach || '—' }}</strong>
            của <strong>{{ rejectTarget?.TenDocGia || '—' }}</strong>.
          </p>
          <div class="mb-3">
            <label class="form-label fw-semibold">Lý do từ chối <span class="text-muted fw-normal">(không bắt buộc)</span></label>
            <textarea
              class="form-control border-0 bg-light rounded-3"
              rows="3"
              placeholder="Nhập lý do từ chối để thông báo cho độc giả..."
              v-model="rejectReason"
              maxlength="500"
            ></textarea>
            <div class="text-end mt-1"><small class="text-muted">{{ rejectReason.length }}/500</small></div>
          </div>
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
          <button
            type="button"
            class="btn btn-danger rounded-pill px-4 fw-bold"
            :disabled="processingId === rejectTarget?._id"
            @click="submitReject"
          >
            <i :class="['fas', 'me-2', processingId === rejectTarget?._id ? 'fa-spinner fa-spin' : 'fa-ban']"></i>
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL ĐỘC GIẢ KHÔNG ĐẾN NHẬN SÁCH ===== -->
  <div class="modal fade" id="notCollectedModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" v-if="notCollectedTarget">
        <div class="modal-header bg-danger text-white py-3 px-4 border-0">
          <h5 class="modal-title fw-bold">
            <i class="fas fa-user-times me-2"></i>Xác nhận độc giả không đến nhận
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <div class="alert alert-warning border-0 d-flex gap-3 align-items-center rounded-3 p-3 mb-3">
            <i class="fas fa-exclamation-triangle fa-2x text-warning flex-shrink-0"></i>
            <div class="small">
              <div>Phiếu mượn: <strong>{{ notCollectedTarget.TenSach }}</strong></div>
              <div>Độc giả: <strong>{{ notCollectedTarget.TenDocGia }}</strong></div>
              <div v-if="getPickupWaitingDays(notCollectedTarget) >= 3" class="text-danger fw-bold mt-1">
                <i class="fas fa-clock me-1"></i>Đã quá {{ getPickupWaitingDays(notCollectedTarget) }} ngày kể từ lúc được duyệt!
              </div>
            </div>
          </div>
          <p class="text-dark small mb-2">
            Khi xác nhận thao tác này:
          </p>
          <ul class="text-muted small ps-3 mb-3">
            <li>Phiếu mượn sẽ chuyển sang trạng thái <strong>"Từ chối"</strong>.</li>
            <li>Hệ thống sẽ <strong>tự động hoàn trả {{ notCollectedTarget.soLuong || 1 }} quyển sách vào kho</strong> và xóa cache.</li>
            <li>Độc giả sẽ nhận được thông báo lý do hủy phiếu mượn.</li>
          </ul>
          <div class="mb-2">
            <label class="form-label fw-semibold small">Lý do hủy nhận sách:</label>
            <input
              type="text"
              class="form-control rounded-3"
              v-model="notCollectedReason"
              placeholder="Nhập lý do..."
            />
          </div>
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy bỏ</button>
          <button
            type="button"
            class="btn btn-danger rounded-pill px-4 fw-bold"
            :disabled="processingId === notCollectedTarget._id"
            @click="submitNotCollected"
          >
            <i class="fas me-2" :class="processingId === notCollectedTarget._id ? 'fa-spinner fa-spin' : 'fa-undo'"></i>
            Xác nhận hủy & Hoàn kho
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL XÁC NHẬN MỞ KHÓA TÀI KHOẢN SAU KHI TRẢ SÁCH ===== -->
  <div class="modal fade" id="unlockPromptModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" v-if="unlockPromptData">
        <div class="modal-header bg-warning bg-opacity-25 py-3 px-4 border-bottom">
          <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
            <i class="fas fa-user-shield text-warning"></i>
            <span>Độc giả đang bị khóa tài khoản</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4 text-center">
          <div class="bg-warning-subtle text-warning rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px;">
            <i class="fas fa-unlock-alt fa-2x"></i>
          </div>
          <h5 class="fw-bold text-dark mb-2">Độc giả đã hoàn tất trả sách!</h5>
          <p class="text-secondary mb-3">
            Độc giả <strong class="text-dark">{{ unlockPromptData.tenDocGia }}</strong> vừa trả sách <strong class="text-dark">"{{ unlockPromptData.tenSach }}"</strong>. Hiện tài khoản của độc giả này đang ở trạng thái <span class="badge bg-danger-subtle text-danger px-2 py-1 rounded-pill">Bị khóa</span>.
          </p>
          <div class="alert alert-light border small text-muted text-start mb-0">
            <i class="fas fa-info-circle me-1 text-primary"></i>
            Bạn có muốn <strong>MỞ KHÓA TÀI KHOẢN</strong> cho độc giả <strong>{{ unlockPromptData.tenDocGia }}</strong> ngay bây giờ không?
          </div>
        </div>
        <div class="modal-footer border-top bg-light px-4 py-3 d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-4"
            data-bs-dismiss="modal"
            :disabled="unlockLoading"
          >
            <i class="fas fa-lock me-1"></i> Giữ khóa (Để sau)
          </button>
          <button
            type="button"
            class="btn btn-success rounded-pill px-4 text-white fw-semibold"
            @click="confirmUnlockDocGia"
            :disabled="unlockLoading"
          >
            <i class="fas" :class="unlockLoading ? 'fa-spinner fa-spin' : 'fa-unlock'"></i>
            <span class="ms-1">{{ unlockLoading ? 'Đang mở khóa...' : 'Mở khóa tài khoản ngay' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== TOAST NOTIFICATION ===== -->
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index:1100;">
    <div
      id="muonSachToast"
      class="toast align-items-center text-white border-0"
      :class="toastVariant === 'success' ? 'bg-success' : 'bg-danger'"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body fw-medium d-flex align-items-center">
          <i class="fas me-2" :class="toastVariant === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
          {{ toastMessage }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, Toast } from 'bootstrap'
import MuonSachService from '@/services/muonsach.service'
import DocGiaService from '@/services/docgia.service'

const route = useRoute()

// =================== STATE ===================
const records = ref([])
const loading = ref(false)
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const processingId = ref(null)
// Map: recordId → selected action value
const actionSelected = ref({})

// Modal instances
let detailModalInst = null
let rejectModalInst = null
let notCollectedModalInst = null
let unlockPromptModalInst = null
let toastInst = null

// Unlock Prompt modal state (khi trả sách mà độc giả đang bị khóa)
const unlockPromptData = ref(null)
const unlockLoading = ref(false)

// Selected record (detail modal)
const selectedRecord = ref(null)

// Reject modal state
const rejectTarget = ref(null)
const rejectReason = ref('')
const fromDetailModal = ref(false)
const isRejectingExtension = ref(false)

// Not collected modal state
const notCollectedTarget = ref(null)
const notCollectedReason = ref('')
const fromDetailModalNotCollected = ref(false)

// Toast
const toastMessage = ref('')
const toastVariant = ref('success')

// =================== COMPUTED ===================
const getPickupWaitingDays = (record) => {
  if (!record || record.trangThai !== 'đã duyệt') return 0
  const approvedDateStr = record.ngayDuyet || record.updatedAt || record.createdAt
  if (!approvedDateStr) return 0
  const approvedTime = new Date(approvedDateStr).getTime()
  if (isNaN(approvedTime)) return 0
  const now = Date.now()
  const diffDays = Math.floor((now - approvedTime) / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const isPickupOverdue = (record) => {
  return record && record.trangThai === 'đã duyệt' && getPickupWaitingDays(record) >= 3
}

const countPickupOverdue = computed(() => {
  return records.value.filter(r => isPickupOverdue(r)).length
})

/** Danh sách action options tùy trạng thái phiếu */
const getActionOptions = (trangThai, record = null) => {
  switch (trangThai) {
    case 'chờ duyệt':
      return [
        { value: 'approve', label: 'Duyệt phiếu' },
        { value: 'reject',  label: 'Từ chối' },
      ]
    case 'chờ gia hạn':
      return [
        { value: 'approve-extend', label: 'Duyệt gia hạn' },
        { value: 'reject-extend',  label: 'Từ chối gia hạn' },
      ]
    case 'đã duyệt':
      return [
        { value: 'handover', label: 'Giao sách' },
        {
          value: 'not-collected',
          label: isPickupOverdue(record)
            ? `Độc giả không nhận (${getPickupWaitingDays(record)} ngày)`
            : 'Độc giả không đến nhận'
        },
      ]
    case 'đang mượn':
      return [
        { value: 'confirm-return', label: 'Xác nhận trả' },
      ]
    case 'quá hạn':
      return [
        { value: 'confirm-return', label: 'Xác nhận trả' },
        record?.TrangThaiTaiKhoan === 'BiKhoa'
          ? { value: 'unlock-account', label: 'Mở khóa tài khoản' }
          : { value: 'lock-account',   label: 'Khóa tài khoản' },
      ]
    case 'đang chờ trả':
      return [
        { value: 'confirm-return', label: 'Xác nhận trả' },
        ...(isOverdue(record) || record?.daTungQuaHan ? [
          record?.TrangThaiTaiKhoan === 'BiKhoa'
            ? { value: 'unlock-account', label: 'Mở khóa tài khoản' }
            : { value: 'lock-account',   label: 'Khóa tài khoản' }
        ] : [])
      ]
    default:
      return [] // đã trả, từ chối → không có action
  }
}

/** Màu nút Thực hiện theo action đang chọn */
const getExecBtnClass = (action) => {
  if (action === 'approve' || action === 'approve-extend' || action === 'unlock-account') return 'btn-success text-white'
  if (action === 'reject' || action === 'reject-extend' || action === 'not-collected' || action === 'lock-account') return 'btn-danger text-white'
  if (action === 'handover')       return 'btn-primary text-white'
  if (action === 'confirm-return') return 'btn-warning text-dark'
  return 'btn-secondary'
}

const filteredRecords = computed(() => {
  let list = records.value

  // 1. Lọc theo trạng thái được chọn (từ pill hoặc dropdown)
  if (filterStatus.value) {
    if (filterStatus.value === 'quá hạn') {
      list = list.filter(r => isOverdue(r) || r.trangThai === 'quá hạn')
    } else if (filterStatus.value === 'quá hạn nhận') {
      list = list.filter(r => isPickupOverdue(r))
    } else {
      list = list.filter(r => r.trangThai === filterStatus.value)
    }
  }

  // 2. Lọc theo từ khóa tìm kiếm (hỗ trợ tìm kiếm tổ hợp nhiều từ)
  if (searchText.value.trim()) {
    const words = searchText.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    list = list.filter(r => {
      const book = (r.TenSach || '').toLowerCase()
      const reader = (r.TenDocGia || '').toLowerCase()
      const email = (r.EmailDocGia || '').toLowerCase()
      const code = (r.MaSach || '').toLowerCase()
      return words.every(w => book.includes(w) || reader.includes(w) || email.includes(w) || code.includes(w))
    })
  }

  // 3. Sắp xếp: First-Come, First-Served khi xem Chờ duyệt hoặc Chờ gia hạn (ai đăng ký trước hiển thị trước)
  if (filterStatus.value === 'chờ duyệt' || filterStatus.value === 'chờ gia hạn') {
    return [...list].sort((a, b) => new Date(a.createdAt || a.ngayMuon || 0) - new Date(b.createdAt || b.ngayMuon || 0))
  }

  return list
})

watch(searchText, () => {
  currentPage.value = 1
})

watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus !== undefined) {
      filterStatus.value = newStatus || ''
      currentPage.value = 1
    }
  }
)

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage.value) || 1)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredRecords.value.slice(start, start + itemsPerPage.value)
})

// =================== METHODS ===================
const toggleFilterStatus = (status) => {
  if (filterStatus.value === status) {
    filterStatus.value = '' // Click lại vào pill đang active để hủy lọc (xem tất cả)
  } else {
    filterStatus.value = status
  }
  currentPage.value = 1
}

const onStatusChange = () => {
  currentPage.value = 1
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const response = await MuonSachService.getAll()
    records.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Lỗi tải danh sách mượn sách:', error)
    showToast('Không thể tải danh sách phiếu mượn!', 'danger')
  } finally {
    loading.value = false
  }
}

const countStatus = (status) => {
  return records.value.filter(r => r.trangThai === status).length
}

const openDetail = (record) => {
  selectedRecord.value = record
  detailModalInst?.show()
}

const executeAction = (record) => {
  const action = actionSelected.value[record._id]
  if (!action) return
  if (action === 'reject') {
    openRejectModal(record)
  } else if (action === 'reject-extend') {
    openRejectModal(record, false, true)
  } else if (action === 'not-collected') {
    openNotCollectedModal(record)
  } else {
    handleAction(record, action)
  }
  // Reset dropdown
  actionSelected.value[record._id] = ''
}

const openRejectModal = (record, fromDetail = false, isExtension = false) => {
  rejectTarget.value = record
  rejectReason.value = ''
  fromDetailModal.value = fromDetail
  isRejectingExtension.value = isExtension
  if (fromDetail) {
    detailModalInst?.hide()
  }
  rejectModalInst?.show()
}

const openNotCollectedModal = (record, fromDetail = false) => {
  notCollectedTarget.value = record
  fromDetailModalNotCollected.value = fromDetail
  const days = getPickupWaitingDays(record)
  notCollectedReason.value = days >= 3
    ? `Độc giả không đến nhận sách sau ${days} ngày chờ (Hủy phiếu và hoàn trả sách vào kho)`
    : `Độc giả không đến nhận sách (Hủy phiếu và hoàn trả sách vào kho)`
  if (fromDetail && detailModalInst) {
    detailModalInst.hide()
  }
  notCollectedModalInst?.show()
}

const submitNotCollected = async () => {
  if (!notCollectedTarget.value) return
  processingId.value = notCollectedTarget.value._id
  try {
    const bookTitle = notCollectedTarget.value.TenSach || 'sách'
    const qty = notCollectedTarget.value.soLuong || 1
    await MuonSachService.reject(notCollectedTarget.value._id, notCollectedReason.value)
    showToast(`Đã hủy phiếu và hoàn trả ${qty} quyển "${bookTitle}" vào kho thành công!`, 'success')
    notCollectedModalInst?.hide()
    await fetchRecords()
  } catch (error) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra khi hủy phiếu!'
    showToast(msg, 'danger')
  } finally {
    processingId.value = null
    notCollectedTarget.value = null
  }
}

const handleAction = async (record, action, fromDetail = false) => {
  if (action === 'lock-account') {
    if (!confirm(`Bạn có chắc muốn KHÓA TÀI KHOẢN độc giả "${record.TenDocGia}" do quá hạn mượn sách không?`)) return
    processingId.value = record._id
    try {
      await DocGiaService.toggleAccountStatus(record.docGiaId, { TrangThaiTaiKhoan: 'BiKhoa', LyDoKhoa: 'Quá hạn mượn sách' })
      showToast(`Đã khóa tài khoản độc giả ${record.TenDocGia}!`, 'warning')
      record.TrangThaiTaiKhoan = 'BiKhoa'
      await fetchRecords()
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể khóa tài khoản độc giả!', 'danger')
    } finally {
      processingId.value = null
    }
    return
  }

  if (action === 'unlock-account') {
    if (!confirm(`Mở khóa tài khoản cho độc giả "${record.TenDocGia}"?`)) return
    processingId.value = record._id
    try {
      await DocGiaService.toggleAccountStatus(record.docGiaId, { TrangThaiTaiKhoan: 'BinhThuong' })
      showToast(`Đã mở khóa tài khoản cho độc giả ${record.TenDocGia}!`, 'success')
      record.TrangThaiTaiKhoan = 'BinhThuong'
      await fetchRecords()
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể mở khóa tài khoản độc giả!', 'danger')
    } finally {
      processingId.value = null
    }
    return
  }

  let actionLabel = 'Duyệt'
  if (action === 'confirm-return') actionLabel = 'Xác nhận trả'
  if (action === 'handover') actionLabel = 'Giao'
  if (action === 'approve-extend') actionLabel = 'Duyệt gia hạn'

  if (!confirm(`${actionLabel} sách "${record.TenSach}" cho "${record.TenDocGia}"?`)) return

  processingId.value = record._id
  try {
    if (action === 'approve') {
      await MuonSachService.approve(record._id)
      showToast('Duyệt phiếu mượn thành công!', 'success')
    } else if (action === 'approve-extend') {
      await MuonSachService.approveExtension(record._id)
      showToast('Đã duyệt gia hạn mượn sách thành công!', 'success')
    } else if (action === 'handover') {
      await MuonSachService.handover(record._id)
      showToast('Đã giao sách cho độc giả!', 'success')
    } else if (action === 'confirm-return') {
      const res = await MuonSachService.confirmReturn(record._id)
      showToast('Xác nhận trả sách thành công!', 'success')

      const docGiaData = res?.data?.docGia || {}
      const isLocked = docGiaData.TrangThaiTaiKhoan === 'BiKhoa' || record.TrangThaiTaiKhoan === 'BiKhoa'
      if (isLocked) {
        openUnlockPromptModal({
          docGiaId: record.docGiaId,
          tenDocGia: docGiaData.TenDocGia || record.TenDocGia || 'Độc giả',
          tenSach: record.TenSach || 'Sách mượn'
        })
      }
    }
    if (fromDetail) detailModalInst?.hide()
    await fetchRecords()
  } catch (error) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra!'
    showToast(msg, 'danger')
  } finally {
    processingId.value = null
  }
}

const openUnlockPromptModal = (data) => {
  unlockPromptData.value = data
  unlockPromptModalInst?.show()
}

const confirmUnlockDocGia = async () => {
  if (!unlockPromptData.value) return
  unlockLoading.value = true
  try {
    await DocGiaService.toggleAccountStatus(unlockPromptData.value.docGiaId, {
      TrangThaiTaiKhoan: 'BinhThuong'
    })
    showToast(`Đã mở khóa tài khoản cho độc giả ${unlockPromptData.value.tenDocGia} thành công!`, 'success')
    unlockPromptModalInst?.hide()
    await fetchRecords()
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể mở khóa tài khoản độc giả!', 'danger')
  } finally {
    unlockLoading.value = false
  }
}

const submitReject = async () => {
  if (!rejectTarget.value) return
  processingId.value = rejectTarget.value._id
  try {
    if (isRejectingExtension.value) {
      await MuonSachService.rejectExtension(rejectTarget.value._id, rejectReason.value)
      showToast('Đã từ chối gia hạn sách!', 'success')
    } else {
      await MuonSachService.reject(rejectTarget.value._id, rejectReason.value)
      showToast('Từ chối phiếu mượn thành công!', 'success')
    }
    rejectModalInst?.hide()
    await fetchRecords()
  } catch (error) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra!'
    showToast(msg, 'danger')
  } finally {
    processingId.value = null
    rejectTarget.value = null
    isRejectingExtension.value = false
  }
}

const changePage = (page) => {
  if (page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  currentPage.value = page
}

// =================== HELPERS ===================
const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('vi-VN')
}

const formatCurrency = (value) => {
  if (!value) return '0 VNĐ'
  return `${Number(value).toLocaleString('vi-VN')} VNĐ`
}

const isOverdue = (record) => {
  if (!record || !record.ngayTra) return false
  if (['đã trả', 'từ chối'].includes(record.trangThai)) return false
  if (record.trangThai === 'quá hạn' || record.daTungQuaHan) return true
  const todayDateStr = new Date().toLocaleDateString('en-CA')
  const returnDateStr = new Date(record.ngayTra).toLocaleDateString('en-CA')
  return returnDateStr < todayDateStr
}

const getOverdueDays = (record) => {
  if (!record || !record.ngayTra) return 0
  const returnDate = new Date(record.ngayTra)
  if (isNaN(returnDate.getTime())) return 0

  const d1 = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate())
  const compareDate = record.ngayTraThucTe ? new Date(record.ngayTraThucTe) : new Date()
  const d2 = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate())

  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
  if (diffDays > 0) return diffDays
  if (record.trangThai === 'quá hạn' || record.daTungQuaHan) return 1
  return 0
}

const getOverdueFine = (record) => {
  if (!record) return 0
  if (record.tienPhat !== undefined && record.tienPhat !== null && Number(record.tienPhat) > 0) {
    return Number(record.tienPhat)
  }
  if (!isOverdue(record)) return 0
  const days = getOverdueDays(record)
  const qty = record.soLuong || 1
  return days * 5000 * qty
}

const countOverdue = computed(() => {
  return records.value.filter(isOverdue).length
})

const totalOverdueFine = computed(() => {
  return records.value.reduce((sum, r) => sum + getOverdueFine(r), 0)
})

const getInitial = (name) => {
  if (!name || name === '—') return '?'
  const parts = name.trim().split(' ')
  return parts[parts.length - 1]?.[0]?.toUpperCase() || '?'
}

const truncate = (str, max = 40) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

const statusBadgeClass = (status) => {
  const map = {
    'chờ duyệt': 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
    'chờ gia hạn': 'bg-info-subtle text-info-emphasis border border-info-subtle',
    'đã duyệt': 'bg-primary-subtle text-primary-emphasis border border-primary-subtle',
    'đang mượn': 'bg-info-subtle text-info-emphasis border border-info-subtle',
    'đang chờ trả': 'bg-orange-subtle text-warning-emphasis border border-warning-subtle',
    'đã trả': 'bg-success-subtle text-success-emphasis border border-success-subtle',
    'từ chối': 'bg-danger-subtle text-danger-emphasis border border-danger-subtle',
    'quá hạn': 'bg-danger text-white border border-danger',
  }
  return map[status] || 'bg-secondary-subtle text-secondary-emphasis'
}

const statusIcon = (status) => {
  const map = {
    'chờ duyệt': 'fa-hourglass-half',
    'chờ gia hạn': 'fa-calendar-plus text-info',
    'đã duyệt': 'fa-check-circle',
    'đang mượn': 'fa-book-reader',
    'đang chờ trả': 'fa-clock',
    'đã trả': 'fa-check-double',
    'từ chối': 'fa-ban',
    'quá hạn': 'fa-exclamation-circle',
  }
  return map[status] || 'fa-circle'
}

const showToast = (message, variant = 'success') => {
  toastMessage.value = message
  toastVariant.value = variant
  toastInst?.show()
}

// =================== LIFECYCLE ===================
let tablePollingTimer = null
const handleFocus = () => {
  fetchRecords()
}

onMounted(async () => {
  detailModalInst = new Modal(document.getElementById('detailModal'))
  rejectModalInst = new Modal(document.getElementById('tuChoiModal'))
  notCollectedModalInst = new Modal(document.getElementById('notCollectedModal'))
  unlockPromptModalInst = new Modal(document.getElementById('unlockPromptModal'))
  toastInst = new Toast(document.getElementById('muonSachToast'), { delay: 3000 })

  if (route.query.status) {
    filterStatus.value = route.query.status
  }

  await fetchRecords()
  tablePollingTimer = setInterval(() => fetchRecords(), 15000)
  window.addEventListener('focus', handleFocus)
})

onBeforeUnmount(() => {
  if (tablePollingTimer) clearInterval(tablePollingTimer)
  window.removeEventListener('focus', handleFocus)
})
</script>

<style scoped>
.custom-height { height: 48px; }

/* Filter Quick Pills */
.filter-pill {
  cursor: pointer;
  border-width: 1.5px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.84rem;
  line-height: 1.4;
  outline: none;
  user-select: none;
}
.filter-pill:hover {
  transform: translateY(-2px);
  filter: brightness(0.96);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08) !important;
}
.filter-pill.active-pill {
  transform: scale(1.05);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.avatar-sm {
  width: 38px;
  height: 38px;
  min-width: 38px;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.action-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.action-btn:hover:not(:disabled) {
  transform: scale(1.15);
}

/* Action select dropdown */
.action-select {
  min-width: 120px;
  max-width: 140px;
  font-size: 0.78rem;
  border-radius: 8px;
  border: 1.5px solid #dee2e6;
  background-color: #f8f9fa;
  padding-top: 5px;
  padding-bottom: 5px;
  transition: border-color 0.2s;
  cursor: pointer;
}
.action-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13,110,253,0.15);
  outline: none;
}

/* Nút thực hiện */
.action-exec-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.8rem;
}
.action-exec-btn:not(:disabled):hover {
  transform: scale(1.1);
  filter: brightness(1.05);
}

.book-title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 200px;
}

.table-row-hover:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.03);
}

.table > :not(caption) > * > * {
  padding: 0.875rem 0.75rem;
}

/* Override Bootstrap badge for wrapping trang thai */
.badge {
  white-space: normal;
  text-align: left;
}
</style>
