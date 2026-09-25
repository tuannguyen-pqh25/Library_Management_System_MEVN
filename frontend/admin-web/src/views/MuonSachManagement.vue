<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Quản lý mượn sách</h2>
        <p class="text-muted mb-0">Danh sách yêu cầu mượn sách của độc giả</p>
      </div>
    </div>

    <div class="card-surface p-3">
      <div v-if="loading" class="text-center py-4">Đang tải dữ liệu...</div>
      <div v-else-if="!records.length" class="empty-state">Chưa có dữ liệu mượn sách.</div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="record._id || index">
              <td>{{ index + 1 }}</td>
              <td>{{ record.docGiaId || '—' }}</td>
              <td>{{ record.sachId || '—' }}</td>
              <td>{{ formatDate(record.ngayMuon) }}</td>
              <td>{{ formatDate(record.ngayTra) }}</td>
              <td><span class="badge bg-primary">{{ record.trangThai || 'Chờ duyệt' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import MuonSachService from '@/services/muonsach.service'

export default {
  name: 'MuonSachManagement',
  data() {
    return {
      records: [],
      loading: false,
    }
  },
  async created() {
    this.loading = true
    try {
      const response = await MuonSachService.getAll()
      this.records = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Không thể tải danh sách mượn sách:', error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatDate(value) {
      if (!value) return '—'
      const date = new Date(value)
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
    },
  },
}
</script>
