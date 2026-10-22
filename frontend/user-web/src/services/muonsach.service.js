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

  /**
   * Lấy danh sách thông báo sắp hết hạn / quá hạn từ lịch sử mượn.
   * - Quá hạn: ngayHenTra < hôm nay (hoặc trangThai === 'quá hạn')
   * - Sắp hết hạn: 0 <= (ngayHenTra - hôm nay) <= 2 ngày
   * Chỉ xét phiếu có trạng thái đang hoạt động (không phải đã trả / từ chối).
   * @returns {Promise<Array>} mảng các phiếu cần cảnh báo, mỗi phần tử có thêm field `daysLeft` và `alertType`
   */
  async getNotifications() {
    const activeStatuses = ['chờ duyệt', 'đã duyệt', 'đang mượn', 'đang chờ trả', 'quá hạn']
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const res = await this.getHistory()
    const list = Array.isArray(res.data) ? res.data : []

    return list
      .filter(item => activeStatuses.includes(item.trangThai) && item.ngayHenTra)
      .map(item => {
        const due = new Date(item.ngayHenTra)
        due.setHours(0, 0, 0, 0)
        const daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24))
        let alertType = null
        if (daysLeft < 0 || item.trangThai === 'quá hạn') alertType = 'overdue'
        else if (daysLeft <= 2) alertType = 'soon'
        return { ...item, daysLeft, alertType }
      })
      .filter(item => item.alertType !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }
}

export default new MuonSachService()
