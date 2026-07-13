import { useMutation } from '@tanstack/vue-query'
import { loginAdmin, logoutAdmin } from '../api/adminAuth.api'

/**
 * Composable HANYA membungkus mutationFn — logic sukses/gagal (update store,
 * navigasi, toast) sengaja ditaruh di halaman pemanggil (Page.vue), bukan
 * di sini, karena tiap pemanggil butuh akses router/store yang beda konteks.
 * Lihat forms-validation.md untuk pola lengkapnya.
 */
export function useLoginAdmin() {
  return useMutation({ mutationFn: loginAdmin })
}

export function useLogoutAdmin() {
  return useMutation({ mutationFn: logoutAdmin })
}
