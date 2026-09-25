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
    const email = payload.Email ?? payload.email
    const password = payload.MatKhau ?? payload.password

    const response = await http.post('/user/auth/login', {
      Email: email,
      MatKhau: password,
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
      Email: payload.Email ?? payload.email,
      MatKhau: payload.MatKhau ?? payload.password,
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
