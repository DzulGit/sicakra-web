import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage, StorageSerializers } from '@vueuse/core'

/**
 * Tipe pengguna yang login — cermin 2 model backend (Admin vs Pelanggan).
 * Guard 'sanctum' di backend bersifat polymorphic, jadi kita HARUS simpan
 * tipe ini sendiri di sisi frontend untuk tahu rute mana yang boleh diakses.
 */
export type TipePengguna = 'admin' | 'pelanggan'

export type PeranAdmin = 'super_admin' | 'operasional' | 'teknisi' | 'keuangan'

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
 */
export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | null>('sicakra_token', null)
  const pengguna = useLocalStorage<SesiPengguna | null>('sicakra_pengguna', null, {
    serializer: StorageSerializers.object
  })

  const sudahLogin = computed(() => !!token.value && !!pengguna.value)
  const tipePengguna = computed<TipePengguna | null>(
  () => pengguna.value?.tipe ?? ((pengguna.value as { tipe_pengguna?: TipePengguna } | null)?.tipe_pengguna ?? null),
)
  const peranAdmin = computed<PeranAdmin | null>(() => pengguna.value?.peran ?? null)

  // Halaman "home" setelah login — dipakai auto-redirect dari halaman login
  // dan navigasi default. Cermin rute default per peran di LoginAdminPage.
  const rutePerPeran: Record<string, string> = {
    super_admin: '/admin/super-admin/admin',
    operasional: '/admin/operasional/overview',
    teknisi: '/admin/teknisi/overview',
    keuangan: '/admin/keuangan/overview',
  }
  const ruteHome = computed(() => {
    if (tipePengguna.value === 'pelanggan') return '/pelanggan/dashboard'
    return rutePerPeran[pengguna.value?.peran ?? ''] ?? '/admin/masuk'
  })
  const wajibBuatPassword = computed(
    () => pengguna.value?.tipe === 'pelanggan' && pengguna.value.password_sudah_dibuat === false,
  )

  function setSesi(tokenBaru: string, penggunaBaru: SesiPengguna) {
    token.value = tokenBaru
    pengguna.value = penggunaBaru
  }

  function perbaruiPengguna(perubahan: Partial<SesiPengguna>) {
    if (!pengguna.value) return
    pengguna.value = { ...pengguna.value, ...perubahan }
  }

  function bersihkanSesi() {
    token.value = null
    pengguna.value = null
  }

  return {
    token,
    pengguna,
    sudahLogin,
    tipePengguna,
    peranAdmin,
    ruteHome,
    wajibBuatPassword,
    setSesi,
    perbaruiPengguna,
    bersihkanSesi,
  }
})
