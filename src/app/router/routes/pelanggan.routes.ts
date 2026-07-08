import type { RouteRecordRaw } from 'vue-router'
import HalamanPlaceholder from '@/components/feedback/HalamanPlaceholder.vue'
import LoginPelangganPage from '@/modules/auth/pelanggan/pages/LoginPelangganPage.vue'
import BuatPasswordPage from '@/modules/auth/pelanggan/pages/BuatPasswordPage.vue'

/**
 * Route Pelanggan — dibangun Fase 3 (auth) & Fase 9 (dashboard).
 * '/pelanggan/buat-password' SENGAJA requiresAuth tapi TIDAK di-guard
 * pastikan-password (justru ini tempat mengisinya) — lihat guards.ts.
 */
export const pelangganRoutes: RouteRecordRaw[] = [
  {
    path: '/pelanggan/masuk',
    name: 'pelanggan.masuk',
    component: LoginPelangganPage,
    meta: { layout: 'auth', judul: 'Masuk — Pelanggan' },
  },
  {
    path: '/pelanggan/buat-password',
    name: 'pelanggan.buat-password',
    component: BuatPasswordPage,
    meta: {
      layout: 'auth',
      judul: 'Buat Password',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/dashboard',
    name: 'pelanggan.dashboard',
    component: HalamanPlaceholder,
    props: { judul: 'Dashboard Pelanggan' },
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
    component: HalamanPlaceholder,
    props: { judul: 'Layanan Saya' },
    meta: {
      layout: 'dashboard',
      judul: 'Layanan Saya',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/tagihan',
    name: 'pelanggan.tagihan.index',
    component: HalamanPlaceholder,
    props: { judul: 'Tagihan Saya' },
    meta: {
      layout: 'dashboard',
      judul: 'Tagihan Saya',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/laporan-kendala',
    name: 'pelanggan.laporan-kendala.index',
    component: HalamanPlaceholder,
    props: { judul: 'Laporan Kendala Saya' },
    meta: {
      layout: 'dashboard',
      judul: 'Laporan Kendala',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
  {
    path: '/pelanggan/profil',
    name: 'pelanggan.profil',
    component: HalamanPlaceholder,
    props: { judul: 'Profil Saya' },
    meta: {
      layout: 'dashboard',
      judul: 'Profil',
      requiresAuth: true,
      guard: 'pelanggan',
    },
  },
]
