<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Nhân Viên
          </h2>
          <p class="text-muted-custom mb-0">Danh sách nhân sự và phân quyền trong hệ thống</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" @click="openCreate">
            <i class="fas fa-user-plus me-1"></i> Thêm nhân viên
          </button>
        </div>
      </div>

      <!-- Toast / Notice -->
      <div v-if="notice" class="alert alert-dismissible fade show" :class="noticeType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="fas me-2" :class="noticeType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ notice }}
        <button type="button" class="btn-close" @click="notice = ''"></button>
      </div>

      <!-- Data Table Card -->
      <BaseCard class="border-0 shadow-sm rounded-4 overflow-hidden p-0">
        <div class="bg-white pt-4 pb-3 px-4 border-bottom">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center">
              <div class="bg-primary-subtle text-primary rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="fas fa-users-cog fa-lg"></i>
              </div>
              <div>
                <h5 class="mb-0 fw-bold text-dark">Danh sách nhân sự</h5>
                <small class="text-muted">{{ paginatedRecords.length }} / {{ records.length }} nhân viên</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <label class="text-muted small fw-semibold text-nowrap">Hiển thị:</label>
              <select
                class="form-select form-select-sm w-auto bg-light border-0 fw-bold text-primary shadow-none cursor-pointer rounded-pill px-3"
                v-model="itemsPerPage"
                @change="currentPage = 1"
              >
                <option :value="10">10 dòng</option>
                <option :value="20">20 dòng</option>
                <option :value="50">50 dòng</option>
                <option :value="100">100 dòng</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Bulk Action Bar -->
        <div v-if="selectedIds.length > 0" class="bg-primary-subtle border-bottom px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary fs-6 rounded-pill px-3 py-2">
              <i class="fas fa-check-square me-1"></i> Đã chọn {{ selectedIds.length }} nhân viên
            </span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-danger" @click="confirmBulkDelete" :disabled="saving">
              <i class="fas fa-trash-alt me-1"></i> Xóa đã chọn
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="selectedIds = []" :disabled="saving">
              Bỏ chọn
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="text-muted mt-2 mb-0">Đang tải danh sách nhân viên...</p>
        </div>
        
        <!-- Empty -->
        <div v-else-if="!records.length" class="text-center py-5 text-muted">
          <div class="mb-3"><i class="fas fa-user-slash fa-3x opacity-25"></i></div>
          <p class="mb-0 fw-medium">Chưa có dữ liệu nhân viên. Hãy thêm nhân viên đầu tiên.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted-custom">
              <tr>
                <th class="ps-4 py-3" style="width: 40px;">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                  </div>
                </th>
                <th class="fw-semibold text-uppercase small py-3">STT</th>
                <th class="fw-semibold text-uppercase small py-3">Mã NV</th>
                <th class="fw-semibold text-uppercase small py-3">Họ tên</th>
                <th class="fw-semibold text-uppercase small py-3">Email</th>
                <th class="fw-semibold text-uppercase small py-3">Chức vụ</th>
                <th class="fw-semibold text-uppercase small py-3 text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in paginatedRecords" :key="record._id || index">
                <td class="ps-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="record._id"
                      v-model="selectedIds"
                      :disabled="record._id === currentUserId"
                      :title="record._id === currentUserId ? 'Không thể thao tác trên tài khoản đang đăng nhập' : ''"
                    />
                  </div>
                </td>
                <td class="text-muted fw-bold">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>
                  <span class="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill font-monospace">
                    {{ record.MaNhanVien || record.MSNV || '—' }}
                  </span>
                </td>
                <td class="fw-semibold text-dark">{{ record.HoTenNV || record.HOLOT || '—' }}</td>
                <td class="text-secondary">
                  <i class="fas fa-envelope me-2 text-muted opacity-50"></i>{{ record.EMAIL || '—' }}
                </td>
                <td>
                  <span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-2">
                    {{ roleLabel(record.ChucVu) }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(record)" title="Sửa nhân viên">
                    <i class="fas fa-edit me-1"></i> Sửa
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    :disabled="saving || record._id === currentUserId"
                    @click="remove(record)"
                    title="Xóa nhân viên"
                  >
                    <i class="fas fa-trash-alt me-1"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light">
          <small class="text-muted">
            Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, records.length) }}
            trên tổng {{ records.length }} nhân viên
          </small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </BaseCard>
    </div>

    <!-- ========== MODAL: THÊM / SỬA NHÂN VIÊN ========== -->
    <div class="modal fade" id="staffModal" tabindex="-1" aria-labelledby="staffModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold text-dark" id="staffModalLabel">
              <i class="fas text-primary me-2" :class="editId ? 'fa-user-edit' : 'fa-user-plus'"></i>
              {{ editId ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body px-4 py-3">
              <div v-if="formError" class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-1"></i> {{ formError }}
              </div>
              <div class="row g-3">
                <div class="col-md-6" v-if="editId">
                  <label class="form-label fw-medium" for="staffCode">MSNV (Tự động)</label>
                  <input id="staffCode" :value="form.MSNV" class="form-control bg-light text-muted" disabled />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium" for="staffName">Họ tên <span class="text-danger">*</span></label>
                  <input id="staffName" v-model.trim="form.HoTenNV" class="form-control" placeholder="Nhập họ và tên" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium" for="staffEmail">Email</label>
                  <input id="staffEmail" v-model.trim="form.EMAIL" class="form-control" type="email" placeholder="example@library.vn" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium" for="staffRole">Chức vụ <span class="text-danger">*</span></label>
                  <select id="staffRole" v-model="form.ChucVu" class="form-select" required>
                    <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium" for="staffPassword">
                    Mật khẩu {{ editId ? '(để trống để giữ nguyên)' : '' }} <span v-if="!editId" class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input
                      id="staffPassword"
                      v-model="form.Password"
                      class="form-control"
                      :type="showPassword ? 'text' : 'password'"
                      :required="!editId"
                      minlength="8"
                      autocomplete="new-password"
                      placeholder="Tối thiểu 8 ký tự"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                      tabindex="-1"
                      :title="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                    >
                      <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <div class="form-text text-muted small">
                    {{ editId ? 'Chỉ nhập nếu bạn muốn đổi mật khẩu mới cho nhân viên này.' : 'Mật khẩu phải có ít nhất 8 ký tự.' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 px-4 pb-4 pt-2">
              <button class="btn btn-outline-secondary" type="button" :disabled="saving" data-bs-dismiss="modal">Hủy</button>
              <button class="btn btn-primary" type="submit" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-save me-1"></i>
                {{ saving ? 'Đang lưu...' : 'Lưu thông tin' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ========== MODAL: XÓA ĐƠN LẺ NHÂN VIÊN ========== -->
    <div class="modal fade" id="deleteStaffModal" tabindex="-1" aria-labelledby="deleteStaffModalLabel" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 bg-danger bg-opacity-10 text-danger"
                 style="width: 64px; height: 64px;">
              <i class="fas fa-trash-alt fa-2x"></i>
            </div>

            <h5 class="fw-bold mb-2">
              Xác nhận xóa Nhân Viên
            </h5>

            <p class="text-muted small mb-3">
              Bạn có chắc chắn muốn xóa nhân viên "<strong>{{ staffToDelete?.HoTenNV || staffToDelete?.MSNV }}</strong>"
              <span v-if="staffToDelete?.MSNV"> (MSNV: <code>{{ staffToDelete?.MSNV }}</code>)</span> khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>

            <p class="fw-semibold small text-danger mb-4">
              Bạn có CHẮC CHẮN muốn tiếp tục xóa?
            </p>

            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal" :disabled="saving">
                Hủy bỏ
              </button>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-semibold shadow-sm" @click="executeDeleteStaff" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-trash me-1"></i> Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== MODAL: XÓA HÀNG LOẠT NHÂN VIÊN ========== -->
    <div class="modal fade" id="bulkDeleteStaffModal" tabindex="-1" aria-labelledby="bulkDeleteStaffModalLabel" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 bg-danger bg-opacity-10 text-danger"
                 style="width: 64px; height: 64px;">
              <i class="fas fa-trash-alt fa-2x"></i>
            </div>

            <h5 class="fw-bold mb-2">
              Xác nhận xóa hàng loạt
            </h5>

            <div class="alert alert-danger d-flex align-items-start gap-2 rounded-3 mb-3 text-start small">
              <i class="fas fa-exclamation-triangle mt-1"></i>
              <div>
                Bạn có chắc chắn muốn xóa vĩnh viễn <strong>{{ selectedIds.length }}</strong> nhân viên đã chọn khỏi hệ thống?
              </div>
            </div>

            <p class="text-muted small mb-3">
              Thao tác này sẽ xóa hoàn toàn thông tin tài khoản và không thể phục hồi.
            </p>

            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-light rounded-pill px-4 fw-medium" data-bs-dismiss="modal" :disabled="saving">
                Hủy bỏ
              </button>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-semibold shadow-sm" @click="executeBulkDeleteStaff" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-trash me-1"></i> Xác nhận xóa hàng loạt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NhanVienService from '@/services/nhanvien.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import { ROLES, readAdminSession } from '@/services/adminRoles'
import { Modal } from 'bootstrap'

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
const editId = ref(null)
const form = ref({})
const formError = ref('')
const notice = ref('')
const noticeType = ref('success')
const showPassword = ref(false)
const selectedIds = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => Math.ceil(records.value.length / itemsPerPage.value) || 1)
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return records.value.slice(start, start + itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else if (end === total) start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

let staffModalInstance = null
let deleteStaffModalInstance = null
let bulkDeleteStaffModalInstance = null

const getStaffModal = () => {
  if (!staffModalInstance) {
    const el = document.getElementById('staffModal')
    if (el) staffModalInstance = new Modal(el)
  }
  return staffModalInstance
}

const getDeleteStaffModal = () => {
  if (!deleteStaffModalInstance) {
    const el = document.getElementById('deleteStaffModal')
    if (el) deleteStaffModalInstance = new Modal(el)
  }
  return deleteStaffModalInstance
}

const getBulkDeleteStaffModal = () => {
  if (!bulkDeleteStaffModalInstance) {
    const el = document.getElementById('bulkDeleteStaffModal')
    if (el) bulkDeleteStaffModalInstance = new Modal(el)
  }
  return bulkDeleteStaffModalInstance
}

// Bulk Selection
const selectableRecords = computed(() => records.value.filter(r => r._id !== currentUserId))
const isAllSelected = computed(() => {
  if (!selectableRecords.value.length) return false
  return selectableRecords.value.every(r => selectedIds.value.includes(r._id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = selectableRecords.value.map(r => r._id)
  }
}

const retrieveStaff = async () => {
  loading.value = true
  currentPage.value = 1
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
  showPassword.value = false
  getStaffModal()?.show()
}

const openEdit = (record) => {
  editId.value = record._id
  form.value = { MSNV: record.MSNV, HoTenNV: record.HoTenNV || '', EMAIL: record.EMAIL || '', ChucVu: record.ChucVu, Password: '' }
  formError.value = ''
  showPassword.value = false
  getStaffModal()?.show()
}

const save = async () => {
  saving.value = true
  formError.value = ''
  try {
    const payload = { HoTenNV: form.value.HoTenNV, EMAIL: form.value.EMAIL, ChucVu: form.value.ChucVu }
    if (form.value.Password) payload.Password = form.value.Password
    if (editId.value) await NhanVienService.update(editId.value, payload)
    else await NhanVienService.create(payload)

    getStaffModal()?.hide()
    noticeType.value = 'success'
    notice.value = editId.value ? 'Đã cập nhật nhân viên thành công.' : 'Đã tạo nhân viên thành công.'
    await retrieveStaff()
  } catch (error) {
    formError.value = error.response?.data?.message || 'Không thể lưu nhân viên.'
  } finally {
    saving.value = false
  }
}

const staffToDelete = ref(null)

const remove = (record) => {
  staffToDelete.value = record
  getDeleteStaffModal()?.show()
}

const executeDeleteStaff = async () => {
  if (!staffToDelete.value) return
  saving.value = true
  try {
    await NhanVienService.delete(staffToDelete.value._id)
    selectedIds.value = selectedIds.value.filter(id => id !== staffToDelete.value._id)
    noticeType.value = 'success'
    notice.value = `Đã xóa nhân viên ${staffToDelete.value.HoTenNV || staffToDelete.value.MSNV} thành công.`
    getDeleteStaffModal()?.hide()
    await retrieveStaff()
  } catch (error) {
    noticeType.value = 'danger'
    notice.value = error.response?.data?.message || 'Không thể xóa nhân viên.'
    getDeleteStaffModal()?.hide()
  } finally {
    saving.value = false
    staffToDelete.value = null
  }
}

const confirmBulkDelete = () => {
  if (!selectedIds.value.length) return
  getBulkDeleteStaffModal()?.show()
}

const executeBulkDeleteStaff = async () => {
  if (!selectedIds.value.length) return
  saving.value = true
  let successCount = 0
  let failCount = 0
  for (const id of selectedIds.value) {
    try {
      await NhanVienService.delete(id)
      successCount++
    } catch (_) {
      failCount++
    }
  }
  selectedIds.value = []
  saving.value = false
  getBulkDeleteStaffModal()?.hide()
  noticeType.value = failCount > 0 ? 'danger' : 'success'
  notice.value = `Đã xóa ${successCount} nhân viên.` + (failCount > 0 ? ` Thất bại ${failCount} nhân viên.` : '')
  await retrieveStaff()
}

onMounted(() => {
  retrieveStaff()
})
</script>

<style scoped>
.page-shell {
  background-color: #f3f6f9;
  min-height: 100vh;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}

.table tbody tr {
  transition: background-color 0.15s ease;
}
</style>
