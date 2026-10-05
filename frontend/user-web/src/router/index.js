import { createRouter, createWebHistory } from 'vue-router'

import HomeUser from '@/views/HomeUser.vue'
import LoginUser from '@/views/LoginUser.vue'
import RegisterUser from '@/views/RegisterUser.vue'
import BookList from '@/views/BookList.vue'
import BookDetail from '@/views/BookDetail.vue'
import BorrowHistory from '@/views/BorrowHistory.vue'
import ProfileUser from '@/views/ProfileUser.vue'
import WishlistUser from '@/views/WishlistUser.vue'
import CartUser from '@/views/CartUser.vue'

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
    path: '/yeuthich',
    name: 'wishlist',
    component: WishlistUser,
    meta: { requiresAuth: true },
  },
  {
    path: '/gio-muon',
    name: 'cart',
    component: CartUser,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const decodeToken = (token) => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const raw = atob(padded)
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

const isValidUserToken = () => {
  const token = localStorage.getItem('token')
  const payload = decodeToken(token)

  if (!payload || !payload.aud || payload.aud !== 'user') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return false
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return false
  }

  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth) {
    if (!token || !isValidUserToken()) {
      next('/login')
      return
    }
  }

  if (to.path === '/login' && token && isValidUserToken()) {
    next('/')
    return
  }

  next()
})

export default router
