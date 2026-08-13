import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getLaporanKendalaDetail,
  getLaporanKendalaList,
  tutupLaporan,
  tindakLanjutLaporan,  
} from '../api/operasionalLaporanKendala.api'
import type { TindakLanjutLaporanForm } from '@/schemas/laporan-kendala.schema'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Toast } from '@capacitor/toast'

const router = useRouter()
let konfirmasiKeluar = false

onMounted(() => {
  if (Capacitor.isNativePlatform()) {
    CapacitorApp.addListener('backButton', async () => {
      const path = router.currentRoute.value.path
      const rootPaths = ['/pelanggan/dashboard', '/pelanggan/masuk']

      if (rootPaths.includes(path)) {
        if (konfirmasiKeluar) {
          CapacitorApp.exitApp() // Keluar aplikasi, bukan logout
        } else {
          konfirmasiKeluar = true
          await Toast.show({ text: 'Tekan kembali sekali lagi untuk keluar' })
          
          // Reset status setelah 2 detik
          setTimeout(() => {
            konfirmasiKeluar = false
          }, 2000)
        }
      } else {
        router.back()
      }
    })
  }
})

function useFilterParams() {
  const route = useRoute()
  return computed(() => {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') params[key] = value
    }
    return params
  })
}

export function useLaporanKendalaList() {
  const params = useFilterParams()
  return useQuery({
    queryKey: ['laporan-kendala', 'operasional', 'list', params],
    queryFn: () => getLaporanKendalaList(params.value).then((res) => res.data.data),
  })
}

export function useLaporanKendalaDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['laporan-kendala', 'operasional', 'detail', id],
    queryFn: () => getLaporanKendalaDetail(toValue(id)).then((res) => res.data.data),
  })
}

function useInvalidasiLaporan() {
  const queryClient = useQueryClient()
  return (id: number | string) => {
    queryClient.invalidateQueries({ queryKey: ['laporan-kendala', 'operasional', 'list'] })
    queryClient.invalidateQueries({ queryKey: ['laporan-kendala', 'operasional', 'detail', id] })
  }
}

export function useTutupLaporan() {
  const invalidasi = useInvalidasiLaporan()
  return useMutation({
    mutationFn: (id: number | string) => tutupLaporan(id),
    onSuccess: (_, id) => invalidasi(id),
  })
}

export function useTindakLanjutLaporan() {
  const invalidasi = useInvalidasiLaporan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: TindakLanjutLaporanForm }) =>
      tindakLanjutLaporan(id, payload), 
    onSuccess: (_, { id }) => invalidasi(id),
  })
}