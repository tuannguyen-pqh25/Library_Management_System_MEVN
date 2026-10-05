<template>
  <div class="page-shell py-5">
    <div class="container">

      <!-- Toast -->
      <div
        v-if="toast.show"
        class="toast-fixed alert shadow-sm d-flex align-items-center gap-3"
        :class="toast.type === 'success' ? 'alert-success' : 'alert-danger'"
        role="alert"
      >
        <i class="fas" :class="toast.type === 'success' ? 'fa-heart text-danger' : 'fa-exclamation-circle'"></i>
        {{ toast.message }}
        <button type="button" class="btn-close ms-auto" @click="toast.show = false"></button>
      </div>

      <!-- Header -->
      <div class="d-flex align-items-center gap-3 mb-5">
        <div class="wishlist-icon-wrap d-flex align-items-center justify-content-center rounded-4 shadow-sm flex-shrink-0">
          <i class="fas fa-heart fa-lg text-danger"></i>
        </div>
        <div>
          <h2 class="font-display fw-bold text-dark mb-0">Sách Yêu Thích</h2>
          <p class="text-muted-custom mb-0 small">
            <span v-if="!loading">{{ wishlist.length }} cuốn sách đã lưu</span>
            <span v-else>Đang tải...</span>
          </p>
        </div>
        <router-link to="/sach" class="btn btn-outline-primary rounded-pill px-4 ms-auto d-none d-sm-inline-flex align-items-center gap-2">
          <i class="fas fa-compass"></i> Khám phá thêm
        </router-link>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="row g-4">
        <div v-for="i in 4" :key="i" class="col-sm-6 col-md-4 col-lg-3">
          <div class="card border-0 shadow-sm placeholder-glow">
            <div class="placeholder w-100" style="height:220px; border-radius:16px 16px 0 0;"></div>
            <div class="card-body">
              <div class="placeholder col-8 mb-2"></div>
              <div class="placeholder col-5"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!wishlist.length" class="empty-state-wishlist text-center py-5 rounded-4">
        <div class="empty-icon mb-4">
          <i class="far fa-heart fa-4x text-danger opacity-30"></i>
        </div>
        <h4 class="fw-bold text-dark mb-2">Chưa có sách yêu thích</h4>
        <p class="text-muted-custom mb-4">Bấm vào biểu tượng trái tim trên trang sách để thêm vào đây.</p>
        <router-link to="/sach" class="btn btn-danger rounded-pill px-5 fw-bold shadow-sm">
          <i class="fas fa-compass me-2"></i> Khám phá sách
        </router-link>
      </div>

      <!-- Wishlist Grid -->
      <div v-else class="row g-4">
        <div v-for="item in wishlist" :key="item._id" class="col-sm-6 col-md-4 col-lg-3">
          <div class="wishlist-card card h-100 border-0 shadow-sm hover-elevate">
            <!-- Cover Image -->
            <div class="img-wrapper">
              <img
                :src="item.sach?.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
                class="book-cover"
                :alt="item.sach?.TenSach"
              />
              <!-- Overlay actions -->
              <div class="img-overlay d-flex flex-column align-items-center justify-content-center gap-2">
                <router-link
                  :to="`/sach/${item.sachId}`"
                  class="btn btn-light rounded-pill px-4 fw-bold text-primary shadow-sm"
                >
                  <i class="fas fa-eye me-1"></i> Chi tiết
                </router-link>
                <button
                  class="btn btn-danger btn-sm rounded-pill px-3"
                  @click="removeFromWishlist(item.sachId)"
                  :disabled="removingId === String(item.sachId)"
                >
                  <span v-if="removingId === String(item.sachId)" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-heart-broken me-1"></i>
                  Bỏ yêu thích
                </button>
              </div>
            </div>

            <div class="card-body d-flex flex-column pt-3">
              <!-- Genre badge -->
              <span class="badge bg-light text-primary border border-primary-subtle rounded-pill align-self-start px-2 py-1 mb-2" style="font-size:0.68rem;">
                {{ item.sach?.TheLoai || 'Khác' }}
              </span>

              <h6 class="card-title fw-bold text-dark mb-1 line-clamp-2">
                {{ item.sach?.TenSach || 'Không rõ tên' }}
              </h6>
              <p class="text-muted-custom small mb-0 line-clamp-1">
                <i class="fas fa-pen-nib me-1"></i>
                {{ item.sach?.TacGia || 'Tác giả không rõ' }}
              </p>

              <!-- Stock & Price -->
              <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <span class="small fw-semibold" :class="(item.sach?.SoQuyen || 0) > 0 ? 'text-success' : 'text-danger'">
                  <i class="fas" :class="(item.sach?.SoQuyen || 0) > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
                  {{ item.sach?.SoQuyen || 0 }} quyển
                </span>
                <span class="text-primary fw-bold small">{{ formatPrice(item.sach?.DonGia) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import YeuThichService from '@/services/yeuthich.service'

const wishlist = ref([])
const loading = ref(false)
const removingId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const fetchWishlist = async () => {
  loading.value = true
  try {
    const res = await YeuThichService.getMyWishlist()
    wishlist.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    showToast('Không thể tải danh sách yêu thích', 'error')
  } finally {
    loading.value = false
  }
}

const removeFromWishlist = async (sachId) => {
  removingId.value = String(sachId)
  try {
    await YeuThichService.remove(sachId)
    wishlist.value = wishlist.value.filter(item => String(item.sachId) !== String(sachId))
    showToast('Đã xóa khỏi danh sách yêu thích', 'success')
  } catch (err) {
    showToast('Không thể xóa. Vui lòng thử lại.', 'error')
  } finally {
    removingId.value = null
  }
}

const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  fetchWishlist()
})
</script>

<style scoped>
.wishlist-icon-wrap {
  width: 52px;
  height: 52px;
  background: #fff0f3;
  border: 2px solid rgba(220, 53, 69, 0.15);
}

.img-wrapper {
  position: relative;
  padding-top: 130%;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background: #f8f9fa;
}

.book-cover {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.img-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(20, 30, 60, 0.55);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(3px);
  border-radius: 16px 16px 0 0;
}

.hover-elevate:hover .book-cover {
  transform: scale(1.05);
}

.hover-elevate:hover .img-overlay {
  opacity: 1;
}

.wishlist-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wishlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
}

.empty-state-wishlist {
  background: linear-gradient(135deg, #fff0f3 0%, #f8f9fa 100%);
  border: 1px dashed rgba(220, 53, 69, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4em;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toast-fixed {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1060;
  min-width: 300px;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
