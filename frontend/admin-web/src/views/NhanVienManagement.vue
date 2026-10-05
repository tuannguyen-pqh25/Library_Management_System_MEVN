<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Nhân Viên
          </h2>
          <p class="text-muted-custom mb-0">Danh sách nhân sự trong hệ thống</p>
        </div>
        <div class="col-auto"><button class="btn btn-primary" @click="openCreate">Thêm nhân viên</button></div>
      </div>

      <div v-if="notice" class="alert" :class="noticeType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">{{ notice }}</div>

      <BaseCard v-if="editing" class="mb-4 border-0 shadow-sm">
        <h5 class="fw-bold mb-3">{{ editId ? 'Sửa nhân viên' : 'Thêm nhân viên' }}</h5>
        <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>
        <form @submit.prevent="save">
          <div class="row g-3">
            <div class="col-md-6" v-if="editId"><label class="form-label" for="staffCode">MSNV (Tự động)</label><input id="staffCode" :value="form.MSNV" class="form-control bg-light text-muted" disabled></div>
            <div class="col-md-6"><label class="form-label" for="staffName">Họ tên</label><input id="staffName" v-model.trim="form.HoTenNV" class="form-control" required></div>
            <div class="col-md-6"><label class="form-label" for="staffEmail">Email</label><input id="staffEmail" v-model.trim="form.EMAIL" class="form-control" type="email"></div>
            <div class="col-md-6"><label class="form-label" for="staffRole">Chức vụ</label><select id="staffRole" v-model="form.ChucVu" class="form-select" required><option v-for="option in roleOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></div>
            <div class="col-md-6"><label class="form-label" for="staffPassword">Mật khẩu {{ editId ? '(để trống để giữ nguyên)' : '' }}</label><input id="staffPassword" v-model="form.Password" class="form-control" type="password" :required="!editId" minlength="8" autocomplete="new-password"></div>
          </div>
          <div class="d-flex gap-2 mt-4"><button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button><button class="btn btn-outline-secondary" type="button" :disabled="saving" @click="editing = false">Hủy</button></div>
        </form>
      </BaseCard>

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
          <p class="mb-0 fw-medium">Chưa có dữ liệu nhân viên. Hãy thêm nhân viên đầu tiên.</p>
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
                <th class="fw-semibold text-uppercase small py-3 text-end pe-4">Thao tác</th>
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
                <td class="text-secondary"><i class="fas fa-envelope me-2 text-muted opacity-50"></i>{{ record.EMAIL || '—' }}</td>
                <td>
                  <span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-2">
                    {{ roleLabel(record.ChucVu) }}
                  </span>
                </td>
                <td class="text-end pe-4"><button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(record)">Sửa</button><button class="btn btn-sm btn-outline-danger" :disabled="saving || record._id === currentUserId" @click="remove(record)">Xóa</button></td>
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
import { ROLES, readAdminSession } from '@/services/adminRoles'

const roleOptions = [
  { value: ROLES.admin, label: 'Admin' },
  { value: ROLES.books, label: 'Nhân viên quản lý sách' },
  { value: ROLES.borrowing, label: 'Nhân viên duyệt mượn' },
]
const roleLabel = (role) => roleOptions.find(option => option.value === role)?.label || role || 'Chưa phân quyền'
const currentUserId = readAdminSession()?._id

const records = ref([])
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const editId = ref(null)
const form = ref({})
const formError = ref('')
const notice = ref('')
const noticeType = ref('success')

const retrieveStaff = async () => {
  loading.value = true
  try {
    const response = await NhanVienService.getAll()
    records.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    noticeType.value = 'danger'
    notice.value = error.response?.data?.message || 'Không thể tải danh sách nhân viên.'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editId.value = null
  form.value = { MSNV: '', HoTenNV: '', EMAIL: '', ChucVu: ROLES.books, Password: '' }
  formError.value = ''
  editing.value = true
}

const openEdit = (record) => {
  editId.value = record._id
  form.value = { MSNV: record.MSNV, HoTenNV: record.HoTenNV || '', EMAIL: record.EMAIL || '', ChucVu: record.ChucVu, Password: '' }
  formError.value = ''
  editing.value = true
}

const save = async () => {
  saving.value = true
  formError.value = ''
  try {
    const payload = { HoTenNV: form.value.HoTenNV, EMAIL: form.value.EMAIL, ChucVu: form.value.ChucVu }
    if (form.value.Password) payload.Password = form.value.Password
    if (editId.value) await NhanVienService.update(editId.value, payload)
    else await NhanVienService.create(payload)
    editing.value = false
    noticeType.value = 'success'
    notice.value = editId.value ? 'Đã cập nhật nhân viên.' : 'Đã tạo nhân viên.'
    await retrieveStaff()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Không thể lưu nhân viên.'
  } finally {
    saving.value = false
  }
}

const remove = async (record) => {
  if (!confirm(`Xóa nhân viên ${record.HoTenNV || record.MSNV}?`)) return
  saving.value = true
  try {
    await NhanVienService.delete(record._id)
    noticeType.value = 'success'
    notice.value = 'Đã xóa nhân viên.'
    await retrieveStaff()
  } catch (error) {
    noticeType.value = 'danger'
    notice.value = error.response?.data?.message || 'Không thể xóa nhân viên.'
  } finally {
    saving.value = false
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
