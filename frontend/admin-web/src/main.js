import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initTheme } from "./services/theme.service";
import { Modal } from "bootstrap";

initTheme();

// Đảm bảo tất cả nút đóng modal (dấu X, nút Hủy có data-bs-dismiss="modal") luôn thoát modal an toàn
if (typeof document !== "undefined") {
  document.addEventListener("click", (event) => {
    const dismissBtn = event.target.closest('[data-bs-dismiss="modal"], .modal .btn-close');
    if (dismissBtn) {
      const modalEl = dismissBtn.closest(".modal");
      if (modalEl) {
        const modalInst = Modal.getInstance(modalEl) || Modal.getOrCreateInstance(modalEl);
        if (modalInst) {
          modalInst.hide();
        }
      }
    }
  });
}

createApp(App).use(router).mount("#app");

