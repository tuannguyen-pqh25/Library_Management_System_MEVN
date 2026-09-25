import http from './http-common'

class MuonSachService {
  create(payload) {
    return http.post('/user/muon', {
      sachId: payload.sachId,
      soLuong: payload.soLuong || 1,
      ngayMuon: payload.ngayMuon,
      ngayTra: payload.ngayTra,
    })
  }

  getHistory() {
    return http.get('/user/muon/lich-su')
  }
}

export default new MuonSachService()
