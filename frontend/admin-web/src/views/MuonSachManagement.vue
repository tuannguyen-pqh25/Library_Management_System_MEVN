<template>
  <div class="page-shell py-4">
    <div class="container-fluid">

      <!-- ===== HEADER ===== -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Mượn Sách
          </h2>
          <p class="text-muted-custom mb-0">Duyệt, từ chối và xác nhận trả sách cho độc giả</p>
        </div>
        <!-- Badge thống kê nhanh -->
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 fw-semibold border border-warning-subtle">
            <i class="fas fa-hourglass-half me-1"></i> Chờ duyệt: {{ countStatus('chờ duyệt') }}
          </span>
          <span class="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2 fw-semibold border border-primary-subtle">
            <i class="fas fa-book-reader me-1"></i> Đang mượn: {{ countStatus('đã duyệt') + countStatus('đang mượn') }}
          </span>
          <span class="badge rounded-pill bg-danger-subtle text-danger-emphasis px-3 py-2 fw-semibold border border-danger-subtle">
            <i class="fas fa-clock me-1"></i> Chờ trả: {{ countStatus('đang chờ trả') }}
          </span>
        </div>
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
                <option value="">Tất cả trạng thái</option>
                <option value="chờ duyệt">Chờ duyệt</option>
                <option value="đã duyệt">Đã duyệt</option>
                <option value="đang mượn">Đang mượn</option>
                <option value="đang chờ trả">Đang chờ trả</option>
                <option value="đã trả">Đã trả</option>
                <option value="từ chối">Từ chối</option>
              </select>
            </div>
          </div>
          <!-- Tìm kiếm -->
          <div class="col-md-8 col-lg-9">
            <div class="input-group">
              <input
                type="text"
                class="form-control custom-height shadow-none rounded-start-3 bg-light border-0 ps-4"
                placeholder="Tìm theo tên sách, tên độc giả, email..."
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
        <small class="text-muted">
          {{ filterStatus ? `Không có phiếu mượn với trạng thái "${filterStatus}".` : 'Chưa có dữ liệu trong hệ thống.' }}
        </small>
      </div>

      <!-- ===== TABLE ===== -->
      <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <!-- Result count -->
        <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
          <small class="text-muted fw-semibold">
            Hiển thị {{ paginatedRecords.length }} / {{ filteredRecords.length }} phiếu
          </small>
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
                    <span v-if="isOverdue(record)" class="d-block" style="font-size:0.7rem;">
                      <i class="fas fa-exclamation-triangle"></i> Quá hạn
                    </span>
                  </span>
                </td>

                <!-- Trạng thái -->
                <td>
                  <span class="badge rounded-pill px-3 py-2 fw-medium" :class="statusBadgeClass(record.trangThai)">
                    <i class="fas me-1" :class="statusIcon(record.trangThai)"></i>
                    {{ record.trangThai || '—' }}
                  </span>
                  <div v-if="record.lyDoTuChoi" class="text-muted mt-1" style="font-size:0.72rem;" :title="record.lyDoTuChoi">
                    <i class="fas fa-comment-slash me-1"></i>{{ truncate(record.lyDoTuChoi, 30) }}
                  </div>
                </td>

                <!-- Thao tác -->
                <td class="text-center">
                  <div class="d-flex gap-1 justify-content-center flex-nowrap">
                    <!-- Xem chi tiết -->
                    <button
                      class="btn btn-sm btn-light text-primary rounded-circle action-btn"
                      title="Xem chi tiết"
                      @click="openDetail(record)"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <!-- Duyệt (chỉ hiện khi "chờ duyệt") -->
                    <button
                      v-if="record.trangThai === 'chờ duyệt'"
                      class="btn btn-sm btn-light text-success rounded-circle action-btn"
                      title="Duyệt phiếu mượn"
                      :disabled="processingId === record._id"
                      @click="handleAction(record, 'approve')"
                    >
                      <i class="fas" :class="processingId === record._id ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    </button>

                    <!-- Từ chối (chỉ hiện khi "chờ duyệt") -->
                    <button
                      v-if="record.trangThai === 'chờ duyệt'"
                      class="btn btn-sm btn-light text-danger rounded-circle action-btn"
                      title="Từ chối"
                      @click="openRejectModal(record)"
                    >
                      <i class="fas fa-times"></i>
                    </button>

                    <!-- Xác nhận trả (khi "đang chờ trả" hoặc "đã duyệt" / "đang mượn") -->
                    <button
                      v-if="['đang chờ trả', 'đã duyệt', 'đang mượn'].includes(record.trangThai)"
                      class="btn btn-sm btn-light text-warning rounded-circle action-btn"
                      title="Xác nhận trả sách"
                      :disabled="processingId === record._id"
                      @click="handleAction(record, 'confirm-return')"
                    >
                      <i class="fas" :class="processingId === record._id ? 'fa-spinner fa-spin' : 'fa-undo-alt'"></i>
                    </button>
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
                  <div class="col-sm-4">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Trạng thái</small>
                    <span class="badge rounded-pill px-3 py-2" :class="statusBadgeClass(selectedRecord.trangThai)">
                      {{ selectedRecord.trangThai || '—' }}
                    </span>
                  </div>
                  <div class="col-sm-4" v-if="selectedRecord.tienPhat">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Tiền phạt</small>
                    <span class="fw-bold text-danger">{{ formatCurrency(selectedRecord.tienPhat) }}</span>
                  </div>
                  <div class="col-sm-4" v-if="selectedRecord.TenNhanVien">
                    <small class="text-muted text-uppercase fw-bold d-block" style="font-size:0.7rem;">Nhân viên xử lý</small>
                    <span class="fw-semibold">{{ selectedRecord.TenNhanVien }}</span>
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
              v-if="['đang chờ trả', 'đã duyệt', 'đang mượn'].includes(selectedRecord.trangThai)"
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
import { ref, computed, onMounted } from 'vue'
import { Modal, Toast } from 'bootstrap'
import MuonSachService from '@/services/muonsach.service'

// =================== STATE ===================
const records = ref([])
const loading = ref(false)
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const processingId = ref(null) // ID of the record currently being processed (shows spinner)

// Modal instances
let detailModalInst = null
let rejectModalInst = null
let toastInst = null

// Selected record (detail modal)
const selectedRecord = ref(null)

// Reject modal state
const rejectTarget = ref(null)
const rejectReason = ref('')
const fromDetailModal = ref(false)

// Toast
const toastMessage = ref('')
const toastVariant = ref('success')

// =================== COMPUTED ===================
const filteredRecords = computed(() => {
  let list = records.value
  if (searchText.value.trim()) {
    const q = searchText.value.trim().toLowerCase()
    list = list.filter(r =>
      (r.TenSach || '').toLowerCase().includes(q) ||
      (r.TenDocGia || '').toLowerCase().includes(q) ||
      (r.EmailDocGia || '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage) || 1)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRecords.value.slice(start, start + itemsPerPage)
})

// =================== METHODS ===================
const fetchRecords = async (status = '') => {
  loading.value = true
  try {
    const response = await MuonSachService.getAll(status || null)
    records.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Lỗi tải danh sách mượn sách:', error)
    showToast('Không thể tải danh sách phiếu mượn!', 'danger')
  } finally {
    loading.value = false
  }
}

const onStatusChange = () => {
  currentPage.value = 1
  fetchRecords(filterStatus.value)
}

const countStatus = (status) => {
  return records.value.filter(r => r.trangThai === status).length
}

const openDetail = (record) => {
  selectedRecord.value = record
  detailModalInst?.show()
}

const openRejectModal = (record, fromDetail = false) => {
  rejectTarget.value = record
  rejectReason.value = ''
  fromDetailModal.value = fromDetail
  if (fromDetail) {
    detailModalInst?.hide()
  }
  rejectModalInst?.show()
}

const handleAction = async (record, action, fromDetail = false) => {
  const actionLabel = action === 'approve' ? 'Duyệt' : 'Xác nhận trả'
  if (!confirm(`${actionLabel} phiếu mượn sách "${record.TenSach}" của "${record.TenDocGia}"?`)) return

  processingId.value = record._id
  try {
    if (action === 'approve') {
      await MuonSachService.approve(record._id)
      showToast('Duyệt phiếu mượn thành công!', 'success')
    } else if (action === 'confirm-return') {
      await MuonSachService.confirmReturn(record._id)
      showToast('Xác nhận trả sách thành công!', 'success')
    }
    if (fromDetail) detailModalInst?.hide()
    await fetchRecords(filterStatus.value)
  } catch (error) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra!'
    showToast(msg, 'danger')
  } finally {
    processingId.value = null
  }
}

const submitReject = async () => {
  if (!rejectTarget.value) return
  processingId.value = rejectTarget.value._id
  try {
    await MuonSachService.reject(rejectTarget.value._id, rejectReason.value)
    showToast('Từ chối phiếu mượn thành công!', 'success')
    rejectModalInst?.hide()
    await fetchRecords(filterStatus.value)
  } catch (error) {
    const msg = error.response?.data?.message || 'Có lỗi xảy ra!'
    showToast(msg, 'danger')
  } finally {
    processingId.value = null
    rejectTarget.value = null
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
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const isOverdue = (record) => {
  if (!record.ngayTra) return false
  if (['đã trả', 'từ chối'].includes(record.trangThai)) return false
  return new Date(record.ngayTra) < new Date()
}

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
    'đã duyệt': 'bg-primary-subtle text-primary-emphasis border border-primary-subtle',
    'đang mượn': 'bg-info-subtle text-info-emphasis border border-info-subtle',
    'đang chờ trả': 'bg-orange-subtle text-warning-emphasis border border-warning-subtle',
    'đã trả': 'bg-success-subtle text-success-emphasis border border-success-subtle',
    'từ chối': 'bg-danger-subtle text-danger-emphasis border border-danger-subtle',
  }
  return map[status] || 'bg-secondary-subtle text-secondary-emphasis'
}

const statusIcon = (status) => {
  const map = {
    'chờ duyệt': 'fa-hourglass-half',
    'đã duyệt': 'fa-check-circle',
    'đang mượn': 'fa-book-reader',
    'đang chờ trả': 'fa-clock',
    'đã trả': 'fa-check-double',
    'từ chối': 'fa-ban',
  }
  return map[status] || 'fa-circle'
}

const showToast = (message, variant = 'success') => {
  toastMessage.value = message
  toastVariant.value = variant
  toastInst?.show()
}

// =================== LIFECYCLE ===================
onMounted(async () => {
  detailModalInst = new Modal(document.getElementById('detailModal'))
  rejectModalInst = new Modal(document.getElementById('tuChoiModal'))
  toastInst = new Toast(document.getElementById('muonSachToast'), { delay: 3000 })

  await fetchRecords()
})
</script>

<style scoped>
.custom-height { height: 48px; }

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
