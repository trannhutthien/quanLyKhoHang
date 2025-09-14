import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('../views/InventoryListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/:id',
      name: 'inventory-detail',
      component: () => import('../views/InventoryDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: () => import('../views/TransferView.vue'),
      meta: { requiresAuth: true }
    },

  ],
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const raw = localStorage.getItem('user')
  let isAuthenticated = false
  try {
    const session = raw ? JSON.parse(raw) : null
    isAuthenticated = !!(session && session.isAuthenticated === true)
  } catch (e) {
    isAuthenticated = false
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
