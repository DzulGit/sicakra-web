import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage, useSessionStorage, StorageSerializers } from '@vueuse/core'

/**
 * Tipe pengguna yang login — cermin 2 model backend (Admin vs Pelanggan).
 * Guard 'sanctum' di backend bersifat polymorphic, jadi kita HARUS simpan
 * tipe ini sendiri di sisi frontend untuk tahu rute mana yang boleh diakses.
 */
export type TipePengguna = 'admin' | 'pelanggan'

export type PeranAdmin = 'super_admin' | 'operasional' | 'teknisi' | 'keuangan' | 'reseller'

export interface SesiPengguna {
  id: number
  nama_lengkap: string
  tipe: TipePengguna
  peran?: PeranAdmin // hanya ada kalau tipe === 'admin'
  password_sudah_dibuat?: boolean // hanya relevan kalau tipe === 'pelanggan'
  foto_profil?: string | null;
}

/**
 * Pinia store — HANYA client/UI state (sesi auth).
 * Data dari API (permohonan, tagihan, dst) TIDAK pernah masuk ke sini —
 * itu semua tanggung jawab TanStack Query. Lihat docs/frontend/arsitektur/data-fetching.md.
 *
 * Shadow session (login as) menggunakan sessionStorage supaya tab baru
 * punya sesi sendiri tanpa menimpa sesi admin di tab asal (localStorage).
 */
export const useAuthStore = defineStore('auth', () => {
  // Sesi normal — persist di localStorage (shared lintas tab).
  const token = useLocalStorage<string | null>('sicakra_token', null)
  const pengguna = useLocalStorage<SesiPengguna | null>('sicakra_pengguna', null, {
    serializer: StorageSerializers.object
  })

  // Sesi shadow — persist di sessionStorage (per-tab, tidak sync antar tab).
  const shadowToken = useSessionStorage<string | null>('sicakra_shadow_token', null)
  const shadowPengguna = useSessionStorage<SesiPengguna | null>('sicakra_shadow_pengguna', null, {
    serializer: StorageSerializers.object
  })

  // --- Computed aktif: shadow menimpa normal jika ada ---

  const isShadow = computed(() => !!shadowToken.value)

  const sudahLogin = computed(() =>
    !!(shadowToken.value || token.value) && !!(shadowPengguna.value || pengguna.value),
  )

  const activePengguna = computed(() => shadowPengguna.value || pengguna.value)

  const tipePengguna = computed<TipePengguna | null>(
    () => activePengguna.value?.tipe ?? ((activePengguna.value as { tipe_pengguna?: TipePengguna } | null)?.tipe_pengguna ?? null),
  )

  const peranAdmin = computed<PeranAdmin | null>(() => activePengguna.value?.peran ?? null)

  // Halaman "home" setelah login — dipakai auto-redirect dari halaman login
  // dan navigasi default. Reseller punya portal sendiri (/reseller), terpisah
  // dari halaman admin internal (/admin).
  const rutePerPeran: Record<string, string> = {
    super_admin: '/admin/super-admin/admin',
    operasional: '/admin/operasional/overview',
    teknisi: '/admin/teknisi/overview',
    keuangan: '/admin/keuangan/overview',
    reseller: '/reseller/overview',
  }
  const ruteHome = computed(() => {
    if (tipePengguna.value === 'pelanggan') return '/pelanggan/dashboard'
    return rutePerPeran[activePengguna.value?.peran ?? ''] ?? '/admin/masuk'
  })

  const wajibBuatPassword = computed(
    () => activePengguna.value?.tipe === 'pelanggan' && activePengguna.value.password_sudah_dibuat === false,
  )

  // --- Akses token aktif untuk httpClient ---

  const activeToken = computed(() => shadowToken.value || token.value)

  // --- Mutasi ---

  function setSesi(tokenBaru: string, penggunaBaru: SesiPengguna) {
    if (shadowToken.value) {
      shadowToken.value = tokenBaru
      shadowPengguna.value = penggunaBaru
    } else {
      token.value = tokenBaru
      pengguna.value = penggunaBaru
    }
  }

  /** Inisialisasi sesi shadow dari URL param (dipanggil oleh router guard). */
  function setShadow(tokenBaru: string, penggunaBaru: SesiPengguna) {
    shadowToken.value = tokenBaru
    shadowPengguna.value = penggunaBaru
  }

  function perbaruiPengguna(perubahan: Partial<SesiPengguna>) {
    const active = shadowPengguna.value || pengguna.value
    if (!active) return
    const updated = { ...active, ...perubahan }
    if (shadowPengguna.value) {
      shadowPengguna.value = updated
    } else {
      pengguna.value = updated
    }
  }

  /** Hanya clear sesi aktif (shadow → clear shadow; normal → clear normal). */
  function bersihkanSesi() {
    if (shadowToken.value) {
      shadowToken.value = null
      shadowPengguna.value = null
    } else {
      token.value = null
      pengguna.value = null
    }
  }

  return {
    token: activeToken,
    pengguna: activePengguna,
    shadowToken,
    shadowPengguna,
    isShadow,
    sudahLogin,
    tipePengguna,
    peranAdmin,
    ruteHome,
    wajibBuatPassword,
    setSesi,
    setShadow,
    perbaruiPengguna,
    bersihkanSesi,
  }
})
