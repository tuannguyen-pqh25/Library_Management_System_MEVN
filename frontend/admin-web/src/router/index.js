import { createWebHistory, createRouter } from "vue-router";
import Login from "@/views/Login.vue";
import StaffDashboard from "@/views/StaffDashboard.vue";
import StaffSachManagement from "@/views/StaffSachManagement.vue";
import StaffNhaXuatBanManagement from "@/views/StaffNhaXuatBanManagement.vue";
import SachAdd from "@/views/SachAdd.vue";
import SachEdit from "@/views/SachEdit.vue";
import MuonSachManagement from "@/views/MuonSachManagement.vue";
import NhanVienManagement from "@/views/NhanVienManagement.vue";

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "LoginAdmin",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "StaffDashboard",
    component: StaffDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: "/sach",
    name: "StaffSachManagement",
    component: StaffSachManagement,
    meta: { requiresAuth: true }
  },
  {
    path: "/sach/add",
    name: "SachAdd",
    component: SachAdd,
    meta: { requiresAuth: true }
  },
  {
    path: "/sach/edit/:id",
    name: "SachEdit",
    component: SachEdit,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: "/nxb",
    name: "StaffNhaXuatBanManagement",
    component: StaffNhaXuatBanManagement,
    meta: { requiresAuth: true }
  },
  {
    path: "/muonsach",
    name: "MuonSachManagement",
    component: MuonSachManagement,
    meta: { requiresAuth: true }
  },
  {
    path: "/nhanvien",
    name: "NhanVienManagement",
    component: NhanVienManagement,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
    // Tạm thời bỏ qua auth guard cho dev phase hoặc cài đặt logic lấy token từ localStorage 
    // const isAuthenticated = localStorage.getItem('token');
    // if (to.meta.requiresAuth && !isAuthenticated) {
    //     next('/login');
    // } else {
        next();
    // }
});

export default router;
