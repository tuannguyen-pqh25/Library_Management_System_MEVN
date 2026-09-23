<template>
  <div class="container-fluid pt-3 pb-4 bg-light-gray min-vh-100">
    <!-- Header Section -->
    <div class="row align-items-center mb-4">
      <div class="col-auto">
        <router-link to="/admin/sach" class="btn btn-white shadow-sm rounded-pill px-3 fw-bold text-primary border">
          <i class="fas fa-arrow-left me-2"></i> Quay lại
        </router-link>
      </div>
      <div class="col">
        <h3 class="fw-bold text-dark mb-0">
          <span class="text-primary">Cập Nhật</span> Sách
        </h3>
        <small class="text-muted">Chỉnh sửa thông tin chi tiết của sách</small>
      </div>
    </div>

    <!-- SUCCESS TOAST -->
    <transition name="slide-fade">
      <div v-if="showSuccessNotification" class="toast-overlay success">
        <div class="d-flex align-items-center">
          <div class="icon-circle bg-white text-success me-3">
             <i class="fas fa-check"></i>
          </div>
          <div>
             <h6 class="mb-0 fw-bold">Thành công!</h6>
             <small>Thông tin sách đã được cập nhật.</small>
          </div>
        </div>
      </div>
    </transition>

    <!-- ERROR TOAST -->
    <transition name="slide-fade">
      <div v-if="showErrorNotification" class="toast-overlay error">
        <div class="d-flex align-items-center">
          <div class="icon-circle bg-white text-danger me-3">
             <i class="fas fa-exclamation"></i>
          </div>
          <div>
             <h6 class="mb-0 fw-bold">Đã có lỗi xảy ra!</h6>
             <small>{{ message }}</small>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Form Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      
      <!-- Loading State -->
      <div v-if="loading && !book" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Đang tải dữ liệu...</p>
      </div>

      <div class="card-body p-4" v-if="book">
        <Form @submit="handleUpdate" :validation-schema="bookSchema" :initial-values="book" :validate-on-input="true">
          <div class="row g-4">
            
            <!-- LEFT COLUMN: IMAGE UPLOAD -->
            <div class="col-lg-4">
              <div class="sticky-top" style="top: 20px; z-index: 1;">
                <div class="p-3 bg-light rounded-4 border border-light-subtle h-100">
                  <h6 class="fw-bold text-dark mb-3"><i class="fas fa-image me-2 text-primary"></i>Ảnh Bìa</h6>
                  
                  <!-- Image Preview / Upload Area -->
                  <div class="image-upload-wrapper bg-white shadow-sm rounded-4" @click="openImageUploader">
                    <!-- Loading State -->
                    <div v-if="uploadingImage" class="d-flex flex-column align-items-center justify-content-center h-100 text-primary">
                      <div class="spinner-border mb-2" role="status"></div>
                      <small class="fw-bold">Đang tải ảnh...</small>
                    </div>
                    
                    <!-- Preview State -->
                    <div v-else-if="imageUrl" class="image-preview h-100 position-relative">
                      <img :src="imageUrl" alt="Book Cover" class="w-100 h-100 object-fit-cover rounded-4" />
                      <div class="overlay-hover rounded-4 d-flex align-items-center justify-content-center">
                        <div class="text-white text-center">
                           <i class="fas fa-camera fa-2x mb-2"></i>
                           <p class="mb-0 fw-bold small">Thay đổi ảnh</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Placeholder State -->
                    <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 text-secondary p-4 text-center">
                      <div class="bg-primary-subtle rounded-circle p-3 mb-3 text-primary">
                          <i class="fas fa-cloud-upload-alt fa-2x"></i>
                      </div>
                      <p class="mb-1 fw-bold text-dark">Nhấn để tải ảnh</p>
                      <small class="text-muted" style="font-size: 0.75rem;">(JPG, PNG, Max 5MB)</small>
                    </div>
                  </div>

                  <!-- URL Input Fallback -->
                  <div class="mt-3">
                     <label class="form-label small fw-bold text-secondary mb-1">Hoặc nhập URL ảnh:</label>
                     <div class="input-group input-group-sm">
                        <span class="input-group-text bg-white border-end-0"><i class="fas fa-link text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0 bg-white" v-model="imageUrl" placeholder="https://..." />
                     </div>
                  </div>
                  <ErrorMessage name="HinhAnh" class="text-danger small mt-1 d-block text-center fw-bold" />

                  <!-- Submit Button (Left Side) -->
                  <div class="d-grid mt-4">
                     <button class="btn btn-primary fw-bold py-2 shadow-sm button-save" :disabled="loading">
                        <span v-if="!loading"><i class="fas fa-save me-2"></i> Lưu Cập Nhật</span>
                        <span v-else><span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</span>
                     </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: BOOK INFO -->
            <div class="col-lg-8">
              
              <!-- Section 1: Basic Info -->
              <div class="mb-4">
                 <h6 class="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Thông tin cơ bản</h6>
                 <div class="row g-3">
                     <div class="col-12">
                        <label class="form-label fw-bold text-dark small">Tên Sách <span class="text-danger">*</span></label>
                        <Field name="TENSACH" type="text" class="form-control" placeholder="Nhập tên sách..." />
                        <ErrorMessage name="TENSACH" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-md-6">
                        <label class="form-label fw-bold text-dark small">Tác Giả <span class="text-danger">*</span></label>
                        <div class="input-group">
                           <span class="input-group-text bg-light border-end-0"><i class="fas fa-pen-nib text-secondary"></i></span>
                           <Field name="TACGIA" type="text" class="form-control border-start-0 ps-0" placeholder="Tên tác giả" />
                        </div>
                        <ErrorMessage name="TACGIA" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-md-6">
                        <label class="form-label fw-bold text-dark small">Mã NXB <span class="text-danger">*</span></label>
                        <div class="input-group">
                           <span class="input-group-text bg-light border-end-0"><i class="fas fa-barcode text-secondary"></i></span>
                           <Field name="MANXB" type="text" class="form-control border-start-0 ps-0" placeholder="Mã nhà xuất bản" />
                        </div>
                        <ErrorMessage name="MANXB" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-md-6">
                        <label class="form-label fw-bold text-dark small">Thể Loại <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0"><i class="fas fa-tags text-secondary"></i></span>
                            <Field name="THELOAI" type="text" class="form-control border-start-0 ps-0" placeholder="Ví dụ: Khoa học..." />
                        </div>
                        <ErrorMessage name="THELOAI" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-md-6">
                        <label class="form-label fw-bold text-dark small">Đơn Giá <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <Field name="DONGIA" type="number" class="form-control border-end-0" placeholder="0" />
                            <span class="input-group-text bg-light border-start-0 text-success fw-bold">VNĐ</span>
                        </div>
                        <ErrorMessage name="DONGIA" class="text-danger small mt-1 fw-bold" />
                     </div>
                 </div>
              </div>

              <!-- Section 2: Publishing Details -->
              <div class="mb-4">
                 <h6 class="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Chi tiết xuất bản</h6>
                 <div class="row g-3">
                     <div class="col-6 col-md-3">
                        <label class="form-label fw-bold text-dark small">Năm XB</label>
                        <Field name="NAMXUATBAN" type="number" class="form-control" />
                        <ErrorMessage name="NAMXUATBAN" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-6 col-md-3">
                        <label class="form-label fw-bold text-dark small">Số Quyển</label>
                        <Field name="SOQUYEN" type="number" class="form-control" />
                        <ErrorMessage name="SOQUYEN" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-6 col-md-3">
                        <label class="form-label fw-bold text-dark small">Số Trang</label>
                        <Field name="SOTRANG" type="number" class="form-control" />
                        <ErrorMessage name="SOTRANG" class="text-danger small mt-1 fw-bold" />
                     </div>
                     <div class="col-6 col-md-3">
                        <label class="form-label fw-bold text-dark small">Ngôn Ngữ</label>
                        <Field name="NGONNGU" type="text" class="form-control" placeholder="Tiếng Việt" />
                        <ErrorMessage name="NGONNGU" class="text-danger small mt-1 fw-bold" />
                     </div>
                 </div>
              </div>

              <!-- Section 3: Description -->
              <div class="mb-3">
                 <h6 class="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Nội dung</h6>
                 <label class="form-label fw-bold text-dark small">Mô Tả Ngắn <span class="text-danger">*</span></label>
                 <Field name="MOTA" as="textarea" class="form-control shadow-sm" rows="5" placeholder="Viết mô tả ngắn về nội dung sách..." />
                 <ErrorMessage name="MOTA" class="text-danger small mt-1 fw-bold" />
              </div>

            </div>
          </div>
          
          <!-- Hidden File Input -->
          <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileSelect" />
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import SachService from "@/services/sach.service";

export default {
  name: "SachEdit",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const bookSchema = yup.object().shape({
      TENSACH: yup.string().required("Tên sách là bắt buộc!"),
      MANXB: yup.string().required("Mã NXB là bắt buộc!"),
      TACGIA: yup.string().required("Tên tác giả là bắt buộc!"),
      NAMXUATBAN: yup.number().required("Năm XB là bắt buộc!").typeError("Năm XB phải là số").min(1900),
      SOQUYEN: yup.number().required("Số quyển là bắt buộc!").typeError("Số quyển phải là số").min(1),
      DONGIA: yup.number().required("Đơn giá là bắt buộc!").typeError("Đơn giá phải là số").min(0),
      HinhAnh: yup.string().url("Phải là URL hợp lệ").optional().nullable(),
      SOTRANG: yup.number().optional().nullable().typeError("Số trang phải là số"),
      NGONNGU: yup.string().optional().nullable(),
      THELOAI: yup.string().optional().nullable(),
      MOTA: yup.string().optional().nullable(),
    });

    return {
      book: null,
      loading: false,
      message: "",
      bookSchema,
      imageUrl: "",
      uploadingImage: false,
      uploadAbortController: null,
      showSuccessNotification: false,
      showErrorNotification: false,
    };
  },
  methods: {
    openImageUploader() {
      this.$refs.fileInput.click();
    },

    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.showErrorNotification = false;

      if (!file.type.startsWith("image/")) {
        this.message = "Vui lòng chọn file ảnh!";
        this.showErrorNotification = true;
        setTimeout(() => this.showErrorNotification = false, 3000);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.message = "Ảnh không được vượt quá 5MB!";
        this.showErrorNotification = true;
        setTimeout(() => this.showErrorNotification = false, 3000);
        return;
      }

      try {
        const compressedFile = await this.compressImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageUrl = e.target.result;
          this.uploadImageToCloudinary(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error(error);
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

    async uploadImageToCloudinary(base64Data) {
      try {
        if (this.uploadAbortController) this.uploadAbortController.abort();
        this.uploadAbortController = new AbortController();
        this.uploadingImage = true;
        this.message = "";
        this.showErrorNotification = false;

        const response = await SachService.uploadImage(base64Data, this.uploadAbortController.signal);
        const returnedUrl = response?.data?.data?.url;
        
        if (returnedUrl) {
          this.imageUrl = returnedUrl;
        } else {
          this.message = "Lỗi khi upload ảnh";
          this.showErrorNotification = true;
          setTimeout(() => this.showErrorNotification = false, 3000);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
           this.message = "Lỗi upload ảnh";
           this.showErrorNotification = true;
           setTimeout(() => this.showErrorNotification = false, 3000);
        }
      } finally {
        this.uploadingImage = false;
      }
    },

    async getBook(id) {
      this.loading = true;
      try {
        const response = await SachService.get(id);
        this.book = response.data;
        if (this.book.HinhAnh) {
          this.imageUrl = this.book.HinhAnh;
        }
      } catch (error) {
        this.message = "Không tìm thấy sách.";
        this.showErrorNotification = true;
      } finally {
        this.loading = false;
      }
    },

    async handleUpdate(data) {
      this.loading = true;
      this.message = "";
      
      try {
        data.HinhAnh = this.imageUrl || data.HinhAnh;
        await SachService.update(this.book._id, data);
        
        this.showSuccessNotification = true;

        setTimeout(() => {
          this.$router.push('/admin/sach');
        }, 700);

      } catch (error) {
        this.message = error.response?.data?.message || "Lỗi khi cập nhật sách.";
        this.showErrorNotification = true;
        setTimeout(() => this.showErrorNotification = false, 4000);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    const id = this.$route.params.id;
    if (id) {
        this.getBook(id);
    }
  }
};
</script>

<style scoped>
/* --- Global Background --- */
.bg-light-gray {
    background-color: #f3f6f9;
}

/* --- Input Styling (Clean & Bright) --- */
.form-control, .form-select {
    background-color: #fff;
    border: 1px solid #e4e6ef;
    color: #181c32;
    padding: 0.6rem 0.8rem;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
}

.form-control:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
    background-color: #fff;
}

.input-group-text {
    background-color: #f8f9fa;
    border-color: #e4e6ef;
    color: #5e6278;
}

.input-group:focus-within .input-group-text {
    background-color: #fff;
    border-color: #0d6efd;
    color: #0d6efd;
}
.input-group:focus-within .form-control {
    border-color: #0d6efd;
}

/* --- Image Uploader --- */
.image-upload-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  border: 2px dashed #e4e6ef;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.image-upload-wrapper:hover {
  border-color: #0d6efd;
  background-color: #f1faff !important;
}

.overlay-hover {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .overlay-hover {
  opacity: 1;
}

/* --- Button Save --- */
.button-save {
    transition: all 0.2s;
}
.button-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
}

/* --- Toast Notification (Top Right) --- */
.toast-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1050;
    min-width: 300px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    padding: 1rem;
    color: white;
    font-weight: 500;
}

.toast-overlay.success {
    background: #28a745;
}

.toast-overlay.error {
    background: #dc3545;
}

.icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

/* Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.btn-white {
    background-color: #fff;
    color: #181c32;
}
.btn-white:hover {
    background-color: #f8f9fa;
}
</style>