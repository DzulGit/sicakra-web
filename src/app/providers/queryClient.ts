import { QueryClient } from '@tanstack/vue-query'

/**
 * QueryClient tunggal untuk seluruh aplikasi.
 * staleTime default sengaja pendek (30 detik) karena mayoritas data kita
 * (permohonan, jadwal, laporan) bersifat operasional & sering berubah status.
 * Modul dengan data yang jarang berubah (mis. katalog paket_internet) boleh
 * override staleTime lebih panjang di composable masing-masing.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
