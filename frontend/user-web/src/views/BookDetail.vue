<template>
  <div class="page-shell py-5">
    <div class="container">
      <div v-if="book" class="row justify-content-center">
        <div class="col-lg-10">
          <BaseCard class="overflow-hidden shadow-sm border-0">
            <div class="row g-0">
              <div class="col-md-5 col-lg-4 bg-light">
                <img
                  :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
                  class="img-fluid w-100 h-100 object-fit-cover"
                  style="min-height: 100%;"
                  :alt="book.TenSach"
                />
              </div>
              <div class="col-md-7 col-lg-8">
                <div class="p-4 p-lg-5 d-flex flex-column h-100">
                  <div class="mb-2">
                    <span class="badge bg-warning text-dark border border-warning-subtle rounded-pill px-3 py-2">
                      {{ book.TheLoai || 'Khác' }}
                    </span>
                  </div>
                  <h2 class="font-display fw-bold text-dark mt-2 mb-1">{{ book.TenSach }}</h2>
                  <p class="text-muted-custom fs-5 mb-4"><i class="fas fa-pen-nib me-2"></i>{{ book.TacGia || 'Tác giả không rõ' }}</p>

                  <div class="row g-3 mb-4 bg-light rounded-4 p-3">
                    <div class="col-6 col-sm-3">
                      <div class="text-muted-custom small mb-1">Số quyển còn</div>
                      <div class="fw-bold text-primary fs-5">{{ book.SoQuyen || 0 }}</div>
                    </div>
                    <div class="col-6 col-sm-3">
                      <div class="text-muted-custom small mb-1">Ngôn ngữ</div>
                      <div class="fw-semibold text-dark">{{ book.NgonNgu || 'Tiếng Việt' }}</div>
                    </div>
                    <div class="col-6 col-sm-3">
                      <div class="text-muted-custom small mb-1">Năm xuất bản</div>
                      <div class="fw-semibold text-dark">{{ book.NamXuatBan || 'Không rõ' }}</div>
                    </div>
                    <div class="col-6 col-sm-3">
                      <div class="text-muted-custom small mb-1">Đơn giá</div>
                      <div class="fw-bold text-accent">{{ formatPrice(book.DonGia) }}</div>
                    </div>
                  </div>

                  <div class="mb-4 flex-grow-1">
                    <h6 class="fw-bold text-dark mb-2">Giới thiệu nội dung</h6>
                    <p class="text-muted-custom" style="line-height: 1.7;">
                      {{ book.MoTa || 'Chưa có mô tả chi tiết cho cuốn sách này. Xin vui lòng liên hệ thư viện để biết thêm thông tin.' }}
                    </p>
                  </div>

                  <div class="d-flex gap-3 flex-wrap align-items-center mt-auto pt-4 border-top">
                    <!-- Chọn số lượng -->
                    <div class="d-flex align-items-center border rounded-pill px-3 py-1 gap-2 bg-light">
                      <button type="button" class="btn btn-sm p-0 border-0 text-muted" @click="soLuong = Math.max(1, soLuong - 1)">
                        <i class="fas fa-minus"></i>
                      </button>
                      <span class="fw-bold text-dark px-2" style="min-width:24px; text-align:center;">{{ soLuong }}</span>
                      <button type="button" class="btn btn-sm p-0 border-0 text-muted" @click="soLuong = Math.min(maxBorrow, soLuong + 1)">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <span class="text-muted-custom small">quyển (tối đa {{ maxBorrow }})</span>

                    <BaseButton
                      variant="primary"
                      class="px-5 py-2 rounded-pill fw-bold shadow-sm"
                      @click="openBorrowModal"
                      :disabled="!book.SoQuyen || book.SoQuyen <= 0"
                    >
                      <i class="fas fa-hand-holding-heart me-2"></i>
                      Mượn sách
                    </BaseButton>
                    <router-link to="/sach" class="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold">
                      <i class="fas fa-arrow-left me-2"></i> Quay lại
                    </router-link>
                  </div>

                  <div v-if="message" class="alert mt-4 mb-0 py-3 rounded-4 d-flex align-items-center gap-3" :class="messageType === 'success' ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'" role="alert">
                    <i class="fas fa-2x" :class="messageType === 'success' ? 'fa-check-circle text-success' : 'fa-exclamation-circle text-danger'"></i>
                    <div>
                      <h6 class="alert-heading fw-bold mb-1">{{ messageType === 'success' ? 'Thành công!' : 'Lỗi!' }}</h6>
                      <div class="mb-0">{{ message }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <div v-else-if="fetchError" class="empty-state text-center py-5 bg-white rounded-4 shadow-sm border">
        <div class="text-danger mb-3">
          <i class="fas fa-exclamation-triangle fa-3x opacity-75"></i>
        </div>
        <h4 class="fw-bold text-dark">Lỗi tải dữ liệu</h4>
        <p class="text-muted-custom">Không tìm thấy sách hoặc đã có lỗi xảy ra.</p>
        <router-link to="/sach" class="btn btn-primary rounded-pill px-4 mt-2">Quay lại danh sách</router-link>
      </div>

      <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL XÁC NHẬN MƯỢN SÁCH ===== -->
  <teleport to="body">
    <div v-if="showModal" class="modal-backdrop-custom" @click.self="showModal = false">
      <div class="borrow-modal rounded-4 shadow-lg p-4 p-md-5">
        <!-- Header -->
        <div class="d-flex align-items-center gap-3 mb-4">
          <div class="modal-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width:48px;height:48px;">
            <i class="fas fa-book-open fs-5"></i>
          </div>
          <div>
            <h5 class="fw-bold mb-0 font-display">Xác nhận mượn sách</h5>
            <p class="text-muted-custom small mb-0">Kiểm tra thông tin trước khi gửi yêu cầu</p>
          </div>
          <button type="button" class="btn-close ms-auto" @click="showModal = false"></button>
        </div>

        <!-- Book info summary -->
        <div class="book-summary rounded-3 p-3 mb-4 d-flex gap-3 align-items-center">
          <img
            :src="book?.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=80&q=80'"
            class="rounded-2 flex-shrink-0"
            style="width:56px;height:72px;object-fit:cover;"
            :alt="book?.TenSach"
          />
          <div class="min-w-0">
            <div class="fw-bold text-dark text-truncate">{{ book?.TenSach }}</div>
            <div class="text-muted-custom small mb-1">{{ book?.TacGia || 'Tác giả không rõ' }}</div>
            <span class="badge bg-primary bg-opacity-10 text-primary">{{ soLuong }} quyển</span>
          </div>
        </div>

        <!-- Date pickers -->
        <div class="row g-3 mb-4">
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-dark">
              <i class="fas fa-calendar-day me-1 text-primary"></i> Ngày đến mượn
            </label>
            <input
              type="date"
              class="form-control rounded-3"
              v-model="ngayMuon"
              :min="todayStr"
            />
            <div class="form-text">Ngày bạn sẽ đến thư viện nhận sách</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-dark">
              <i class="fas fa-calendar-check me-1 text-success"></i> Ngày trả sách
            </label>
            <input
              type="date"
              class="form-control rounded-3"
              v-model="ngayTra"
              :min="ngayMuon || todayStr"
            />
            <div class="form-text">Mặc định 20 ngày kể từ ngày mượn</div>
          </div>
        </div>

        <!-- Summary info -->
        <div class="info-box rounded-3 p-3 mb-4 small">
          <div class="row g-2">
            <div class="col-6">
              <span class="text-muted-custom">Số quyển:</span>
              <span class="fw-bold text-dark ms-1">{{ soLuong }} quyển</span>
            </div>
            <div class="col-6">
              <span class="text-muted-custom">Thời hạn:</span>
              <span class="fw-bold text-dark ms-1">{{ borrowDays }} ngày</span>
            </div>
            <div class="col-6">
              <span class="text-muted-custom">Ngày mượn:</span>
              <span class="fw-bold text-dark ms-1">{{ formatDisplayDate(ngayMuon) }}</span>
            </div>
            <div class="col-6">
              <span class="text-muted-custom">Hạn trả:</span>
              <span class="fw-bold text-success ms-1">{{ formatDisplayDate(ngayTra) }}</span>
            </div>
          </div>
        </div>

        <!-- Error inside modal -->
        <div v-if="modalError" class="alert alert-danger py-2 small mb-3 rounded-3">
          <i class="fas fa-exclamation-circle me-1"></i> {{ modalError }}
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="showModal = false">
            Huỷ
          </button>
          <button
            type="button"
            class="btn btn-primary rounded-pill px-4 fw-bold"
            @click="confirmBorrow"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-paper-plane me-2"></i>
            {{ loading ? 'Đang gửi...' : 'Xác nhận mượn' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SachService from '@/services/sach.service'
import MuonSachService from '@/services/muonsach.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()

const book = ref(null)
const soLuong = ref(1)
const loading = ref(false)
const fetchError = ref(false)
const message = ref('')
const messageType = ref('success')

// ---- Modal state ----
const showModal = ref(false)
const modalError = ref('')

// Tối đa mỗi lần mượn: không quá 10 quyển và không vượt tồn kho
const maxBorrow = computed(() => {
  if (!book.value?.SoQuyen) return 1
  return Math.min(10, book.value.SoQuyen)
})

// ---- Date helpers ----
const todayStr = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const defaultReturnDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 20)
  return d.toISOString().split('T')[0]
})

const ngayMuon = ref(todayStr.value)
const ngayTra = ref(defaultReturnDate.value)

const borrowDays = computed(() => {
  if (!ngayMuon.value || !ngayTra.value) return 0
  const diff = new Date(ngayTra.value) - new Date(ngayMuon.value)
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
})

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ---- Actions ----
const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const fetchBook = async () => {
  try {
    const response = await SachService.getById(props.id)
    book.value = response.data || null
    if (!book.value) fetchError.value = true
  } catch (error) {
    console.error('Không thể tải thông tin sách:', error)
    fetchError.value = true
  }
}

const openBorrowModal = () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  // Reset dates mỗi lần mở
  ngayMuon.value = todayStr.value
  ngayTra.value = defaultReturnDate.value
  modalError.value = ''
  showModal.value = true
}

const confirmBorrow = async () => {
  modalError.value = ''

  if (!ngayMuon.value || !ngayTra.value) {
    modalError.value = 'Vui lòng chọn ngày mượn và ngày trả.'
    return
  }
  if (new Date(ngayTra.value) <= new Date(ngayMuon.value)) {
    modalError.value = 'Ngày trả phải sau ngày mượn ít nhất 1 ngày.'
    return
  }

  loading.value = true
  try {
    await MuonSachService.create({
      sachId: props.id,
      soLuong: soLuong.value,
      ngayMuon: ngayMuon.value,
      ngayTra: ngayTra.value,
    })
    showModal.value = false
    message.value = `Yêu cầu mượn ${soLuong.value} quyển đã được gửi thành công. Vui lòng chờ thủ thư duyệt.`
    messageType.value = 'success'
  } catch (error) {
    modalError.value = error?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBook()
})
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}

.text-accent {
  color: var(--bs-warning);
}

/* Modal */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.borrow-modal {
  background: white;
  width: 100%;
  max-width: 520px;
  animation: slideUp 0.25s ease;
}

.book-summary {
  background: var(--bs-body-bg, #f8f9fa);
  border: 1px solid rgba(0,0,0,0.07);
}

.info-box {
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.06) 0%, rgba(var(--bs-success-rgb), 0.04) 100%);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.15);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
