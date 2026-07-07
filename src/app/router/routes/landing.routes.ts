import type { RouteRecordRaw } from 'vue-router'
import HalamanPlaceholder from '@/components/feedback/HalamanPlaceholder.vue'

/**
 * Route publik — Landing Page & Pendaftaran. Tidak butuh auth sama sekali.
 * Dibangun di Fase 10 roadmap. Placeholder dulu supaya struktur routing utuh.
 */
export const landingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing.home',
    component: HalamanPlaceholder,
    props: { judul: 'Home' },
    meta: { layout: 'landing', judul: 'Sicakra — Internet Cepat & Andal' },
  },
  {
    path: '/paket-internet',
    name: 'landing.paket-internet',
    component: HalamanPlaceholder,
    props: { judul: 'Paket Internet' },
    meta: { layout: 'landing', judul: 'Paket Internet' },
  },
  {
    path: '/tentang-kami',
    name: 'landing.tentang-kami',
    component: HalamanPlaceholder,
    props: { judul: 'Tentang Kami' },
    meta: { layout: 'landing', judul: 'Tentang Kami' },
  },
  {
    path: '/faq',
    name: 'landing.faq',
    component: HalamanPlaceholder,
    props: { judul: 'FAQ' },
    meta: { layout: 'landing', judul: 'FAQ' },
  },
  {
    path: '/kontak',
    name: 'landing.kontak',
    component: HalamanPlaceholder,
    props: { judul: 'Kontak' },
    meta: { layout: 'landing', judul: 'Kontak' },
  },
  {
    path: '/daftar',
    name: 'landing.daftar',
    component: HalamanPlaceholder,
    props: { judul: 'Daftar Berlangganan' },
    meta: { layout: 'landing', judul: 'Daftar Berlangganan' },
  },
]
