<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Quản lý nhân viên</h2>
        <p class="text-muted mb-0">Danh sách nhân sự trong hệ thống</p>
      </div>
    </div>

    <div class="card-surface p-3">
      <div v-if="loading" class="text-center py-4">Đang tải dữ liệu...</div>
      <div v-else-if="!records.length" class="empty-state">Chưa có dữ liệu nhân viên.</div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Chức vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="record._id || index">
              <td>{{ index + 1 }}</td>
              <td>{{ record.MaNhanVien || '—' }}</td>
              <td>{{ record.HoTenNV || record.HOLOT || '—' }}</td>
              <td>{{ record.Email || '—' }}</td>
              <td>{{ record.ChucVu || 'Nhân viên' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import NhanVienService from '@/services/nhanvien.service'

export default {
  name: 'NhanVienManagement',
  data() {
    return {
      records: [],
      loading: false,
    }
  },
  async created() {
    this.loading = true
    try {
      const response = await NhanVienService.getAll()
      this.records = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Không thể tải danh sách nhân viên:', error)
    } finally {
      this.loading = false
    }
  },
}
</script>
