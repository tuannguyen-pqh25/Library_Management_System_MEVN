<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="row align-items-center mb-4">
      <div class="col">
        <h3 class="fw-bold text-dark mb-0">
          <span class="text-primary">Quản Lý</span> Nhà Xuất Bản
        </h3>
        <small class="text-muted">Xem và quản lý danh sách các nhà xuất bản</small>
      </div>
    </div>

    <!-- Search & Actions Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-8">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-secondary ps-3">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control bg-light border-start-0 ps-0"
                placeholder="Tìm kiếm theo tên hoặc mã NXB..."
                v-model="searchText"
                @keyup.enter="search"
              />
              <button class="btn btn-primary px-4 fw-bold" type="button" @click="search">
                Tìm kiếm
              </button>
            </div>
          </div>
          <!-- Phần hiển thị số dòng (thay thế nút copy cũ) -->
          <div class="col-md-4 text-end">
            <div class="d-flex align-items-center justify-content-end gap-2">
                <label class="text-secondary fw-semibold small text-nowrap">Hiển thị:</label>
                <select 
                    class="form-select w-auto bg-light border-0 fw-bold text-primary shadow-none cursor-pointer" 
                    v-model="itemsPerPage" 
                    @change="currentPage = 1"
                >
                    <option :value="5">5 dòng</option>
                    <option :value="10">10 dòng</option>
                    <option :value="15">15 dòng</option>
                    <option :value="20">20 dòng</option>
                    <option :value="50">50 dòng</option>
                </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
        <div class="d-flex align-items-center">
          <div class="icon-shape bg-primary text-white rounded-3 me-3 p-2">
            <i class="fas fa-building fa-lg"></i>
          </div>
          <h5 class="mb-0 fw-bold text-secondary">Danh sách Nhà Xuất Bản</h5>
        </div>
      </div>

      <div class="card-body p-0 mt-3">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-secondary">
              <tr>
                <th class="fw-bold text-uppercase small ps-4">STT</th>
                <th class="fw-bold text-uppercase small">Mã NXB</th>
                <th class="fw-bold text-uppercase small">Tên Nhà Xuất Bản</th>
                <th class="fw-bold text-uppercase small">Địa Chỉ</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="(nxb, index) in paginatedNXB" :key="nxb._id">
                <td class="text-muted fw-bold ps-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                      <span class="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill me-2">
                        {{ nxb.MANXB }}
                      </span>
                      <!-- Nút copy nhỏ kế bên -->
                      <button 
                        class="btn btn-sm btn-light text-secondary rounded-circle shadow-sm copy-btn" 
                        @click="copyToClipboard(nxb.MANXB)"
                        title="Sao chép mã"
                      >
                        <i v-if="copiedId === nxb.MANXB" class="fas fa-check text-success"></i>
                        <i v-else class="fas fa-copy"></i>
                      </button>
                  </div>
                </td>
                <td class="fw-semibold text-dark">{{ nxb.TENNXB }}</td>
                <td class="text-secondary"><i class="fas fa-map-marker-alt me-2 text-danger opacity-50"></i> {{ nxb.DIACHI }}</td>
              </tr>
              <tr v-if="paginatedNXB.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                  <p class="mb-0">Không tìm thấy dữ liệu phù hợp.</p>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3" v-if="!loading && totalPages > 1">
        <nav>
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link border-0 rounded-circle mx-1" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }"
            >
              <a class="page-link border-0 rounded-circle mx-1 shadow-sm" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link border-0 rounded-circle mx-1" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import NhaXuatBanService from "@/services/nhaxuatban.service";

export default {
  name: "StaffNhaXuatBanManagement",
  data() {
    return {
      nhaXuatBans: [],
      loading: true,
      searchText: "",
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 5, // Mặc định hiển thị 5 dòng
      
      // Copy visual feedback
      copiedId: null,
    };
  },
  computed: {
    filteredNXB() {
      if (!this.searchText) {
        return this.nhaXuatBans;
      }
      const lowerSearch = this.searchText.toLowerCase();
      return this.nhaXuatBans.filter(
        (nxb) =>
          nxb.TENNXB.toLowerCase().includes(lowerSearch) ||
          nxb.MANXB.toLowerCase().includes(lowerSearch)
      );
    },
    totalPages() {
      return Math.ceil(this.filteredNXB.length / this.itemsPerPage);
    },
    paginatedNXB() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNXB.slice(start, end);
    },
  },
  methods: {
    async retrieveNXB() {
      this.loading = true;
      try {
        const response = await NhaXuatBanService.getAll();
        this.nhaXuatBans = response.data;
      } catch (error) {
        console.error("Lỗi khi tải danh sách NXB:", error);
      } finally {
        this.loading = false;
      }
    },

    search() {
      this.currentPage = 1;
    },

    changePage(page) {
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      this.currentPage = page;
    },

    // Hàm sao chép mã NXB đơn lẻ
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        // Hiển thị visual feedback (icon check)
        this.copiedId = text;
        // Tắt icon check sau 2 giây
        setTimeout(() => {
          this.copiedId = null;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("Không thể sao chép. Vui lòng thử lại.");
      }
    },
  },
  mounted() {
    this.retrieveNXB();
  },
};
</script>

<style scoped>
/* Icon shape container */
.icon-shape {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Input group styling for search */
.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  color: #6c757d;
}

.input-group .form-control {
  background-color: #f8f9fa;
  border-left: none;
  color: #495057;
}

.input-group:focus-within .input-group-text {
  background-color: #fff;
  border-color: #86b7fe;
  color: #0d6efd;
}

.input-group:focus-within .form-control {
  background-color: #fff;
  border-color: #86b7fe;
  box-shadow: none;
}

.input-group:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
  border-radius: 0.375rem;
}

/* Pagination Styling */
.page-link {
  color: #6c757d;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-weight: 600;
  transition: all 0.2s;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  background-color: #e9ecef;
  color: #adb5bd;
}

.page-link:hover:not(.active) {
  background-color: #e9ecef;
  color: #0d6efd;
}

/* Table Hover Effect */
.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.04);
}

/* Copy Button Styling */
.copy-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0.6;
}
.copy-btn:hover {
    background-color: #e9ecef;
    opacity: 1;
    transform: scale(1.1);
}
.copy-btn:active {
    transform: scale(0.95);
}

/* Cursor pointer for select */
.cursor-pointer {
    cursor: pointer;
}
</style>