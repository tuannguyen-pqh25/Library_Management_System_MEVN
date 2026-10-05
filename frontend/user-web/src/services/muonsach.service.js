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

  requestReturn(id, ngayDuKienTra = null) {
    return http.post(`/user/muon/${id}/request-return`, { ngayDuKienTra })
  }

  updatePending(id, soLuong) {
    return http.put(`/user/muon/${id}`, { soLuong })
  }

  deletePending(id) {
    return http.delete(`/user/muon/${id}`)
  }
}

export default new MuonSachService()
