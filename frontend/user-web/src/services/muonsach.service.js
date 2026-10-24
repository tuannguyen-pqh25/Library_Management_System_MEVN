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

  requestExtension(id, payload) {
    return http.post(`/user/muon/${id}/gia-han`, payload)
  }

  updatePending(id, soLuong) {
    return http.put(`/user/muon/${id}`, { soLuong })
  }

  deletePending(id) {
    return http.delete(`/user/muon/${id}`)
  }

  /**
   * Lấy danh sách thông báo cho độc giả:
   * 1. Yêu cầu mượn đã được duyệt ('đã duyệt'): Báo cho user biết để đến thư viện nhận sách.
   * 1.5. Yêu cầu gia hạn được duyệt hoặc từ chối.
   * 2. Yêu cầu bị từ chối ('từ chối' trong 7 ngày gần nhất) kèm lý do.
   * 3. Sách quá hạn ('quá hạn' hoặc ngày hẹn trả < hôm nay).
   * 4. Sắp đến hạn trả (trong vòng 2 ngày tới).
   * @returns {Promise<Array>} mảng thông báo đã chuẩn hóa
   */
  async getNotifications() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const res = await this.getHistory()
    const list = Array.isArray(res.data) ? res.data : []
    const notifications = []

    list.forEach(item => {
      const dueDateStr = item.ngayTra || item.ngayHenTra
      let daysLeft = null
      if (dueDateStr) {
        const due = new Date(dueDateStr)
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0)
          daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24))
        }
      }

      const notifTime = item.updatedAt || item.createdAt || item.ngayMuon || ''

      // 1. THỦ THƯ ĐÃ DUYỆT YÊU CẦU MƯỢN SÁCH
      if (item.trangThai === 'đã duyệt') {
        notifications.push({
          ...item,
          notifId: `${item._id}_approved`,
          daysLeft,
          alertType: 'approved',
          title: 'Yêu cầu mượn đã được duyệt',
          message: `Thủ thư đã duyệt yêu cầu mượn ${item.soLuong || 1} quyển. Vui lòng đến thư viện nhận sách!`,
          time: notifTime,
        })
      }

      // 1.5. YÊU CẦU GIA HẠN ĐƯỢC DUYỆT HOẶC TỪ CHỐI
      if (item.yeuCauGiaHan && item.yeuCauGiaHan.trangThai === 'đã duyệt') {
        const approvedTime = item.yeuCauGiaHan.ngayDuyet || notifTime
        const diffDays = approvedTime ? Math.round((today - new Date(approvedTime)) / (1000 * 60 * 60 * 24)) : 0
        if (diffDays <= 7) {
          notifications.push({
            ...item,
            notifId: `${item._id}_ext_approved_${item.giaHanCount || item.yeuCauGiaHan.soNgayGiaHan || 1}`,
            daysLeft,
            alertType: 'extension_approved',
            title: 'Gia hạn sách thành công',
            message: `Thủ thư đã duyệt gia hạn sách thêm ${item.yeuCauGiaHan.soNgayGiaHan || 7} ngày. Hạn trả mới: ${item.ngayTra ? new Date(item.ngayTra).toLocaleDateString('vi-VN') : '—'}.`,
            time: approvedTime,
          })
        }
      } else if (item.yeuCauGiaHan && item.yeuCauGiaHan.trangThai === 'từ chối') {
        const rejectedTime = item.yeuCauGiaHan.ngayDuyet || notifTime
        const diffDays = rejectedTime ? Math.round((today - new Date(rejectedTime)) / (1000 * 60 * 60 * 24)) : 0
        if (diffDays <= 7) {
          notifications.push({
            ...item,
            notifId: `${item._id}_ext_rejected_${item.giaHanCount || 1}`,
            daysLeft,
            alertType: 'extension_rejected',
            title: 'Yêu cầu gia hạn bị từ chối',
            message: `Yêu cầu gia hạn không được duyệt: ${item.yeuCauGiaHan.lyDoTuChoi || 'Quy định thư viện'}. Hạn trả vẫn là ${item.ngayTra ? new Date(item.ngayTra).toLocaleDateString('vi-VN') : '—'}.`,
            time: rejectedTime,
          })
        }
      }

      // 2. YÊU CẦU BỊ TỪ CHỐI (trong vòng 7 ngày gần nhất)
      if (item.trangThai === 'từ chối') {
        const updatedDate = notifTime ? new Date(notifTime) : null
        const diffDays = updatedDate ? Math.round((today - updatedDate) / (1000 * 60 * 60 * 24)) : 0
        if (diffDays <= 7) {
          notifications.push({
            ...item,
            notifId: `${item._id}_rejected`,
            daysLeft,
            alertType: 'rejected',
            title: 'Yêu cầu mượn bị từ chối',
            message: item.lyDoTuChoi ? `Lý do: ${item.lyDoTuChoi}` : 'Yêu cầu mượn sách không được duyệt.',
            time: notifTime,
          })
        }
      }
      // 3. SÁCH QUÁ HẠN
      else if (item.trangThai === 'quá hạn' || (daysLeft !== null && daysLeft < 0 && ['đang mượn', 'đang chờ trả', 'chờ gia hạn'].includes(item.trangThai))) {
        notifications.push({
          ...item,
          notifId: `${item._id}_overdue_${item.ngayTra || ''}`,
          daysLeft,
          alertType: 'overdue',
          title: 'Sách quá hạn trả',
          message: daysLeft !== null && daysLeft < 0 ? `Đã quá hạn ${Math.abs(daysLeft)} ngày. Vui lòng trả sách sớm!` : 'Phiếu mượn đã quá hạn trả.',
          time: notifTime,
        })
      }
      // 4. SÁCH SẮP ĐẾN HẠN TRẢ (trong vòng 2 ngày)
      else if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 2 && ['đang mượn', 'đang chờ trả', 'chờ gia hạn'].includes(item.trangThai)) {
        notifications.push({
          ...item,
          notifId: `${item._id}_soon_${item.ngayTra || ''}`,
          daysLeft,
          alertType: 'soon',
          title: 'Sắp đến hạn trả sách',
          message: daysLeft === 0 ? 'Hôm nay là hạn trả sách!' : `Còn ${daysLeft} ngày nữa đến hạn trả sách.`,
          time: notifTime,
        })
      }
    })

    // Sắp xếp: Quá hạn & Đã duyệt lên trước, sau đó sắp hết hạn, từ chối
    const priority = { overdue: 1, approved: 2, extension_approved: 2, soon: 3, rejected: 4, extension_rejected: 4 }
    return notifications.sort((a, b) => {
      const pDiff = (priority[a.alertType] || 99) - (priority[b.alertType] || 99)
      if (pDiff !== 0) return pDiff
      return new Date(b.time || 0) - new Date(a.time || 0)
    })
  }
}

export default new MuonSachService()
