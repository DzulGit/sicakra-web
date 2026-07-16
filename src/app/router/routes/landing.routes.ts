import type { RouteRecordRaw } from 'vue-router'
const HomePage = () => import('@/modules/landing/pages/HomePage.vue')
const PaketInternetPage = () => import('@/modules/landing/pages/PaketInternetPage.vue')
const TentangKamiPage = () => import('@/modules/landing/pages/TentangKamiPage.vue')
const FaqPage = () => import('@/modules/landing/pages/FaqPage.vue')
const KontakPage = () => import('@/modules/landing/pages/KontakPage.vue')
const DaftarPage = () => import('@/modules/landing/pages/DaftarPage.vue')

/**
 * Route publik — Landing Page & Pendaftaran. Tidak butuh auth sama sekali.
 * Dibangun Fase 10.
 */
export const landingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing.home',
    component: HomePage,
    meta: { layout: 'landing', judul: 'Sicakra — Internet Fiber Cepat & Andal' },
  },
  {
    path: '/paket-internet',
    name: 'landing.paket-internet',
    component: PaketInternetPage,
    meta: { layout: 'landing', judul: 'Paket Internet' },
  },
  {
    path: '/tentang-kami',
    name: 'landing.tentang-kami',
    component: TentangKamiPage,
    meta: { layout: 'landing', judul: 'Tentang Kami' },
  },
  {
    path: '/faq',
    name: 'landing.faq',
    component: FaqPage,
    meta: { layout: 'landing', judul: 'FAQ' },
  },
  {
    path: '/kontak',
    name: 'landing.kontak',
    component: KontakPage,
    meta: { layout: 'landing', judul: 'Kontak' },
  },
  {
    path: '/daftar',
    name: 'landing.daftar',
    component: DaftarPage,
    meta: { layout: 'landing', judul: 'Daftar Berlangganan' },
  },
]
