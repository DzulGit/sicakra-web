import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { httpClient } from '@/app/providers/httpClient'
import { toast } from 'vue-sonner'

/**
 * Navigation guard global. Urutan pengecekan SENGAJA mencerminkan urutan
 * middleware backend: tipe-pengguna -> peran -> pastikan.password.
 * Lihat docs/frontend/auth/authorization.md.
 */
export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Shadow login — kode sekali pakai dari admin operasional ditukar ke token
    // shadow berumur pendek di endpoint /reseller/shadow/klaim. Token ASLI
    // tidak pernah lewat URL; cuma kode (3 menit, sekali pakai) yang ada di sana.
    const shadowCode = to.query.shadow_code as string | undefined
    if (shadowCode) {
      try {
        const { data } = await httpClient.post('/reseller/shadow/klaim', { kode: shadowCode })
        const { token, reseller, admin } = data.data
        authStore.setShadow(token, {
          id: reseller.id,
          nama_lengkap: reseller.nama_lengkap,
          tipe: 'admin',
          peran: 'reseller',
          foto_profil: reseller.foto_profil,
        }, admin)

        // Redirect tanpa query param supaya guard tidak trigger ulang.
        const { shadow_code: _, ...restQuery } = to.query
        return { path: to.path, query: restQuery, replace: true }
      } catch {
        toast.error('Kode shadow tidak valid atau sudah kedaluwarsa.')
        authStore.kunciKeModeReseller()
        return { name: 'reseller.masuk' }
      }
    }

    // Halaman login (hanyaGuest): sesi valid -> jangan tampilkan form login,
    // langsung lompat ke dashboard sesuai tipe/peran pengguna.
    if (to.meta.hanyaGuest && authStore.sudahLogin) {
      return authStore.ruteHome
    }

    // Route publik (tidak butuh auth) -> selalu boleh lewat
    if (!to.meta.requiresAuth) return true

    // 1. Harus sudah login. Arah balik ditentukan dari prefix path rute
    // tujuan (portal reseller /reseller -> reseller.masuk, pelanggan,
    // sisanya admin) karena meta.guard pada rute reseller sengaja 'admin'
    // (reseller adalah model "admin" di backend) — disambiguasi via path.
    if (!authStore.sudahLogin) {
      if (to.path.startsWith('/reseller')) return { name: 'reseller.masuk' }
      if (to.path.startsWith('/pelanggan')) return { name: 'pelanggan.masuk' }
      return { name: 'admin.masuk' }
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