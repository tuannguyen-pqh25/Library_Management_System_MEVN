import http from './http-common'

class DanhGiaService {
  // Lấy danh sách đánh giá theo sách (công khai, không cần token)
  getBySach(sachId, page = 1, limit = 10) {
    return http.get(`/user/danhgia/${sachId}?page=${page}&limit=${limit}`)
  }

  // Kiểm tra review của mình (cần token)
  getMyReview(sachId) {
    return http.get(`/user/danhgia/${sachId}/my-review`)
  }

  // Tạo hoặc cập nhật đánh giá (upsert)
  upsert(sachId, data) {
    return http.post(`/user/danhgia/${sachId}`, data)
  }

  // Xóa đánh giá
  deleteReview(reviewId) {
    return http.delete(`/user/danhgia/review/${reviewId}`)
  }
}

export default new DanhGiaService()
