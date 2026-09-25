<template>
  <div class="page-shell">
    <div class="container">
      <div v-if="book" class="card-surface overflow-hidden">
        <div class="row g-0">
          <div class="col-lg-5">
            <img
              :src="book.HinhAnh || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'"
              class="img-fluid w-100 h-100"
              style="min-height: 420px; object-fit: cover;"
              :alt="book.TENSACH"
            />
          </div>
          <div class="col-lg-7">
            <div class="p-4 p-lg-5">
              <span class="badge-pill bg-primary-subtle text-primary mb-3">{{ book.THELOAI || 'Sách' }}</span>
              <h2 class="fw-bold mb-3">{{ book.TENSACH }}</h2>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <div class="summary-box">
                    <div class="text-muted-custom small">Tác giả</div>
                    <strong>{{ book.TACGIA || 'Không rõ' }}</strong>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="summary-box">
                    <div class="text-muted-custom small">Số quyển còn</div>
                    <strong>{{ book.SOQUYEN || 0 }}</strong>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="summary-box">
                    <div class="text-muted-custom small">Ngôn ngữ</div>
                    <strong>{{ book.NGONNGU || 'Tiếng Việt' }}</strong>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="summary-box">
                    <div class="text-muted-custom small">Năm xuất bản</div>
                    <strong>{{ book.NAMXUATBAN || 'Không rõ' }}</strong>
                  </div>
                </div>
              </div>

              <p class="text-muted-custom mb-4">{{ book.MOTA || 'Chưa có mô tả cho cuốn sách này.' }}</p>

              <div class="d-flex gap-3 flex-wrap">
                <button class="btn btn-primary btn-lg" @click="borrowBook" :disabled="loading">
                  {{ loading ? 'Đang gửi yêu cầu...' : 'Mượn sách' }}
                </button>
                <router-link class="btn btn-outline-primary btn-lg" to="/sach">Quay lại</router-link>
              </div>

              <div v-if="message" class="alert mt-4 mb-0 py-2" :class="messageType === 'success' ? 'alert-success' : 'alert-danger'">
                {{ message }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card-surface">Không tìm thấy sách.</div>
    </div>
  </div>
</template>

<script>
import SachService from '@/services/sach.service'
import MuonSachService from '@/services/muonsach.service'

export default {
  name: 'BookDetail',
  props: ['id'],
  data() {
    return {
      book: null,
      loading: false,
      message: '',
      messageType: 'success',
    }
  },
  async created() {
    await this.fetchBook()
  },
  methods: {
    async fetchBook() {
      try {
        const response = await SachService.getById(this.id)
        this.book = response.data || null
      } catch (error) {
        console.error('Không thể tải thông tin sách:', error)
      }
    },
    async borrowBook() {
      if (!localStorage.getItem('token')) {
        this.$router.push('/login')
        return
      }

      this.loading = true
      this.message = ''

      try {
        await MuonSachService.create({
          sachId: this.id,
          soLuong: 1,
        })

        this.message = 'Yêu cầu mượn sách đã được gửi thành công.'
        this.messageType = 'success'
      } catch (error) {
        this.message = error?.response?.data?.message || 'Không thể gửi yêu cầu mượn sách.'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
