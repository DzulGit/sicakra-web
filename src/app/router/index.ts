import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { landingRoutes } from './routes/landing.routes'
import { adminRoutes } from './routes/admin.routes'
import { pelangganRoutes } from './routes/pelanggan.routes'
import { setupRouterGuards } from './guards'
import './types' // augmentasi RouteMeta
import { Capacitor } from '@capacitor/core'


const HalamanPlaceholder = () => import('@/components/feedback/HalamanPlaceholder.vue')

const fallbackRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'forbidden',
    component: HalamanPlaceholder,
    props: { judul: 'Akses Ditolak (403)' },
    meta: { layout: 'auth', judul: 'Akses Ditolak' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: HalamanPlaceholder,
    props: { judul: 'Halaman Tidak Ditemukan (404)' },
    meta: { layout: 'auth', judul: 'Halaman Tidak Ditemukan' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...landingRoutes, ...adminRoutes, ...pelangganRoutes, ...fallbackRoutes],
  scrollBehavior() {
    return { top: 0 }
  },
})

if (Capacitor.isNativePlatform()) {
  router.beforeEach((to, _from, next) => {
    if (!to.path.startsWith('/pelanggan')) {
      next('/pelanggan/masuk')
    } else {
      next()
    }
  })
}

setupRouterGuards(router)

export default router
