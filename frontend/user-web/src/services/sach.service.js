import http from './http-common'

class SachService {
  getAll(search = '') {
    const url = search ? `/user/sach?TenSach=${encodeURIComponent(search)}` : '/user/sach'
    return http.get(url)
  }

  getById(id) {
    return http.get(`/user/sach/${id}`)
  }
}

export default new SachService()
