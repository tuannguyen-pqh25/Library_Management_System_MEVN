<template>
  <div class="page-shell">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Lịch sử mượn sách</h2>
          <p class="text-muted-custom mb-0">Theo dõi các phiếu mượn và trạng thái xử lý</p>
        </div>
      </div>

      <div v-if="records.length" class="card-surface overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="record._id || index">
                <td>{{ index + 1 }}</td>
                <td>{{ record.TENSACH || 'Sách' }}</td>
                <td>{{ formatDate(record.ngayMuon) }}</td>
                <td>{{ formatDate(record.ngayTra) }}</td>
                <td>
                  <span class="badge-pill" :class="statusClass(record.trangThai)">
                    {{ formatStatus(record.trangThai) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="empty-state card-surface">
        Bạn chưa có lịch sử mượn sách nào.
      </div>
    </div>
  </div>
</template>

<script>
import MuonSachService from '@/services/muonsach.service'

export default {
  name: 'BorrowHistory',
  data() {
    return {
      records: [],
    }
  },
  async created() {
    try {
      const response = await MuonSachService.getHistory()
      this.records = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Không thể tải lịch sử mượn sách:', error)
    }
  },
  methods: {
    formatDate(value) {
      if (!value) return '—'
      const date = new Date(value)
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
    },
    formatStatus(value) {
      const mapping = {
        'chờ duyệt': 'Chờ duyệt',
        'đã duyệt': 'Đã duyệt',
        'đang mượn': 'Đang mượn',
        'đã trả': 'Đã trả',
        'từ chối': 'Từ chối',
      }
      return mapping[String(value).toLowerCase()] || value || 'Không xác định'
    },
    statusClass(value) {
      const text = String(value || '').toLowerCase()
      if (text.includes('duyệt') || text.includes('mượn')) return 'bg-primary-subtle text-primary'
      if (text.includes('trả')) return 'bg-success-subtle text-success'
      if (text.includes('từ chối')) return 'bg-danger-subtle text-danger'
      return 'bg-warning-subtle text-warning'
    },
  },
}
</script>
