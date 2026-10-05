import http from './http-common'

class AuthService {
  getCurrentUser() {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (error) {
      return null
    }
  }

  async login(payload) {
    const response = await http.post('/user/auth/login', {
      Email: payload.Email,
      Password: payload.Password,
    })

    const user = response.data?.data || null
    const token = response.data?.token || null

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }

    if (token) {
      localStorage.setItem('token', token)
    }

    return response.data
  }

  async register(payload) {
    const response = await http.post('/user/auth/register', {
      Email: payload.Email,
      Password: payload.Password,
      MaDocGia: payload.MaDocGia,
      HoLot: payload.HoLot,
      Ten: payload.Ten,
      NgaySinh: payload.NgaySinh,
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
    })

    return response.data
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export default new AuthService()
