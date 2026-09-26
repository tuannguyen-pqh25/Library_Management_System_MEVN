<template>
  <div class="page-shell py-4">
    <div class="container-fluid">
      
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 class="font-display fw-bold text-dark mb-1">
            <span class="text-primary">Quản Lý</span> Kho Sách
          </h2>
          <p class="text-muted-custom mb-0">Quản lý kho và thông tin chi tiết ấn phẩm</p>
        </div>
        <BaseButton variant="primary" class="fw-bold px-4 shadow-sm rounded-pill d-flex align-items-center justify-content-center" @click="openAddModal">
          <i class="fas fa-plus me-2"></i> Thêm Sách Mới
        </BaseButton>
      </div>

      <!-- Filters -->
      <BaseCard class="mb-4 border-0 shadow-sm rounded-4 p-2">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="position-relative">
              <span class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style="pointer-events: none; z-index: 5;">
                <i class="fas fa-filter"></i>
              </span>
              <select class="form-select custom-height shadow-none ps-5 rounded-3 bg-light border-0" v-model="filterStock">
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
                class="form-control custom-height shadow-none rounded-start-3 bg-light border-0 ps-4"
                placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                v-model="searchText"
                @keyup.enter="search"
              >
              <button class="btn btn-primary px-4 custom-height z-0" type="button" @click="search">
                <i class="fas fa-search"></i>
              </button>
              <button
                class="btn custom-height rounded-end-3 z-0"
                type="button"
                @click="toggleVoiceSearch"
                :class="isListening ? 'btn-danger text-white' : 'btn-light border-start text-secondary'"
                title="Tìm kiếm bằng giọng nói"
              >
                <i class="fas fa-microphone" :class="{ 'fa-beat-fade': isListening }"></i>
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Empty State -->
      <BaseCard v-if="filteredBooks.length === 0" class="text-center py-5 border-0 shadow-sm rounded-4">
        <div class="mb-3"><i class="fas fa-box-open fa-4x opacity-25"></i></div>
        <p class="text-muted fw-medium fs-5 mb-0">Kho sách hiện đang trống hoặc không tìm thấy kết quả.</p>
      </BaseCard>

      <!-- Grid -->
      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-3 px-2">
          <small class="text-muted-custom fw-semibold">
            Hiển thị {{ paginatedBooks.length }} trên tổng số {{ filteredBooks.length }} sách
          </small>
        </div>
        <div class="row g-4">
          <div
            v-for="(book, index) in paginatedBooks"
            :key="book._id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-12"
          >
            <BaseCard class="h-100 border-0 shadow-sm book-card p-0 overflow-hidden d-flex flex-column" style="cursor: pointer;" @click="viewDetails(book)">
              
              <div class="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-end z-index-1">
                <span
                  class="badge rounded-pill shadow-sm px-3 py-2 fw-medium"
                  :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
                >
                  {{ book.SoQuyen > 0 ? `Sẵn sàng: ${book.SoQuyen}` : 'Đã hết' }}
                </span>
              </div>

              <div class="img-container bg-light position-relative">
                 <img
                    :src="book.HinhAnh || 'https://via.placeholder.com/200x300?text=No+Image'"
                    class="book-img"
                    :alt="book.TenSach"
                    @error="(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }"
                  >
              </div>

              <div class="p-3 d-flex flex-column flex-grow-1 text-center bg-white">
                <h6 class="fw-bold text-dark text-truncate-2 mb-1" :title="book.TenSach">
                  {{ book.TenSach }}
                </h6>
                <p class="text-muted small mb-3 fst-italic text-truncate">{{ book.TacGia }}</p>
                
                <div class="mt-auto d-flex justify-content-center gap-2">
                   <button class="btn btn-sm btn-light text-primary rounded-circle action-btn shadow-sm" @click.stop="viewDetails(book)" title="Xem chi tiết">
                      <i class="fas fa-eye"></i>
                   </button>
                   <button class="btn btn-sm btn-light text-warning rounded-circle action-btn shadow-sm" @click.stop="openEditModal(book)" title="Chỉnh sửa">
                      <i class="fas fa-pen"></i>
                   </button>
                   <button class="btn btn-sm btn-light text-danger rounded-circle action-btn shadow-sm" @click.stop="deleteSach(book._id, book.TenSach)" title="Xóa sách">
                      <i class="fas fa-trash"></i>
                   </button>
                </div>
              </div>

            </BaseCard>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-5" v-if="totalPages > 1">
        <div class="btn-group shadow-sm rounded-pill overflow-hidden">
          <button class="btn btn-white border" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <i class="fas fa-chevron-left text-secondary"></i>
          </button>
          <span class="btn btn-white border-top border-bottom fw-semibold px-4 text-primary bg-light" style="pointer-events: none;">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button class="btn btn-white border" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            <i class="fas fa-chevron-right text-secondary"></i>
          </button>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal fade" id="sachModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg overflow-hidden rounded-4">
            
            <div class="modal-header bg-primary text-white py-3 px-4 border-0">
              <h5 class="modal-title fw-bold">
                <i class="fas me-2" :class="isEdit ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEdit ? 'Cập Nhật Thông Tin Sách' : 'Thêm Sách Mới' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body p-0 bg-light">
               <Form :key="formKey" @submit="saveSach" :validation-schema="bookSchema" :initial-values="formData" :validate-on-input="true" v-slot="{ errors }">
                  <div class="row g-0" style="height: 75vh;"> 
                      
                      <!-- Left Column: Image -->
                      <div class="col-lg-4 bg-white border-end d-flex flex-column p-4 h-100 overflow-auto">
                          <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-image me-2"></i>Ảnh Bìa</h6>
                          
                          <div class="upload-area flex-grow-1 d-flex flex-column justify-content-center align-items-center mb-3 bg-light rounded-4 border-2 border-dashed shadow-sm" 
                               @click="openImageUploader" 
                               style="min-height: 250px;">
                               
                               <div v-if="uploadingImage" class="text-center">
                                  <div class="spinner-border text-primary mb-2 spinner-border-sm"></div>
                                  <p class="small text-muted fw-medium mb-0">Đang tối ưu & tải lên...</p>
                               </div>
                               
                               <div v-else-if="imageUrl" class="position-relative w-100 h-100 preview-container d-flex align-items-center justify-content-center p-2">
                                  <img :src="imageUrl" class="img-fluid rounded" style="max-height: 100%; object-fit: contain;">
                                  <div class="overlay d-flex align-items-center justify-content-center rounded">
                                      <span class="btn btn-light btn-sm fw-bold shadow-sm rounded-pill px-3"><i class="fas fa-camera me-1"></i> Đổi ảnh</span>
                                  </div>
                               </div>

                               <div v-else class="text-center p-4">
                                  <div class="icon-circle bg-primary-subtle text-primary mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle" style="width: 64px; height: 64px;">
                                      <i class="fas fa-cloud-upload-alt fa-2x"></i>
                                  </div>
                                  <h6 class="fw-bold text-dark mb-1">Click để chọn ảnh bìa</h6>
                                  <p class="text-muted small mb-0">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                               </div>
                          </div>

                          <div class="form-group mt-2">
                               <Field name="HinhAnh" type="text" class="form-control bg-light border-0" placeholder="Hoặc dán URL ảnh trực tiếp vào đây..." v-model="imageUrl" />
                               <ErrorMessage name="HinhAnh" class="text-danger small mt-1 d-block" />
                          </div>
                           <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleFileSelect" />
                      </div>

                      <!-- Right Column: Form -->
                      <div class="col-lg-8 bg-white d-flex flex-column h-100">
                          
                          <div class="p-4 overflow-auto flex-grow-1">
                              
                              <!-- General Info -->
                              <div class="mb-4">
                                  <h6 class="text-uppercase text-primary small fw-bold mb-3 d-flex align-items-center"><i class="fas fa-info-circle me-2"></i>Thông tin chung</h6>
                                  <div class="row g-3">
                                      <div class="col-12">
                                          <label class="form-label fw-semibold small text-muted">Tên Sách <span class="text-danger">*</span></label>
                                          <Field name="TenSach" type="text" class="form-control bg-light border-0" :class="{'is-invalid': errors.TenSach}" placeholder="Nhập tên sách đầy đủ..." v-model="formData.TenSach" />
                                          <ErrorMessage name="TenSach" class="invalid-feedback small" />
                                      </div>
                                      <div class="col-md-6">
                                          <label class="form-label fw-semibold small text-muted">Tác Giả <span class="text-danger">*</span></label>
                                          <Field name="TacGia" type="text" class="form-control bg-light border-0" :class="{'is-invalid': errors.TacGia}" placeholder="Tên tác giả" v-model="formData.TacGia" />
                                          <ErrorMessage name="TacGia" class="invalid-feedback small" />
                                      </div>
                                       <div class="col-md-6">
                                          <label class="form-label fw-semibold small text-muted">Nhà Xuất Bản</label>
                                          <Field name="MaNXB" type="text" class="form-control bg-light border-0" :class="{'is-invalid': errors.MaNXB}" placeholder="Mã NXB" v-model="formData.MaNXB" />
                                          <ErrorMessage name="MaNXB" class="invalid-feedback small" />
                                      </div>
                                  </div>
                              </div>

                              <!-- Publication Details -->
                              <div class="mb-4">
                                  <h6 class="text-uppercase text-primary small fw-bold mb-3 d-flex align-items-center"><i class="fas fa-tags me-2"></i>Chi tiết phân loại</h6>
                                  <div class="row g-3">
                                      <div class="col-md-4">
                                           <label class="form-label fw-semibold small text-muted">Thể Loại</label>
                                           <Field name="TheLoai" type="text" class="form-control bg-light border-0" :class="{'is-invalid': errors.TheLoai}" v-model="formData.TheLoai" list="genreOptions" placeholder="Chọn hoặc nhập..."/>
                                           <datalist id="genreOptions">
                                                <option value="Khoa học"></option>
                                                <option value="Văn học"></option>
                                                <option value="Kinh tế"></option>
                                                <option value="Truyện tranh"></option>
                                                <option value="Lịch sử"></option>
                                                <option value="Kỹ năng sống"></option>
                                           </datalist>
                                           <ErrorMessage name="TheLoai" class="invalid-feedback small" />
                                      </div>
                                      <div class="col-md-4">
                                           <label class="form-label fw-semibold small text-muted">Ngôn Ngữ</label>
                                           <Field name="NgonNgu" type="text" class="form-control bg-light border-0" :class="{'is-invalid': errors.NgonNgu}" v-model="formData.NgonNgu" placeholder="Tiếng Việt, English..." />
                                           <ErrorMessage name="NgonNgu" class="invalid-feedback small" />
                                      </div>
                                      <div class="col-md-2">
                                           <label class="form-label fw-semibold small text-muted">Năm XB</label>
                                           <Field name="NamXuatBan" type="number" class="form-control bg-light border-0" :class="{'is-invalid': errors.NamXuatBan}" v-model="formData.NamXuatBan" />
                                           <ErrorMessage name="NamXuatBan" class="invalid-feedback small" />
                                      </div>
                                      <div class="col-md-2">
                                           <label class="form-label fw-semibold small text-muted">Trang</label>
                                           <Field name="SoTrang" type="number" class="form-control bg-light border-0" :class="{'is-invalid': errors.SoTrang}" v-model="formData.SoTrang" />
                                           <ErrorMessage name="SoTrang" class="invalid-feedback small" />
                                      </div>
                                  </div>
                              </div>

                              <!-- Pricing & Inventory -->
                              <div class="p-3 bg-light rounded-4 border-0 mb-4">
                                  <div class="row g-3">
                                      <div class="col-md-6">
                                          <label class="form-label fw-bold text-primary small mb-2">Đơn Giá Nhập</label>
                                          <div class="input-group">
                                              <Field name="DonGia" type="number" class="form-control bg-white border-0 fw-bold text-primary" :class="{'is-invalid': errors.DonGia}" placeholder="0" v-model="formData.DonGia" />
                                              <span class="input-group-text bg-white border-0 fw-bold text-primary">VNĐ</span>
                                          </div>
                                          <ErrorMessage name="DonGia" class="invalid-feedback small d-block" />
                                      </div>
                                      <div class="col-md-6">
                                           <label class="form-label fw-bold text-success small mb-2">Số Lượng Nhập</label>
                                           <div class="input-group">
                                              <Field name="SoQuyen" type="number" class="form-control bg-white border-0 fw-bold text-success" :class="{'is-invalid': errors.SoQuyen}" v-model="formData.SoQuyen" />
                                              <span class="input-group-text bg-white border-0 text-success">Quyển</span>
                                           </div>
                                           <ErrorMessage name="SoQuyen" class="invalid-feedback small d-block" />
                                      </div>
                                  </div>
                              </div>

                              <!-- Description -->
                               <div>
                                   <label class="form-label fw-semibold small text-muted"><i class="fas fa-align-left me-2"></i>Mô Tả Nội Dung</label>
                                   <Field name="MoTa" as="textarea" class="form-control bg-light border-0" :class="{'is-invalid': errors.MoTa}" rows="5" v-model="formData.MoTa" placeholder="Tóm tắt nội dung sách..." />
                                   <ErrorMessage name="MoTa" class="invalid-feedback small" />
                              </div>
                          </div>

                          <div class="modal-footer bg-white border-top py-3 px-4 justify-content-end mt-auto">
                              <BaseButton variant="light" class="px-4 fw-medium" data-bs-dismiss="modal">Hủy</BaseButton>
                              <BaseButton type="submit" variant="primary" class="px-5 fw-bold shadow-sm rounded-pill ms-2">
                                  <i class="fas fa-save me-2"></i> {{ isEdit ? 'Lưu Thay Đổi' : 'Thêm Sách' }}
                              </BaseButton>
                          </div>

                      </div>
                  </div>
               </Form>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div class="modal fade" id="sachDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header border-bottom-0 pb-0 bg-white">
               <button type="button" class="btn-close" aria-label="Đóng" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body pt-0 pb-4 px-4 bg-white" v-if="selectedBook">
               <div class="row g-4">
                  <div class="col-md-4">
                      <div class="rounded-4 overflow-hidden shadow-sm mb-3 bg-light d-flex align-items-center justify-content-center p-2" style="height: 350px;">
                          <img
                          :src="selectedBook.HinhAnh || 'https://via.placeholder.com/200x300?text=No+Image'"
                          class="img-fluid rounded-3"
                          style="max-height: 100%; object-fit: contain;"
                          @error="(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }"
                          >
                      </div>
                      <div class="d-grid">
                          <span class="badge py-2 rounded-pill shadow-sm fs-6 fw-medium" :class="selectedBook.SoQuyen > 0 ? 'bg-success' : 'bg-danger'">
                              <i class="fas me-2" :class="selectedBook.SoQuyen > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
                              {{ selectedBook.SoQuyen > 0 ? `Còn ${selectedBook.SoQuyen} quyển` : 'Hết sách' }}
                          </span>
                      </div>
                  </div>

                  <div class="col-md-8">
                      <h3 class="fw-bold mb-2 text-dark font-display">{{ selectedBook.TenSach }}</h3>
                      <p class="text-primary fw-medium mb-4 fs-5"><i class="fas fa-pen-nib me-2"></i>{{ selectedBook.TacGia }}</p>
                      
                      <div class="bg-light p-4 rounded-4 mb-4 border-0">
                          <div class="row g-4">
                              <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Mã Sách</small>
                                  <span class="fw-semibold text-dark">{{ selectedBook.MaSach }}</span>
                              </div>
                              <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Mã NXB</small>
                                  <span class="fw-semibold text-dark">{{ selectedBook.MaNXB }}</span>
                              </div>
                              <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Năm xuất bản</small>
                                  <span class="fw-semibold text-dark">{{ selectedBook.NamXuatBan }}</span>
                              </div>
                              <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Thể loại</small>
                                  <span class="badge bg-info text-dark rounded-pill px-3">{{ selectedBook.TheLoai }}</span>
                              </div>
                              <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Ngôn ngữ</small>
                                  <span class="fw-semibold text-dark">{{ selectedBook.NgonNgu }}</span>
                              </div>
                               <div class="col-sm-6">
                                  <small class="text-muted text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Số trang</small>
                                  <span class="fw-semibold text-dark">{{ selectedBook.SoTrang }} trang</span>
                              </div>
                              <div class="col-sm-6">
                                  <small class="text-primary text-uppercase fw-bold mb-1 d-block" style="font-size: 0.7rem;">Đơn giá</small>
                                  <span class="fw-bold text-primary fs-5">{{ formatCurrency(selectedBook.DonGia) }}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div>
                          <h6 class="fw-bold small text-uppercase text-secondary mb-3 d-flex align-items-center"><i class="fas fa-align-left me-2"></i>Giới thiệu nội dung</h6>
                          <div class="p-0">
                               <p class="text-secondary mb-0 lh-lg" style="text-align: justify; font-size: 0.95rem;">
                                  {{ selectedBook.MoTa || 'Chưa có mô tả nội dung cho sách này.' }}
                               </p>
                          </div>
                      </div>

                      <!-- ACTION BUTTONS -->
                      <div class="d-flex gap-2 mt-4 pt-4 border-top">
                          <button class="btn btn-outline-primary fw-bold px-4 rounded-pill" @click="closeDetailModal(); openEditModal(selectedBook);">
                              <i class="fas fa-edit me-2"></i>Chỉnh sửa
                          </button>
                          <button class="btn btn-outline-danger fw-bold px-4 rounded-pill" @click="closeDetailModal(); deleteSach(selectedBook._id, selectedBook.TenSach);">
                              <i class="fas fa-trash me-2"></i>Xóa
                          </button>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
    <div id="successToast" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body fw-medium d-flex align-items-center">
          <i class="fas fa-check-circle me-2 fs-5"></i>
          {{ notificationMessage }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal, Toast } from "bootstrap"
import { Form, Field, ErrorMessage } from "vee-validate"
import * as yup from "yup"
import SachService from "@/services/sach.service"
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const bookSchema = yup.object().shape({
  TenSach: yup.string().required("Tên sách là bắt buộc!").min(2, "Quá ngắn").max(200, "Quá dài"),
  MaNXB: yup.string().required("Bắt buộc").max(50, "Quá dài"),
  TacGia: yup.string().required("Bắt buộc").max(100, "Quá dài"),
  NamXuatBan: yup.number().required("Bắt buộc").typeError("Phải là số").min(1900, "Từ 1900+").max(new Date().getFullYear() + 1, "Không hợp lệ"),
  SoQuyen: yup.number().required("Bắt buộc").typeError("Phải là số").min(0, "Không được âm").max(10000, "Quá nhiều"),
  DonGia: yup.number().required("Bắt buộc").typeError("Phải là số").min(0, "Không được âm"),
  SoTrang: yup.number().nullable().transform((v, o) => (o === '' || o === undefined) ? null : v),
  NgonNgu: yup.string().nullable(),
  TheLoai: yup.string().nullable(),
  MoTa: yup.string().nullable(),
})

const loading = ref(false)
const imageUrl = ref("")
const uploadingImage = ref(false)
let uploadAbortController = null

const books = ref([])
const searchText = ref("")
const filterStock = ref("all")
const currentPage = ref(1)
const itemsPerPage = ref(8)
const selectedBook = ref(null)
const isEdit = ref(false)
const notificationMessage = ref("")

const formData = ref({
  TenSach: "",
  TacGia: "",
  MaNXB: "",
  NamXuatBan: "",
  DonGia: "",
  SoQuyen: 0,
  SoTrang: "",
  NgonNgu: "",
  TheLoai: "",
  HinhAnh: "",
  MoTa: "",
})

let detailModalInstance = null
let sachModalInstance = null
let toastInstance = null

const isListening = ref(false)
let recognition = null
const fileInput = ref(null)
const formKey = ref(0)

const filteredBooks = computed(() => {
  let filtered = books.value
  if (filterStock.value === "in_stock") filtered = filtered.filter(b => b.SoQuyen > 0)
  else if (filterStock.value === "out_of_stock") filtered = filtered.filter(b => b.SoQuyen === 0)

  if (searchText.value.trim()) {
    const lower = searchText.value.trim().toLowerCase()
    filtered = filtered.filter(b => b.TenSach.toLowerCase().includes(lower) || b.TacGia.toLowerCase().includes(lower))
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage.value) || 1)

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredBooks.value.slice(start, start + itemsPerPage.value)
})

watch(filterStock, () => {
  currentPage.value = 1
})

const formatCurrency = (value) => {
  if (!value) return "0 VNĐ"
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const retrieveBooks = async () => {
  loading.value = true
  try {
    const response = await SachService.getAll()
    books.value = response.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewDetails = (book) => {
  selectedBook.value = book
  detailModalInstance?.show()
}

const closeDetailModal = () => {
  try {
    if (detailModalInstance) {
      detailModalInstance.hide()
    } else {
      const modalEl = document.getElementById('sachDetailModal')
      const instance = modalEl && Modal.getInstance(modalEl)
      if (instance) instance.hide()
    }
  } catch (e) {
    // Fallback: dọn dẹp modal thủ công
    const modalEl = document.getElementById('sachDetailModal')
    if (modalEl) {
      modalEl.classList.remove('show')
      modalEl.style.display = 'none'
      modalEl.setAttribute('aria-hidden', 'true')
    }
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  }
}

const openAddModal = () => {
  isEdit.value = false
  resetForm()
  formKey.value++
  sachModalInstance?.show()
}

const openEditModal = (book) => {
  isEdit.value = true
  formData.value = { ...book }
  imageUrl.value = book.HinhAnh || ""
  formKey.value++
  sachModalInstance?.show()
}

const resetForm = () => {
  formData.value = {
    TenSach: "",
    TacGia: "",
    MaNXB: "",
    NamXuatBan: "",
    DonGia: "",
    SoQuyen: 0,
    SoTrang: "",
    NgonNgu: "",
    TheLoai: "",
    HinhAnh: "",
    MoTa: "",
  }
  imageUrl.value = ""
  uploadingImage.value = false
  if (uploadAbortController) {
    uploadAbortController.abort()
    uploadAbortController = null
  }
}

const saveSach = async () => {
  try {
    formData.value.HinhAnh = imageUrl.value
    if (isEdit.value) {
      await SachService.update(formData.value._id, formData.value)
      notificationMessage.value = "Cập nhật sách thành công!"
    } else {
      await SachService.create(formData.value)
      notificationMessage.value = "Thêm sách thành công!"
    }
    await retrieveBooks()
    sachModalInstance?.hide()
    toastInstance?.show()
  } catch (error) {
    console.error("Lỗi lưu sách:", error)
    alert("Lỗi khi lưu sách")
  }
}

const deleteSach = async (id, name) => {
  if (confirm(`Bạn có chắc chắn muốn xóa sách "${name}" không?`)) {
    try {
      await SachService.delete(id)
      notificationMessage.value = "Xóa sách thành công!"
      await retrieveBooks()
      toastInstance?.show()
    } catch (error) {
      console.error("Lỗi xóa sách:", error)
      alert("Lỗi khi xóa sách")
    }
  }
}

const changePage = (page) => {
  if (page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  currentPage.value = page
}

const search = () => {
  currentPage.value = 1
}

const openImageUploader = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Chỉ chấp nhận file ảnh!')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Kích thước file không được vượt quá 5MB!')
    return
  }

  uploadingImage.value = true
  uploadAbortController = new AbortController()

  try {
    const compressedFile = await compressImage(file)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      try {
        const response = await SachService.uploadImage(dataUrl, uploadAbortController.signal)
        imageUrl.value = response.data?.data?.url || response.data?.url
      } catch (uploadError) {
        if (uploadError.name !== 'AbortError') {
          console.error('Upload failed:', uploadError)
          alert('Tải ảnh lên thất bại!')
        }
      } finally {
        uploadingImage.value = false
        uploadAbortController = null
      }
    }
    reader.readAsDataURL(compressedFile)
  } catch (error) {
    console.error('File processing failed:', error)
    alert('Lỗi xử lý ảnh!')
    uploadingImage.value = false
    uploadAbortController = null
  }
}

const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const maxDimension = 1200
      let { width, height } = img
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    }
    img.src = URL.createObjectURL(file)
  })
}

const toggleVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.')
    return
  }

  if (isListening.value) {
    recognition?.stop()
    isListening.value = false
    return
  }

  if (!recognition) {
    recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      searchText.value = transcript
      search()
    }

    recognition.onend = () => {
      isListening.value = false
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false
      if (event.error !== 'not-allowed') {
        alert('Có lỗi xảy ra khi nhận diện giọng nói. Vui lòng thử lại.')
      }
    }
  }

  isListening.value = true
  recognition.start()
}

onMounted(() => {
  retrieveBooks()
  detailModalInstance = new Modal(document.getElementById("sachDetailModal"))
  sachModalInstance = new Modal(document.getElementById("sachModal"))
  toastInstance = new Toast(document.getElementById("successToast"))
})
</script>

<style scoped>
.custom-height { height: 48px; }

/* Upload Area */
.upload-area {
    border-style: dashed !important;
    transition: all 0.2s ease;
    cursor: pointer;
}
.upload-area:hover {
    border-color: var(--bs-primary) !important;
    background-color: var(--bs-primary-bg-subtle) !important;
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
.form-control:focus, .form-select:focus {
    box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.1);
}

/* Book Card */
.book-card {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.book-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08) !important;
}
.img-container {
    height: 260px;
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
    transition: transform 0.5s ease;
}
.book-card:hover .book-img {
    transform: scale(1.05);
}
.z-index-1 { z-index: 10; }
.action-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.action-btn:hover {
    transform: scale(1.15);
}

.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Text justification fix for description */
.text-justify {
    text-align: justify;
}
</style>