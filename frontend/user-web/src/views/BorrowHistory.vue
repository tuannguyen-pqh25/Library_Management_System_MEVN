<template>
  <div class="page-shell py-5">
    <div class="container">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">Lịch sử mượn sách</h2>
          <p class="text-muted-custom mb-0">Theo dõi trạng thái các phiếu mượn sách của bạn</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <BaseCard v-else-if="records.length" class="overflow-hidden shadow-sm border-0">
        <div class="table-responsive">
          <table class="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th class="ps-4 py-3 text-uppercase font-display text-muted" style="font-size: 0.75rem; letter-spacing: 0.5px;">#</th>
                <th class="py-3 text-uppercase font-display text-muted" style="font-size: 0.75rem; letter-spacing: 0.5px;">Tên Sách</th>
                <th class="py-3 text-uppercase font-display text-muted text-center" style="font-size: 0.75rem; letter-spacing: 0.5px;">SL</th>
                <th class="py-3 text-uppercase font-display text-muted" style="font-size: 0.75rem; letter-spacing: 0.5px;">Ngày mượn</th>
                <th class="py-3 text-uppercase font-display text-muted" style="font-size: 0.75rem; letter-spacing: 0.5px;">Hạn trả</th>
                <th class="py-3 text-uppercase font-display text-muted text-center" style="font-size: 0.75rem; letter-spacing: 0.5px;">Trạng thái</th>
                <th class="py-3 text-uppercase font-display text-muted text-center pe-4" style="font-size: 0.75rem; letter-spacing: 0.5px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="record._id || index" class="bg-white border-bottom table-row-hover">
                <td class="ps-4 fw-medium text-muted-custom" style="font-size: 0.9rem;">{{ index + 1 }}</td>
                <td class="fw-bold text-dark py-3">
                  <div class="d-flex align-items-center gap-3">
                    <img
                      v-if="record.HinhAnh"
                      :src="record.HinhAnh"
                      :alt="record.TenSach"
                      class="rounded shadow-sm flex-shrink-0"
                      style="width:36px;height:48px;object-fit:cover;"
                      @error="(e) => { e.target.style.display='none' }"
                    />
                    <div v-else class="book-icon-wrapper bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                      <i class="fas fa-book"></i>
                    </div>
                    <div>
                      <span class="line-clamp-1" style="max-width: 250px; font-size: 0.95rem;" :title="record.TenSach || 'Sách'">{{ record.TenSach || 'Sách' }}</span>
                      <small v-if="record.trangThai === 'đã duyệt'" class="text-success d-block fw-medium mt-1" style="font-size:0.75rem;">
                        <i class="fas fa-check-circle me-1"></i>Đã được duyệt — Vui lòng đến nhận sách
                      </small>
                      <small v-else-if="record.trangThai === 'chờ gia hạn'" class="text-info d-block fw-medium mt-1" style="font-size:0.75rem;">
                        <i class="fas fa-hourglass-half me-1"></i>Đang chờ thư viện duyệt gia hạn (+{{ record.yeuCauGiaHan?.soNgayGiaHan || 7 }} ngày)
                      </small>
                      <small v-else-if="record.giaHanCount > 0 && record.trangThai === 'đang mượn'" class="text-primary d-block fw-normal mt-1" style="font-size:0.72rem;">
                        <i class="fas fa-redo me-1"></i>Đã gia hạn {{ record.giaHanCount }} lần
                      </small>
                      <small v-else-if="record.trangThai === 'từ chối' && record.lyDoTuChoi" class="text-danger d-block fw-normal mt-1" style="font-size:0.72rem;">
                        <i class="fas fa-info-circle me-1"></i>{{ record.lyDoTuChoi }}
                      </small>
                    </div>
                  </div>
                </td>
                <td class="fw-bold text-center text-primary" style="font-size: 0.95rem;">{{ record.soLuong || 1 }}</td>
                <td class="fw-medium text-dark" style="font-size: 0.9rem;">{{ formatDate(record.ngayMuon) }}</td>
                <td class="fw-medium" style="font-size: 0.9rem;">
                  <span :class="isOverdueLoan(record) ? 'text-danger fw-bold' : 'text-dark'">
                    {{ formatDate(record.ngayTra) }}
                  </span>
                  <span v-if="isOverdueLoan(record)" class="badge bg-danger-subtle text-danger border border-danger-subtle d-block mt-1" style="font-size:0.7rem; width:fit-content;">
                    <i class="fas fa-exclamation-triangle me-1"></i>Quá hạn
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill px-3 py-2 fw-bold" :class="statusClass(record.trangThai)" style="font-size: 0.75rem;">
                    <i class="fas me-1" :class="statusIcon(record.trangThai)"></i>
                    {{ formatStatus(record.trangThai) }}
                  </span>
                  <small v-if="record.trangThai === 'đang chờ trả' && isOverdueLoan(record)" class="text-danger d-block mt-1 fw-medium" style="font-size:0.72rem;">
                    <i class="fas fa-info-circle me-1"></i>Chờ thủ thư xác nhận trả
                  </small>
                </td>
                <td class="text-center pe-4" style="min-width:170px;">
                  <div class="d-flex align-items-center gap-1 justify-content-center">
                    <template v-if="getUserActionOptions(record).length > 0">
                      <select
                        class="form-select form-select-sm action-select"
                        v-model="actionSelected[record._id]"
                        :id="'user-action-' + record._id"
                      >
                        <option value="" disabled>--- Chọn ---</option>
                        <option
                          v-for="opt in getUserActionOptions(record)"
                          :key="opt.value"
                          :value="opt.value"
                        >{{ opt.label }}</option>
                      </select>
                      <button
                        class="btn btn-sm action-exec-btn flex-shrink-0"
                        :class="getUserExecBtnClass(actionSelected[record._id])"
                        :disabled="!actionSelected[record._id] || isProcessing === record._id"
                        @click="executeUserAction(record)"
                      >
                        <i class="fas" :class="isProcessing === record._id ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                      </button>
                    </template>
                    <!-- Đã duyệt — hiển thị badge nhắc đến nhận sách -->
                    <span
                      v-else-if="record.trangThai === 'đã duyệt'"
                      class="badge bg-success bg-opacity-10 text-success fw-semibold rounded-pill px-3 py-2"
                    >
                      <i class="fas fa-store me-1"></i> Chờ nhận sách
                    </span>
                    <!-- Đang chờ gia hạn — hiển thị badge -->
                    <span
                      v-else-if="record.trangThai === 'chờ gia hạn'"
                      class="badge bg-info bg-opacity-10 text-info fw-semibold rounded-pill px-3 py-2"
                    >
                      <i class="fas fa-history me-1"></i> Chờ duyệt gia hạn
                    </span>
                    <!-- Đang chờ trả — chỉ hiển thị badge -->
                    <span
                      v-else-if="record.trangThai === 'đang chờ trả'"
                      class="badge bg-secondary bg-opacity-10 text-secondary fw-semibold rounded-pill px-3 py-2"
                    >
                      <i class="fas fa-hourglass-half me-1"></i> Đang chờ trả
                    </span>
                    <!-- Đã trả / Từ chối — không cần thao tác -->
                    <span v-else class="text-muted" style="font-size:0.75rem;">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <div v-else class="empty-state text-center py-5 bg-white rounded-4 shadow-sm border mt-4">
        <div class="text-muted-custom mb-3">
          <i class="fas fa-history fa-3x opacity-50"></i>
        </div>
        <h5 class="fw-bold text-dark">Chưa có lịch sử mượn</h5>
        <p class="text-muted-custom mb-4">Bạn chưa thực hiện bất kỳ yêu cầu mượn sách nào.</p>
        <router-link to="/sach" class="btn btn-primary rounded-pill px-4 hover-scale">
          Khám phá sách ngay
        </router-link>
      </div>
    </div>
  </div>
    <!-- Modal Xin Trả Sách -->
    <div class="modal fade" id="returnModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 460px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-1">
                <i class="fas fa-undo-alt text-warning me-2"></i>Hẹn ngày trả sách
              </h5>
              <p class="text-muted small mb-0">Thông báo thời gian mang sách đến quầy cho thư viện</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="p-3 rounded-3 bg-light border border-light-subtle mb-3">
              <span class="text-muted small fw-medium d-block mb-1">Tên sách hoàn trả:</span>
              <div class="fw-bold text-dark">{{ returnTarget?.TenSach }}</div>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-semibold text-dark">
                Ngày dự kiến mang sách đến trả <span class="text-danger">*</span>
              </label>
              <input type="date" class="form-control" v-model="returnDate" :min="todayDate">
              <small class="text-muted mt-1.5 d-block">Giúp thủ thư chủ động sắp xếp thời gian kiểm tra và nhận sách tại quầy.</small>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Hủy</button>
            <button
              type="button"
              class="btn btn-warning text-dark rounded-pill px-4 fw-semibold shadow-sm"
              :disabled="isProcessing === returnTarget?._id || !returnDate"
              @click="submitReturnRequest"
            >
              <span v-if="isProcessing === returnTarget?._id" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-check me-1"></i> Xác nhận hẹn trả
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Sửa Số Lượng -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-1">
                <i class="fas fa-edit text-primary me-2"></i>Sửa số lượng mượn
              </h5>
              <p class="text-muted small mb-0">Điều chỉnh số lượng sách trong yêu cầu chờ duyệt</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="p-3 rounded-3 bg-light border border-light-subtle mb-3">
              <span class="text-muted small fw-medium d-block mb-1">Tên sách:</span>
              <div class="fw-bold text-dark">{{ editTarget?.TenSach }}</div>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-semibold text-dark">Số lượng đăng ký mượn <span class="text-danger">*</span></label>
              <div class="input-group">
                <button class="btn btn-outline-secondary px-3" type="button" @click="editQuantity = Math.max(1, editQuantity - 1)">
                  <i class="fas fa-minus small"></i>
                </button>
                <input type="number" class="form-control text-center text-primary fw-bold fs-5 bg-white shadow-none" v-model="editQuantity" min="1" max="10">
                <button class="btn btn-outline-secondary px-3" type="button" @click="editQuantity = Math.min(10, editQuantity + 1)">
                  <i class="fas fa-plus small"></i>
                </button>
              </div>
              <small class="text-muted mt-2 d-block">Lưu ý: Hạn mức tối đa là 10 quyển sách trên một tài khoản.</small>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 fw-medium" data-bs-dismiss="modal">Hủy</button>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              :disabled="isProcessing === editTarget?._id || editQuantity < 1"
              @click="submitEditRequest"
            >
              <span v-if="isProcessing === editTarget?._id" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-save me-1"></i> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xin Gia Hạn Sách -->
    <div class="modal fade" id="extendModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-1">
                <i class="fas fa-calendar-plus text-primary me-2"></i>Xin gia hạn mượn sách
              </h5>
              <p class="text-muted small mb-0">Gửi yêu cầu kéo dài thời gian mượn sách đến thư viện</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Book summary card -->
            <div class="p-3 rounded-3 bg-light border border-light-subtle mb-3">
              <div class="d-flex align-items-center justify-content-between mb-1.5">
                <span class="text-muted small fw-medium">Tên sách</span>
                <span class="badge bg-primary-subtle text-primary fw-semibold rounded-pill px-2.5 py-1">
                  Còn {{ getDaysUntilDue(extendTarget?.ngayTra) }} ngày
                </span>
              </div>
              <div class="fw-bold text-dark fs-6 mb-2">{{ extendTarget?.TenSach }}</div>
              <div class="d-flex align-items-center justify-content-between small text-muted pt-2 border-top">
                <span>Hạn trả hiện tại:</span>
                <strong class="text-danger fw-semibold">{{ formatDate(extendTarget?.ngayTra) }}</strong>
              </div>
            </div>

            <!-- Policy note -->
            <div class="d-flex align-items-start gap-2 p-2.5 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 mb-3 small text-secondary">
              <i class="fas fa-circle-info text-warning mt-1 flex-shrink-0"></i>
              <div>
                Quy định: Yêu cầu gia hạn phải gửi trước ngày hết hạn ít nhất <strong>3 ngày</strong> (tối đa 2 lần/phiếu mượn).
              </div>
            </div>

            <!-- Duration selector -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark mb-2">Thời gian xin gia hạn <span class="text-danger">*</span></label>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <div
                    class="duration-card p-3 border rounded-3 text-center cursor-pointer"
                    :class="extendDays === 7 ? 'active-card' : 'bg-white'"
                    @click="extendDays = 7"
                    role="button"
                  >
                    <div class="fw-bold fs-5 text-dark mb-0">+ 7 ngày</div>
                    <small class="text-muted">1 tuần</small>
                  </div>
                </div>
                <div class="col-6">
                  <div
                    class="duration-card p-3 border rounded-3 text-center cursor-pointer"
                    :class="extendDays === 14 ? 'active-card' : 'bg-white'"
                    @click="extendDays = 14"
                    role="button"
                  >
                    <div class="fw-bold fs-5 text-dark mb-0">+ 14 ngày</div>
                    <small class="text-muted">2 tuần</small>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center p-2.5 bg-light rounded-3 small">
                <span class="text-muted">Hạn trả dự kiến mới:</span>
                <strong class="text-primary fw-bold">{{ calcNewDueDate(extendTarget?.ngayTra, extendDays) }}</strong>
              </div>
            </div>

            <!-- Reason textarea -->
            <div class="mb-1">
              <label class="form-label small fw-semibold text-dark mb-1">
                Lý do xin gia hạn <span class="text-muted fw-normal">(tùy chọn)</span>
              </label>
              <textarea
                class="form-control"
                rows="2"
                placeholder="VD: Cần thêm thời gian làm tiểu luận, nghiên cứu tài liệu..."
                v-model="extendReason"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 fw-medium" data-bs-dismiss="modal">
              Hủy bỏ
            </button>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              :disabled="isProcessing === extendTarget?._id"
              @click="submitExtendRequest"
            >
              <span v-if="isProcessing === extendTarget?._id" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-paper-plane me-1"></i> Gửi yêu cầu gia hạn
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Hủy Phiếu Mượn -->
    <div class="modal fade" id="cancelModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 bg-danger bg-opacity-10 text-danger" style="width: 56px; height: 56px;">
              <i class="fas fa-trash-alt fa-lg"></i>
            </div>
            <h5 class="fw-bold mb-2">Hủy yêu cầu mượn sách</h5>
            <p class="text-muted small mb-3">
              Bạn có chắc chắn muốn hủy yêu cầu mượn cuốn sách "<strong>{{ cancelTarget?.TenSach }}</strong>"?
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal" :disabled="isProcessing === cancelTarget?._id">
                Không hủy
              </button>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-semibold shadow-sm" @click="confirmCancelRequest" :disabled="isProcessing === cancelTarget?._id">
                <span v-if="isProcessing === cancelTarget?._id" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-trash me-1"></i> Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div id="historyToast" class="toast align-items-center text-white border-0 shadow-lg" :class="toastType === 'danger' ? 'bg-danger' : 'bg-success'" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body fw-medium d-flex align-items-center">
            <i class="fas me-2 fs-5" :class="toastType === 'danger' ? 'fa-exclamation-circle' : 'fa-check-circle'"></i>
            {{ toastMessage }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Modal, Toast } from 'bootstrap'
import MuonSachService from '@/services/muonsach.service'
import BaseCard from '@/components/ui/BaseCard.vue'

const records = ref([])
const loading = ref(true)
const isProcessing = ref(null)
const actionSelected = ref({}) // Map: recordId → selected action

let returnModalInst = null
let editModalInst = null
let extendModalInst = null
let cancelModalInst = null
let toastInstance = null

const toastMessage = ref('')
const toastType = ref('success')
const cancelTarget = ref(null)

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastInstance?.show()
}

const returnTarget = ref(null)
const returnDate = ref('')
const editTarget = ref(null)
const editQuantity = ref(1)

const extendTarget = ref(null)
const extendDays = ref(7)
const extendReason = ref('')

const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const fetchHistory = async () => {
  try {
    const response = await MuonSachService.getHistory()
    records.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Không thể tải lịch sử mượn sách:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

// Tính số ngày còn lại đến hạn trả
const getDaysUntilDue = (ngayTra) => {
  if (!ngayTra) return 0
  const hanTra = new Date(ngayTra)
  const today = new Date()
  const hanTraMidnight = new Date(hanTra.getFullYear(), hanTra.getMonth(), hanTra.getDate())
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((hanTraMidnight - todayMidnight) / (1000 * 60 * 60 * 24))
}

// Tính hạn trả mới dự kiến
const calcNewDueDate = (currentDueDate, days) => {
  if (!currentDueDate) return '—'
  const date = new Date(currentDueDate)
  date.setDate(date.getDate() + Number(days))
  return date.toLocaleDateString('vi-VN')
}

// Kiểm tra sách quá hạn (bao gồm cả trường hợp đang chờ xác nhận trả sau quá hạn)
const isOverdueLoan = (record) => {
  if (!record || ['đã trả', 'từ chối'].includes(record.trangThai)) return false
  if (record.trangThai === 'quá hạn') return true
  if (record.daTungQuaHan) return true
  if (record.ngayTra) {
    const todayDateStr = new Date().toLocaleDateString('en-CA')
    const returnDateStr = new Date(record.ngayTra).toLocaleDateString('en-CA')
    if (returnDateStr < todayDateStr) return true
  }
  return false
}

// Kiểm tra điều kiện gia hạn (phải gia hạn trước 3 ngày, đang mượn, tối đa 2 lần)
const canExtend = (record) => {
  if (!record || record.trangThai !== 'đang mượn') return false
  if ((record.giaHanCount || 0) >= 2) return false
  const diffDays = getDaysUntilDue(record.ngayTra)
  return diffDays >= 3
}

// Chuyển đổi trạng thái sang hiển thị UI
const formatStatus = (value) => {
  const text = String(value || '').toLowerCase()
  const mapping = {
    'chờ duyệt': 'Chờ duyệt',
    'đã duyệt': 'Đã duyệt',
    'đang mượn': 'Đang mượn',
    'chờ gia hạn': 'Chờ gia hạn',
    'đang chờ trả': 'Đang chờ trả',
    'đã trả': 'Đã trả',
    'từ chối': 'Từ chối',
    'quá hạn': 'Quá hạn',
    'mat': 'Mất sách',
  }
  return mapping[text] || value || 'Chờ xử lý'
}

const openReturnModal = (record) => {
  returnTarget.value = record
  returnDate.value = todayDate.value
  returnModalInst?.show()
}

const submitReturnRequest = async () => {
  if (!returnTarget.value || !returnDate.value) return
  isProcessing.value = returnTarget.value._id
  try {
    await MuonSachService.requestReturn(returnTarget.value._id, returnDate.value)
    showToast("Đã gửi yêu cầu hẹn ngày trả sách thành công! Vui lòng mang sách đến quầy đúng hẹn.", "success")
    returnModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    showToast(error.response?.data?.message || "Không thể yêu cầu trả sách", "danger")
  } finally {
    isProcessing.value = null
  }
}

const openEditModal = (record) => {
  editTarget.value = record
  editQuantity.value = record.soLuong || 1
  editModalInst?.show()
}

const submitEditRequest = async () => {
  if (!editTarget.value) return
  isProcessing.value = editTarget.value._id
  try {
    await MuonSachService.updatePending(editTarget.value._id, editQuantity.value)
    showToast("Đã cập nhật số lượng mượn thành công!", "success")
    editModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    showToast(error.response?.data?.message || "Không thể cập nhật số lượng", "danger")
  } finally {
    isProcessing.value = null
  }
}

const openExtendModal = (record) => {
  extendTarget.value = record
  extendDays.value = 7
  extendReason.value = ''
  extendModalInst?.show()
}

const submitExtendRequest = async () => {
  if (!extendTarget.value) return
  isProcessing.value = extendTarget.value._id
  try {
    await MuonSachService.requestExtension(extendTarget.value._id, {
      soNgayGiaHan: Number(extendDays.value),
      lyDo: extendReason.value.trim()
    })
    showToast('Đã gửi yêu cầu gia hạn sách thành công! Vui lòng chờ thủ thư phê duyệt.', 'success')
    extendModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    showToast(error.response?.data?.message || 'Không thể gửi yêu cầu gia hạn', 'danger')
  } finally {
    isProcessing.value = null
  }
}

const cancelRequest = (record) => {
  cancelTarget.value = record
  cancelModalInst?.show()
}

const confirmCancelRequest = async () => {
  if (!cancelTarget.value) return
  isProcessing.value = cancelTarget.value._id
  try {
    await MuonSachService.deletePending(cancelTarget.value._id)
    showToast(`Đã hủy yêu cầu mượn cuốn sách "${cancelTarget.value.TenSach}" thành công!`, "success")
    cancelModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    showToast(error.response?.data?.message || "Không thể hủy phiếu mượn", "danger")
  } finally {
    isProcessing.value = null
    cancelTarget.value = null
  }
}

// =================== ACTION DROPDOWN (USER) ===================
const getUserActionOptions = (record) => {
  const trangThai = record?.trangThai
  switch (trangThai) {
    case 'chờ duyệt':
      return [
        { value: 'edit',   label: 'Sửa số lượng' },
        { value: 'cancel', label: 'Hủy yêu cầu' },
      ]
    case 'đang mượn': {
      const opts = [{ value: 'return', label: 'Hẹn trả sách' }]
      if (canExtend(record)) {
        opts.push({ value: 'extend', label: 'Xin gia hạn' })
      }
      return opts
    }
    case 'quá hạn':
      return [
        { value: 'return', label: 'Hẹn trả sách' },
      ]
    default:
      return []
  }
}

const getUserExecBtnClass = (action) => {
  if (action === 'edit')   return 'btn-primary text-white'
  if (action === 'cancel') return 'btn-danger text-white'
  if (action === 'return') return 'btn-warning text-dark'
  if (action === 'extend') return 'btn-info text-white'
  return 'btn-secondary'
}

const executeUserAction = (record) => {
  const action = actionSelected.value[record._id]
  if (!action) return
  actionSelected.value[record._id] = '' // reset
  if (action === 'return') openReturnModal(record)
  else if (action === 'edit') openEditModal(record)
  else if (action === 'cancel') cancelRequest(record)
  else if (action === 'extend') openExtendModal(record)
}

const statusClass = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'chờ duyệt') return 'bg-warning bg-opacity-10 text-warning-emphasis'
  if (text === 'đã duyệt') return 'bg-success bg-opacity-10 text-success border border-success-subtle'
  if (text === 'đang mượn') return 'bg-primary bg-opacity-10 text-primary'
  if (text === 'chờ gia hạn') return 'bg-info bg-opacity-10 text-info border border-info-subtle'
  if (text === 'đang chờ trả') return 'bg-secondary bg-opacity-10 text-secondary'
  if (text === 'đã trả') return 'bg-success bg-opacity-10 text-success'
  if (text === 'từ chối' || text === 'mat') return 'bg-danger bg-opacity-10 text-danger'
  if (text === 'quá hạn') return 'bg-danger text-white border-danger shadow-sm'
  return 'bg-secondary text-white'
}

const statusIcon = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'chờ duyệt') return 'fa-clock'
  if (text === 'đã duyệt') return 'fa-check-circle'
  if (text === 'đang mượn') return 'fa-book-reader'
  if (text === 'chờ gia hạn') return 'fa-clock'
  if (text === 'đang chờ trả') return 'fa-clock'
  if (text === 'đã trả') return 'fa-check-circle'
  if (text === 'từ chối') return 'fa-times-circle'
  if (text === 'quá hạn') return 'fa-exclamation-circle'
  return 'fa-info-circle'
}

onMounted(() => {
  returnModalInst = new Modal(document.getElementById('returnModal'))
  editModalInst = new Modal(document.getElementById('editModal'))
  extendModalInst = new Modal(document.getElementById('extendModal'))
  cancelModalInst = new Modal(document.getElementById('cancelModal'))
  toastInstance = new Toast(document.getElementById('historyToast'))
  fetchHistory()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Custom Table Design */
.custom-table {
  --bs-table-bg: transparent;
  --bs-table-border-color: #f1f3f5;
}
.custom-table thead th {
  border-bottom: 2px solid #e9ecef;
  background-color: transparent;
}
.table-row-hover {
  transition: all 0.2s ease;
}
.table-row-hover:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.custom-table > :not(caption) > * > * {
  padding: 1.25rem 0.5rem;
  vertical-align: middle;
}
.book-icon-wrapper {
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
}

/* Action dropdown */
.action-select {
  min-width: 115px;
  max-width: 140px;
  font-size: 0.78rem;
  border-radius: 8px;
  border: 1.5px solid #dee2e6;
  background-color: #f8f9fa;
  padding-top: 5px;
  padding-bottom: 5px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.action-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13,110,253,0.15);
  outline: none;
}
.action-exec-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.action-exec-btn:not(:disabled):hover {
  transform: scale(1.1);
  filter: brightness(1.05);
}

/* Duration selector in extend modal */
.duration-card {
  border: 1.5px solid #e2e8f0 !important;
  transition: all 0.2s ease;
}
.duration-card:hover {
  border-color: #0d6efd !important;
  background-color: rgba(13, 110, 253, 0.03);
}
.duration-card.active-card {
  border-color: #0d6efd !important;
  background-color: rgba(13, 110, 253, 0.06) !important;
  box-shadow: 0 0 0 1px #0d6efd;
}
.duration-card.active-card .text-dark {
  color: #0d6efd !important;
}
</style>
