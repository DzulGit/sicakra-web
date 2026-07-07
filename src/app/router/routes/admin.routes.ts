import type { RouteRecordRaw } from 'vue-router'
import HalamanPlaceholder from '@/components/feedback/HalamanPlaceholder.vue'

/**
 * Route Admin — dibangun Fase 3 (auth) & Fase 5-8 (Operasional/Teknisi/Keuangan/Super Admin).
 * Peran dibatasi lewat meta.peran, dicek oleh navigation guard (guards.ts).
 */
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/masuk',
    name: 'admin.masuk',
    component: HalamanPlaceholder,
    props: { judul: 'Login Admin' },
    meta: { layout: 'auth', judul: 'Masuk — Admin' },
  },

  // ----- Operasional -----
  {
    path: '/admin/operasional/permohonan-layanan',
    name: 'admin.operasional.permohonan-layanan.index',
    component: HalamanPlaceholder,
    props: { judul: 'Daftar Permohonan Layanan' },
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
    component: HalamanPlaceholder,
    props: { judul: 'Detail Permohonan Layanan' },
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
    component: HalamanPlaceholder,
    props: { judul: 'Laporan Kendala (Operasional)' },
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['operasional', 'super_admin'],
    },
  },

  // ----- Teknisi -----
  {
    path: '/admin/teknisi/jadwal-survey',
    name: 'admin.teknisi.jadwal-survey.index',
    component: HalamanPlaceholder,
    props: { judul: 'Jadwal Survey' },
    meta: {
      layout: 'dashboard',
      judul: 'Jadwal Survey',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },
  {
    path: '/admin/teknisi/jadwal-pemasangan',
    name: 'admin.teknisi.jadwal-pemasangan.index',
    component: HalamanPlaceholder,
    props: { judul: 'Jadwal Pemasangan' },
    meta: {
      layout: 'dashboard',
      judul: 'Jadwal Pemasangan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },
  {
    path: '/admin/teknisi/laporan-kendala',
    name: 'admin.teknisi.laporan-kendala.index',
    component: HalamanPlaceholder,
    props: { judul: 'Laporan Kendala (Teknisi)' },
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'admin',
      peran: ['teknisi', 'super_admin'],
    },
  },

  // ----- Keuangan -----
  {
    path: '/admin/keuangan/tagihan',
    name: 'admin.keuangan.tagihan.index',
    component: HalamanPlaceholder,
    props: { judul: 'Tagihan (Keuangan)' },
    meta: {
      layout: 'dashboard',
      judul: 'Tagihan',
      requiresAuth: true,
      guard: 'admin',
      peran: ['keuangan', 'super_admin'],
    },
  },

  // ----- Super Admin -----
  {
    path: '/admin/super-admin/admin',
    name: 'admin.super-admin.admin.index',
    component: HalamanPlaceholder,
    props: { judul: 'Kelola Akun Admin' },
    meta: {
      layout: 'dashboard',
      judul: 'Kelola Admin',
      requiresAuth: true,
      guard: 'admin',
      peran: ['super_admin'],
    },
  },
]
