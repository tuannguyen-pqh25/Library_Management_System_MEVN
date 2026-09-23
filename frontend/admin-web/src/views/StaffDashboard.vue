<template>
  <div class="staff-dashboard">
    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Yêu Cầu Chờ Xử Lý</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon borrowed">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Sách Đang Mượn</div>
          <div class="stat-value">{{ borrowedCount }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon return">
          <i class="fas fa-undo"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Yêu Cầu Trả</div>
          <div class="stat-value">{{ returnCount }}</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Section -->
    <div class="filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm theo tên, mã..."
          @input="handleSearch"
        />
      </div>

      <div class="tab-buttons">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value; currentPage = 1"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Độc Giả</th>
            <th>Tên Sách</th>
            <th>Ngày Mượn</th>
            <th>Hạn Trả</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredData.length === 0">
            <td colspan="7" class="text-center text-muted">Không có dữ liệu</td>
          </tr>
          <tr v-for="(item, index) in paginatedData" :key="item._id">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ item.maDocGia?.tenDocGia || '-' }}</td>
            <td>{{ item.maSach?.tenSach || '-' }}</td>
            <td>{{ formatDate(item.ngayMuon) }}</td>
            <td>{{ formatDate(item.hanTra) }}</td>
            <td>
              <span :class="['badge', getStatusClass(item.trangThai)]">
                {{ getStatusLabel(item.trangThai) }}
              </span>
            </td>
            <td>
              <button 
                v-if="item.trangThai === 'CHO_XU_LY'"
                class="btn-action btn-confirm"
                @click="openConfirmModal(item)"
                title="Xác nhận mượn"
              >
                <i class="fas fa-check"></i>
              </button>
              <button 
                v-if="item.trangThai === 'DA_MUON'"
                class="btn-action btn-return"
                @click="openReturnModal(item)"
                title="Xác nhận trả"
              >
                <i class="fas fa-undo"></i>
              </button>
              <button 
                v-if="item.trangThai === 'CHO_XU_LY' || item.trangThai === 'DA_MUON'"
                class="btn-action btn-reject"
                @click="rejectRequest(item._id)"
                title="Từ chối"
              >
                <i class="fas fa-times"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-section" v-if="filteredData.length > pageSize">
      <div class="pagination">
        <button 
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Xác Nhận Mượn Sách</h5>
          <button class="close-btn" @click="closeConfirmModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedItem" class="info-group">
            <p><strong>Độc giả:</strong> {{ selectedItem.maDocGia?.tenDocGia }}</p>
            <p><strong>Sách:</strong> {{ selectedItem.maSach?.tenSach }}</p>
            <p><strong>Hạn trả:</strong> {{ formatDate(selectedItem.hanTra) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeConfirmModal">Hủy</button>
          <button class="btn-success" @click="confirmBorrow">Xác Nhận</button>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div v-if="showReturnModal" class="modal-overlay" @click.self="closeReturnModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Xác Nhận Trả Sách</h5>
          <button class="close-btn" @click="closeReturnModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedItem" class="info-group">
            <p><strong>Độc giả:</strong> {{ selectedItem.maDocGia?.tenDocGia }}</p>
            <p><strong>Sách:</strong> {{ selectedItem.maSach?.tenSach }}</p>
            <p><strong>Ngày mượn:</strong> {{ formatDate(selectedItem.ngayMuon) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeReturnModal">Hủy</button>
          <button class="btn-success" @click="confirmReturn">Xác Nhận Trả</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MuonSachService from "@/services/muonsach.service";
import AuthService from "@/services/auth.service";
import DocGiaService from "@/services/docgia.service";
import SachService from "@/services/sach.service";

export default {
  name: "StaffDashboard",
  data() {
    return {
      muonSachList: [],
      filteredData: [],
      searchQuery: "",
      activeTab: "CHO_XU_LY",
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      showReturnModal: false,
      selectedItem: null,
      currentUser: null,

      tabs: [
        { label: "Chờ Xử Lý", value: "CHO_XU_LY" },
        { label: "Đang Mượn", value: "DA_MUON" },
        { label: "Yêu Cầu Trả", value: "CHO_TRA" },
      ],
    };
  },
  computed: {
    pendingCount() {
      return this.muonSachList.filter((item) => item.trangThai === "CHO_XU_LY")
        .length;
    },
    borrowedCount() {
      return this.muonSachList.filter((item) => item.trangThai === "DA_MUON")
        .length;
    },
    returnCount() {
      return this.muonSachList.filter((item) => item.trangThai === "CHO_TRA")
        .length;
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    },
  },
  methods: {
    async fetchAll() {
      try {
        const response = await MuonSachService.getAll();
        this.muonSachList = response.data || [];
        this.applyFilter();
      } catch (error) {
        console.error("Error fetching mượn sách list:", error);
      }
    },

    handleSearch() {
      this.currentPage = 1;
      this.applyFilter();
    },

    applyFilter() {
      let filtered = this.muonSachList.filter(
        (item) => item.trangThai === this.activeTab
      );

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.maDocGia?.tenDocGia?.toLowerCase().includes(query) ||
            item.maSach?.tenSach?.toLowerCase().includes(query) ||
            item.maDocGia?._id?.includes(query) ||
            item.maSach?._id?.includes(query)
        );
      }

      this.filteredData = filtered;
    },

    openConfirmModal(item) {
      this.selectedItem = item;
      this.showConfirmModal = true;
    },

    closeConfirmModal() {
      this.showConfirmModal = false;
      this.selectedItem = null;
    },

    async confirmBorrow() {
      if (!this.selectedItem) return;

      try {
        await MuonSachService.update(this.selectedItem._id, {
          trangThai: "DA_MUON",
          nhanVienId: this.currentUser._id,
        });

        this.closeConfirmModal();
        this.fetchAll();
      } catch (error) {
        console.error("Error confirming borrow:", error);
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    },

    openReturnModal(item) {
      this.selectedItem = item;
      this.showReturnModal = true;
    },

    closeReturnModal() {
      this.showReturnModal = false;
      this.selectedItem = null;
    },

    async confirmReturn() {
      if (!this.selectedItem) return;

      try {
        await MuonSachService.update(this.selectedItem._id, {
          trangThai: "DA_TRA",
          nhanVienId: this.currentUser._id,
        });

        this.closeReturnModal();
        this.fetchAll();
      } catch (error) {
        console.error("Error confirming return:", error);
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    },

    async rejectRequest(id) {
      if (!confirm("Bạn chắc chắn muốn từ chối yêu cầu này?")) return;

      try {
        await MuonSachService.update(id, {
          trangThai: "TU_CHOI",
          nhanVienId: this.currentUser._id,
        });

        this.fetchAll();
      } catch (error) {
        console.error("Error rejecting request:", error);
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusLabel(status) {
      const labels = {
        CHO_XU_LY: "Chờ Xử Lý",
        DA_MUON: "Đang Mượn",
        CHO_TRA: "Yêu Cầu Trả",
        DA_TRA: "Đã Trả",
        TU_CHOI: "Từ Chối",
      };
      return labels[status] || status;
    },

    getStatusClass(status) {
      const classes = {
        CHO_XU_LY: "badge-warning",
        DA_MUON: "badge-info",
        CHO_TRA: "badge-primary",
        DA_TRA: "badge-success",
        TU_CHOI: "badge-danger",
      };
      return classes[status] || "badge-secondary";
    },

    getCurrentUser() {
      const user = AuthService.getCurrentUser();
      this.currentUser = user;
    },
  },
  mounted() {
    this.getCurrentUser();
    this.fetchAll();
  },
};
</script>

<style scoped>
.staff-dashboard {
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Stats Cards */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.pending {
  background-color: #ffc107;
}

.stat-icon.borrowed {
  background-color: #0066ff;
}

.stat-icon.return {
  background-color: #28a745;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.tab-buttons {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #0066ff;
  color: #0066ff;
}

.tab-btn.active {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f0f2f5;
  border-bottom: 2px solid #e0e0e0;
}

.data-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  color: #555;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background-color: #fafafa;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-primary {
  background-color: #cfe2ff;
  color: #084298;
}

.badge-success {
  background-color: #d1e7dd;
  color: #0f5132;
}

.badge-danger {
  background-color: #f8d7da;
  color: #842029;
}

.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

/* Action Buttons */
.btn-action {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: all 0.3s;
}

.btn-confirm {
  background-color: #28a745;
  color: white;
}

.btn-confirm:hover {
  background-color: #218838;
}

.btn-return {
  background-color: #0066ff;
  color: white;
}

.btn-return:hover {
  background-color: #0052cc;
}

.btn-reject {
  background-color: #dc3545;
  color: white;
}

.btn-reject:hover {
  background-color: #c82333;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #0066ff;
  color: #0066ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 10px;
  font-size: 14px;
  color: #666;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-group p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.info-group strong {
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-cancel:hover {
  border-color: #999;
  background: #f5f5f5;
}

.btn-success {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-success:hover {
  background: #218838;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .staff-dashboard {
    padding: 15px;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
  }

  .search-box {
    flex: none;
    width: 100%;
  }

  .tab-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .data-table th,
  .data-table td {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
