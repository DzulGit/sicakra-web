import type { RouteRecordRaw } from 'vue-router'
const OperasionalOverviewPage = () => import('@/modules/dashboard-admin/pages/OperasionalOverviewPage.vue')
const KeuanganOverviewPage = () => import('@/modules/dashboard-admin/pages/KeuanganOverviewPage.vue')
const TeknisiOverviewPage = () => import('@/modules/dashboard-admin/pages/TeknisiOverviewPage.vue')
const LoginAdminPage = () => import('@/modules/auth/admin/pages/LoginAdminPage.vue')
const PermohonanLayananListPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananListPage.vue')
const PermohonanLayananDetailPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananDetailPage.vue')
const LaporanKendalaListPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaDetailPage.vue')
const JadwalKerjaListPage = () => import('@/modules/jadwal-kerja/pages/JadwalKerjaListPage.vue')
const JadwalKerjaDetailPage = () => import('@/modules/jadwal-kerja/pages/JadwalKerjaDetailPage.vue')
const LaporanKendalaListPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaDetailPage.vue')
const TagihanListPage = () => import('@/modules/tagihan/pages/admin/TagihanListPage.vue')
const TagihanDetailPage = () => import('@/modules/tagihan/pages/admin/TagihanDetailPage.vue')
const PendapatanPage = () => import('@/modules/pendapatan/pages/PendapatanPage.vue')
const AdminListPage = () => import('@/modules/admin-management/pages/AdminListPage.vue')
const AdminCreatePage = () => import('@/modules/admin-management/pages/AdminCreatePage.vue')
const AdminEditPage = () => import('@/modules/admin-management/pages/AdminEditPage.vue')
const TimTeknisiListPage = () => import('@/modules/tim-teknisi/pages/TimTeknisiListPage.vue')
const TimTeknisiCreatePage = () => import('@/modules/tim-teknisi/pages/TimTeknisiCreatePage.vue')
const TimTeknisiEditPage = () => import('@/modules/tim-teknisi/pages/TimTeknisiEditPage.vue')
const PelangganListPage = () => import('@/modules/pelanggan/pages/PelangganListPage.vue')
const PelangganDetailPage = () => import('@/modules/pelanggan/pages/PelangganDetailPage.vue')
const PaketInternetListPage = () => import('@/modules/paket-internet/pages/PaketInternetListPage.vue')
const PaketInternetFormPage = () => import('@/modules/paket-internet/pages/PaketInternetFormPage.vue')
const NotifikasiPage = () => import('@/modules/notifikasi/pages/NotifikasiPage.vue')

/**
 * Route Admin — dibangun Fase 3 (auth), Fase 5-8 (Operasional/Teknisi/
 * Keuangan/Super Admin). Direvisi Juli 2026: jadwal survey+pemasangan
 * digabung jadi Jadwal Kerja, tambah Tim Teknisi (Super Admin).
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/masuk',
    name: 'admin.masuk',
    component: LoginAdminPage,
    meta: { layout: 'auth', judul: 'Masuk — Admin', fullBleed: true },
  },

  // ----- Operasional Overview -----
  {
    path: '/admin/operasional/overview',
    name: 'admin.operasional.overview',
    component: OperasionalOverviewPage,
    meta: {
      layout: 'dashboard',
      judul: 'Overview',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },

  // ----- Keuangan Overview -----
  {
    path: '/admin/keuangan/overview',
    name: 'admin.keuangan.overview',
    component: KeuanganOverviewPage,
    meta: {
      layout: 'dashboard',
      judul: 'Overview',
      requiresAuth: true,
      guard: 'admin',
      peran: ['keuangan'],
    },
  },

  // ----- Teknisi Overview -----
  {
    path: '/admin/teknisi/overview',
    name: 'admin.teknisi.overview',
    component: TeknisiOverviewPage,
    meta: {
      layout: 'dashboard',
      judul: 'Overview',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi'],
    },
  },

  // ----- Operasional -----
  {
    path: '/admin/operasional/permohonan-layanan',
    name: 'admin.operasional.permohonan-layanan.index',
    component: PermohonanLayananListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Permohonan Layanan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/permohonan-layanan/:id',
    name: 'admin.operasional.permohonan-layanan.detail',
    component: PermohonanLayananDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Permohonan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/laporan-kendala',
    name: 'admin.operasional.laporan-kendala.index',
    component: LaporanKendalaListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/laporan-kendala/:id',
    name: 'admin.operasional.laporan-kendala.detail',
    component: LaporanKendalaDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },

  {
    path: '/admin/operasional/paket-internet',
    name: 'admin.operasional.paket-internet.index',
    component: PaketInternetListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/paket-internet/baru',
    name: 'admin.operasional.paket-internet.create',
    component: PaketInternetFormPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tambah Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional',],
    },
  },
  {
    path: '/admin/operasional/paket-internet/:id/ubah',
    name: 'admin.operasional.paket-internet.edit',
    component: PaketInternetFormPage,
    meta: {
      layout: 'dashboard',
      judul: 'Ubah Paket Internet',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/pelanggan',
    name: 'admin.operasional.pelanggan.index',
    component: PelangganListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Pelanggan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional', 'keuangan', 'super_admin'],
    },
  },
  {
    path: '/admin/operasional/pelanggan/:id',
    name: 'admin.operasional.pelanggan.detail',
    component: PelangganDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Pelanggan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional', 'keuangan', 'super_admin'],
    },
  },

  // ----- Teknisi -----
  {
    path: '/admin/teknisi/jadwal-kerja',
    name: 'admin.teknisi.jadwal-kerja.index',
    component: JadwalKerjaListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Jadwal Kerja',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi'],
    },
  },
  {
    path: '/admin/teknisi/jadwal-kerja/:id',
    name: 'admin.teknisi.jadwal-kerja.detail',
    component: JadwalKerjaDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Isi Hasil Kunjungan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi'],
    },
  },
  {
    path: '/admin/teknisi/laporan-kendala',
    name: 'admin.teknisi.laporan-kendala.index',
    component: LaporanKendalaListPageTeknisi,
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi'],
    },
  },
  {
    path: '/admin/teknisi/laporan-kendala/:id',
    name: 'admin.teknisi.laporan-kendala.detail',
    component: LaporanKendalaDetailPageTeknisi,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi'],
    },
  },

  // ----- Keuangan -----
  {
    path: '/admin/keuangan/tagihan',
    name: 'admin.keuangan.tagihan.index',
    component: TagihanListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tagihan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['keuangan'],
    },
  },
  {
    path: '/admin/keuangan/tagihan/:id',
    name: 'admin.keuangan.tagihan.detail',
    component: TagihanDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Detail Tagihan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['keuangan'],
    },
  },
  {
    path: '/admin/keuangan/pendapatan',
    name: 'admin.keuangan.pendapatan',
    component: PendapatanPage,
    meta: {
      layout: 'dashboard',
      judul: 'Pendapatan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['keuangan'],
    },
  },

  // ----- Super Admin -----
  {
    path: '/admin/super-admin/admin',
    name: 'admin.super-admin.admin.index',
    component: AdminListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Kelola Admin',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
  {
    path: '/admin/super-admin/admin/baru',
    name: 'admin.super-admin.admin.create',
    component: AdminCreatePage,
    meta: {
      layout: 'dashboard',
      judul: 'Tambah Admin',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
  {
    path: '/admin/super-admin/admin/:id/ubah',
    name: 'admin.super-admin.admin.edit',
    component: AdminEditPage,
    meta: {
      layout: 'dashboard',
      judul: 'Ubah Admin',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
  {
    path: '/admin/operasional/tim-teknisi',
    name: 'admin.operasional.tim-teknisi.index',
    component: TimTeknisiListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/tim-teknisi/baru',
    name: 'admin.operasional.tim-teknisi.create',
    component: TimTeknisiCreatePage,
    meta: {
      layout: 'dashboard',
      judul: 'Tambah Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },
  {
    path: '/admin/operasional/tim-teknisi/:id/ubah',
    name: 'admin.operasional.tim-teknisi.edit',
    component: TimTeknisiEditPage,
    meta: {
      layout: 'dashboard',
      judul: 'Ubah Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional'],
    },
  },

  // ----- Notifikasi (semua peran admin) -----
  {
    path: '/admin/notifikasi',
    name: 'admin.notifikasi',
    component: NotifikasiPage,
    meta: {
      layout: 'dashboard',
      judul: 'Notifikasi',
      requiresAuth: true,
      guard: 'admin',
    },
  },
]