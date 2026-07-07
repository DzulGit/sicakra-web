import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { landingRoutes } from './routes/landing.routes'
import { adminRoutes } from './routes/admin.routes'
import { pelangganRoutes } from './routes/pelanggan.routes'
import { setupRouterGuards } from './guards'
import HalamanPlaceholder from '@/components/feedback/HalamanPlaceholder.vue'
import './types' // augmentasi RouteMeta

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

setupRouterGuards(router)

export default router
