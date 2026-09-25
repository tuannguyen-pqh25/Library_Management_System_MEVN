import http from './http-common'

class ProfileService {
  getProfile() {
    return http.get('/user/profile')
  }

  updateProfile(payload) {
    return http.put('/user/profile', payload)
  }

  changePassword(payload) {
    return http.put('/user/profile/password', payload)
  }
}

export default new ProfileService()
