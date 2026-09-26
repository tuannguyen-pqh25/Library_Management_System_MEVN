<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Nhà Xuất Bản
          </h2>
          <p class="text-muted-custom mb-0">Xem và quản lý danh sách các nhà xuất bản</p>
        </div>
        <BaseButton variant="primary" class="fw-bold px-4 shadow-sm rounded-pill d-flex align-items-center justify-content-center" @click="openAddModal">
          <i class="fas fa-plus me-2"></i> Thêm NXB Mới
        </BaseButton>
      </div>

      <!-- Search & Actions Card -->
      <BaseCard class="mb-4 border-0 shadow-sm rounded-4">
        <div class="row g-3 align-items-center justify-content-between">
          <div class="col-md-6 col-lg-5">
            <div class="input-group input-group-lg">
              <span class="input-group-text bg-light border-end-0 text-muted">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control bg-light border-start-0 ps-0 text-dark"
                placeholder="Tìm kiếm nhà xuất bản..."
                v-model="searchText"
                @keyup.enter="search"
              />
            </div>
          </div>
          <!-- Items Per Page -->
          <div class="col-md-4 text-md-end">
            <div class="d-flex align-items-center justify-content-md-end gap-2">
                <label class="text-muted-custom fw-semibold small text-nowrap">Hiển thị:</label>
                <select 
                    class="form-select w-auto bg-light border-0 fw-bold text-primary shadow-none cursor-pointer rounded-pill px-3" 
                    v-model="itemsPerPage" 
                    @change="currentPage = 1"
                >
                    <option :value="5">5 dòng</option>
                    <option :value="10">10 dòng</option>
                    <option :value="15">15 dòng</option>
                    <option :value="20">20 dòng</option>
                    <option :value="50">50 dòng</option>
                </select>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Data Table Card -->
      <BaseCard class="border-0 shadow-sm rounded-4 overflow-hidden p-0">
        <div class="bg-white pt-4 pb-3 px-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="bg-primary-subtle text-primary rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="fas fa-building fa-lg"></i>
            </div>
            <h5 class="mb-0 fw-bold text-dark">Danh sách Nhà Xuất Bản</h5>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted-custom">
              <tr>
                <th class="fw-semibold text-uppercase small ps-4 py-3">STT</th>
                <th class="fw-semibold text-uppercase small py-3">Mã NXB</th>
                <th class="fw-semibold text-uppercase small py-3">Tên Nhà Xuất Bản</th>
                <th class="fw-semibold text-uppercase small py-3">Địa Chỉ</th>
                <th class="fw-semibold text-uppercase small py-3 text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="(nxb, index) in paginatedNXB" :key="nxb._id">
                <td class="text-muted fw-bold ps-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                      <span class="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill me-2 font-monospace">
                        {{ nxb.MaNXB }}
                      </span>
                      <!-- Nút copy nhỏ kế bên -->
                      <button 
                        class="btn btn-sm btn-light text-secondary rounded-circle shadow-sm copy-btn d-flex align-items-center justify-content-center" 
                        @click="copyToClipboard(nxb.MaNXB)"
                        title="Sao chép mã"
                        style="width: 32px; height: 32px;"
                      >
                        <i v-if="copiedId === nxb.MaNXB" class="fas fa-check text-success"></i>
                        <i v-else class="fas fa-copy"></i>
                      </button>
                  </div>
                </td>
                <td class="fw-semibold text-dark">{{ nxb.TenNXB }}</td>
                <td class="text-secondary">
                  <i class="fas fa-map-marker-alt me-2 text-danger opacity-75"></i> 
                  <span class="text-dark">{{ nxb.DiaChi }}</span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-light text-warning rounded-circle action-btn shadow-sm me-2" @click="openEditModal(nxb)" title="Chỉnh sửa">
                      <i class="fas fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger rounded-circle action-btn shadow-sm" @click="deleteNxb(nxb._id, nxb.TenNXB)" title="Xóa">
                      <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedNXB.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <div class="mb-3"><i class="fas fa-inbox fa-3x opacity-25"></i></div>
                  <p class="mb-0 fw-medium">Không tìm thấy dữ liệu phù hợp.</p>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white py-3 px-4 border-top d-flex justify-content-center" v-if="!loading && totalPages > 1">
          <div class="btn-group shadow-sm rounded-pill overflow-hidden">
            <button class="btn btn-light border" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="btn btn-light border-top border-bottom fw-medium px-4 text-dark" style="pointer-events: none;">
              Trang {{ currentPage }} / {{ totalPages }}
            </span>
            <button class="btn btn-light border" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- Add/Edit Modal -->
      <div class="modal fade" id="nxbModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg overflow-hidden rounded-4">
            
            <div class="modal-header bg-primary text-white py-3 px-4 border-0">
              <h5 class="modal-title fw-bold">
                <i class="fas me-2" :class="isEdit ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEdit ? 'Cập Nhật NXB' : 'Thêm Nhà Xuất Bản Mới' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body bg-light p-4">
               <Form @submit="saveNxb" :validation-schema="nxbSchema" v-slot="{ errors }">
                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-muted">Mã Nhà Xuất Bản <span class="text-danger">*</span></label>
                        <Field name="MaNXB" type="text" class="form-control bg-white border-0 shadow-sm" :class="{'is-invalid': errors.MaNXB}" placeholder="VD: NXB01" v-model="formData.MaNXB" />
                        <ErrorMessage name="MaNXB" class="invalid-feedback small" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-muted">Tên Nhà Xuất Bản <span class="text-danger">*</span></label>
                        <Field name="TenNXB" type="text" class="form-control bg-white border-0 shadow-sm" :class="{'is-invalid': errors.TenNXB}" placeholder="Tên đầy đủ NXB..." v-model="formData.TenNXB" />
                        <ErrorMessage name="TenNXB" class="invalid-feedback small" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-muted">Địa Chỉ <span class="text-danger">*</span></label>
                        <Field name="DiaChi" type="text" class="form-control bg-white border-0 shadow-sm" :class="{'is-invalid': errors.DiaChi}" placeholder="Địa chỉ chi tiết..." v-model="formData.DiaChi" />
                        <ErrorMessage name="DiaChi" class="invalid-feedback small" />
                    </div>
                    <div class="d-flex justify-content-end mt-4">
                        <BaseButton variant="light" type="button" class="px-4 fw-medium me-2" data-bs-dismiss="modal">Hủy</BaseButton>
                        <BaseButton type="submit" variant="primary" class="px-4 fw-bold shadow-sm rounded-pill">
                            <i class="fas fa-save me-2"></i> {{ isEdit ? 'Lưu Thay Đổi' : 'Thêm NXB' }}
                        </BaseButton>
                    </div>
               </Form>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Toast Notification -->
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
    <div id="nxbSuccessToast" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body fw-medium d-flex align-items-center">
          <i class="fas fa-check-circle me-2 fs-5"></i>
          {{ notificationMessage }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal, Toast } from "bootstrap"
import { Form, Field, ErrorMessage } from "vee-validate"
import * as yup from "yup"
import NhaXuatBanService from "@/services/nhaxuatban.service"
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const nxbSchema = yup.object().shape({
  MaNXB: yup.string().required("Mã NXB là bắt buộc").max(10, "Tối đa 10 ký tự"),
  TenNXB: yup.string().required("Tên NXB là bắt buộc").max(200, "Tối đa 200 ký tự"),
  DiaChi: yup.string().required("Địa chỉ là bắt buộc").max(500, "Tối đa 500 ký tự")
})

const nhaXuatBans = ref([])
const loading = ref(true)
const searchText = ref("")

const currentPage = ref(1)
const itemsPerPage = ref(10) 
const copiedId = ref(null)

const isEdit = ref(false)
const notificationMessage = ref("")
const formData = ref({ MaNXB: "", TenNXB: "", DiaChi: "" })
let nxbModalInstance = null
let toastInstance = null

const filteredNXB = computed(() => {
  if (!searchText.value) return nhaXuatBans.value
  
  const lowerSearch = searchText.value.toLowerCase()
  return nhaXuatBans.value.filter(
    (nxb) =>
      nxb.TenNXB.toLowerCase().includes(lowerSearch) ||
      nxb.MaNXB.toLowerCase().includes(lowerSearch)
  )
})

const totalPages = computed(() => Math.ceil(filteredNXB.value.length / itemsPerPage.value) || 1)

const paginatedNXB = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNXB.value.slice(start, end)
})

const retrieveNXB = async () => {
  loading.value = true
  try {
    const response = await NhaXuatBanService.getAll()
    nhaXuatBans.value = response.data || []
  } catch (error) {
    console.error("Lỗi khi tải danh sách NXB:", error)
  } finally {
    loading.value = false
  }
}

const search = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  currentPage.value = page
}

const openAddModal = () => {
  isEdit.value = false
  formData.value = { MaNXB: "", TenNXB: "", DiaChi: "" }
  nxbModalInstance?.show()
}

const openEditModal = (nxb) => {
  isEdit.value = true
  formData.value = { ...nxb }
  nxbModalInstance?.show()
}

const saveNxb = async () => {
  try {
    if (isEdit.value) {
      await NhaXuatBanService.update(formData.value._id, formData.value)
      notificationMessage.value = "Cập nhật NXB thành công!"
    } else {
      await NhaXuatBanService.create(formData.value)
      notificationMessage.value = "Thêm NXB thành công!"
    }
    await retrieveNXB()
    nxbModalInstance?.hide()
    toastInstance?.show()
  } catch (error) {
    console.error("Lỗi lưu NXB:", error)
    alert(error.response?.data?.message || "Lỗi khi lưu NXB")
  }
}

const deleteNxb = async (id, name) => {
  if (confirm(`Bạn có chắc muốn xóa NXB "${name}" không?`)) {
    try {
      await NhaXuatBanService.delete(id)
      notificationMessage.value = "Xóa NXB thành công!"
      await retrieveNXB()
      toastInstance?.show()
    } catch (error) {
      console.error("Lỗi xóa NXB:", error)
      alert("Lỗi khi xóa NXB")
    }
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = text
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error("Failed to copy:", err)
    alert("Không thể sao chép. Vui lòng thử lại.")
  }
}

onMounted(() => {
  retrieveNXB()
  nxbModalInstance = new Modal(document.getElementById("nxbModal"))
  toastInstance = new Toast(document.getElementById("nxbSuccessToast"))
})
</script>

<style scoped>
.input-group:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.15);
  border-radius: var(--bs-border-radius-lg);
}

.table > :not(caption) > * > * {
  padding: 1rem 0.5rem;
}

.copy-btn {
  transition: transform 0.2s;
}
.copy-btn:hover {
  transform: scale(1.1);
}
.cursor-pointer {
  cursor: pointer;
}

.action-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.action-btn:hover {
    transform: scale(1.15);
}
</style>