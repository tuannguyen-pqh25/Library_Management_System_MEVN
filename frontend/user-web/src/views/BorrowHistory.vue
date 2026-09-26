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
                <td>{{ formatDate(record.NgayMuon) }}</td>
                <td>{{ formatDate(record.NgayHenTra) }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill px-3 py-2 fw-medium border" :class="statusClass(record.TrangThai)">
                    <i class="fas me-1" :class="statusIcon(record.TrangThai)"></i>
                    {{ formatStatus(record.TrangThai) }}
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MuonSachService from '@/services/muonsach.service'
import BaseCard from '@/components/ui/BaseCard.vue'

const records = ref([])
const loading = ref(true)

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

// Chuyển đổi trạng thái enum không dấu sang hiển thị UI
const formatStatus = (value) => {
  const mapping = {
    'choduyet': 'Chờ duyệt',
    'dangmuon': 'Đang mượn',
    'datra': 'Đã trả',
    'quahan': 'Quá hạn',
    'tuchoi': 'Từ chối',
    'mat': 'Mất sách',
  }
  return mapping[String(value).toLowerCase()] || value || 'Chờ xử lý'
}

const statusClass = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'choduyet') return 'bg-warning text-dark border-warning-subtle'
  if (text === 'dangmuon') return 'bg-primary text-white border-primary-subtle'
  if (text === 'datra') return 'bg-success text-white border-success-subtle'
  if (text === 'tuchoi' || text === 'mat') return 'bg-danger text-white border-danger-subtle'
  if (text === 'quahan') return 'bg-danger text-white border-danger-subtle'
  return 'bg-secondary text-white'
}

const statusIcon = (value) => {
  const text = String(value || '').toLowerCase()
  if (text === 'choduyet') return 'fa-clock'
  if (text === 'dangmuon') return 'fa-book-reader'
  if (text === 'datra') return 'fa-check-circle'
  if (text === 'tuchoi') return 'fa-times-circle'
  if (text === 'quahan') return 'fa-exclamation-circle'
  return 'fa-info-circle'
}

onMounted(() => {
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
