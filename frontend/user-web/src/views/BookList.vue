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

        <!-- Search Bar with Category Filter & Hot Search Dropdown -->
        <div class="search-box position-relative" ref="searchBoxRef">
          <div class="input-group shadow-sm rounded-pill overflow-hidden bg-white border">
            <select 
              class="form-select border-0 shadow-none bg-transparent py-2 ps-3" 
              style="max-width: 160px; border-right: 1px solid #dee2e6 !important;" 
              v-model="selectedCategory" 
              @change="onCategoryChange" 
            >
              <option value="">Tất cả thể loại</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input 
              v-model="searchText" 
              type="text" 
              class="form-control border-0 shadow-none bg-transparent py-2 px-3" 
              placeholder="Tìm theo tên sách, tác giả..." 
              @input="onSearchInput"
              @focus="onSearchFocus"
              @keyup.enter="onSearchEnter" 
              autocomplete="off"
            />
            <button 
              v-if="searchText" 
              type="button" 
              class="btn border-0 px-2 bg-transparent text-muted-custom hover-danger" 
              @click="clearSearchInput"
              title="Xóa tìm kiếm"
            >
              <i class="fas fa-times-circle"></i>
            </button>
            <button 
              type="button" 
              class="btn border-0 px-3 bg-transparent" 
              :class="isListening ? 'text-danger pulse-animation' : 'text-muted-custom hover-primary'"
              @click="startVoiceSearch" 
              title="Tìm kiếm bằng giọng nói"
              :disabled="loading"
            >
              <i class="fas fa-microphone"></i>
            </button>
            <BaseButton variant="primary" class="rounded-pill m-1 px-4" @click="onSearchEnter" :disabled="loading">
              <i class="fas fa-spinner fa-spin me-1" v-if="loading"></i>
              <span v-else>Tìm</span>
            </BaseButton>
          </div>

          <!-- Hot Search & Suggestions Dropdown Panel -->
          <transition name="fade-drop">
            <div 
              v-if="showSuggestions" 
              class="suggestions-dropdown position-absolute start-0 end-0 bg-white shadow-lg rounded-4 p-3 border mt-2"
              style="z-index: 1050; top: 100%; max-height: 420px; overflow-y: auto;"
            >
              <!-- Khi chưa gõ: Hiển thị Hot Search (Từ khóa phổ biến & Thể loại thịnh hành) -->
              <div v-if="!searchText.trim()">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">
                    <i class="fas fa-fire text-danger me-1"></i> Tìm kiếm phổ biến (Hot Searches)
                  </span>
                </div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <button 
                    v-for="kw in hotKeywords" 
                    :key="kw" 
                    type="button" 
                    class="btn btn-sm btn-light border rounded-pill px-3 py-1 text-secondary hot-tag hover-accent"
                    @mousedown.prevent="selectHotKeyword(kw)"
                  >
                    <i class="fas fa-search small me-1 opacity-50"></i>{{ kw }}
                  </button>
                </div>

                <div v-if="categories.length > 0" class="border-top pt-2">
                  <span class="small fw-bold text-muted text-uppercase mb-2 d-block" style="font-size: 0.72rem;">
                    <i class="fas fa-layer-group me-1"></i> Khám phá theo thể loại
                  </span>
                  <div class="d-flex flex-wrap gap-1">
                    <span 
                      v-for="cat in categories.slice(0, 8)" 
                      :key="cat" 
                      class="badge bg-light text-dark border rounded-pill px-2 py-1 cursor-pointer hover-primary"
                      style="font-size: 0.75rem;"
                      @mousedown.prevent="selectCategoryFromHot(cat)"
                    >
                      {{ cat }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Khi đã gõ: Gợi ý sách khớp theo từng ký tự/từ (Live Matches) -->
              <div v-else>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="small fw-bold text-dark text-uppercase" style="font-size: 0.75rem;">
                    <i class="fas fa-bolt text-warning me-1"></i> Gợi ý trực tiếp theo từ khóa
                  </span>
                  <small class="text-muted" style="font-size: 0.72rem;">
                    {{ quickSuggestions.length }} kết quả
                  </small>
                </div>

                <!-- Danh sách sách gợi ý -->
                <div v-if="quickSuggestions.length > 0" class="list-group list-group-flush">
                  <router-link
                    v-for="item in quickSuggestions"
                    :key="item._id"
                    :to="`/sach/${item._id}`"
                    class="list-group-item list-group-item-action border-0 px-2 py-2 rounded-3 d-flex align-items-center gap-3 mb-1"
                    @mousedown="closeSuggestions"
                  >
                    <img 
                      :src="item.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=80&q=80'" 
                      class="rounded-2 flex-shrink-0 shadow-sm"
                      style="width: 42px; height: 56px; object-fit: cover;"
                      :alt="item.TenSach"
                    />
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="fw-bold text-dark text-truncate" :title="item.TenSach" style="font-size: 0.88rem;">
                        {{ item.TenSach }}
                      </div>
                      <div class="small text-muted text-truncate" style="font-size: 0.78rem;">
                        <i class="fas fa-pen-nib me-1"></i>{{ item.TacGia || 'Tác giả không rõ' }}
                        <span v-if="item.TheLoai" class="badge bg-light text-secondary border ms-2" style="font-size: 0.68rem;">{{ item.TheLoai }}</span>
                      </div>
                    </div>
                    <div class="text-end flex-shrink-0">
                      <span class="d-block fw-bold text-primary" style="font-size: 0.85rem;">{{ formatPrice(item.DonGia) }}</span>
                      <span class="small" :class="item.SoQuyen > 0 ? 'text-success' : 'text-danger'" style="font-size: 0.72rem;">
                        {{ item.SoQuyen > 0 ? `Còn ${item.SoQuyen} q` : 'Hết sách' }}
                      </span>
                    </div>
                  </router-link>
                </div>

                <!-- Không tìm thấy gợi ý nào -->
                <div v-else class="text-center py-3 text-muted">
                  <i class="fas fa-search me-1 opacity-50"></i> Không tìm thấy gợi ý phù hợp cho "{{ searchText }}"
                </div>

                <!-- Nút xem toàn bộ kết quả bên dưới -->
                <div class="border-top pt-2 mt-2 text-center">
                  <button 
                    type="button" 
                    class="btn btn-sm btn-link text-primary text-decoration-none fw-semibold"
                    @mousedown.prevent="onSearchEnter"
                  >
                    Xem tất cả kết quả cho "{{ searchText }}" <i class="fas fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </transition>
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
              <div class="d-flex align-items-center gap-1 mb-2 flex-wrap">
                <span class="badge bg-light text-accent border border-accent-subtle rounded-pill px-2 py-1" style="font-size: 0.7rem;">
                  {{ book.TheLoai || 'Khác' }}
                </span>
                <span v-if="book.isHot || (book.soLanMuon && book.soLanMuon >= 3)" class="badge bg-danger text-white rounded-pill px-2 py-1" style="font-size: 0.7rem;">
                  Mượn nhiều
                </span>
              </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import SachService from '@/services/sach.service'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const books = ref([])
const categories = ref([])
const allBooksCache = ref([])
const searchText = ref('')
const selectedCategory = ref('')
const loading = ref(false)
const isListening = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// Hot Search & Autocomplete State
const searchBoxRef = ref(null)
const showSuggestions = ref(false)
const hotKeywords = ref(['Lập trình', 'Công nghệ', 'Văn học', 'Kinh tế', 'Kỹ năng sống', 'Khoa học', 'Lịch sử', 'Truyện tranh'])
let searchTimeout = null

const showToast = (message, type = 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}

const fetchCategories = async () => {
  try {
    const response = await SachService.getAll()
    const all = Array.isArray(response.data) ? response.data : []
    allBooksCache.value = all
    const rawCategories = all.map(b => b.TheLoai).filter(Boolean)
    categories.value = [...new Set(rawCategories)].sort()
  } catch (error) {
    console.error('Lỗi khi lấy danh mục', error)
  }
}

const fetchBooks = async (isBackground = false) => {
  if (!isBackground) {
    loading.value = true
  }
  toast.value.show = false
  try {
    const response = await SachService.getAll(searchText.value, selectedCategory.value)
    books.value = Array.isArray(response.data) ? response.data : []
    if (!searchText.value && !selectedCategory.value) {
      allBooksCache.value = books.value
    }
  } catch (error) {
    console.error('Không thể tải danh sách sách:', error)
    showToast(error.response?.data?.message || 'Lỗi khi tải danh sách sách')
  } finally {
    if (!isBackground) {
      loading.value = false
    }
  }
}

// Hot search theo từng ký tự & từng từ (Debounce 250ms)
const onSearchInput = () => {
  showSuggestions.value = true
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchBooks(true)
  }, 250)
}

const onSearchFocus = () => {
  showSuggestions.value = true
}

const onSearchEnter = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  showSuggestions.value = false
  fetchBooks()
}

const onCategoryChange = () => {
  showSuggestions.value = false
  fetchBooks()
}

const clearSearchInput = () => {
  searchText.value = ''
  showSuggestions.value = false
  fetchBooks()
}

const selectHotKeyword = (kw) => {
  searchText.value = kw
  showSuggestions.value = false
  fetchBooks()
}

const selectCategoryFromHot = (cat) => {
  selectedCategory.value = cat
  searchText.value = ''
  showSuggestions.value = false
  fetchBooks()
}

const closeSuggestions = () => {
  showSuggestions.value = false
}

// Gợi ý tức thì khớp theo từng từ / từng ký tự
const quickSuggestions = computed(() => {
  if (!searchText.value.trim()) return []
  const query = searchText.value.trim().toLowerCase()
  const words = query.split(/\s+/).filter(Boolean)

  return allBooksCache.value.filter(book => {
    if (selectedCategory.value && book.TheLoai !== selectedCategory.value) {
      return false
    }
    const title = (book.TenSach || '').toLowerCase()
    const author = (book.TacGia || '').toLowerCase()
    const cat = (book.TheLoai || '').toLowerCase()
    // Khớp theo từng từ: tất cả các từ khóa gõ vào đều xuất hiện trong tiêu đề, tác giả hoặc thể loại
    return words.every(w => title.includes(w) || author.includes(w) || cat.includes(w))
  }).slice(0, 6)
})

const clearSearch = () => {
  searchText.value = ''
  selectedCategory.value = ''
  showSuggestions.value = false
  fetchBooks()
}

let voiceRecognitionInstance = null

const startVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    showToast('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói (Yêu cầu Google Chrome hoặc Microsoft Edge).', 'error')
    return
  }

  // Nếu đang nghe, bấm lại để dừng
  if (isListening.value) {
    if (voiceRecognitionInstance) {
      try { voiceRecognitionInstance.stop() } catch (e) { /* ignore */ }
    }
    isListening.value = false
    return
  }

  try {
    if (voiceRecognitionInstance) {
      try { voiceRecognitionInstance.abort() } catch (e) { /* ignore */ }
    }

    voiceRecognitionInstance = new SpeechRecognition()
    voiceRecognitionInstance.lang = 'vi-VN'
    voiceRecognitionInstance.interimResults = false
    voiceRecognitionInstance.maxAlternatives = 1

    voiceRecognitionInstance.onstart = () => {
      isListening.value = true
      showToast('Đang lắng nghe... Vui lòng nói tên sách.', 'success')
    }

    voiceRecognitionInstance.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript
        searchText.value = transcript
        toast.value.show = false
        showSuggestions.value = false
        fetchBooks()
      }
    }

    voiceRecognitionInstance.onerror = (event) => {
      console.warn('Lỗi nhận diện giọng nói:', event.error)
      isListening.value = false
      if (event.error === 'not-allowed') {
        showToast('Vui lòng cấp quyền Micro trên trình duyệt (nhấp biểu tượng ổ khóa cạnh URL và chọn Cho phép).', 'error')
      } else if (event.error === 'network') {
        showToast('Lỗi kết nối mạng đến Google Speech API. Vui lòng kiểm tra lại kết nối Internet.', 'error')
      } else if (event.error === 'no-speech') {
        showToast('Chưa phát hiện thấy giọng nói. Vui lòng thử lại và nói rõ hơn.', 'error')
      } else if (event.error !== 'aborted') {
        showToast(`Không thể nhận diện giọng nói (${event.error}). Vui lòng thử lại.`, 'error')
      }
    }

    voiceRecognitionInstance.onend = () => {
      isListening.value = false
    }

    voiceRecognitionInstance.start()
  } catch (err) {
    console.error('Không thể kích hoạt Micro:', err)
    isListening.value = false
    showToast('Không thể kích hoạt Micro: ' + (err.message || 'Lỗi không xác định'), 'error')
  }
}

const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const handleClickOutside = (e) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(e.target)) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchBooks()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-box {
  width: 100%;
  max-width: 550px;
}

.suggestions-dropdown {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-drop-enter-active,
.fade-drop-leave-active {
  transition: all 0.2s ease;
}
.fade-drop-enter-from,
.fade-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.hot-tag {
  font-size: 0.8rem;
  transition: all 0.2s ease;
}
.hot-tag:hover {
  background-color: var(--bs-primary) !important;
  color: white !important;
  border-color: var(--bs-primary) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-danger:hover {
  color: #dc3545 !important;
}

.hover-accent:hover {
  border-color: var(--bs-primary) !important;
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

.hover-primary:hover {
  color: var(--bs-primary) !important;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
.pulse-animation {
  animation: pulse 1s infinite ease-in-out;
}
</style>
