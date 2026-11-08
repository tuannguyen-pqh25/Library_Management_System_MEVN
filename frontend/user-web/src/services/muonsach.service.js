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
    try {
      const res = await http.get('/user/muon/thong-bao')
      if (Array.isArray(res.data)) {
        return res.data
      }
    } catch (_) {
      // Fallback bên dưới nếu có lỗi mạng
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let list = []
    try {
      const res = await this.getHistory()
      list = Array.isArray(res.data) ? res.data : []
    } catch (_) {
      list = []
    }

    const notifications = []
    let maxSoNgayTre = 0
    let tongTienPhat = 0
    let userObj = null

    // Kiểm tra tài khoản bị khóa từ localStorage
    try {
      userObj = JSON.parse(localStorage.getItem('user') || '{}')
      if (userObj && userObj.TrangThaiTaiKhoan === 'BiKhoa') {
        notifications.push({
          _id: `lock_${userObj._id}`,
          notifId: `account_locked_${userObj._id}`,
          alertType: 'account_locked',
          title: 'Tài khoản của bạn đang bị khóa!',
          message: userObj.LyDoKhoa
            ? `Tài khoản độc giả đã bị khóa do: ${userObj.LyDoKhoa}. Vui lòng liên hệ ban quản lý thư viện để giải quyết.`
            : 'Tài khoản độc giả đã bị khóa do có sách quá hạn chưa hoàn tất trả hoặc theo quyết định của thủ thư. Vui lòng liên hệ thư viện để được giải quyết.',
          time: new Date().toISOString(),
          isUrgent: true,
        })
      }
    } catch (_) {}

    list.forEach(item => {
      const dueDateStr = item.ngayTra || item.ngayHenTra
      let daysLeft = null
      let soNgayTre = 0
      if (dueDateStr) {
        const due = new Date(dueDateStr)
        if (!isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0)
          daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24))
          if (daysLeft < 0) {
            soNgayTre = Math.abs(daysLeft)
          }
        }
      }

      const notifTime = item.updatedAt || item.createdAt || item.ngayMuon || ''
      const soLuong = item.soLuong || 1
      if (item.trangThai === 'quá hạn' && soNgayTre <= 0) {
        soNgayTre = 1
      }
      const tienPhat = soNgayTre * 5000 * soLuong

      // 1. THỦ THƯ ĐÃ DUYỆT YÊU CẦU MƯỢN SÁCH
      if (item.trangThai === 'đã duyệt') {
        notifications.push({
          ...item,
          notifId: `${item._id}_approved`,
          daysLeft,
          alertType: 'approved',
          title: 'Yêu cầu mượn đã được duyệt',
          message: `Thủ thư đã duyệt yêu cầu mượn ${soLuong} quyển sách "${item.TenSach || 'Sách mượn'}". Vui lòng đến thư viện nhận sách!`,
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
      else if (item.trangThai === 'quá hạn' || item.daTungQuaHan || (daysLeft !== null && daysLeft < 0 && ['đang mượn', 'đang chờ trả', 'chờ gia hạn'].includes(item.trangThai))) {
        tongTienPhat += tienPhat
        if (soNgayTre > maxSoNgayTre) maxSoNgayTre = soNgayTre
        notifications.push({
          ...item,
          notifId: `${item._id}_overdue_${dueDateStr || ''}`,
          daysLeft,
          soNgayTre,
          tienPhat,
          alertType: 'overdue',
          title: 'Sách quá hạn trả!',
          message: soNgayTre > 0 ? `Đã quá hạn ${soNgayTre} ngày (${soLuong} quyển). Phí phạt trễ hạn tạm tính: ${tienPhat.toLocaleString('vi-VN')} VNĐ (5.000đ/ngày/quyển). Vui lòng trả sách sớm!` : 'Phiếu mượn đã quá hạn trả.',
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

    // Cảnh báo trước khi khóa (Khi chưa bị khóa)
    if (userObj && userObj.TrangThaiTaiKhoan !== 'BiKhoa' && (maxSoNgayTre > 0 || tongTienPhat > 0)) {
      if (maxSoNgayTre >= 6) {
        notifications.push({
          _id: `lock_warn_urgent_${userObj._id}`,
          notifId: `lock_warn_urgent_${userObj._id}_${maxSoNgayTre}`,
          alertType: 'lock_warning_urgent',
          title: 'CẢNH BÁO KHẨN CẤP: Tài khoản sắp bị khóa sau 1 ngày!',
          message: `Quyển sách đầu tiên của bạn đã trễ hạn ${maxSoNgayTre} ngày. Theo quy chế thư viện, tài khoản sẽ tự động bị KHÓA sau 24h nữa (khi thời gian trễ tính từ quyển đầu tiên vượt quá 7 ngày). Hãy mang sách đến trả ngay!`,
          time: new Date().toISOString(),
          isUrgent: true,
        })
      } else if (maxSoNgayTre >= 4) {
        notifications.push({
          _id: `lock_warn_3d_${userObj._id}`,
          notifId: `lock_warn_3d_${userObj._id}_${maxSoNgayTre}`,
          alertType: 'lock_warning',
          title: 'Cảnh báo: Nguy cơ bị khóa tài khoản sau 3 ngày',
          message: `Quyển sách đầu tiên của bạn đã trễ hạn ${maxSoNgayTre} ngày. Tài khoản sẽ tự động bị KHÓA khi thời gian trễ của quyển đầu tiên vượt quá 7 ngày (1 tuần). Vui lòng sắp xếp trả sách sớm!`,
          time: new Date().toISOString(),
          isUrgent: true,
        })
      }

      if (tongTienPhat >= 75000 && tongTienPhat < 100000) {
        notifications.push({
          _id: `fine_warn_75k_${userObj._id}`,
          notifId: `fine_warn_75k_${userObj._id}`,
          alertType: 'fine_warning_75k',
          title: 'CẢNH BÁO TIỀN PHẠT: Tổng tiền phạt đã đạt 75.000 VNĐ',
          message: `Tổng tiền phạt trễ hạn tích lũy của tất cả các sách bạn đang mượn đã đạt ${tongTienPhat.toLocaleString('vi-VN')} VNĐ. Tài khoản sẽ tự động bị KHÓA NGAY khi tổng tiền phạt đạt 100.000 VNĐ. Hãy đến trả sách ngay!`,
          time: new Date().toISOString(),
          isUrgent: true,
        })
      } else if (tongTienPhat >= 50000 && tongTienPhat < 75000) {
        notifications.push({
          _id: `fine_warn_50k_${userObj._id}`,
          notifId: `fine_warn_50k_${userObj._id}`,
          alertType: 'fine_warning_50k',
          title: 'Nhắc nhở tiền phạt: Tổng tiền phạt đạt 50.000 VNĐ',
          message: `Tổng tiền phạt trễ hạn của tất cả các sách bạn đang mượn là ${tongTienPhat.toLocaleString('vi-VN')} VNĐ (mức khóa tài khoản tự động là 100.000 VNĐ). Vui lòng trả sách sớm để tránh phát sinh thêm phí!`,
          time: new Date().toISOString(),
          isUrgent: false,
        })
      }
    }

    // Sắp xếp: Quá hạn & Đã duyệt lên trước, sau đó sắp hết hạn, từ chối
    const priority = {
      account_locked: 0,
      lock_warning_urgent: 1,
      fine_warning_75k: 2,
      lock_warning: 3,
      fine_warning_50k: 4,
      overdue: 5,
      approved: 6,
      extension_approved: 6,
      soon: 7,
      rejected: 8,
      extension_rejected: 8
    }
    return notifications.sort((a, b) => {
      const pDiff = (priority[a.alertType] || 99) - (priority[b.alertType] || 99)
      if (pDiff !== 0) return pDiff
      return new Date(b.time || 0) - new Date(a.time || 0)
    })
  }
}

export default new MuonSachService()
