import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Navigation guard global. Urutan pengecekan SENGAJA mencerminkan urutan
 * middleware backend: tipe-pengguna -> peran -> pastikan.password.
 * Lihat docs/frontend/auth/authorization.md.
 */
export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    // Route publik (tidak butuh auth) -> selalu boleh lewat
    if (!to.meta.requiresAuth) return true

    // 1. Harus sudah login
    if (!authStore.sudahLogin) {
      return to.meta.guard === 'pelanggan' ? { name: 'pelanggan.masuk' } : { name: 'admin.masuk' }
    }

    // 2. Tipe pengguna harus cocok (admin token tidak boleh akses rute pelanggan, dst)
    if (to.meta.guard && authStore.tipePengguna !== to.meta.guard) {
      return { name: 'forbidden' }
    }

    // 3. Kalau rute admin dibatasi peran tertentu, cek peran cocok
    if (to.meta.peran && to.meta.peran.length > 0) {
      if (!authStore.peranAdmin || !to.meta.peran.includes(authStore.peranAdmin)) {
        return { name: 'forbidden' }
      }
    }

    // Catatan: pelanggan yang belum pernah ganti password TIDAK LAGI dipaksa
    // ke halaman buat-password. Password default (= nomor pelanggan) sudah
    // cukup untuk login; ganti password ditawarkan opsional lewat popup di
    // dashboard (lihat DashboardPelangganPage.vue), bukan dipaksa di sini.

    return true
  })
}