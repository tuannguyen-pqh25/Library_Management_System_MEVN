<template>
  <div class="page-shell py-5">
    <div class="container">
      <div class="d-flex align-items-center mb-4 gap-3">
        <h2 class="font-display fw-bold text-dark mb-0">Giỏ mượn sách</h2>
        <span class="badge bg-primary rounded-pill fs-6">{{ totalBooks }} cuốn</span>
      </div>

      <div v-if="cartItems.length === 0" class="empty-state text-center py-5 bg-white rounded-4 shadow-sm border mt-4">
        <div class="text-muted-custom mb-3">
          <i class="fas fa-shopping-basket fa-3x opacity-50"></i>
        </div>
        <h5 class="fw-bold text-dark">Giỏ mượn đang trống</h5>
        <p class="text-muted-custom mb-4">Bạn chưa chọn cuốn sách nào để mượn.</p>
        <router-link to="/sach" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-scale">
          Khám phá sách ngay
        </router-link>
      </div>

      <div v-else class="row g-4">
        <!-- Danh sách sách trong giỏ -->
        <div class="col-lg-8">
          <div class="bg-white rounded-4 shadow-sm border p-4 mb-4">
            <h5 class="fw-bold text-dark mb-4 border-bottom pb-3">Sách đã chọn</h5>
            
            <div v-for="item in cartItems" :key="item._id" class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom position-relative item-row">
              <img :src="item.HinhAnh || 'https://via.placeholder.com/100x150?text=No+Image'" class="rounded shadow-sm" style="width: 70px; height: 105px; object-fit: cover;">
              <div class="flex-grow-1 min-w-0">
                <h6 class="fw-bold text-dark text-truncate mb-1">{{ item.TenSach }}</h6>
                <p class="text-muted small mb-2">{{ item.TacGia }}</p>
                <div class="d-flex align-items-center mt-2">
                  <div class="d-flex align-items-center border rounded-pill px-2 py-1 bg-light me-3">
                    <button type="button" class="btn btn-sm p-0 border-0 text-muted" @click="updateQty(item, -1)">
                      <i class="fas fa-minus" style="font-size:0.7rem;"></i>
                    </button>
                    <span class="fw-bold text-dark px-2" style="font-size:0.85rem; min-width:24px; text-align:center;">{{ item.quantity || 1 }}</span>
                    <button type="button" class="btn btn-sm p-0 border-0 text-muted" @click="updateQty(item, 1)">
                      <i class="fas fa-plus" style="font-size:0.7rem;"></i>
                    </button>
                  </div>
                  <span v-if="item.SoQuyen > 0" class="badge bg-success bg-opacity-10 text-success rounded-pill">Sẵn sàng (Còn {{ item.SoQuyen }})</span>
                  <span v-else class="badge bg-danger bg-opacity-10 text-danger rounded-pill">Tạm hết</span>
                </div>
              </div>
              <button class="btn btn-light text-danger rounded-circle p-2 ms-auto action-btn" @click="removeItem(item._id)" title="Xóa khỏi giỏ">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <div class="d-flex justify-content-between mt-3">
              <router-link to="/sach" class="btn btn-outline-primary rounded-pill fw-medium px-4">
                <i class="fas fa-plus me-1"></i> Khám phá thêm
              </router-link>
              <button class="btn btn-outline-danger rounded-pill fw-medium px-4" @click="clearCart">
                <i class="fas fa-broom me-2"></i> Xóa tất cả
              </button>
            </div>
          </div>
        </div>

        <!-- Khung đặt lịch mượn -->
        <div class="col-lg-4">
          <div class="bg-white rounded-4 shadow-sm border p-4 sticky-top" style="top: 85px;">
            <h5 class="fw-bold text-dark mb-4 border-bottom pb-3">Lịch trình mượn</h5>
            
            <div class="mb-3">
              <label class="form-label fw-bold text-muted small">Ngày nhận sách (dự kiến)</label>
              <input type="date" class="form-control bg-light border-0 py-2" v-model="borrowDate" :min="todayDate">
            </div>
            <div class="mb-4">
              <label class="form-label fw-bold text-muted small">Ngày trả sách (dự kiến)</label>
              <input type="date" class="form-control bg-light border-0 py-2" v-model="returnDate" :min="borrowDate">
            </div>

            <div class="bg-primary bg-opacity-10 rounded-3 p-3 mb-4">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary fw-medium">Tổng số sách:</span>
                <span class="fw-bold text-dark">{{ totalBooks }} cuốn</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-secondary fw-medium">Phí mượn:</span>
                <span class="fw-bold text-success">Miễn phí</span>
              </div>
            </div>

            <button 
              class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow hover-scale d-flex align-items-center justify-content-center"
              @click="submitBorrow"
              :disabled="isSubmitting || !canSubmit"
            >
              <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              <span class="ms-2">{{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu mượn' }}</span>
            </button>
            
            <p v-if="!isValidDates" class="text-danger small mt-2 text-center fw-medium">
              Vui lòng chọn ngày nhận và ngày trả hợp lệ.
            </p>
            <p v-if="hasOutOfStock" class="text-danger small mt-2 text-center fw-medium">
              Có sách đang tạm hết, vui lòng xóa khỏi giỏ để tiếp tục.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import CartService from '@/services/cart.service'
import MuonSachService from '@/services/muonsach.service'

const router = useRouter()
const cartItems = ref([])
const borrowDate = ref('')
const returnDate = ref('')
const isSubmitting = ref(false)

const todayDate = computed(() => new Date().toISOString().split('T')[0])

onMounted(() => {
  cartItems.value = CartService.getCart()
  
  // Set default dates (today and +7 days)
  const today = new Date()
  borrowDate.value = today.toISOString().split('T')[0]
  
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  returnDate.value = nextWeek.toISOString().split('T')[0]
})

// Check if return date is valid relative to borrow date
watch(borrowDate, (newVal) => {
  if (returnDate.value < newVal) {
    returnDate.value = newVal
  }
})

const isValidDates = computed(() => {
  if (!borrowDate.value || !returnDate.value) return false
  if (borrowDate.value < todayDate.value) return false
  if (returnDate.value < borrowDate.value) return false
  return true
})

const totalBooks = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.quantity || 1), 0)
})

const hasOutOfStock = computed(() => {
  return cartItems.value.some(item => item.SoQuyen < (item.quantity || 1))
})

const canSubmit = computed(() => {
  return cartItems.value.length > 0 && isValidDates.value && !hasOutOfStock.value
})

const updateQty = (item, change) => {
  const newQty = (item.quantity || 1) + change
  if (newQty >= 1 && newQty <= item.SoQuyen && newQty <= 10) {
    CartService.updateQuantity(item._id, newQty)
    cartItems.value = CartService.getCart()
  } else if (newQty > item.SoQuyen) {
    alert(`Chỉ còn ${item.SoQuyen} quyển trong kho!`)
  } else if (newQty > 10) {
    alert('Chỉ mượn tối đa 10 quyển cho mỗi đầu sách!')
  }
}

const removeItem = (id) => {
  CartService.removeFromCart(id)
  cartItems.value = CartService.getCart()
}

const clearCart = () => {
  if (confirm('Bạn có chắc muốn xóa tất cả sách khỏi giỏ?')) {
    CartService.clearCart()
    cartItems.value = []
  }
}

const submitBorrow = async () => {
  if (!canSubmit.value) return
  
  if (totalBooks.value > 10) {
    alert(`Tổng số sách trong giỏ (${totalBooks.value}) vượt quá giới hạn 10 quyển. Vui lòng giảm số lượng.`)
    return
  }

  isSubmitting.value = true

  try {
    const historyRes = await MuonSachService.getHistory()
    const activeRecords = historyRes.data.filter(r => ['chờ duyệt', 'đã duyệt', 'đang mượn'].includes(r.trangThai))
    const activeCount = activeRecords.reduce((sum, r) => sum + (r.soLuong || 1), 0)
    
    if (activeCount + totalBooks.value > 10) {
      alert(`Bạn hiện đang mượn/chờ duyệt ${activeCount} quyển. Không thể mượn thêm ${totalBooks.value} quyển vì sẽ vượt quá hạn mức tối đa 10 quyển!`)
      isSubmitting.value = false
      return
    }
  } catch (error) {
    console.error("Lỗi kiểm tra lịch sử", error)
  }

  let successCount = 0
  let errorMessages = []

  try {
    // Submit each book sequentially
    for (const item of cartItems.value) {
      try {
        await MuonSachService.create({
          sachId: item._id,
          soLuong: item.quantity || 1,
          ngayMuon: borrowDate.value,
          ngayTra: returnDate.value
        })
        successCount++
      } catch (err) {
        errorMessages.push(`Lỗi "${item.TenSach}": ${err.response?.data?.message || 'Không thành công'}`)
      }
    }

    if (successCount === cartItems.value.length) {
      alert('Đã gửi yêu cầu mượn toàn bộ sách thành công!')
      CartService.clearCart()
      router.push('/lich-su')
    } else if (successCount > 0) {
      alert(`Đã gửi ${successCount}/${cartItems.value.length} loại sách thành công.\n\nLỗi:\n${errorMessages.join('\n')}`)
      CartService.clearCart() // For simplicity
      router.push('/lich-su')
    } else {
      alert(`Gửi yêu cầu thất bại:\n${errorMessages.join('\n')}`)
    }
  } catch (error) {
    console.error(error)
    alert('Đã xảy ra lỗi hệ thống.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.item-row {
  transition: background-color 0.2s;
}
.item-row:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
  margin-left: -8px;
  margin-right: -8px;
}
.action-btn {
  opacity: 0.5;
  transition: all 0.2s;
}
.item-row:hover .action-btn {
  opacity: 1;
  background-color: #ffe3e3;
}
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}
</style>
