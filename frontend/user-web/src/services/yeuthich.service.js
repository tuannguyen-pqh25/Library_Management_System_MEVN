import http from './http-common'

class YeuThichService {
  // Lấy danh sách yêu thích của mình
  getMyWishlist() {
    return http.get('/user/yeuthich')
  }

  // Kiểm tra sách có trong wishlist không
  checkWishlist(sachId) {
    return http.get(`/user/yeuthich/${sachId}/check`)
  }

  // Toggle yêu thích
  toggle(sachId) {
    return http.post(`/user/yeuthich/${sachId}/toggle`)
  }

  // Xóa khỏi wishlist
  remove(sachId) {
    return http.delete(`/user/yeuthich/${sachId}`)
  }
}

export default new YeuThichService()
