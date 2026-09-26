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
                    <BaseButton 
                      variant="primary" 
                      class="px-5 py-2 rounded-pill fw-bold shadow-sm" 
                      @click="borrowBook" 
                      :disabled="loading || (book.SoQuyen && book.SoQuyen <= 0)"
                    >
                      <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
                      <i v-else class="fas fa-hand-holding-heart me-2"></i>
                      {{ loading ? 'Đang xử lý...' : 'Mượn sách' }}
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const loading = ref(false)
const fetchError = ref(false)
const message = ref('')
const messageType = ref('success')

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

const borrowBook = async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }

  loading.value = true
  message.value = ''

  try {
    await MuonSachService.create({
      sachId: props.id,
      soLuong: 1,
    })

    message.value = 'Yêu cầu mượn sách đã được gửi thành công. Vui lòng chờ thủ thư duyệt.'
    messageType.value = 'success'
  } catch (error) {
    message.value = error?.response?.data?.message || 'Không thể gửi yêu cầu mượn sách. Có thể bạn đã mượn cuốn này.'
    messageType.value = 'error'
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
</style>
