import type { RouteRecordRaw } from 'vue-router'
const LoginAdminPage = () => import('@/modules/auth/admin/pages/LoginAdminPage.vue')
const PermohonanLayananListPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananListPage.vue')
const PermohonanLayananDetailPage = () => import('@/modules/permohonan-layanan/pages/PermohonanLayananDetailPage.vue')
const LaporanKendalaListPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPage = () => import('@/modules/laporan-kendala/pages/operasional/LaporanKendalaDetailPage.vue')
const JadwalSurveyListPage = () => import('@/modules/jadwal-survey/pages/JadwalSurveyListPage.vue')
const JadwalSurveyDetailPage = () => import('@/modules/jadwal-survey/pages/JadwalSurveyDetailPage.vue')
const JadwalPemasanganListPage = () => import('@/modules/jadwal-pemasangan/pages/JadwalPemasanganListPage.vue')
const JadwalPemasanganDetailPage = () => import('@/modules/jadwal-pemasangan/pages/JadwalPemasanganDetailPage.vue')
const LaporanKendalaListPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaListPage.vue')
const LaporanKendalaDetailPageTeknisi = () => import('@/modules/laporan-kendala/pages/teknisi/LaporanKendalaDetailPage.vue')
const TagihanListPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanSayaListPage.vue')
const TagihanDetailPage = () => import('@/modules/tagihan/pages/pelanggan/TagihanSayaDetailPage.vue')
const AdminListPage = () => import('@/modules/admin-management/pages/AdminListPage.vue')
const AdminCreatePage = () => import('@/modules/admin-management/pages/AdminCreatePage.vue')
const AdminEditPage = () => import('@/modules/admin-management/pages/AdminEditPage.vue')

/**
 * Route Admin — dibangun Fase 3 (auth) & Fase 5-8 (Operasional/Teknisi/Keuangan/Super Admin).
 * Peran dibatasi lewat meta.peran, dicek oleh navigation guard (guards.ts).
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/masuk',
    name: 'admin.masuk',
    component: LoginAdminPage,
    meta: { layout: 'auth', judul: 'Masuk — Admin' },
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
    path: '/admin/teknisi/jadwal-survey',
    name: 'admin.teknisi.jadwal-survey.index',
    component: JadwalSurveyListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Jadwal Survey',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },
  {
    path: '/admin/teknisi/jadwal-survey/:id',
    name: 'admin.teknisi.jadwal-survey.detail',
    component: JadwalSurveyDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Isi Hasil Survey',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },
  {
    path: '/admin/teknisi/jadwal-pemasangan',
    name: 'admin.teknisi.jadwal-pemasangan.index',
    component: JadwalPemasanganListPage,
    meta: {
      layout: 'dashboard',
      judul: 'Jadwal Pemasangan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },
  {
    path: '/admin/teknisi/jadwal-pemasangan/:id',
    name: 'admin.teknisi.jadwal-pemasangan.detail',
    component: JadwalPemasanganDetailPage,
    meta: {
      layout: 'dashboard',
      judul: 'Isi Hasil Pemasangan',
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
]
