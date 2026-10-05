<template>
  <div class="page-shell py-5">
    <div class="container">
      <!-- Toast Notification -->
      <div v-if="toast.show" class="alert alert-dismissible fade show toast-fixed shadow" :class="toast.type === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="fas me-2" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ toast.message }}
        <button type="button" class="btn-close" @click="toast.show = false"></button>
      </div>

      <!-- Header Section -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">Danh sách sách</h2>
          <p class="text-muted-custom mb-0">Khám phá kho sách phong phú của Thư viện Số</p>
        </div>

        <!-- Search Bar with Category Filter -->
        <div class="search-box">
          <div class="input-group shadow-sm rounded-pill overflow-hidden bg-white border">
            <select 
              class="form-select border-0 shadow-none bg-transparent py-2 ps-3" 
              style="max-width: 160px; border-right: 1px solid #dee2e6 !important;" 
              v-model="selectedCategory" 
              @change="fetchBooks" 
              :disabled="loading"
            >
              <option value="">Tất cả thể loại</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input 
              v-model="searchText" 
              type="text" 
              class="form-control border-0 shadow-none bg-transparent py-2 px-3" 
              placeholder="Tìm kiếm tên sách..." 
              @keyup.enter="fetchBooks" 
              :disabled="loading"
            />
            <BaseButton variant="primary" class="rounded-pill m-1 px-4" @click="fetchBooks" :disabled="loading">
              <i class="fas fa-spinner fa-spin me-1" v-if="loading"></i>
              <span v-else>Tìm</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Loading State (Skeleton) -->
      <div v-if="loading" class="row g-4">
        <div v-for="i in 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
          <div class="card border-0 shadow-sm h-100 placeholder-glow">
            <div class="placeholder w-100" style="height: 250px; border-radius: 16px 16px 0 0;"></div>
            <div class="card-body mt-2">
              <div class="placeholder w-25 mb-2 rounded-pill" style="height: 20px;"></div>
              <h6 class="card-title"><span class="placeholder col-10"></span></h6>
              <p class="card-text mb-3"><span class="placeholder col-6"></span></p>
              <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <span class="placeholder col-4"></span>
                <span class="placeholder col-3"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Book Grid -->
      <div v-else-if="books.length" class="row g-4">
        <div v-for="book in books" :key="book._id" class="col-sm-6 col-md-4 col-lg-3">
          <BaseCard class="book-card h-100 hover-elevate">
            <template #img-top>
              <div class="img-wrapper">
                <img
                  :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
                  class="card-img-top book-cover"
                  :alt="book.TenSach"
                />
                <div class="overlay d-flex align-items-center justify-content-center">
                  <router-link class="btn btn-light rounded-pill px-4 fw-bold text-primary shadow" :to="`/sach/${book._id}`">
                    Xem chi tiết
                  </router-link>
                </div>
              </div>
            </template>
            
            <div class="d-flex flex-column h-100 mt-2">
              <span class="badge bg-light text-accent border border-accent-subtle rounded-pill align-self-start px-2 py-1 mb-2" style="font-size: 0.7rem;">
                {{ book.TheLoai || 'Khác' }}
              </span>
              <h6 class="card-title fw-bold text-dark mb-1 line-clamp-2" :title="book.TenSach">{{ book.TenSach }}</h6>
              <p class="text-muted-custom small mb-3 line-clamp-1" :title="book.TacGia"><i class="fas fa-pen-nib me-1"></i> {{ book.TacGia || 'Tác giả không rõ' }}</p>
              
              <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <span class="small fw-semibold" :class="book.SoQuyen > 0 ? 'text-success' : 'text-danger'">
                  <i class="fas" :class="book.SoQuyen > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i> 
                  {{ book.SoQuyen || 0 }} quyển
                </span>
                <span class="text-primary fw-bold">{{ formatPrice(book.DonGia) }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state text-center py-5 bg-white rounded-4 shadow-sm border mt-4">
        <div class="text-muted-custom mb-3">
          <i class="fas fa-book-open fa-3x opacity-50"></i>
        </div>
        <h5 class="fw-bold text-dark">Không tìm thấy sách</h5>
        <p class="text-muted-custom">Thử tìm kiếm với một từ khóa khác hoặc quay lại sau.</p>
        <BaseButton variant="outline-primary" @click="clearSearch" v-if="searchText || selectedCategory">
          Xóa tìm kiếm
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SachService from '@/services/sach.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const books = ref([])
const categories = ref([])
const searchText = ref('')
const selectedCategory = ref('')
const loading = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}

const fetchCategories = async () => {
  try {
    const response = await SachService.getAll()
    const allBooks = Array.isArray(response.data) ? response.data : []
    const rawCategories = allBooks.map(b => b.TheLoai).filter(Boolean)
    categories.value = [...new Set(rawCategories)].sort()
  } catch (error) {
    console.error('Lỗi khi lấy danh mục', error)
  }
}

const fetchBooks = async () => {
  loading.value = true
  toast.value.show = false
  try {
    const response = await SachService.getAll(searchText.value, selectedCategory.value)
    books.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Không thể tải danh sách sách:', error)
    showToast(error.response?.data?.message || 'Lỗi khi tải danh sách sách')
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchText.value = ''
  selectedCategory.value = ''
  fetchBooks()
}

const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

onMounted(() => {
  fetchCategories()
  fetchBooks()
})
</script>

<style scoped>
.search-box {
  width: 100%;
  max-width: 550px;
}

.img-wrapper {
  position: relative;
  padding-top: 130%; /* 4:3 Aspect Ratio approximately for books */
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background-color: #f8f9fa;
}

.book-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 61, 47, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.hover-elevate:hover .book-cover {
  transform: scale(1.05);
}

.hover-elevate:hover .overlay {
  opacity: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-accent {
  color: var(--bs-warning);
}
.border-accent-subtle {
  border-color: rgba(var(--bs-warning-rgb), 0.5) !important;
}
.toast-fixed {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  min-width: 250px;
}
</style>
