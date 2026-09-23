<template>
  <div class="container-fluid pt-2 pb-4">
    <div class="row align-items-center mb-3">
      <div class="col-auto">
        <router-link to="/admin/sach" class="btn btn-light shadow-sm rounded-pill px-3 fw-bold text-primary">
          <i class="fas fa-arrow-left me-2"></i> Quay lại
        </router-link>
      </div>
      <div class="col">
        <h3 class="fw-bold text-dark mb-0">
          <span class="text-primary">Thêm</span> Sách Mới
        </h3>
        <small class="text-muted">Nhập thông tin chi tiết để thêm sách vào kho</small>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
        <div class="d-flex align-items-center">
          <div class="icon-shape bg-primary text-white rounded-3 me-3 p-2">
            <i class="fas fa-book-medical fa-lg"></i>
          </div>
          <h5 class="mb-0 fw-bold text-secondary">Thông tin sách</h5>
        </div>
      </div>

      <div class="card-body p-4">
        <Form @submit="handleCreate" :validation-schema="bookSchema" :validate-on-input="true">
          <div class="row g-4">
            
            <div class="col-lg-4">
              <div class="p-3 bg-light rounded-4 h-100 border border-light">
                <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-image me-2"></i>Ảnh Bìa</h6>
                
                <div class="image-upload-wrapper bg-white shadow-sm rounded-3 border-0" @click="openImageUploader">
                  <div v-if="uploadingImage" class="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div class="spinner-border text-primary mb-2" role="status"></div>
                    <small>Đang tải ảnh...</small>
                  </div>
                  
                  <div v-else-if="imageUrl" class="image-preview h-100 position-relative">
                    <img :src="imageUrl" alt="Book Cover" class="w-100 h-100 object-fit-cover rounded-3" />
                    <div class="overlay-hover rounded-3 d-flex align-items-center justify-content-center">
                      <div class="text-white text-center">
                          <i class="fas fa-camera fa-2x mb-2"></i>
                          <p class="mb-0 fw-bold small">Thay đổi ảnh</p>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 text-secondary p-4 text-center">
                    <div class="bg-light rounded-circle p-3 mb-3">
                        <i class="fas fa-cloud-upload-alt fa-2x text-primary"></i>
                    </div>
                    <p class="mb-1 fw-bold small">Nhấn để tải ảnh lên</p>
                    <small class="text-muted" style="font-size: 0.75rem;">(JPG, PNG, tối đa 5MB)</small>
                  </div>
                </div>

                <div class="mt-3">
                   <label class="form-label small fw-bold text-muted mb-1">Hoặc nhập URL ảnh:</label>
                   <div class="input-group">
                      <span class="input-group-text bg-white border-end-0 text-secondary"><i class="fas fa-link"></i></span>
                      <input type="text" class="form-control border-start-0 ps-0 bg-white" v-model="imageUrl" placeholder="https://example.com/image.png" />
                   </div>
                </div>
                <ErrorMessage name="HinhAnh" class="text-danger small mt-1 d-block text-center" />

                <div class="d-grid mt-4">
                   <button class="btn btn-primary fw-bold py-2 shadow-sm button-save" :disabled="loading">
                      <span v-if="!loading"><i class="fas fa-save me-2"></i> Lưu Sách</span>
                      <span v-else><span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</span>
                   </button>
                </div>
                
                </div>
            </div>

            <div class="col-lg-8">
              <div class="row g-3 mb-4">
                 <div class="col-12">
                    <label class="form-label fw-semibold text-secondary small">Tên Sách <span class="text-danger">*</span></label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-book text-muted"></i></span>
                        <Field name="TENSACH" type="text" class="form-control bg-light border-0 ps-2" placeholder="Nhập tên sách..." />
                    </div>
                    <ErrorMessage name="TENSACH" class="text-danger small mt-1" />
                 </div>
                 <div class="col-md-6">
                    <label class="form-label fw-semibold text-secondary small">Tác Giả <span class="text-danger">*</span></label>
                    <div class="input-group input-group-merge">
                       <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-pen-nib text-muted"></i></span>
                       <Field name="TACGIA" type="text" class="form-control bg-light border-0 ps-2" placeholder="Tên tác giả" />
                    </div>
                    <ErrorMessage name="TACGIA" class="text-danger small mt-1" />
                 </div>
                 <div class="col-md-6">
                    <label class="form-label fw-semibold text-secondary small">Mã NXB <span class="text-danger">*</span></label>
                    <div class="input-group input-group-merge">
                       <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-barcode text-muted"></i></span>
                       <Field name="MANXB" type="text" class="form-control bg-light border-0 ps-2" placeholder="Mã nhà xuất bản" />
                    </div>
                    <ErrorMessage name="MANXB" class="text-danger small mt-1" />
                 </div>
                 <div class="col-md-6">
                    <label class="form-label fw-semibold text-secondary small">Thể Loại <span class="text-danger">*</span></label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-tags text-muted"></i></span>
                        <Field name="THELOAI" type="text" class="form-control bg-light border-0 ps-2" placeholder="Ví dụ: Khoa học, Văn học..." />
                    </div>
                    <ErrorMessage name="THELOAI" class="text-danger small mt-1" />
                 </div>
                 <div class="col-md-6">
                    <label class="form-label fw-semibold text-secondary small">Đơn Giá <span class="text-danger">*</span></label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-tag text-muted"></i></span>
                        <Field name="DONGIA" type="number" class="form-control bg-light border-0 ps-2" placeholder="0" />
                        <span class="input-group-text bg-light border-0 text-success fw-bold">VNĐ</span>
                    </div>
                    <ErrorMessage name="DONGIA" class="text-danger small mt-1" />
                 </div>
              </div>

              <hr class="border-light my-4">

              <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-info-circle me-2"></i>Chi tiết xuất bản</h6>
              <div class="row g-3 mb-4">
                 <div class="col-6 col-md-3">
                    <label class="form-label fw-semibold text-secondary small">Năm XB</label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-calendar-alt text-muted small"></i></span>
                        <Field name="NAMXUATBAN" type="number" class="form-control bg-light border-0 ps-1" />
                    </div>
                    <ErrorMessage name="NAMXUATBAN" class="text-danger small mt-1" />
                 </div>
                 <div class="col-6 col-md-3">
                    <label class="form-label fw-semibold text-secondary small">Số Quyển</label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-layer-group text-muted small"></i></span>
                        <Field name="SOQUYEN" type="number" class="form-control bg-light border-0 ps-1" />
                    </div>
                    <ErrorMessage name="SOQUYEN" class="text-danger small mt-1" />
                 </div>
                 <div class="col-6 col-md-3">
                    <label class="form-label fw-semibold text-secondary small">Số Trang</label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-file-alt text-muted small"></i></span>
                        <Field name="SOTRANG" type="number" class="form-control bg-light border-0 ps-1" />
                    </div>
                    <ErrorMessage name="SOTRANG" class="text-danger small mt-1" />
                 </div>
                 <div class="col-6 col-md-3">
                    <label class="form-label fw-semibold text-secondary small">Ngôn Ngữ</label>
                    <div class="input-group input-group-merge">
                        <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-globe text-muted small"></i></span>
                        <Field name="NGONNGU" type="text" class="form-control bg-light border-0 ps-1" placeholder="Tiếng Việt" />
                    </div>
                    <ErrorMessage name="NGONNGU" class="text-danger small mt-1" />
                 </div>
              </div>

              <div class="mb-3">
                 <label class="form-label fw-semibold text-secondary small">Giới Thiệu Nội Dung <span class="text-danger">*</span></label>
                 <Field name="MOTA" as="textarea" class="form-control bg-light border-0" rows="4" placeholder="Viết mô tả ngắn về nội dung sách..." />
                 <ErrorMessage name="MOTA" class="text-danger small mt-1" />
              </div>

            </div>
          </div>
          
          <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileSelect" />
        </Form>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="showSuccessNotification" class="toast-overlay" style="z-index: 10000;">
        <div class="toast show align-items-center text-white bg-success border-0 shadow-lg" role="alert">
          <div class="d-flex">
            <div class="toast-body fs-6 fw-bold">
              <i class="fas fa-check-circle me-2"></i> Thêm sách thành công!
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="showSuccessNotification = false"></button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="showErrorNotification" class="toast-overlay" style="z-index: 10001;">
        <div class="toast show align-items-center text-white bg-danger border-0 shadow-lg" role="alert">
          <div class="d-flex">
            <div class="toast-body fs-6 fw-bold">
              <i class="fas fa-exclamation-triangle me-2"></i> {{ message }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="showErrorNotification = false"></button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import SachService from "@/services/sach.service";

export default {
  name: "SachAdd",
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
      showSuccessNotification: false,
      showErrorNotification: false, // State mới cho toast lỗi
    };
  },
  methods: {
    // Helper function để hiển thị lỗi dạng Toast
    showError(msg) {
        this.message = msg;
        this.showErrorNotification = true;
        // Tự động tắt sau 3 giây
        setTimeout(() => {
            this.showErrorNotification = false;
        }, 3000);
    },

    openImageUploader() {
      this.$refs.fileInput.click();
    },

    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Reset lỗi cũ
      this.showErrorNotification = false;

      if (!file.type.startsWith("image/")) {
        this.showError("Vui lòng chọn file ảnh!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showError("Ảnh không được vượt quá 5MB!");
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
        this.showError("Lỗi xử lý ảnh.");
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
          this.showError("Lỗi khi upload ảnh (không nhận được URL)");
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
           this.showError("Lỗi upload ảnh: " + error.message);
        }
      } finally {
        this.uploadingImage = false;
      }
    },

    async handleCreate(book) {
      // Reset trạng thái thông báo
      this.showSuccessNotification = false;
      this.showErrorNotification = false;

      if (!this.imageUrl && !book.HinhAnh) {
        this.showError("Hình ảnh là bắt buộc!");
        return;
      }

      this.loading = true;
      this.message = "";
      
      try {
        book.HinhAnh = this.imageUrl || book.HinhAnh;
        await SachService.create(book);

        this.showSuccessNotification = true;

        setTimeout(() => {
          this.$router.push('/admin/sach');
        }, 1500);

      } catch (error) {
        const errorMsg = error.response?.data?.message || "Lỗi khi thêm sách.";
        this.showError(errorMsg);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* --- INPUT STYLING --- */
.form-control, .form-select {
  background-color: #fff;
  border: 1px solid #e4e6ef;
  color: #181c32;
  padding: 0.6rem 0.8rem;
  transition: all 0.2s;
}
.form-control:focus, .form-select:focus {
  border-color: #b5b5c3;
  box-shadow: none;
  background-color: #ffffff; /* Giữ nền trắng khi focus */
}
.input-group-text {
  background-color: #f8f9fa;
  border-color: #e4e6ef;
}
.input-group:focus-within .input-group-text {
  background-color: #fff;
  border-color: #b5b5c3;
  color: #0d6efd;
}
.input-group:focus-within .form-control {
  border-color: #b5b5c3;
}

/* FIX AUTOFILL BACKGROUND */
.input-group-merge .form-control.bg-light:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px #f8f9fa inset !important;
}
.input-group-merge:focus-within .form-control.bg-light:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px #fff inset !important;
}


/* --- IMAGE UPLOADER --- */
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

/* --- ICON SHAPE --- */
.icon-shape {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* --- BUTTONS --- */
.button-save {
  transition: transform 0.2s;
}
.button-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
}

/* --- TOAST OVERLAY (Dùng chung cho cả Success và Error) --- */
.toast-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Vue Transition */
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
</style>