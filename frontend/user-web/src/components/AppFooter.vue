<template>
  <footer class="app-footer bg-white border-top mt-auto pt-5 pb-4">
    <div class="container">
      <div class="row g-4 pb-4">
        <!-- Cột 1: Thông tin thương hiệu -->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="footer-brand-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center">
              <i class="fas fa-book-open"></i>
            </div>
            <div>
              <div class="font-display fw-bold text-dark fs-5 lh-1">Thư viện số <span class="text-primary">ASALib</span></div>
              <span class="text-muted-custom small" style="font-size: 0.72rem; letter-spacing: 0.5px;">Cổng thông tin & Dịch vụ độc giả</span>
            </div>
          </div>
          <p class="text-muted-custom small pe-lg-4 mb-0" style="line-height: 1.65;">
            Hệ sinh thái Thư viện số thông minh, cung cấp giải pháp tra cứu danh mục, đăng ký mượn sách trực tuyến nhanh chóng, thuận tiện và minh bạch phục vụ độc giả.
          </p>
        </div>

        <!-- Cột 2: Lối tắt tra cứu & dịch vụ -->
        <div class="col-6 col-md-6 col-lg-2">
          <h6 class="fw-bold text-dark mb-3 font-display">Lối Tắt</h6>
          <ul class="list-unstyled d-flex flex-column gap-2 small mb-0">
            <li>
              <router-link to="/" class="footer-link text-decoration-none text-muted-custom" @click="scrollToTop">
                <i class="fas fa-chevron-right me-1 text-primary" style="font-size: 0.65rem;"></i> Trang chủ
              </router-link>
            </li>
            <li>
              <router-link to="/sach" class="footer-link text-decoration-none text-muted-custom" @click="scrollToTop">
                <i class="fas fa-chevron-right me-1 text-primary" style="font-size: 0.65rem;"></i> Khám phá Sách
              </router-link>
            </li>
            <li>
              <router-link to="/yeuthich" class="footer-link text-decoration-none text-muted-custom" @click="scrollToTop">
                <i class="fas fa-chevron-right me-1 text-primary" style="font-size: 0.65rem;"></i> Sách yêu thích
              </router-link>
            </li>
            <li>
              <router-link to="/gio-muon" class="footer-link text-decoration-none text-muted-custom" @click="scrollToTop">
                <i class="fas fa-chevron-right me-1 text-primary" style="font-size: 0.65rem;"></i> Giỏ mượn sách
              </router-link>
            </li>
            <li>
              <router-link to="/lich-su" class="footer-link text-decoration-none text-muted-custom" @click="scrollToTop">
                <i class="fas fa-chevron-right me-1 text-primary" style="font-size: 0.65rem;"></i> Lịch sử mượn trả
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Cột 3: Quy chế mượn trả -->
        <div class="col-6 col-md-6 col-lg-3">
          <h6 class="fw-bold text-dark mb-3 font-display">Quy Chế Mượn Trả</h6>
          <ul class="list-unstyled d-flex flex-column gap-2 small text-muted-custom mb-0">
            <li class="d-flex align-items-start gap-2">
              <i class="fas fa-layer-group text-primary mt-1"></i>
              <span>Hạn mức lưu hành: <strong>Tối đa 10 quyển</strong> cùng lúc</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="fas fa-calendar-alt text-primary mt-1"></i>
              <span>Thời gian mượn tiêu chuẩn: <strong>14 ngày</strong> / lượt mượn</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="fas fa-redo-alt text-primary mt-1"></i>
              <span>Chính sách gia hạn: <strong>Tối đa 2 lần</strong> (trước hạn tối thiểu 3 ngày)</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="fas fa-exclamation-circle text-danger mt-1"></i>
              <span>Phí lưu kho trễ hạn: <strong>5.000 VNĐ</strong> / ngày / quyển</span>
            </li>
          </ul>
        </div>

        <!-- Cột 4: Giờ phục vụ & Liên hệ -->
        <div class="col-12 col-md-6 col-lg-3">
          <h6 class="fw-bold text-dark mb-3 font-display">Giờ Mở Cửa & Liên Hệ</h6>
          <div class="mb-3 small text-muted-custom">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="fas fa-clock text-primary"></i>
              <strong class="text-dark">Thứ 2 – Thứ 7:</strong> 07:30 – 17:00
            </div>
            <div class="text-secondary ps-4">Chủ nhật & Ngày lễ: Nghỉ</div>
          </div>

          <div class="small text-muted-custom d-flex flex-column gap-2">
            <div class="d-flex align-items-start gap-2">
              <i class="fas fa-map-marker-alt text-primary mt-1"></i>
              <span>Khu II, Đ. 3 Tháng 2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-envelope text-primary"></i>
              <a href="mailto:thuviensoasalib@library.vn" class="text-decoration-none text-muted-custom">thuviensoasalib@library.vn</a>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-phone-alt text-primary"></i>
              <span>(0292) 3832 663</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bản quyền & Bottom bar -->
      <div class="border-top pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted-custom">
        <div>
          © 2025 <strong>Thư viện số ASALib</strong>. All rights reserved.
        </div>
        <div>
          <a href="#top" class="text-decoration-none text-muted-custom back-to-top-link" @click.prevent="scrollToTop">
            <i class="fas fa-arrow-up me-1"></i> Về đầu trang
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.app-footer {
  position: relative;
  width: 100%;
  clear: both;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.04);
}

.footer-brand-icon {
  width: 36px;
  height: 36px;
  font-size: 1rem;
}

.footer-link {
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
}

.footer-link:hover {
  color: var(--primary) !important;
  transform: translateX(3px);
}

.back-to-top-link {
  transition: color 0.2s ease;
}

.back-to-top-link:hover {
  color: var(--primary) !important;
}

:global([data-bs-theme="dark"]) .app-footer {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
}

:global([data-bs-theme="dark"]) .footer-link {
  color: #94a3b8 !important;
}

:global([data-bs-theme="dark"]) .footer-link:hover {
  color: #60a5fa !important;
}

:global([data-bs-theme="dark"]) .text-dark {
  color: #f1f5f9 !important;
}
</style>
