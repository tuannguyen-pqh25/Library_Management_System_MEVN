import { createRouter, createWebHistory } from 'vue-router'

import HomeUser from '@/views/HomeUser.vue'
import LoginUser from '@/views/LoginUser.vue'
import RegisterUser from '@/views/RegisterUser.vue'
import BookList from '@/views/BookList.vue'
import BookDetail from '@/views/BookDetail.vue'
import BorrowHistory from '@/views/BorrowHistory.vue'
import ProfileUser from '@/views/ProfileUser.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeUser,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginUser,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterUser,
  },
  {
    path: '/sach',
    name: 'books',
    component: BookList,
  },
  {
    path: '/sach/:id',
    name: 'book-detail',
    component: BookDetail,
    props: true,
  },
  {
    path: '/lich-su',
    name: 'borrow-history',
    component: BorrowHistory,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileUser,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  next()
})

export default router
