import type { RouteRecordRaw } from 'vue-router'
const LoginResellerPage = () => import('@/modules/reseller-portal/pages/LoginResellerPage.vue')
const ResellerOverviewPage = () => import('@/modules/reseller-portal/pages/ResellerOverviewPage.vue')
const ResellerPelangganListPage = () => import('@/modules/reseller-portal/pages/ResellerPelangganListPage.vue')
const ResellerPelangganDetailPage = () => import('@/modules/reseller-portal/pages/ResellerPelangganDetailPage.vue')
const NotifikasiListPage = () => import('@/modules/notifikasi/pages/NotifikasiListPage.vue')

/**
 * Route PORTAL RESELLER — mitra eksternal memakai sistem, data dibatasi
 * (scoped) pelanggan milik reseller tsb. Pisah total dari rute admin internal
 * (reseller TIDAK bisa lewat /admin/*). Backend: grup prefix 'reseller'.
 */
export const resellerRoutes: RouteRecordRaw[] = [
  {
    path: '/reseller/masuk',
    name: 'reseller.masuk',
    component: LoginResellerPage,
    meta: { layout: 'auth', judul: 'Masuk — Portal Reseller', fullBleed: true, hanyaGuest: true },
  },
  {
    path: '/reseller/overview',
    name: 'reseller.overview',
    component: ResellerOverviewPage,
    meta: {
      layout: 'dashboard',
      judul: 'Overview',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/pelanggan',
    name: 'reseller.pelanggan.index',
    component: ResellerPelangganListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Pelanggan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/pelanggan/:id',
    name: 'reseller.pelanggan.detail',
    component: ResellerPelangganDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Pelanggan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/notifikasi',
    name: 'reseller.notifikasi',
    component: NotifikasiListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Notifikasi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
]