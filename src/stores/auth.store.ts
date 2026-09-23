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

export interface AdminPembuka {
  id: number
  nama_lengkap: string
}

/**
 * Pinia store — HANYA client/UI state (sesi auth).
 * Data dari API (permohonan, tagihan, dst) TIDAK pernah masuk ke sini —
 * itu semua tanggung jawab TanStack Query. Lihat docs/frontend/arsitektur/data-fetching.md.
 *
 * Shadow session (login as) menggunakan sessionStorage supaya tab baru
 * punya sesi sendiri tanpa menimpa sesi admin di tab asal (localStorage).
 *
 * Catatan keamanan: begitu tab masuk mode shadow (shadowMode = true), tab itu
 * TIDAK boleh jatuh kembali ke token admin di localStorage meskipun token
 * shadow habis/401 — sesi shadow harus dianggap berakhir, bukan "kembali
 * login sebagai admin".
 */
export const useAuthStore = defineStore('auth', () => {
  // Sesi normal — persist di localStorage (shared lintas tab).
  const token = useLocalStorage<string | null>('sicakra_token', null)
  const pengguna = useLocalStorage<SesiPengguna | null>('sicakra_pengguna', null, {
    serializer: StorageSerializers.object
  })

  // Sesi shadow — persist di sessionStorage (per-tab, tidak sync antar tab).
  const shadowMode = useSessionStorage('sicakra_shadow_mode', false)
  const shadowToken = useSessionStorage<string | null>('sicakra_shadow_token', null)
  const shadowPengguna = useSessionStorage<SesiPengguna | null>('sicakra_shadow_pengguna', null, {
    serializer: StorageSerializers.object
  })
  const shadowAdmin = useSessionStorage<AdminPembuka | null>('sicakra_shadow_admin', null, {
    serializer: StorageSerializers.object
  })

  // --- Computed aktif: mode shadow mengunci tab ke sesi shadow saja ---

  const isShadow = computed(() => shadowMode.value && !!shadowToken.value && !!shadowAdmin.value)

  const sudahLogin = computed(() => {
    if (shadowMode.value) {
      return !!shadowToken.value && !!shadowPengguna.value
    }
    return !!(token.value && pengguna.value)
  })

  const activePengguna = computed(() =>
    shadowMode.value ? shadowPengguna.value : pengguna.value,
  )

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

  const activeToken = computed(() =>
    shadowMode.value ? shadowToken.value : token.value,
  )

  // --- Mutasi ---

  function setSesi(tokenBaru: string, penggunaBaru: SesiPengguna) {
    if (shadowMode.value) {
      shadowToken.value = tokenBaru
      shadowPengguna.value = penggunaBaru
    } else {
      shadowMode.value = false
      shadowToken.value = null
      shadowPengguna.value = null
      shadowAdmin.value = null
      token.value = tokenBaru
      pengguna.value = penggunaBaru
    }
  }

  /**
   * Inisialisasi sesi shadow setelah kode ditukar (dipanggil oleh router guard).
   * Mengunci tab ke mode shadow — tidak kembali ke sesi admin saat token habis.
   */
  function setShadow(tokenBaru: string, penggunaBaru: SesiPengguna, adminBaru: AdminPembuka) {
    shadowMode.value = true
    shadowToken.value = tokenBaru
    shadowPengguna.value = penggunaBaru
    shadowAdmin.value = adminBaru
  }

  function perbaruiPengguna(perubahan: Partial<SesiPengguna>) {
    const active = activePengguna.value
    if (!active) return
    const updated = { ...active, ...perubahan }
    if (shadowMode.value) {
      shadowPengguna.value = updated
    } else {
      pengguna.value = updated
    }
  }

  /** Akhiri sesi shadow di tab ini — tab tidak boleh jatuh ke sesi admin. */
  function akhiriShadow() {
    shadowToken.value = null
    shadowPengguna.value = null
    shadowAdmin.value = null
  }

  /**
   * Logout / sesi habis.
   * - Mode shadow: token shadow dibuang tapi mode tetap ON, jadi tab ini tidak
   *   pernah jatuh kembali ke token admin di localStorage (shared lintas tab).
   *   Tab tetap berujung ke login reseller, bukan login admin.
   * - Normal: bersihkan sesi normal.
   */
  function bersihkanSesi() {
    if (shadowMode.value) {
      akhiriShadow()
    } else {
      token.value = null
      pengguna.value = null
    }
  }

  /**
   * Kunci tab agar SELALU terisolasi ke portal reseller, tanpa menyentuh
   * sesi admin di localStorage. Dipakai saat kode shadow gagal ditukar:
   * tab baru itu jangan ikut menghapus/ memakai token admin tab asal.
   */
  function kunciKeModeReseller() {
    shadowMode.value = true
    akhiriShadow()
  }

  return {
    token: activeToken,
    pengguna: activePengguna,
    shadowToken,
    shadowPengguna,
    shadowAdmin,
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
    kunciKeModeReseller,
  }
})