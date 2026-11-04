// src/services/dashboard.service.js (admin-web)
import http from "./http-common";

class DashboardService {
  /**
   * GET /api/admin/dashboard/stats
   * Trả về toàn bộ thống kê dashboard: tongQuan, chiTietTrangThai, topSach, muonTheoThang
   */
  getStats(range = "6m") {
    return http.get("/dashboard/stats", { params: { range } });
  }
}

export default new DashboardService();
