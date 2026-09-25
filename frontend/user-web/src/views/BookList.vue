<template>
  <div class="page-shell">
    <div class="container">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="fw-bold mb-1">Danh sách sách</h2>
          <p class="text-muted-custom mb-0">Khám phá kho sách phong phú của thư viện</p>
        </div>

        <div class="input-group" style="max-width: 360px;">
          <span class="input-group-text"><i class="fa-solid fa-search"></i></span>
          <input v-model="searchText" type="text" class="form-control" placeholder="Tìm kiếm tên sách" @keyup.enter="fetchBooks" />
          <button type="button" class="btn btn-primary" @click="fetchBooks">Tìm</button>
        </div>
      </div>

      <div v-if="books.length" class="row g-4">
        <div v-for="book in books" :key="book._id" class="col-md-6 col-lg-4">
          <div class="card book-card h-100">
            <img
              :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
              class="book-cover"
              :alt="book.TENSACH"
            />
            <div class="card-body d-flex flex-column">
              <span class="badge-pill bg-light text-primary mb-2 align-self-start">{{ book.THELOAI || 'Khác' }}</span>
              <h5 class="card-title fw-bold mb-2">{{ book.TENSACH }}</h5>
              <p class="text-muted-custom mb-3">{{ book.TACGIA || 'Tác giả không rõ' }}</p>
              <div class="d-flex justify-content-between align-items-center mt-auto">
                <span class="fw-semibold text-primary">{{ book.SOQUYEN || 0 }} quyển có sẵn</span>
                <router-link class="btn btn-sm btn-primary" :to="`/sach/${book._id}`">Chi tiết</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card-surface">
        Không tìm thấy sách phù hợp.
      </div>
    </div>
  </div>
</template>

<script>
import SachService from '@/services/sach.service'

export default {
  name: 'BookList',
  data() {
    return {
      books: [],
      searchText: '',
    }
  },
  async created() {
    await this.fetchBooks()
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await SachService.getAll(this.searchText)
        this.books = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Không thể tải danh sách sách:', error)
      }
    },
  },
}
</script>
