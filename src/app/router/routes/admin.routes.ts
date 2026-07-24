import type { RouteRecordRaw } from 'vue-router'
const LoginAdminPage = () => import('@/modules/auth/admin/pages/LoginAdminPage.vue')
const PermohonanLayananListPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananListPage.vue')
const PermohonanLayananDetailPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananDetailPage.vue')
const LaporanKendalaListPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaDetailPage.vue')
const JadwalKerjaListPage = () => import('@/modules/jadwal-kerja/pages/JadwalKerjaListPage.vue')
const JadwalKerjaDetailPage = () => import('@/modules/jadwal-kerja/pages/JadwalKerjaDetailPage.vue')
const LaporanKendalaListPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaDetailPage.vue')
const TagihanListPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanListPage.vue')
const TagihanDetailPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanDetailPage.vue')
const AdminListPage = () => import('@/modules/admin-management/pages/AdminListPage.vue')
const AdminCreatePage = () => import('@/modules/admin-management/pages/AdminCreatePage.vue')
const AdminEditPage = () => import('@/modules/admin-management/pages/AdminEditPage.vue')
const TimTeknisiListPage = () => import('@/modules/tim-teknisi/pages/TimTeknisiListPage.vue')
const TimTeknisiCreatePage = () => import('@/modules/tim-teknisi/pages/TimTeknisiCreatePage.vue')
const TimTeknisiEditPage = () => import('@/modules/tim-teknisi/pages/TimTeknisiEditPage.vue')

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
      peran: ['operasional', 'super_admin'],
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
      peran: ['operasional', 'super_admin'],
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
      peran: ['operasional', 'super_admin'],
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
      peran: ['operasional', 'super_admin'],
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
      peran: ['teknisi', 'super_admin'],
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
      peran: ['teknisi', 'super_admin'],
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
      peran: ['teknisi', 'super_admin'],
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
      peran: ['teknisi', 'super_admin'],
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
      peran: ['keuangan', 'super_admin'],
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
      peran: ['keuangan', 'super_admin'],
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
    path: '/admin/super-admin/tim-teknisi',
    name: 'admin.super-admin.tim-teknisi.index',
    component: TimTeknisiListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
  {
    path: '/admin/super-admin/tim-teknisi/baru',
    name: 'admin.super-admin.tim-teknisi.create',
    component: TimTeknisiCreatePage,
    meta: {
      layout: 'dashboard',
      judul: 'Tambah Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
  {
    path: '/admin/super-admin/tim-teknisi/:id/ubah',
    name: 'admin.super-admin.tim-teknisi.edit',
    component: TimTeknisiEditPage,
    meta: {
      layout: 'dashboard',
      judul: 'Ubah Tim Teknisi',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
]