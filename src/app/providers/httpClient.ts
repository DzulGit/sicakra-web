import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/app/router'
import { toast } from 'vue-sonner'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Instance Axios tunggal untuk seluruh aplikasi. JANGAN buat instance axios
 * baru di modul lain — semua request lewat sini supaya interceptor
 * (auth token, error handling) konsisten di mana-mana.
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

// Auto-attach Bearer token dari Pinia auth store ke tiap request.
httpClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

/**
 * Penanganan error terpusat — lihat docs/frontend/integrasi/error-handling.md.
 * 401 -> sesi habis/token invalid, paksa logout + redirect ke login sesuai tipe pengguna.
 * 403 -> aksi ditolak backend (bukan masalah sesi), tampilkan toast, JANGAN logout.
 * 422 -> validasi gagal, dibiarkan lolos ke pemanggil (form yang menangani field error).
 * 500/network -> toast generik.
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const authStore = useAuthStore()
    const status = error.response?.status

    if (status === 401) {
      const tipeSebelumnya = authStore.tipePengguna
      authStore.bersihkanSesi()
      toast.error('Sesi berakhir, silakan login kembali.')
      router.push(tipeSebelumnya === 'pelanggan' ? '/pelanggan/masuk' : '/admin/masuk')
    } else if (status === 403) {
      toast.error(error.response?.data?.message ?? 'Anda tidak memiliki izin untuk aksi ini.')
    } else if (status && status >= 500) {
      toast.error('Terjadi kesalahan pada server. Coba lagi beberapa saat.')
    } else if (!error.response) {
      toast.error('Tidak bisa terhubung ke server. Periksa koneksi internet kamu.')
    }

    return Promise.reject(error)
  },
)
