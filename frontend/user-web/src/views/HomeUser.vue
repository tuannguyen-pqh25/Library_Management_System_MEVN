<template>
  <div class="page-shell">
    <div class="container">
      <div class="hero-panel card-surface mb-5">
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <span class="badge-pill bg-primary text-white mb-3">Thư viện số</span>
            <h1 class="display-5 fw-bold mb-3">Khám phá tri thức mỗi ngày</h1>
            <p class="text-muted-custom fs-5 mb-4">
              Mượn sách dễ dàng, theo dõi lịch sử, quản lý hồ sơ cá nhân trong một nền tảng thân thiện cho độc giả.
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <router-link class="btn btn-primary btn-lg" to="/sach">Xem danh sách sách</router-link>
              <router-link v-if="!isLoggedIn" class="btn btn-outline-primary btn-lg" to="/login">Đăng nhập</router-link>
              <router-link v-else class="btn btn-outline-primary btn-lg" to="/lich-su">Lịch sử mượn sách</router-link>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="summary-box">
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted-custom">Tổng số đầu sách</span>
                <strong>{{ books.length }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted-custom">Mượn sách nhanh</span>
                <strong>1-2 phút</strong>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted-custom">Theo dõi lịch sử</span>
                <strong>24/7</strong>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted-custom">Trạng thái tài khoản</span>
                <template v-if="!currentUser">
                  <span class="badge-pill bg-secondary bg-opacity-10 text-secondary">Chưa đăng nhập</span>
                </template>
                <template v-else-if="currentUser.TrangThaiTaiKhoan === 'BiKhoa'">
                  <span class="badge bg-danger text-white fw-bold shadow px-3 py-2 animation-pulse rounded-pill border border-2 border-white" style="font-size: 0.95rem; letter-spacing: 0.5px;">
                    <i class="fas fa-lock me-1"></i> BỊ KHÓA
                  </span>
                </template>
                <template v-else>
                  <span class="badge-pill bg-success-subtle text-success">Bình thường</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cảnh báo tài khoản bị khóa -->
      <div v-if="currentUser && currentUser.TrangThaiTaiKhoan === 'BiKhoa'" class="alert alert-danger shadow-sm border-danger border-2 d-flex align-items-center gap-3 mb-5 p-4 rounded-4 locked-alert" role="alert">
        <i class="fas fa-exclamation-triangle fa-3x text-danger heartbeat-icon"></i>
        <div>
          <h4 class="alert-heading fw-bold mb-1 text-danger">TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!</h4>
          <p class="mb-0 text-dark fw-medium">
            Bạn hiện không thể thực hiện các thao tác mượn sách mới. Vui lòng mang thẻ sinh viên/CCCD đến trực tiếp quầy thủ thư hoặc liên hệ qua email thư viện để được hỗ trợ mở khóa.
          </p>
        </div>
      </div>

      <section>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="fw-bold mb-0">Sách nổi bật</h2>
          <router-link class="text-decoration-none fw-semibold" to="/sach">Xem tất cả</router-link>
        </div>

        <div v-if="books.length" class="row g-4">
          <div v-for="book in books" :key="book._id" class="col-md-6 col-lg-3">
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
                  <span class="text-primary fw-bold">{{ book.DonGia ? Number(book.DonGia).toLocaleString() + ' ₫' : 'Miễn phí' }}</span>
                  <router-link class="btn btn-sm btn-outline-primary" :to="`/sach/${book._id}`">Chi tiết</router-link>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        <div v-else class="empty-state card-surface">
          Hiện chưa có sách nào để hiển thị.
        </div>
      </section>

      <!-- Sách mới cập nhật -->
      <section class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="fw-bold mb-0">Sách mới cập nhật</h2>
          <router-link class="text-decoration-none fw-semibold" to="/sach">Xem tất cả</router-link>
        </div>

        <div v-if="newBooks.length" class="row g-4">
          <div v-for="book in newBooks" :key="book._id" class="col-md-6 col-lg-3">
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
                  <span class="text-primary fw-bold">{{ book.DonGia ? Number(book.DonGia).toLocaleString() + ' ₫' : 'Miễn phí' }}</span>
                  <router-link class="btn btn-sm btn-outline-primary" :to="`/sach/${book._id}`">Chi tiết</router-link>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import SachService from '@/services/sach.service'
import AuthService from '@/services/auth.service'
import ProfileService from '@/services/profile.service'
import eventBus from '@/services/eventBus'
import BaseCard from '@/components/ui/BaseCard.vue'

export default {
  name: 'HomeUser',
  components: {
    BaseCard
  },
  data() {
    return {
      books: [],
      newBooks: [],
      isLoggedIn: false,
      currentUser: null
    }
  },
  methods: {
    checkLoginStatus() {
      this.currentUser = AuthService.getCurrentUser();
      this.isLoggedIn = !!this.currentUser;
    }
  },
  async created() {
    this.checkLoginStatus();
    eventBus.on('auth-change', this.checkLoginStatus);
    try {
      const response = await SachService.getAll()
      const allBooks = Array.isArray(response.data) ? response.data : []
      this.books = allBooks.slice(0, 4)
      const sortedBooks = [...allBooks].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime()
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime()
        return dateB - dateA
      })
      this.newBooks = sortedBooks.slice(0, 4)
    } catch (error) {
      console.error('Không thể tải danh sách sách:', error)
    }

    if (this.isLoggedIn) {
      try {
        const profileRes = await ProfileService.getProfile();
        if (profileRes.data && profileRes.data._id) {
          const updatedUser = profileRes.data;
          // Cập nhật lại localStorage để lấy TrangThaiTaiKhoan mới nhất
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUser = updatedUser;
        }
      } catch (err) {
        console.error('Lỗi khi tải profile mới nhất', err);
      }
    }
  },
  unmounted() {
    eventBus.off('auth-change', this.checkLoginStatus);
  }
}
</script>

<style scoped>
.animation-pulse {
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.8); transform: scale(1); }
  50% { box-shadow: 0 0 0 12px rgba(220, 53, 69, 0); transform: scale(1.08); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); transform: scale(1); }
}

.locked-alert {
  background: linear-gradient(to right, #fff5f5, #ffe3e3);
}

.heartbeat-icon {
  animation: heartbeat 1.5s ease-in-out infinite both;
}

@keyframes heartbeat {
  from { transform: scale(1); transform-origin: center center; animation-timing-function: ease-out; }
  10% { transform: scale(0.91); animation-timing-function: ease-in; }
  17% { transform: scale(0.98); animation-timing-function: ease-out; }
  33% { transform: scale(0.87); animation-timing-function: ease-in; }
  45% { transform: scale(1); animation-timing-function: ease-out; }
}

/* Card Styles matching BookList */
.img-wrapper {
  position: relative;
  padding-top: 130%;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background-color: #f8f9fa;
}
.book-cover {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
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
.text-accent { color: var(--bs-warning); }
.border-accent-subtle { border-color: rgba(var(--bs-warning-rgb), 0.5) !important; }
</style>
