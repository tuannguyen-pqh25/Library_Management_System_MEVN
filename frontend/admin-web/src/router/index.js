import { createWebHistory, createRouter } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import Login from "@/views/Login.vue";
import StaffDashboard from "@/views/StaffDashboard.vue";
import StaffSachManagement from "@/views/StaffSachManagement.vue";
import StaffNhaXuatBanManagement from "@/views/StaffNhaXuatBanManagement.vue";
import SachAdd from "@/views/SachAdd.vue";
import SachEdit from "@/views/SachEdit.vue";
import MuonSachManagement from "@/views/MuonSachManagement.vue";
import NhanVienManagement from "@/views/NhanVienManagement.vue";
import DocGiaManagement from "@/views/DocGiaManagement.vue";

const decodeToken = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const raw = atob(padded);
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const isValidAdminToken = () => {
  const token = localStorage.getItem("token");
  const payload = decodeToken(token);

  if (!payload || !payload.aud || payload.aud !== "admin") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }

  return true;
};

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
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "StaffDashboard",
        component: StaffDashboard,
      },
      {
        path: "sach",
        name: "StaffSachManagement",
        component: StaffSachManagement,
      },
      {
        path: "sach/add",
        name: "SachAdd",
        component: SachAdd,
      },
      {
        path: "sach/edit/:id",
        name: "SachEdit",
        component: SachEdit,
        props: true,
      },
      {
        path: "nxb",
        name: "StaffNhaXuatBanManagement",
        component: StaffNhaXuatBanManagement,
      },
      {
        path: "muonsach",
        name: "MuonSachManagement",
        component: MuonSachManagement,
      },
      {
        path: "nhanvien",
        name: "NhanVienManagement",
        component: NhanVienManagement,
      },
      {
        path: "docgia",
        name: "DocGiaManagement",
        component: DocGiaManagement,
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (!token || !isValidAdminToken()) {
      next("/login");
      return;
    }
  }

  if (to.path === "/login" && token && isValidAdminToken()) {
    next("/dashboard");
    return;
  }

  next();
});

export default router;
