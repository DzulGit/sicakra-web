import type { RouteRecordRaw } from 'vue-router'
const LoginResellerPage = () => import('@/modules/reseller-portal/pages/LoginResellerPage.vue')
const ResellerOverviewPage = () => import('@/modules/reseller-portal/pages/ResellerOverviewPage.vue')
const ResellerPelangganListPage = () => import('@/modules/reseller-portal/pages/ResellerPelangganListPage.vue')
const ResellerDaftarkanPelangganPage = () => import('@/modules/reseller-portal/pages/ResellerDaftarkanPelangganPage.vue')
const ResellerPelangganDetailPage = () => import('@/modules/reseller-portal/pages/ResellerPelangganDetailPage.vue')
const PendapatanResellerPage = () => import('@/modules/pendapatan-reseller/pages/PendapatanResellerPage.vue')
const ProfilResellerPage = () => import('@/modules/profil-reseller/pages/ProfilResellerPage.vue')
const NotifikasiListPage = () => import('@/modules/notifikasi/pages/NotifikasiListPage.vue')
const ResellerPaketInternetListPage = () => import('@/modules/reseller-portal/pages/ResellerPaketInternetListPage.vue')
const ResellerPaketInternetFormPage = () => import('@/modules/reseller-portal/pages/ResellerPaketInternetFormPage.vue')
const ResellerTagihanListPage = () => import('@/modules/reseller-portal/pages/ResellerTagihanListPage.vue')
const ResellerTagihanDetailPage = () => import('@/modules/reseller-portal/pages/ResellerTagihanDetailPage.vue')
const ResellerPermohonanLayananListPage = () => import('@/modules/reseller-portal/pages/ResellerPermohonanLayananListPage.vue')
const ResellerPermohonanLayananDetailPage = () => import('@/modules/reseller-portal/pages/ResellerPermohonanLayananDetailPage.vue')
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
    path: '/reseller/profil',
    name: 'reseller.profil',
    component: ProfilResellerPage,
    meta: {
      layout: 'dashboard',
      judul: 'Profil',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/pendapatan',
    name: 'reseller.pendapatan',
    component: PendapatanResellerPage,
    meta: {
      layout: 'dashboard',
      judul: 'Pendapatan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/pelanggan/baru',
    name: 'reseller.pelanggan.baru',
    component: ResellerDaftarkanPelangganPage,
    meta: {
      layout: 'dashboard',
      judul: 'Daftarkan Pelanggan',
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
  {
    path: '/reseller/paket-internet',
    name: 'reseller.paket-internet.index',
    component: ResellerPaketInternetListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/paket-internet/baru',
    name: 'reseller.paket-internet.baru',
    component: ResellerPaketInternetFormPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tambah Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/paket-internet/:id/ubah',
    name: 'reseller.paket-internet.ubah',
    component: ResellerPaketInternetFormPage,
    meta: {
      layout: 'dashboard',
      judul: 'Ubah Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/permohonan-layanan',
    name: 'reseller.permohonan-layanan.index',
    component: ResellerPermohonanLayananListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Permohonan Layanan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/permohonan-layanan/:id',
    name: 'reseller.permohonan-layanan.detail',
    component: ResellerPermohonanLayananDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Permohonan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/tagihan',
    name: 'reseller.tagihan.index',
    component: ResellerTagihanListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tagihan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
  {
    path: '/reseller/tagihan/:id',
    name: 'reseller.tagihan.detail',
    component: ResellerTagihanDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Tagihan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['reseller'],
    },
  },
]