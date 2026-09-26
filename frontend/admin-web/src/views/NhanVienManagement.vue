<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <!-- Header Section -->
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Nhân Viên
          </h2>
          <p class="text-muted-custom mb-0">Danh sách nhân sự trong hệ thống</p>
        </div>
      </div>

      <BaseCard class="border-0 shadow-sm rounded-4 overflow-hidden p-0">
        <div class="bg-white pt-4 pb-3 px-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="bg-primary-subtle text-primary rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="fas fa-users-cog fa-lg"></i>
            </div>
            <h5 class="mb-0 fw-bold text-dark">Danh sách nhân sự</h5>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="!records.length" class="text-center py-5 text-muted">
          <div class="mb-3"><i class="fas fa-user-slash fa-3x opacity-25"></i></div>
          <p class="mb-0 fw-medium">Chưa có dữ liệu nhân viên.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted-custom">
              <tr>
                <th class="fw-semibold text-uppercase small ps-4 py-3">STT</th>
                <th class="fw-semibold text-uppercase small py-3">Mã NV</th>
                <th class="fw-semibold text-uppercase small py-3">Họ tên</th>
                <th class="fw-semibold text-uppercase small py-3">Email</th>
                <th class="fw-semibold text-uppercase small py-3">Chức vụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="record._id || index">
                <td class="text-muted fw-bold ps-4">{{ index + 1 }}</td>
                <td>
                  <span class="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill font-monospace">
                    {{ record.MaNhanVien || record.MSNV || '—' }}
                  </span>
                </td>
                <td class="fw-semibold text-dark">{{ record.HoTenNV || record.HOLOT || '—' }}</td>
                <td class="text-secondary"><i class="fas fa-envelope me-2 text-muted opacity-50"></i>{{ record.Email || '—' }}</td>
                <td>
                  <span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-2">
                    {{ record.ChucVu || 'Nhân viên' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NhanVienService from '@/services/nhanvien.service'
import BaseCard from '@/components/ui/BaseCard.vue'

const records = ref([])
const loading = ref(false)

const retrieveStaff = async () => {
  loading.value = true
  try {
    const response = await NhanVienService.getAll()
    records.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Không thể tải danh sách nhân viên:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  retrieveStaff()
})
</script>

<style scoped>
.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}
</style>
