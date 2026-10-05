<template>
  <div class="page-shell py-5">
    <div class="container">
      <div v-if="book" class="row justify-content-center">
        <div class="col-lg-10">
          <BaseCard class="overflow-hidden shadow-sm border-0">
            <div class="row g-0">
              <!-- Book Cover -->
              <div class="col-md-5 col-lg-4 bg-light">
                <div class="position-relative h-100">
                  <img
                    :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
                    class="img-fluid w-100 h-100 object-fit-cover"
                    style="min-height: 420px;"
                    :alt="book.TenSach"
                  />
                  <!-- Wishlist button overlay -->
                  <button
                    class="btn wishlist-float-btn shadow"
                    :class="isWishlisted ? 'btn-danger' : 'btn-light'"
                    @click="toggleWishlist"
                    :disabled="wishlistLoading"
                    :title="isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                  >
                    <span v-if="wishlistLoading" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="fas" :class="isWishlisted ? 'fa-heart' : 'fa-heart'"></i>
                  </button>
                </div>
              </div>

              <!-- Book Info -->
              <div class="col-md-7 col-lg-8">
                <div class="p-4 p-lg-5 d-flex flex-column h-100">

                  <div class="d-flex align-items-start gap-2 mb-2">
                    <span class="badge bg-warning text-dark border border-warning-subtle rounded-pill px-3 py-2">
                      {{ book.TheLoai || 'Khác' }}
                    </span>
                    <!-- Rating summary badge -->
                    <a href="#reviews-section" class="text-decoration-none">
                      <span v-if="reviewStats.total > 0" class="badge bg-light text-dark border rounded-pill px-3 py-2 d-flex align-items-center gap-1 hover-bg">
                        <i class="fas fa-star text-warning"></i>
                        {{ reviewStats.avgRating.toFixed(1) }}
                        <span class="text-muted-custom" style="font-size:0.75rem;">({{ reviewStats.total }})</span>
                      </span>
                      <span v-else class="badge bg-light text-muted border rounded-pill px-3 py-2 d-flex align-items-center gap-1 hover-bg fw-normal">
                        <i class="far fa-star"></i> Chưa có đánh giá
                      </span>
                    </a>
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

                  <!-- Actions -->
                  <div class="d-flex gap-3 flex-wrap align-items-center mt-auto pt-4 border-top">
                    <!-- Qty picker -->
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

                    <button
                      class="btn btn-outline-primary px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
                      @click="addToCart"
                      :disabled="!book.SoQuyen || book.SoQuyen <= 0"
                    >
                      <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                    <BaseButton
                      variant="primary"
                      class="px-5 py-2 rounded-pill fw-bold shadow-sm"
                      @click="openBorrowModal"
                      :disabled="!book.SoQuyen || book.SoQuyen <= 0"
                    >
                      <i class="fas fa-hand-holding-heart me-2"></i>
                      Mượn ngay
                    </BaseButton>

                    <!-- Wishlist button (mobile-visible) -->
                    <button
                      class="btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                      :class="isWishlisted ? 'btn-danger' : 'btn-outline-danger'"
                      @click="toggleWishlist"
                      :disabled="wishlistLoading"
                    >
                      <span v-if="wishlistLoading" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="fas fa-heart"></i>
                      {{ isWishlisted ? 'Đã yêu thích' : 'Yêu thích' }}
                    </button>

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

          <!-- ===== REVIEWS SECTION ===== -->
          <div id="reviews-section" class="reviews-section mt-4" style="scroll-margin-top: 80px;">
            <BaseCard class="shadow-sm border-0">
              <div class="p-4">
                <!-- Reviews Header -->
                <div class="d-flex align-items-center gap-3 mb-4">
                  <div class="review-icon d-flex align-items-center justify-content-center rounded-3">
                    <i class="fas fa-star text-warning"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold text-dark mb-0">Đánh giá & Nhận xét</h5>
                    <p class="text-muted-custom small mb-0">
                      {{ reviewStats.total }} đánh giá
                      <span v-if="reviewStats.total > 0"> · Trung bình <strong class="text-warning">{{ reviewStats.avgRating.toFixed(1) }} ★</strong></span>
                    </p>
                  </div>

                  <!-- Overall rating display -->
                  <div v-if="reviewStats.total > 0" class="ms-auto text-center d-none d-sm-block">
                    <div class="fw-bold text-dark" style="font-size:2.5rem; line-height:1;">
                      {{ reviewStats.avgRating.toFixed(1) }}
                    </div>
                    <div class="stars-display">
                      <i v-for="s in 5" :key="s" class="fas fa-star" :class="s <= Math.round(reviewStats.avgRating) ? 'text-warning' : 'text-muted opacity-25'"></i>
                    </div>
                    <div class="text-muted-custom small">{{ reviewStats.total }} đánh giá</div>
                  </div>
                </div>

                <!-- Write Review Form (only for logged-in users) -->
                <div v-if="isLoggedIn" class="write-review-box rounded-4 p-4 mb-4">
                  <h6 class="fw-bold mb-3 text-dark">
                    <i class="fas fa-pen me-2 text-primary"></i>
                    {{ myReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá' }}
                  </h6>

                  <!-- Star picker -->
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <span class="text-muted-custom small">Xếp hạng:</span>
                    <div class="star-picker d-flex gap-1">
                      <button
                        v-for="s in 5" :key="s"
                        type="button"
                        class="btn btn-sm p-0 border-0 star-btn"
                        @click="reviewForm.soSao = s"
                        @mouseover="hoverStar = s"
                        @mouseleave="hoverStar = 0"
                      >
                        <i class="fas fa-star" :class="s <= (hoverStar || reviewForm.soSao) ? 'text-warning' : 'text-muted opacity-25'" style="font-size:1.4rem;"></i>
                      </button>
                    </div>
                    <span v-if="reviewForm.soSao" class="text-muted-custom small">{{ starLabels[reviewForm.soSao - 1] }}</span>
                  </div>

                  <!-- Physical condition -->
                  <div class="mb-3">
                    <label class="text-muted-custom small mb-2 d-block">Tình trạng sách (tùy chọn):</label>
                    <div class="d-flex gap-2 flex-wrap">
                      <button
                        v-for="cond in conditions" :key="cond.value"
                        type="button"
                        class="btn btn-sm rounded-pill px-3"
                        :class="reviewForm.tinhTrang === cond.value ? 'btn-primary' : 'btn-outline-secondary'"
                        @click="reviewForm.tinhTrang = reviewForm.tinhTrang === cond.value ? null : cond.value"
                      >
                        <i :class="cond.icon + ' me-1'"></i>{{ cond.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Review text -->
                  <div class="mb-3">
                    <textarea
                      v-model="reviewForm.noiDung"
                      class="form-control rounded-3"
                      rows="3"
                      placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                      maxlength="500"
                    ></textarea>
                    <div class="text-end text-muted-custom small mt-1">{{ reviewForm.noiDung.length }}/500</div>
                  </div>

                  <!-- Error message -->
                  <div v-if="reviewError" class="alert alert-danger py-2 small mb-3 rounded-3">
                    <i class="fas fa-exclamation-triangle me-1"></i> {{ reviewError }}
                  </div>

                  <!-- Submit -->
                  <div class="d-flex gap-2 justify-content-end">
                    <button v-if="myReview" type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="deleteMyReview" :disabled="reviewSubmitting">
                      <i class="fas fa-trash me-1"></i> Xóa
                    </button>
                    <button
                      type="button"
                      class="btn btn-primary rounded-pill px-4 fw-semibold"
                      @click="submitReview"
                      :disabled="!reviewForm.soSao || reviewSubmitting"
                    >
                      <span v-if="reviewSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="fas fa-paper-plane me-1"></i>
                      {{ myReview ? 'Cập nhật' : 'Gửi đánh giá' }}
                    </button>
                  </div>
                </div>

                <!-- Login prompt for guests -->
                <div v-else class="login-prompt rounded-3 p-3 mb-4 text-center">
                  <i class="fas fa-user-circle fa-2x text-muted-custom mb-2"></i>
                  <p class="text-muted-custom mb-2 small">Đăng nhập để viết đánh giá</p>
                  <router-link to="/login" class="btn btn-sm btn-primary rounded-pill px-4">Đăng nhập</router-link>
                </div>

                <!-- Review list -->
                <div v-if="reviews.length" class="reviews-list">
                  <div v-for="review in reviews" :key="review._id" class="review-item p-3 rounded-3 mb-3">
                    <div class="d-flex align-items-start gap-3">
                      <!-- Avatar -->
                      <div class="reviewer-avatar bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0">
                        {{ (review.tenDocGia || 'A').charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-grow-1 min-w-0">
                        <!-- Name + date -->
                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <span class="fw-semibold text-dark">{{ review.tenDocGia || 'Ẩn danh' }}</span>
                          <div class="d-flex gap-1">
                            <i v-for="s in 5" :key="s" class="fas fa-star" :class="s <= review.soSao ? 'text-warning' : 'text-muted opacity-20'" style="font-size:0.75rem;"></i>
                          </div>
                          <!-- Physical condition badge -->
                          <span v-if="review.tinhTrang" class="badge rounded-pill" :class="conditionBadge(review.tinhTrang)">
                            {{ conditionLabel(review.tinhTrang) }}
                          </span>
                          <span class="text-muted-custom ms-auto" style="font-size:0.72rem;">{{ formatDate(review.createdAt) }}</span>
                        </div>
                        <!-- Review text -->
                        <p v-if="review.noiDung" class="text-dark mb-0 small" style="line-height:1.6;">{{ review.noiDung }}</p>
                        <p v-else class="text-muted-custom mb-0 small fst-italic">Không có nhận xét thêm</p>
                      </div>
                    </div>
                  </div>

                  <!-- Pagination -->
                  <div v-if="reviewStats.totalPages > 1" class="d-flex justify-content-center mt-3">
                    <nav>
                      <ul class="pagination pagination-sm mb-0 gap-1">
                        <li class="page-item" :class="{ disabled: reviewPage === 1 }">
                          <button class="page-link rounded-3" @click="loadReviews(reviewPage - 1)">
                            <i class="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        <li v-for="p in reviewStats.totalPages" :key="p" class="page-item" :class="{ active: p === reviewPage }">
                          <button class="page-link rounded-3" @click="loadReviews(p)">{{ p }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: reviewPage === reviewStats.totalPages }">
                          <button class="page-link rounded-3" @click="loadReviews(reviewPage + 1)">
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>

                <!-- No reviews -->
                <div v-else-if="!reviewsLoading" class="text-center py-4 text-muted-custom">
                  <i class="far fa-comment-alt fa-2x mb-2 opacity-40"></i>
                  <p class="small mb-0">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>

                <div v-if="reviewsLoading" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <div v-else-if="fetchError" class="empty-state text-center py-5 bg-white rounded-4 shadow-sm border">
        <div class="text-danger mb-3"><i class="fas fa-exclamation-triangle fa-3x opacity-75"></i></div>
        <h4 class="fw-bold text-dark">Lỗi tải dữ liệu</h4>
        <p class="text-muted-custom">Không tìm thấy sách hoặc đã có lỗi xảy ra.</p>
        <router-link to="/sach" class="btn btn-primary rounded-pill px-4 mt-2">Quay lại danh sách</router-link>
      </div>

      <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL XÁC NHẬN MƯỢN SÁCH ===== -->
  <teleport to="body">
    <div v-if="showModal" class="modal-backdrop-custom" @click.self="showModal = false">
      <div class="borrow-modal rounded-4 shadow-lg p-4 p-md-5">
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

        <div class="book-summary rounded-3 p-3 mb-4 d-flex gap-3 align-items-center">
          <img :src="book?.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=80&q=80'" class="rounded-2 flex-shrink-0" style="width:56px;height:72px;object-fit:cover;" :alt="book?.TenSach"/>
          <div class="min-w-0">
            <div class="fw-bold text-dark text-truncate">{{ book?.TenSach }}</div>
            <div class="text-muted-custom small mb-1">{{ book?.TacGia || 'Tác giả không rõ' }}</div>
            <span class="badge bg-primary bg-opacity-10 text-primary">{{ soLuong }} quyển</span>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-dark"><i class="fas fa-calendar-day me-1 text-primary"></i> Ngày đến mượn</label>
            <input type="date" class="form-control rounded-3" v-model="ngayMuon" :min="todayStr"/>
            <div class="form-text">Ngày bạn sẽ đến thư viện nhận sách</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label fw-semibold small text-dark"><i class="fas fa-calendar-check me-1 text-success"></i> Ngày trả sách</label>
            <input type="date" class="form-control rounded-3" v-model="ngayTra" :min="ngayMuon || todayStr"/>
            <div class="form-text">Mặc định 20 ngày kể từ ngày mượn</div>
          </div>
        </div>

        <div class="info-box rounded-3 p-3 mb-4 small">
          <div class="row g-2">
            <div class="col-6"><span class="text-muted-custom">Số quyển:</span><span class="fw-bold text-dark ms-1">{{ soLuong }} quyển</span></div>
            <div class="col-6"><span class="text-muted-custom">Thời hạn:</span><span class="fw-bold text-dark ms-1">{{ borrowDays }} ngày</span></div>
            <div class="col-6"><span class="text-muted-custom">Ngày mượn:</span><span class="fw-bold text-dark ms-1">{{ formatDisplayDate(ngayMuon) }}</span></div>
            <div class="col-6"><span class="text-muted-custom">Hạn trả:</span><span class="fw-bold text-success ms-1">{{ formatDisplayDate(ngayTra) }}</span></div>
          </div>
        </div>

        <div v-if="modalError" class="alert alert-danger py-2 small mb-3 rounded-3">
          <i class="fas fa-exclamation-circle me-1"></i> {{ modalError }}
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="showModal = false">Huỷ</button>
          <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold" @click="confirmBorrow" :disabled="loading">
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
import YeuThichService from '@/services/yeuthich.service'
import DanhGiaService from '@/services/danhgia.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CartService from '@/services/cart.service'
import eventBus from '@/services/eventBus'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

// ---- Book ----
const book = ref(null)
const soLuong = ref(1)
const loading = ref(false)
const fetchError = ref(false)
const message = ref('')
const messageType = ref('success')

// ---- Auth ----
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

// ---- Wishlist ----
const isWishlisted = ref(false)
const wishlistLoading = ref(false)

// ---- Reviews ----
const reviews = ref([])
const reviewStats = ref({ avgRating: 0, total: 0, totalPages: 1 })
const reviewPage = ref(1)
const reviewsLoading = ref(false)
const myReview = ref(null)
const reviewSubmitting = ref(false)
const reviewError = ref('')
const hoverStar = ref(0)
const reviewForm = ref({ soSao: 0, noiDung: '', tinhTrang: null })

const starLabels = ['Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc']
const conditions = [
  { value: 'tot', label: 'Sách tốt', icon: 'fas fa-thumbs-up' },
  { value: 'nhanbich', label: 'Nhăn/bích', icon: 'fas fa-exclamation-triangle' },
  { value: 'matrang', label: 'Mất trang', icon: 'fas fa-file-excel' },
  { value: 'khac', label: 'Khác', icon: 'fas fa-question-circle' },
]

// ---- Modal ----
const showModal = ref(false)
const modalError = ref('')

const maxBorrow = computed(() => {
  if (!book.value?.SoQuyen) return 1
  return Math.min(10, book.value.SoQuyen)
})

const todayStr = computed(() => new Date().toISOString().split('T')[0])
const defaultReturnDate = computed(() => {
  const d = new Date(); d.setDate(d.getDate() + 20)
  return d.toISOString().split('T')[0]
})
const ngayMuon = ref(todayStr.value)
const ngayTra = ref(defaultReturnDate.value)
const borrowDays = computed(() => {
  if (!ngayMuon.value || !ngayTra.value) return 0
  return Math.max(0, Math.round((new Date(ngayTra.value) - new Date(ngayMuon.value)) / 86400000))
})

const formatDisplayDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--'
const formatPrice = (p) => p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : 'Liên hệ'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--'

const conditionLabel = (val) => conditions.find(c => c.value === val)?.label || val
const conditionBadge = (val) => ({
  tot: 'bg-success-subtle text-success',
  nhanbich: 'bg-warning-subtle text-warning',
  matrang: 'bg-danger-subtle text-danger',
  khac: 'bg-secondary-subtle text-secondary',
}[val] || 'bg-light text-muted')

// ---- Fetch book ----
const fetchBook = async () => {
  try {
    const res = await SachService.getById(props.id)
    book.value = res.data || null
    if (!book.value) fetchError.value = true
  } catch {
    fetchError.value = true
  }
}

// ---- Cart ----
const addToCart = () => {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (CartService.addToCart(book.value)) {
    message.value = 'Đã thêm sách vào giỏ mượn!'
    messageType.value = 'success'
  } else {
    message.value = 'Sách đã có trong giỏ mượn.'
    messageType.value = 'danger'
  }
}

// ---- Wishlist ----
const checkWishlist = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await YeuThichService.checkWishlist(props.id)
    isWishlisted.value = res.data?.wishlisted || false
  } catch (_) {}
}

const toggleWishlist = async () => {
  if (!isLoggedIn.value) { router.push('/login'); return }
  wishlistLoading.value = true
  try {
    const res = await YeuThichService.toggle(props.id)
    isWishlisted.value = res.data?.wishlisted
    // Notify header to refresh count
    eventBus.emit('wishlist-change')
  } catch (_) {} finally {
    wishlistLoading.value = false
  }
}

// ---- Reviews ----
const loadReviews = async (page = 1) => {
  reviewsLoading.value = true
  reviewPage.value = page
  try {
    const res = await DanhGiaService.getBySach(props.id, page)
    reviews.value = res.data?.reviews || []
    reviewStats.value = {
      avgRating: res.data?.avgRating || 0,
      total: res.data?.total || 0,
      totalPages: res.data?.totalPages || 1,
    }
  } catch (_) {} finally {
    reviewsLoading.value = false
  }
}

const loadMyReview = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await DanhGiaService.getMyReview(props.id)
    myReview.value = res.data || null
    if (myReview.value) {
      reviewForm.value.soSao = myReview.value.soSao
      reviewForm.value.noiDung = myReview.value.noiDung || ''
      reviewForm.value.tinhTrang = myReview.value.tinhTrang || null
    }
  } catch (_) {}
}

const submitReview = async () => {
  if (!reviewForm.value.soSao) return
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    await DanhGiaService.upsert(props.id, reviewForm.value)
    await loadReviews(1)
    await loadMyReview()
  } catch (err) {
    reviewError.value = err?.response?.data?.message || 'Có lỗi xảy ra, không thể gửi đánh giá.'
  } finally {
    reviewSubmitting.value = false
  }
}

const deleteMyReview = async () => {
  if (!myReview.value?._id) return
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    await DanhGiaService.deleteReview(myReview.value._id)
    myReview.value = null
    reviewForm.value = { soSao: 0, noiDung: '', tinhTrang: null }
    await loadReviews(1)
  } catch (err) {
    reviewError.value = 'Không thể xóa đánh giá.'
  } finally {
    reviewSubmitting.value = false
  }
}

// ---- Borrow modal ----
const openBorrowModal = () => {
  if (!localStorage.getItem('token')) { router.push('/login'); return }
  ngayMuon.value = todayStr.value
  ngayTra.value = defaultReturnDate.value
  modalError.value = ''
  showModal.value = true
}

const confirmBorrow = async () => {
  modalError.value = ''
  if (!ngayMuon.value || !ngayTra.value) { modalError.value = 'Vui lòng chọn ngày mượn và ngày trả.'; return }
  if (new Date(ngayTra.value) <= new Date(ngayMuon.value)) { modalError.value = 'Ngày trả phải sau ngày mượn ít nhất 1 ngày.'; return }
  loading.value = true
  try {
    await MuonSachService.create({ sachId: props.id, soLuong: soLuong.value, ngayMuon: ngayMuon.value, ngayTra: ngayTra.value })
    showModal.value = false
    message.value = `Yêu cầu mượn ${soLuong.value} quyển đã được gửi thành công. Vui lòng chờ thủ thư duyệt.`
    messageType.value = 'success'
  } catch (err) {
    modalError.value = err?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchBook()
  checkWishlist()
  loadReviews()
  loadMyReview()
})
</script>

<style scoped>
.object-fit-cover { object-fit: cover; }
.text-accent { color: var(--bs-warning); }

/* Wishlist float button */
.wishlist-float-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  padding: 0;
  font-size: 1rem;
  transition: transform 0.2s;
}
.wishlist-float-btn:hover { transform: scale(1.1); }
.wishlist-float-btn.btn-danger { animation: heartBeat 0.4s ease; }

@keyframes heartBeat {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Reviews section */
.reviews-section {}
.review-icon {
  width: 44px; height: 44px;
  background: #fff8e1;
  border: 2px solid rgba(255, 193, 7, 0.3);
}
.write-review-box {
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.04) 0%, rgba(255, 193, 7, 0.04) 100%);
  border: 1px solid rgba(13, 110, 253, 0.1);
}
.login-prompt {
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
}
.star-btn { transition: transform 0.1s; }
.star-btn:hover { transform: scale(1.15); }
.reviewer-avatar {
  width: 38px; height: 38px;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.review-item {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s;
}
.review-item:hover { border-color: rgba(13, 110, 253, 0.2); }

/* Borrow Modal */
.modal-backdrop-custom {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1060;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
.borrow-modal {
  background: white; width: 100%; max-width: 520px;
  animation: slideUp 0.25s ease;
}
.book-summary { background: var(--bs-body-bg, #f8f9fa); border: 1px solid rgba(0,0,0,0.07); }
.info-box {
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb),.06) 0%, rgba(var(--bs-success-rgb),.04) 100%);
  border: 1px solid rgba(var(--bs-primary-rgb),.15);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.stars-display i { font-size: 0.85rem; }
.hover-bg { transition: background-color 0.2s; }
.hover-bg:hover { background-color: #f1f3f5 !important; }
</style>
