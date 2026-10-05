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
                    <div class="book-icon-wrapper bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                      <i class="fas fa-book"></i>
                    </div>
                    <span class="line-clamp-1" style="max-width: 250px; font-size: 0.95rem;" :title="record.TenSach || 'Sách'">{{ record.TenSach || 'Sách' }}</span>
                  </div>
                </td>
                <td class="fw-bold text-center text-primary" style="font-size: 0.95rem;">{{ record.soLuong || 1 }}</td>
                <td class="fw-medium text-dark" style="font-size: 0.9rem;">{{ formatDate(record.ngayMuon) }}</td>
                <td class="fw-medium text-dark" style="font-size: 0.9rem;">{{ formatDate(record.ngayTra) }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill px-3 py-2 fw-bold" :class="statusClass(record.trangThai)" style="font-size: 0.75rem;">
                    <i class="fas me-1" :class="statusIcon(record.trangThai)"></i>
                    {{ formatStatus(record.trangThai) }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <button
                    v-if="['đã duyệt', 'đang mượn', 'quá hạn'].includes(record.trangThai)"
                    class="btn btn-sm btn-outline-warning text-dark border-warning border-2 rounded-pill fw-bold hover-scale px-3"
                    @click="openReturnModal(record)"
                    :disabled="isProcessing === record._id"
                  >
                    <i class="fas" :class="isProcessing === record._id ? 'fa-spinner fa-spin' : 'fa-undo'"></i>
                    Hẹn trả sách
                  </button>
                  <div v-else-if="record.trangThai === 'chờ duyệt'" class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-2 hover-scale" @click="openEditModal(record)" title="Sửa số lượng" :disabled="isProcessing === record._id">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-2 hover-scale" @click="cancelRequest(record)" title="Hủy yêu cầu" :disabled="isProcessing === record._id">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <span v-else-if="record.trangThai === 'đang chờ trả'" class="badge bg-secondary bg-opacity-10 text-secondary fw-semibold rounded-pill px-3 py-2">
                    <i class="fas fa-hourglass-half me-1"></i> Đang chờ
                  </span>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-warning py-3 px-4 border-0">
            <h5 class="modal-title fw-bold text-dark"><i class="fas fa-undo me-2"></i>Xin trả sách</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-muted mb-3">
              Bạn đang yêu cầu trả sách <strong class="text-dark">{{ returnTarget?.TenSach }}</strong>.
            </p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Ngày dự kiến mang sách đến trả <span class="text-danger">*</span></label>
              <input type="date" class="form-control bg-light rounded-3 border-0 py-2" v-model="returnDate" :min="todayDate">
              <small class="text-muted mt-2 d-block">Giúp thư viện chủ động sắp xếp thời gian nhận sách.</small>
            </div>
          </div>
          <div class="modal-footer border-top pt-3">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
            <button
              type="button"
              class="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm"
              :disabled="isProcessing === returnTarget?._id || !returnDate"
              @click="submitReturnRequest"
            >
              <i class="fas" :class="isProcessing === returnTarget?._id ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Sửa Số Lượng -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white py-3 px-4 border-0">
            <h5 class="modal-title fw-bold"><i class="fas fa-edit me-2"></i>Sửa số lượng mượn</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-muted mb-3">
              Bạn đang sửa số lượng cho sách <strong class="text-dark">{{ editTarget?.TenSach }}</strong>.
            </p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Số lượng mượn mới <span class="text-danger">*</span></label>
              <div class="input-group">
                <button class="btn btn-outline-secondary" type="button" @click="editQuantity = Math.max(1, editQuantity - 1)">-</button>
                <input type="number" class="form-control text-center text-primary fw-bold bg-light" v-model="editQuantity" min="1" max="10">
                <button class="btn btn-outline-secondary" type="button" @click="editQuantity = Math.min(10, editQuantity + 1)">+</button>
              </div>
              <small class="text-muted mt-2 d-block">Lưu ý: Tổng số sách mượn không được vượt quá 10 quyển.</small>
            </div>
          </div>
          <div class="modal-footer border-top pt-3">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
              :disabled="isProcessing === editTarget?._id || editQuantity < 1"
              @click="submitEditRequest"
            >
              <i class="fas" :class="isProcessing === editTarget?._id ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import MuonSachService from '@/services/muonsach.service'
import BaseCard from '@/components/ui/BaseCard.vue'

const records = ref([])
const loading = ref(true)
const isProcessing = ref(null)


let returnModalInst = null
let editModalInst = null
const returnTarget = ref(null)
const returnDate = ref('')
const editTarget = ref(null)
const editQuantity = ref(1)

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

// Chuyển đổi trạng thái sang hiển thị UI
const formatStatus = (value) => {
  const text = String(value || '').toLowerCase()
  const mapping = {
    'chờ duyệt': 'Chờ duyệt',
    'đã duyệt': 'Đã duyệt',
    'đang mượn': 'Đang mượn',
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
    alert("Đã gửi yêu cầu xin trả sách thành công!")
    returnModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    alert(error.response?.data?.message || "Không thể yêu cầu trả sách")
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
    editModalInst?.hide()
    await fetchHistory()
  } catch (error) {
    alert(error.response?.data?.message || "Không thể cập nhật số lượng")
  } finally {
    isProcessing.value = null
  }
}

const cancelRequest = async (record) => {
  if (!confirm(`Bạn có chắc chắn muốn hủy phiếu mượn cuốn sách "${record.TenSach}"?`)) return
  isProcessing.value = record._id
  try {
    await MuonSachService.deletePending(record._id)
    await fetchHistory()
  } catch (error) {
    alert(error.response?.data?.message || "Không thể hủy phiếu mượn")
  } finally {
    isProcessing.value = null
  }
}

const statusClass = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'chờ duyệt') return 'bg-warning bg-opacity-10 text-warning-emphasis'
  if (text === 'đã duyệt') return 'bg-info bg-opacity-10 text-info-emphasis'
  if (text === 'đang mượn') return 'bg-primary bg-opacity-10 text-primary'
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
  if (text === 'đang chờ trả') return 'fa-clock'
  if (text === 'đã trả') return 'fa-check-circle'
  if (text === 'từ chối') return 'fa-times-circle'
  if (text === 'quá hạn') return 'fa-exclamation-circle'
  return 'fa-info-circle'
}

onMounted(() => {
  returnModalInst = new Modal(document.getElementById('returnModal'))
  editModalInst = new Modal(document.getElementById('editModal'))
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
</style>
