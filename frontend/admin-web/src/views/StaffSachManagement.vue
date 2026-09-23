<template>
  <div class="container-fluid px-4 pt-2 pb-4 bg-light min-vh-100">

    <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
      <div>
        <h4 class="mb-0 text-primary fw-bold">
          <i class="fas fa-book-reader me-2"></i>Quản lý Kho Sách
        </h4>
        <small class="text-muted">Quản lý kho và thông tin chi tiết ấn phẩm</small>
      </div>
      <button class="btn btn-primary px-4 py-2 fw-semibold shadow-sm btn-add" @click="openAddModal">
        <i class="fas fa-plus me-2"></i> Thêm Sách Mới
      </button>
    </div>

    <div class="card border-0 shadow-sm mb-4 rounded-3">
      <div class="card-body p-3">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="position-relative">
              <span class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style="pointer-events: none; z-index: 5;">
                <i class="fas fa-filter"></i>
              </span>
              
              <select class="form-select custom-height shadow-none ps-5" v-model="filterStock">
                <option value="all">Tất cả trạng thái</option>
                <option value="in_stock">Còn sách</option>
                <option value="out_of_stock">Hết sách</option>
              </select>
            </div>
          </div>
          <div class="col-md-9">
            <div class="input-group">
              <input
                type="text"
                class="form-control custom-height shadow-none"
                placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                v-model="searchText"
                @keyup.enter="search"
              >
              <button class="btn btn-primary px-4 custom-height" type="button" @click="search">
                <i class="fas fa-search"></i>
              </button>
              <button
                class="btn btn-outline-secondary custom-height"
                type="button"
                @click="toggleVoiceSearch"
                :class="{ 'btn-danger': isListening }"
                title="Tìm kiếm bằng giọng nói"
              >
                <i class="fas fa-microphone" :class="{ 'fa-spin': isListening }"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredBooks.length === 0" class="text-center py-5 bg-white rounded shadow-sm">
      <i class="fas fa-box-open fa-4x text-muted mb-3 opacity-50"></i>
      <p class="text-muted fs-5">Kho sách hiện đang trống hoặc không tìm thấy kết quả.</p>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <small class="text-muted">
          Hiển thị {{ paginatedBooks.length }} trên tổng số {{ filteredBooks.length }} sách
        </small>
      </div>
      <div class="row g-4">
      <div
        v-for="(book, index) in paginatedBooks"
        :key="book._id"
        class="col-xl-3 col-lg-4 col-md-6 col-sm-12"
      >
        <div class="card h-100 border-0 shadow-sm book-card overflow-hidden">
          
          <div class="position-absolute top-0 start-0 w-100 p-2 d-flex justify-content-end z-index-1">
            <span
              class="badge rounded-pill shadow-sm px-3 py-2"
              :class="book.SOQUYEN > 0 ? 'bg-success' : 'bg-danger'"
            >
              {{ book.SOQUYEN > 0 ? `Sẵn sàng: ${book.SOQUYEN}` : 'Đã hết' }}
            </span>
          </div>

          <div class="img-container bg-light position-relative">
             <img
                :src="book.HinhAnh || 'https://via.placeholder.com/200x300?text=No+Image'"
                class="book-img"
                :alt="book.TENSACH"
                @error="(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }"
              >
          </div>

          <div class="card-body p-3 d-flex flex-column text-center">
            <h6 class="card-title fw-bold text-dark text-truncate-2 mb-1" :title="book.TENSACH">
              {{ book.TENSACH }}
            </h6>
            <p class="text-muted small mb-3 fst-italic">{{ book.TACGIA }}</p>
            
            <div class="mt-auto d-flex justify-content-center gap-2">
               <button class="btn btn-sm btn-outline-info rounded-circle action-btn" @click="viewDetails(book)" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
               </button>
               <button class="btn btn-sm btn-outline-warning rounded-circle action-btn" @click="openEditModal(book)" title="Chỉnh sửa">
                  <i class="fas fa-pen"></i>
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
    </div>

    <div class="d-flex justify-content-center mt-5" v-if="totalPages > 1">
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-md shadow-sm">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link border-0 rounded-start" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
            <a class="page-link border-0" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link border-0 rounded-end" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="modal fade" id="sachModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg overflow-hidden">
          
          <div class="modal-header bg-primary text-white py-2 px-3">
            <h6 class="modal-title fw-bold text-uppercase">
              <i class="fas" :class="isEdit ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{ isEdit ? 'Cập Nhật Sách' : 'Thêm Sách Mới' }}
            </h6>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body p-0">
             <Form @submit="saveSach" :validation-schema="bookSchema" :validate-on-input="true" v-slot="{ errors }">
                <div class="row g-0" style="height: 75vh;"> 
                    
                    <div class="col-lg-4 bg-light border-end d-flex flex-column p-3 h-100 overflow-auto">
                        <h6 class="fw-bold text-secondary mb-2 small"><i class="fas fa-image me-2"></i>Ảnh Bìa</h6>
                        
                        <div class="upload-area flex-grow-1 d-flex flex-column justify-content-center align-items-center mb-2 bg-white rounded border shadow-sm" 
                             @click="openImageUploader" 
                             style="min-height: 250px;">
                             
                             <div v-if="uploadingImage" class="text-center">
                                <div class="spinner-border text-primary mb-2 spinner-border-sm"></div>
                                <p class="small text-muted mb-0">Đang tải...</p>
                             </div>
                             
                             <div v-else-if="imageUrl" class="position-relative w-100 h-100 preview-container d-flex align-items-center justify-content-center p-2">
                                <img :src="imageUrl" class="img-fluid rounded" style="max-height: 100%; object-fit: contain;">
                                <div class="overlay d-flex align-items-center justify-content-center rounded">
                                    <span class="btn btn-light btn-sm fw-bold shadow-sm"><i class="fas fa-camera me-1"></i> Đổi ảnh</span>
                                </div>
                             </div>

                             <div v-else class="text-center p-3">
                                <div class="icon-circle bg-light-primary text-primary mb-2 mx-auto" style="width: 40px; height: 40px;">
                                    <i class="fas fa-cloud-upload-alt fa-lg"></i>
                                </div>
                                <h6 class="fw-bold mb-0 small">Chọn ảnh bìa</h6>
                                <p class="text-muted mb-0" style="font-size: 0.75rem">Tối đa 5MB</p>
                             </div>
                        </div>

                        <div class="form-group mt-2">
                             <Field name="HinhAnh" type="text" class="form-control form-control-sm" placeholder="Hoặc dán link ảnh..." v-model="imageUrl" />
                             <ErrorMessage name="HinhAnh" class="text-danger small" style="font-size: 0.7rem;" />
                        </div>
                         <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileSelect" />
                    </div>

                    <div class="col-lg-8 bg-white d-flex flex-column h-100">
                        
                        <div class="p-3 overflow-auto flex-grow-1">
                            
                            <div class="mb-3">
                                <h6 class="text-uppercase text-muted small fw-bold mb-2 border-bottom pb-1">Thông tin chung</h6>
                                <div class="row g-2">
                                    <div class="col-12">
                                        <label class="form-label fw-semibold small mb-1">Tên Sách <span class="text-danger">*</span></label>
                                        <Field name="TENSACH" type="text" class="form-control form-control-sm" :class="{'is-invalid': errors.TENSACH}" placeholder="Nhập tên sách..." v-model="formData.TENSACH" />
                                        <ErrorMessage name="TENSACH" class="invalid-feedback small" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold small mb-1">Tác Giả <span class="text-danger">*</span></label>
                                        <Field name="TACGIA" type="text" class="form-control form-control-sm" :class="{'is-invalid': errors.TACGIA}" placeholder="Tên tác giả" v-model="formData.TACGIA" />
                                        <ErrorMessage name="TACGIA" class="invalid-feedback small" />
                                    </div>
                                     <div class="col-md-6">
                                        <label class="form-label fw-semibold small mb-1">Nhà Xuất Bản</label>
                                        <Field name="MANXB" type="text" class="form-control form-control-sm" :class="{'is-invalid': errors.MANXB}" placeholder="NXB" v-model="formData.MANXB" />
                                        <ErrorMessage name="MANXB" class="invalid-feedback small" />
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <h6 class="text-uppercase text-muted small fw-bold mb-2 border-bottom pb-1">Chi tiết ấn phẩm</h6>
                                <div class="row g-2">
                                    <div class="col-md-4">
                                         <label class="form-label fw-semibold small mb-1">Thể Loại</label>
                                         <Field name="THELOAI" type="text" class="form-control form-control-sm" :class="{'is-invalid': errors.THELOAI}" v-model="formData.THELOAI" list="genreOptions"/>
                                         <datalist id="genreOptions">
                                              <option value="Khoa học"></option>
                                              <option value="Văn học"></option>
                                              <option value="Kinh tế"></option>
                                              <option value="Truyện tranh"></option>
                                         </datalist>
                                         <ErrorMessage name="THELOAI" class="invalid-feedback small" />
                                    </div>
                                    <div class="col-md-4">
                                         <label class="form-label fw-semibold small mb-1">Ngôn Ngữ</label>
                                         <Field name="NGONNGU" type="text" class="form-control form-control-sm" :class="{'is-invalid': errors.NGONNGU}" v-model="formData.NGONNGU" />
                                         <ErrorMessage name="NGONNGU" class="invalid-feedback small" />
                                    </div>
                                    <div class="col-md-2">
                                         <label class="form-label fw-semibold small mb-1">Năm XB</label>
                                         <Field name="NAMXUATBAN" type="number" class="form-control form-control-sm" :class="{'is-invalid': errors.NAMXUATBAN}" v-model="formData.NAMXUATBAN" />
                                         <ErrorMessage name="NAMXUATBAN" class="invalid-feedback small" />
                                    </div>
                                    <div class="col-md-2">
                                         <label class="form-label fw-semibold small mb-1">Trang</label>
                                         <Field name="SOTRANG" type="number" class="form-control form-control-sm" :class="{'is-invalid': errors.SOTRANG}" v-model="formData.SOTRANG" />
                                         <ErrorMessage name="SOTRANG" class="invalid-feedback small" />
                                    </div>
                                </div>
                            </div>

                            <div class="p-2 bg-light rounded border mb-3">
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold text-primary small mb-1">Đơn Giá Nhập</label>
                                        <div class="input-group input-group-sm">
                                            <Field name="DONGIA" type="number" class="form-control fw-bold text-primary" :class="{'is-invalid': errors.DONGIA}" placeholder="0" v-model="formData.DONGIA" />
                                            <span class="input-group-text fw-bold">VNĐ</span>
                                        </div>
                                        <ErrorMessage name="DONGIA" class="invalid-feedback small" />
                                    </div>
                                    <div class="col-md-6">
                                         <label class="form-label fw-bold text-success small mb-1">Số Lượng Nhập</label>
                                         <div class="input-group input-group-sm">
                                            <Field name="SOQUYEN" type="number" class="form-control fw-bold text-success" :class="{'is-invalid': errors.SOQUYEN}" v-model="formData.SOQUYEN" />
                                            <span class="input-group-text">Quyển</span>
                                         </div>
                                         <ErrorMessage name="SOQUYEN" class="invalid-feedback small" />
                                    </div>
                                </div>
                            </div>

                             <div>
                                 <label class="form-label fw-semibold small mb-1">Mô Tả Nội Dung</label>
                                 <Field name="MOTA" as="textarea" class="form-control form-control-sm" :class="{'is-invalid': errors.MOTA}" rows="5" v-model="formData.MOTA" placeholder="Tóm tắt nội dung..." />
                                 <ErrorMessage name="MOTA" class="invalid-feedback small" />
                            </div>
                        </div>

                        <div class="modal-footer bg-light border-top py-2 px-3 justify-content-end mt-auto">
                            <button type="button" class="btn btn-secondary btn-sm px-3" data-bs-dismiss="modal">Đóng</button>
                            <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold shadow-sm">
                                <i class="fas fa-save me-1"></i> {{ isEdit ? 'Lưu Thay Đổi' : 'Thêm Sách' }}
                            </button>
                        </div>

                    </div>
                </div>
             </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="sachDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered"> <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
             <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-0 pb-4 px-4" v-if="selectedBook">
             <div class="row">
                <div class="col-md-4 text-center">
                    <div class="rounded overflow-hidden shadow-sm mb-3 bg-light d-flex align-items-center justify-content-center" style="height: 380px;">
                        <img
                        :src="selectedBook.HinhAnh || 'https://via.placeholder.com/200x300?text=No+Image'"
                        class="img-fluid"
                        style="max-height: 100%; object-fit: contain;"
                        @error="(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }"
                        >
                    </div>
                    <div class="d-grid">
                        <span class="badge py-2" :class="selectedBook.SOQUYEN > 0 ? 'bg-success' : 'bg-danger'">
                            <i class="fas me-1" :class="selectedBook.SOQUYEN > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
                            {{ selectedBook.SOQUYEN > 0 ? `Còn ${selectedBook.SOQUYEN} quyển` : 'Hết sách' }}
                        </span>
                    </div>
                </div>

                <div class="col-md-8">
                    <h4 class="fw-bold mb-1 text-dark">{{ selectedBook.TENSACH }}</h4>
                    <p class="text-muted fst-italic mb-3"><i class="fas fa-pen-nib me-2 small"></i>{{ selectedBook.TACGIA }}</p>
                    
                    <div class="bg-light p-3 rounded mb-3 border">
                        <div class="row g-3">
                            <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Mã NXB</small>
                                <span class="fw-medium text-dark">{{ selectedBook.MANXB }}</span>
                            </div>
                            <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Năm xuất bản</small>
                                <span class="fw-medium text-dark">{{ selectedBook.NAMXUATBAN }}</span>
                            </div>
                            <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Thể loại</small>
                                <span class="badge bg-info text-dark">{{ selectedBook.THELOAI }}</span>
                            </div>
                            <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Ngôn ngữ</small>
                                <span class="fw-medium text-dark">{{ selectedBook.NGONNGU }}</span>
                            </div>
                             <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Số trang</small>
                                <span class="fw-medium text-dark">{{ selectedBook.SOTRANG }} trang</span>
                            </div>
                            <div class="col-sm-6">
                                <small class="text-muted d-block mb-1">Đơn giá</small>
                                <span class="fw-bold text-primary">{{ formatCurrency(selectedBook.DONGIA) }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h6 class="fw-bold small text-uppercase text-secondary mb-2"><i class="fas fa-align-left me-1"></i>Giới thiệu nội dung</h6>
                        <div class="p-0">
                             <p class="small text-secondary mb-0 text-justify lh-base" style="text-align: justify;">
                                {{ selectedBook.MOTA || 'Chưa có mô tả nội dung.' }}
                             </p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>


  </div>

  <div v-if="showSuccessNotification" class="success-notification">
    <div class="notification-content">
      <i class="fas fa-check-circle me-2"></i>
      <span>{{ notificationMessage }}</span>
    </div>
  </div>
</template>

<script>
import SachService from "@/services/sach.service";
import { Modal } from "bootstrap";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "StaffSachManagement",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const bookSchema = yup.object().shape({
      TENSACH: yup.string().required("Tên sách là bắt buộc!").min(2, "Quá ngắn").max(200, "Quá dài"),
      MANXB: yup.string().required("Bắt buộc").max(50, "Quá dài"),
      TACGIA: yup.string().required("Bắt buộc").max(100, "Quá dài"),
      NAMXUATBAN: yup.number().required("Bắt buộc").typeError("Phải là số").min(1900, "Từ 1900+").max(new Date().getFullYear() + 1, "Không hợp lệ"),
      SOQUYEN: yup.number().required("Bắt buộc").typeError("Phải là số").min(1, "Ít nhất 1").max(10000, "Quá nhiều"),
      DONGIA: yup.number().required("Bắt buộc").typeError("Phải là số").min(1000, "Min 1k").max(10000000, "Max 10tr"),
      SOTRANG: yup.number().required("Bắt buộc").typeError("Phải là số").min(1, "Min 1"),
      NGONNGU: yup.string().required("Bắt buộc"),
      THELOAI: yup.string().required("Bắt buộc"),
      MOTA: yup.string().required("Bắt buộc").min(10, "Mô tả quá ngắn"),
    });

    return {
      loading: false,
      message: "",
      bookSchema,
      imageUrl: "",
      uploadingImage: false,
      uploadAbortController: null,
      books: [],
      searchText: "",
      filterStock: "all",
      currentPage: 1,
      itemsPerPage: 8,
      selectedBook: null,
      isEdit: false,
      showSuccessNotification: false,
      notificationMessage: "",
      formData: {
        TENSACH: "",
        TACGIA: "",
        MANXB: "",
        NAMXUATBAN: "",
        DONGIA: "",
        SOQUYEN: 0,
        SOTRANG: "",
        NGONNGU: "",
        THELOAI: "",
        HinhAnh: "",
        MOTA: "",
      },
      detailModal: null,
      sachModal: null,
      isListening: false,
      recognition: null,
    };
  },
  computed: {
    filteredBooks() {
      let filtered = this.books;
      if (this.filterStock === "in_stock") filtered = filtered.filter(b => b.SOQUYEN > 0);
      else if (this.filterStock === "out_of_stock") filtered = filtered.filter(b => b.SOQUYEN === 0);

      if (this.searchText.trim()) {
        const lower = this.searchText.trim().toLowerCase();
        filtered = filtered.filter(b => b.TENSACH.toLowerCase().includes(lower) || b.TACGIA.toLowerCase().includes(lower));
      }
      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    },
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredBooks.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    formatCurrency(value) {
      if (!value) return "0 VNĐ";
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    async retrieveBooks() {
      try {
        const response = await SachService.getAll();
        this.books = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    viewDetails(book) {
      this.selectedBook = book;
      this.detailModal.show();
    },
    openAddModal() {
      this.isEdit = false;
      this.resetForm();
      this.sachModal.show();
    },
    openEditModal(book) {
      this.isEdit = true;
      this.formData = { ...book };
      this.imageUrl = book.HinhAnh || "";
      this.sachModal.show();
    },
    resetForm() {
      this.formData = {
        TENSACH: "",
        TACGIA: "",
        MANXB: "",
        NAMXUATBAN: "",
        DONGIA: "",
        SOQUYEN: 0,
        SOTRANG: "",
        NGONNGU: "",
        THELOAI: "",
        HinhAnh: "",
        MOTA: "",
      };
      this.imageUrl = "";
      this.uploadingImage = false;
      if (this.uploadAbortController) {
        this.uploadAbortController.abort();
        this.uploadAbortController = null;
      }
    },
    async saveSach() {
      try {
        this.formData.HinhAnh = this.imageUrl;
        if (this.isEdit) {
          await SachService.update(this.formData._id, this.formData);
          this.notificationMessage = "Cập nhật sách thành công!";
        } else {
          await SachService.create(this.formData);
          this.notificationMessage = "Thêm sách thành công!";
        }
        this.retrieveBooks();
        this.sachModal.hide();
        this.showSuccessNotification = true;
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 700);
      } catch (error) {
        console.error("Lỗi lưu sách:", error);
        alert("Lỗi khi lưu sách");
      }
    },

    changePage(page) {
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      this.currentPage = page;
    },
    search() {
      this.currentPage = 1;
    },
    openImageUploader() {
      this.$refs.fileInput.click();
    },
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Chỉ chấp nhận file ảnh!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }

      this.uploadingImage = true;
      this.uploadAbortController = new AbortController();

      try {
        // Compress image first
        const compressedFile = await this.compressImage(file);

        // Convert compressed file to base64 data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          try {
            // Upload to Cloudinary via backend
            const response = await SachService.uploadImage(dataUrl, this.uploadAbortController.signal);
            // Backend returns { message, data: { url, publicId } }
            this.imageUrl = response.data?.data?.url || response.data?.url;
          } catch (uploadError) {
            if (uploadError.name !== 'AbortError') {
              console.error('Upload failed:', uploadError);
              alert('Tải ảnh lên thất bại!');
            }
          } finally {
            this.uploadingImage = false;
            this.uploadAbortController = null;
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('File processing failed:', error);
        alert('Lỗi xử lý ảnh!');
        this.uploadingImage = false;
        this.uploadAbortController = null;
      }
    },

    async compressImage(file) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1200;
          let { width, height } = img;
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', 0.9);
        };
        img.src = URL.createObjectURL(file);
      });
    },
    toggleVoiceSearch() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.');
        return;
      }

      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
        return;
      }

      if (!this.recognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'vi-VN'; // Vietnamese language
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.searchText = transcript;
          this.search();
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
          if (event.error !== 'not-allowed') {
            alert('Có lỗi xảy ra khi nhận diện giọng nói. Vui lòng thử lại.');
          }
        };
      }

      this.isListening = true;
      this.recognition.start();
    },
  },
  watch: {
    filterStock() {
      this.currentPage = 1;
    },
  },
  mounted() {
    this.retrieveBooks();
    this.detailModal = new Modal(document.getElementById("sachDetailModal"));
    this.sachModal = new Modal(document.getElementById("sachModal"));
  },
};
</script>

<style scoped>
/* Tổng quan */
.bg-light { background-color: #f3f4f6 !important; }
.custom-height { height: 48px; }

/* Upload Area */
.upload-area {
    border: 2px dashed #dee2e6;
    transition: all 0.2s ease;
    cursor: pointer;
    background-color: #fff;
}
.upload-area:hover {
    border-color: #0d6efd;
    background-color: #f1f7ff;
}
.preview-container .overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.2s;
}
.preview-container:hover .overlay {
    opacity: 1;
}

/* Form Styles */
.form-label {
    margin-bottom: 0.2rem;
    color: #495057;
}
/* Border radius cho form control small */
.form-control-sm, .input-group-sm .form-control, .input-group-sm .input-group-text {
    border-radius: 0.25rem;
}

/* Book Card Style (Hiệu ứng mạnh như ban đầu) */
.book-card {
    transition: all 0.3s ease;
    border-radius: 10px;
    background: #fff;
}
.book-card:hover {
    transform: translateY(-5px); /* Quay về -5px */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}
.img-container {
    height: 280px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.book-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}
.book-card:hover .book-img {
    transform: scale(1.08); /* Quay về scale 1.08 */
}
.z-index-1 { z-index: 10; }
.text-truncate-2.action-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.action-btn:hover {
    transform: scale(1.1);
}
.page-link { color: #555; margin: 0 3px; border-radius: 4px; }
.page-item.active .page-link { background-color: #0d6efd; color: #fff; }

/* Modal Inputs */
.form-control:focus, .form-select:focus {
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
    border-color: #86b7fe;
}

/* Success Notification */
.success-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    animation: slideIn 0.6s ease-out;
}

.notification-content {
    background-color: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    min-width: 250px;
    justify-content: center;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Spinning microphone animation */
.fa-microphone.fa-spin {
    animation-duration: 1.2s;
}
</style>