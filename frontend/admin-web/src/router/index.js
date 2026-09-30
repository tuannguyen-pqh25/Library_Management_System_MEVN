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
import { ALL_ROLES, BOOK_ROLES, BORROW_ROLES, ROLES, readAdminSession, defaultAdminPath } from "@/services/adminRoles";

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
    meta: { requiresAuth: true, roles: ALL_ROLES },
    children: [
      {
        path: "dashboard",
        name: "StaffDashboard",
        component: StaffDashboard,
        meta: { roles: BORROW_ROLES },
      },
      {
        path: "sach",
        name: "StaffSachManagement",
        component: StaffSachManagement,
        meta: { roles: BOOK_ROLES },
      },
      {
        path: "sach/add",
        name: "SachAdd",
        component: SachAdd,
        meta: { roles: BOOK_ROLES },
      },
      {
        path: "sach/edit/:id",
        name: "SachEdit",
        component: SachEdit,
        meta: { roles: BOOK_ROLES },
        props: true,
      },
      {
        path: "nxb",
        name: "StaffNhaXuatBanManagement",
        component: StaffNhaXuatBanManagement,
        meta: { roles: BOOK_ROLES },
      },
      {
        path: "muonsach",
        name: "MuonSachManagement",
        component: MuonSachManagement,
        meta: { roles: BORROW_ROLES },
      },
      {
        path: "nhanvien",
        name: "NhanVienManagement",
        component: NhanVienManagement,
        meta: { roles: [ROLES.admin] },
      },
      {
        path: "docgia",
        name: "DocGiaManagement",
        component: DocGiaManagement,
        meta: { roles: [ROLES.admin] },
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const session = readAdminSession();
  if (to.meta.requiresAuth && !session) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return "/login";
  }
  if (to.path === "/login" && session) return defaultAdminPath(session.role);
  if (to.meta.roles && session && !to.meta.roles.includes(session.role)) {
    return defaultAdminPath(session.role);
  }
});

export default router;
