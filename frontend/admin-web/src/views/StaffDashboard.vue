<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">Dashboard</h2>
          <p class="text-muted-custom mb-0">Quản lý các yêu cầu mượn trả sách</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <BaseCard class="h-100 border-0 shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-warning-subtle text-warning rounded-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                <i class="fas fa-clock fa-2x"></i>
              </div>
              <div>
                <div class="text-muted-custom small fw-semibold">Yêu Cầu Chờ Xử Lý</div>
                <h3 class="fw-bold mb-0 text-dark">{{ pendingCount }}</h3>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="col-md-4">
          <BaseCard class="h-100 border-0 shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                <i class="fas fa-book-reader fa-2x"></i>
              </div>
              <div>
                <div class="text-muted-custom small fw-semibold">Sách Đang Mượn</div>
                <h3 class="fw-bold mb-0 text-dark">{{ borrowedCount }}</h3>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="col-md-4">
          <BaseCard class="h-100 border-0 shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                <i class="fas fa-undo fa-2x"></i>
              </div>
              <div>
                <div class="text-muted-custom small fw-semibold">Yêu Cầu Trả</div>
                <h3 class="fw-bold mb-0 text-dark">{{ returnCount }}</h3>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Filters & Search -->
      <BaseCard class="mb-4 border-0 shadow-sm">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <!-- Search -->
          <div class="input-group" style="max-width: 350px;">
            <span class="input-group-text bg-white border-end-0 text-muted"><i class="fas fa-search"></i></span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-start-0 ps-0" 
              placeholder="Tìm kiếm độc giả, mã sách..."
              @input="handleSearch"
            />
          </div>

          <!-- Tabs -->
          <div class="btn-group" role="group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradio1" value="CHO_XU_LY" v-model="activeTab" @change="handleSearch">
            <label class="btn btn-outline-primary fw-medium px-4" for="btnradio1">Chờ Xử Lý</label>

            <input type="radio" class="btn-check" name="btnradio" id="btnradio2" value="DA_MUON" v-model="activeTab" @change="handleSearch">
            <label class="btn btn-outline-primary fw-medium px-4" for="btnradio2">Đang Mượn</label>

            <input type="radio" class="btn-check" name="btnradio" id="btnradio3" value="CHO_TRA" v-model="activeTab" @change="handleSearch">
            <label class="btn btn-outline-primary fw-medium px-4" for="btnradio3">Yêu Cầu Trả</label>
          </div>
        </div>
      </BaseCard>

      <!-- Table -->
      <BaseCard class="border-0 shadow-sm overflow-hidden p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 border-top">
            <thead class="table-light text-muted-custom">
              <tr>
                <th class="ps-4 py-3 fw-semibold">STT</th>
                <th class="py-3 fw-semibold">Độc Giả</th>
                <th class="py-3 fw-semibold">Sách</th>
                <th class="py-3 fw-semibold">Ngày Mượn</th>
                <th class="py-3 fw-semibold">Hạn Trả</th>
                <th class="py-3 fw-semibold">Trạng Thái</th>
                <th class="py-3 fw-semibold text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredData.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <div class="mb-2"><i class="fas fa-inbox fa-2x opacity-50"></i></div>
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
              <tr v-for="(item, index) in paginatedData" :key="item._id">
                <td class="ps-4 text-muted fw-medium">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="fw-semibold text-dark">{{ item.maDocGia?.Ten || item.maDocGia?.HoLot || item.maDocGia?.tenDocGia || '-' }}</td>
                <td>
                  <span class="d-inline-block text-truncate text-dark fw-medium" style="max-width: 200px;" :title="item.maSach?.TenSach || item.maSach?.tenSach">
                    {{ item.maSach?.TenSach || item.maSach?.tenSach || '-' }}
                  </span>
                </td>
                <td>{{ formatDate(item.NgayMuon || item.ngayMuon) }}</td>
                <td>{{ formatDate(item.NgayHenTra || item.hanTra) }}</td>
                <td>
                  <span class="badge rounded-pill px-3 py-2 fw-medium border" :class="getStatusClass(item.TrangThai || item.trangThai)">
                    {{ getStatusLabel(item.TrangThai || item.trangThai) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-2">
                    <button 
                      v-if="(item.TrangThai || item.trangThai) === 'CHO_XU_LY'"
                      class="btn btn-sm btn-success rounded-circle shadow-sm icon-btn"
                      @click="openConfirmModal(item)"
                      title="Duyệt mượn"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      v-if="(item.TrangThai || item.trangThai) === 'DA_MUON'"
                      class="btn btn-sm btn-primary rounded-circle shadow-sm icon-btn"
                      @click="openReturnModal(item)"
                      title="Xác nhận trả"
                    >
                      <i class="fas fa-undo"></i>
                    </button>
                    <button 
                      v-if="(item.TrangThai || item.trangThai) === 'CHO_XU_LY' || (item.TrangThai || item.trangThai) === 'DA_MUON'"
                      class="btn btn-sm btn-danger rounded-circle shadow-sm icon-btn"
                      @click="rejectRequest(item._id)"
                      title="Từ chối / Hủy"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-4" v-if="totalPages > 1">
        <div class="btn-group shadow-sm rounded-pill overflow-hidden">
          <button class="btn btn-light border" :disabled="currentPage === 1" @click="currentPage--">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="btn btn-light border-top border-bottom fw-medium px-4 text-dark" style="pointer-events: none;">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          <button class="btn btn-light border" :disabled="currentPage === totalPages" @click="currentPage++">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals (Custom Simple Modals for now to avoid Bootstrap JS dependency issues) -->
    <!-- Confirm Borrow Modal -->
    <div v-if="showConfirmModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <BaseCard class="modal-card border-0 shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-dark">Duyệt Phiếu Mượn</h5>
          <button class="btn-close" @click="closeConfirmModal"></button>
        </div>
        <div v-if="selectedItem" class="mb-4">
          <div class="bg-light p-3 rounded-3 mb-3">
            <div class="row mb-2">
              <div class="col-4 text-muted-custom small">Độc giả:</div>
              <div class="col-8 fw-semibold text-dark">{{ selectedItem.maDocGia?.Ten || selectedItem.maDocGia?.tenDocGia }}</div>
            </div>
            <div class="row mb-2">
              <div class="col-4 text-muted-custom small">Sách:</div>
              <div class="col-8 fw-semibold text-dark">{{ selectedItem.maSach?.TenSach || selectedItem.maSach?.tenSach }}</div>
            </div>
            <div class="row">
              <div class="col-4 text-muted-custom small">Hạn trả:</div>
              <div class="col-8 fw-semibold text-primary">{{ formatDate(selectedItem.NgayHenTra || selectedItem.hanTra) }}</div>
            </div>
          </div>
          <p class="mb-0 text-muted-custom small">Xác nhận cho độc giả này mượn quyển sách trên?</p>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton variant="outline-secondary" @click="closeConfirmModal">Hủy bỏ</BaseButton>
          <BaseButton variant="success" @click="confirmBorrow" :disabled="loadingAction">
            <i class="fas fa-check me-2"></i> Xác nhận mượn
          </BaseButton>
        </div>
      </BaseCard>
    </div>

    <!-- Confirm Return Modal -->
    <div v-if="showReturnModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <BaseCard class="modal-card border-0 shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0 text-dark">Xác Nhận Trả Sách</h5>
          <button class="btn-close" @click="closeReturnModal"></button>
        </div>
        <div v-if="selectedItem" class="mb-4">
          <div class="bg-light p-3 rounded-3 mb-3">
            <div class="row mb-2">
              <div class="col-4 text-muted-custom small">Độc giả:</div>
              <div class="col-8 fw-semibold text-dark">{{ selectedItem.maDocGia?.Ten || selectedItem.maDocGia?.tenDocGia }}</div>
            </div>
            <div class="row mb-2">
              <div class="col-4 text-muted-custom small">Sách:</div>
              <div class="col-8 fw-semibold text-dark">{{ selectedItem.maSach?.TenSach || selectedItem.maSach?.tenSach }}</div>
            </div>
            <div class="row">
              <div class="col-4 text-muted-custom small">Ngày mượn:</div>
              <div class="col-8 fw-semibold text-primary">{{ formatDate(selectedItem.NgayMuon || selectedItem.ngayMuon) }}</div>
            </div>
          </div>
          <p class="mb-0 text-muted-custom small">Sách đã được thu hồi và xác nhận tình trạng tốt?</p>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton variant="outline-secondary" @click="closeReturnModal">Hủy bỏ</BaseButton>
          <BaseButton variant="primary" @click="confirmReturn" :disabled="loadingAction">
            <i class="fas fa-undo me-2"></i> Xác nhận trả
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MuonSachService from "@/services/muonsach.service"
import AuthService from "@/services/auth.service"
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const muonSachList = ref([])
const filteredData = ref([])
const searchQuery = ref('')
const activeTab = ref('CHO_XU_LY')
const currentPage = ref(1)
const pageSize = 10
const currentUser = ref(null)

const showConfirmModal = ref(false)
const showReturnModal = ref(false)
const selectedItem = ref(null)
const loadingAction = ref(false)

// Cập nhật lại enum matching với backend (Backend sử dụng ChoDuyet, DangMuon, DaTra, QuaHan, TuChoi)
// Note: code cũ xài CHO_XU_LY, DA_MUON, v.v., ta sẽ cần điều chỉnh lại data nếu BE trả về khác.
// Vì UI filter yêu cầu 3 tab, ta map cho linh hoạt
const enumMap = {
  'CHO_XU_LY': ['choduyet', 'cho_xu_ly'],
  'DA_MUON': ['dangmuon', 'da_muon', 'quahan'],
  'CHO_TRA': ['dangmuon', 'cho_tra'] // Nếu không có trạng thái chờ trả, gộp vào Đang Mượn.
}

const pendingCount = computed(() => muonSachList.value.filter(i => {
  const t = String(i.TrangThai || i.trangThai).toLowerCase();
  return enumMap['CHO_XU_LY'].includes(t);
}).length)

const borrowedCount = computed(() => muonSachList.value.filter(i => {
  const t = String(i.TrangThai || i.trangThai).toLowerCase();
  return enumMap['DA_MUON'].includes(t);
}).length)

const returnCount = computed(() => muonSachList.value.filter(i => {
  const t = String(i.TrangThai || i.trangThai).toLowerCase();
  return t === 'dangmuon' || t === 'da_muon'; // Tạm thay bằng đang mượn
}).length)

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize) || 1)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

const fetchAll = async () => {
  try {
    const response = await MuonSachService.getAll()
    muonSachList.value = response.data || []
    applyFilter()
  } catch (error) {
    console.error("Lỗi khi tải danh sách mượn sách:", error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  applyFilter()
}

const applyFilter = () => {
  let filtered = muonSachList.value.filter(item => {
    const t = String(item.TrangThai || item.trangThai).toLowerCase();
    return enumMap[activeTab.value].includes(t);
  })

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => {
      const dgTen = (item.maDocGia?.Ten || item.maDocGia?.tenDocGia || '').toLowerCase()
      const sTen = (item.maSach?.TenSach || item.maSach?.tenSach || '').toLowerCase()
      const dgId = (item.maDocGia?._id || '').toLowerCase()
      const sId = (item.maSach?._id || '').toLowerCase()
      return dgTen.includes(query) || sTen.includes(query) || dgId.includes(query) || sId.includes(query)
    })
  }
  
  filteredData.value = filtered
}

const openConfirmModal = (item) => {
  selectedItem.value = item
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  selectedItem.value = null
}

const confirmBorrow = async () => {
  if (!selectedItem.value) return
  loadingAction.value = true
  try {
    // API Duyệt yêu cầu mượn
    await MuonSachService.update(selectedItem.value._id, {
      trangThai: "DangMuon",
      nhanVienId: currentUser.value?._id,
    })
    closeConfirmModal()
    await fetchAll()
  } catch (error) {
    alert("Lỗi: " + (error.response?.data?.message || error.message))
  } finally {
    loadingAction.value = false
  }
}

const openReturnModal = (item) => {
  selectedItem.value = item
  showReturnModal.value = true
}

const closeReturnModal = () => {
  showReturnModal.value = false
  selectedItem.value = null
}

const confirmReturn = async () => {
  if (!selectedItem.value) return
  loadingAction.value = true
  try {
    // API Xác nhận trả
    await MuonSachService.update(selectedItem.value._id, {
      trangThai: "DaTra",
      nhanVienId: currentUser.value?._id,
    })
    closeReturnModal()
    await fetchAll()
  } catch (error) {
    alert("Lỗi: " + (error.response?.data?.message || error.message))
  } finally {
    loadingAction.value = false
  }
}

const rejectRequest = async (id) => {
  if (!confirm("Bạn chắc chắn muốn từ chối / hủy yêu cầu này?")) return
  try {
    await MuonSachService.update(id, {
      trangThai: "TuChoi",
      nhanVienId: currentUser.value?._id,
    })
    await fetchAll()
  } catch (error) {
    alert("Lỗi: " + (error.response?.data?.message || error.message))
  }
}

const formatDate = (date) => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("vi-VN")
}

const getStatusLabel = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('choduyet') || s.includes('cho_xu_ly')) return "Chờ Duyệt"
  if (s.includes('dangmuon') || s.includes('da_muon')) return "Đang Mượn"
  if (s.includes('datra') || s.includes('da_tra')) return "Đã Trả"
  if (s.includes('tuchoi') || s.includes('tu_choi')) return "Từ Chối"
  if (s.includes('quahan')) return "Quá Hạn"
  return "Chờ Xử Lý"
}

const getStatusClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('choduyet') || s.includes('cho_xu_ly')) return "bg-warning text-dark border-warning-subtle"
  if (s.includes('dangmuon') || s.includes('da_muon')) return "bg-primary text-white border-primary-subtle"
  if (s.includes('datra') || s.includes('da_tra')) return "bg-success text-white border-success-subtle"
  if (s.includes('tuchoi') || s.includes('tu_choi') || s.includes('quahan')) return "bg-danger text-white border-danger-subtle"
  return "bg-secondary text-white"
}

onMounted(() => {
  currentUser.value = AuthService.getCurrentUser()
  fetchAll()
})
</script>

<style scoped>
.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s;
}
.icon-btn:hover {
  transform: scale(1.1);
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1050;
}

.modal-card {
  width: 90%;
  max-width: 450px;
  border-radius: 16px;
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.btn-check:checked + .btn-outline-primary {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}
</style>
