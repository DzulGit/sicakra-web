import type { RouteRecordRaw } from 'vue-router'
const LoginPelangganPage = () => import('@/modules/auth/pelanggan/pages/LoginPelangganPage.vue')
const LupaPasswordPage = () => import('@/modules/auth/pelanggan/pages/LupaPasswordPage.vue')
const ResetPasswordPage = () => import('@/modules/auth/pelanggan/pages/ResetPasswordPage.vue')
const DashboardPelangganPage = () => import('@/modules/dashboard-pelanggan/pages/DashboardPelangganPage.vue')
const LayananSayaListPage = () => import('@/modules/layanan-internet/pages/LayananSayaListPage.vue')
const LayananSayaDetailPage = () => import('@/modules/layanan-internet/pages/LayananSayaDetailPage.vue')
const TagihanSayaListPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanListPage.vue')
const TagihanSayaDetailPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanDetailPage.vue')
const LaporanKendalaSayaListPage = () => import('@/modules/laporan-kendala/pages/pelanggan/LaporanKendalaSayaListPage.vue')
const LaporanKendalaSayaDetailPage = () => import('@/modules/laporan-kendala/pages/pelanggan/LaporanKendalaSayaDetailPage.vue')
const LaporanKendalaSayaCreatePage = () => import('@/modules/laporan-kendala/pages/pelanggan/LaporanKendalaSayaCreatePage.vue')
const ProfilPage = () => import('@/modules/profil/pages/ProfilPage.vue')
const NotifikasiPage = () => import('@/modules/notifikasi/pages/NotifikasiPage.vue')

/**
 * Route Pelanggan — dibangun Fase 3 (auth) & Fase 9 (dashboard).
 * Ganti username/password dilakukan di halaman Profil (bukan halaman
 * terpisah), ditawarkan lewat banner opsional di dashboard — lihat
 * DashboardPelangganPage.vue & ProfilPage.vue.
 */
export const pelangganRoutes: RouteRecordRaw[] = [
  {
    path: '/pelanggan/masuk',
    name: 'pelanggan.masuk',
    component: LoginPelangganPage,
    meta: { layout: 'auth', judul: 'Masuk — Pelanggan', fullBleed: true, hanyaGuest: true },
  },
  {
    path: '/pelanggan/lupa-password',
    name: 'pelanggan.lupa-password',
    component: LupaPasswordPage,
    meta: { layout: 'auth', judul: 'Lupa Password — Pelanggan' },
  },
  {
    path: '/pelanggan/reset-password',
    name: 'pelanggan.reset-password',
    component: ResetPasswordPage,
    meta: { layout: 'auth', judul: 'Reset Password — Pelanggan' },
  },
  {
    path: '/pelanggan/dashboard',
    name: 'pelanggan.dashboard',
    component: DashboardPelangganPage,
    meta: {
      layout: 'dashboard',
      judul: 'Dashboard',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/layanan',
    name: 'pelanggan.layanan.index',
    component: LayananSayaListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Layanan Saya',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/layanan/:id',
    name: 'pelanggan.layanan.detail',
    component: LayananSayaDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Layanan',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/tagihan',
    name: 'pelanggan.tagihan.index',
    component: TagihanSayaListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tagihan Saya',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/tagihan/:id',
    name: 'pelanggan.tagihan.detail',
    component: TagihanSayaDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Tagihan',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/laporan-kendala',
    name: 'pelanggan.laporan-kendala.index',
    component: LaporanKendalaSayaListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/laporan-kendala/baru',
    name: 'pelanggan.laporan-kendala.create',
    component: LaporanKendalaSayaCreatePage,
    meta: {
      layout: 'dashboard',
      judul: 'Buat Laporan Kendala',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/laporan-kendala/:id',
    name: 'pelanggan.laporan-kendala.detail',
    component: LaporanKendalaSayaDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Laporan Kendala',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/profil',
    name: 'pelanggan.profil',
    component: ProfilPage,
    meta: {
      layout: 'dashboard',
      judul: 'Profil',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/notifikasi',
    name: 'pelanggan.notifikasi',
    component: NotifikasiPage,
    meta: {
      layout: 'dashboard',
      judul: 'Notifikasi',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
]