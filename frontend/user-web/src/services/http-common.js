import axios from 'axios'

const http = axios.create({
baseURL: 'http://localhost:3000/api',
headers: {
    'Content-Type': 'application/json',
},
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Xử lý lỗi 401 (Token hết hạn, không hợp lệ)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token cũ
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Dispatch event cho AppHeader cập nhật giao diện
      import('./eventBus').then(module => {
        module.default.emit('auth-changed')
      }).catch(err => console.error(err))

      // Nếu đang không ở trang login, cảnh báo cho người dùng
      if (window.location.pathname !== '/login') {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http
