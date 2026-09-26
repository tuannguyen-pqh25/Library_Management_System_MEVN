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
              <router-link class="btn btn-outline-primary btn-lg" to="/login">Đăng nhập</router-link>
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
              <div class="d-flex justify-content-between">
                <span class="text-muted-custom">Trạng thái tài khoản</span>
                <span class="badge-pill bg-success-subtle text-success">Bình thường</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="fw-bold mb-0">Sách nổi bật</h2>
          <router-link class="text-decoration-none fw-semibold" to="/sach">Xem tất cả</router-link>
        </div>

        <div v-if="books.length" class="row g-4">
          <div v-for="book in books" :key="book._id" class="col-md-6 col-lg-3">
            <div class="card book-card h-100 shadow-sm border-0">
              <img
                :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
                class="book-cover"
                :alt="book.TenSach"
              />
              <div class="card-body d-flex flex-column">
                <span class="badge-pill bg-light text-primary mb-2 align-self-start">{{ book.TheLoai || 'Tiểu thuyết' }}</span>
                <h5 class="card-title fw-bold mb-2">{{ book.TenSach }}</h5>
                <p class="text-muted-custom mb-3">{{ book.TacGia || 'Không rõ tác giả' }}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <span class="fw-semibold text-primary">{{ book.DonGia ? Number(book.DonGia).toLocaleString() + ' ₫' : 'Miễn phí' }}</span>
                  <router-link class="btn btn-sm btn-outline-primary" :to="`/sach/${book._id}`">Chi tiết</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state card-surface">
          Hiện chưa có sách nào để hiển thị.
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import SachService from '@/services/sach.service'

export default {
  name: 'HomeUser',
  data() {
    return {
      books: [],
    }
  },
  async created() {
    try {
      const response = await SachService.getAll()
      this.books = Array.isArray(response.data) ? response.data.slice(0, 4) : []
    } catch (error) {
      console.error('Không thể tải danh sách sách:', error)
    }
  },
}
</script>
