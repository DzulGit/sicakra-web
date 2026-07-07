import 'vue-router'
import type { PeranAdmin, TipePengguna } from '@/stores/auth.store'

/**
 * Augmentasi tipe RouteMeta bawaan vue-router — supaya semua route
 * di project ini punya autocomplete & type-checking untuk field custom kita.
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** Wajib login untuk akses route ini? Default: false (publik). */
    requiresAuth?: boolean
    /** Kalau requiresAuth, harus tipe pengguna apa yang login. */
    guard?: TipePengguna
    /** Kalau guard === 'admin', batasi lebih lanjut ke peran tertentu. Kosong = semua peran admin boleh. */
    peran?: PeranAdmin[]
    /** Layout pembungkus halaman ini. */
    layout: 'landing' | 'auth' | 'dashboard'
    /** Judul halaman untuk <title> (lewat @unhead/vue) dan breadcrumb. */
    judul: string
  }
}
