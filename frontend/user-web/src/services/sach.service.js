import http from './http-common'

class SachService {
  getAll(search = '', category = '') {
    const params = new URLSearchParams()
    if (search) params.append('TenSach', search)
    if (category) params.append('TheLoai', category)
    const queryString = params.toString()
    const url = queryString ? `/user/sach?${queryString}` : '/user/sach'
    return http.get(url)
  }

  getById(id) {
    return http.get(`/user/sach/${id}`)
  }
}

export default new SachService()
