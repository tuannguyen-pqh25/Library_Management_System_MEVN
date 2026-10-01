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
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4 py-3 text-muted-custom fw-semibold">#</th>
                <th class="py-3 text-muted-custom fw-semibold">Tên Sách</th>
                <th class="py-3 text-muted-custom fw-semibold">Ngày mượn</th>
                <th class="py-3 text-muted-custom fw-semibold">Hạn trả</th>
                <th class="py-3 text-muted-custom fw-semibold text-center">Trạng thái</th>
                <th class="py-3 text-muted-custom fw-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="record._id || index">
                <td class="ps-4 fw-medium text-muted">{{ index + 1 }}</td>
                <td class="fw-semibold text-dark">
                  <div class="d-flex align-items-center gap-2">
                    <div class="bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                      <i class="fas fa-book"></i>
                    </div>
                    <span class="line-clamp-1" style="max-width: 250px;" :title="record.TenSach || 'Sách'">{{ record.TenSach || 'Sách' }}</span>
                  </div>
                </td>
                <td>{{ formatDate(record.ngayMuon) }}</td>
                <td>{{ formatDate(record.ngayTra) }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill px-3 py-2 fw-medium border" :class="statusClass(record.trangThai)">
                    <i class="fas me-1" :class="statusIcon(record.trangThai)"></i>
                    {{ formatStatus(record.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    v-if="['đã duyệt', 'đang mượn', 'quá hạn'].includes(record.trangThai)"
                    class="btn btn-sm btn-warning text-dark rounded-pill fw-bold shadow-sm px-3"
                    @click="openReturnModal(record)"
                    :disabled="isProcessing === record._id"
                  >
                    <i class="fas" :class="isProcessing === record._id ? 'fa-spinner fa-spin' : 'fa-undo'"></i>
                    Xin trả sách
                  </button>
                  <span v-else-if="record.trangThai === 'đang chờ trả'" class="text-muted small">
                    Đang chờ xác nhận
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
const returnTarget = ref(null)
const returnDate = ref('')

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

const statusClass = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'chờ duyệt') return 'bg-warning text-dark border-warning-subtle'
  if (text === 'đã duyệt') return 'bg-info text-dark border-info-subtle'
  if (text === 'đang mượn') return 'bg-primary text-white border-primary-subtle'
  if (text === 'đang chờ trả') return 'bg-orange text-white border-warning-subtle'
  if (text === 'đã trả') return 'bg-success text-white border-success-subtle'
  if (text === 'từ chối' || text === 'mat') return 'bg-danger text-white border-danger-subtle'
  if (text === 'quá hạn') return 'bg-danger text-white border-danger-subtle'
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
.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}
</style>
