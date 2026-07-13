import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getJadwalPemasanganDetail,
  getJadwalPemasanganList,
  isiHasilPemasangan,
} from '../api/jadwalPemasangan.api'
import type { HasilPemasanganForm } from '@/schemas/jadwal-teknisi.schema'

export function useJadwalPemasanganList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    if (typeof route.query.page === 'string') p.page = route.query.page
    return p
  })

  return useQuery({
    queryKey: ['jadwal-pemasangan', 'list', params],
    queryFn: () => getJadwalPemasanganList(params.value).then((res) => res.data.data),
  })
}

export function useJadwalPemasanganDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['jadwal-pemasangan', 'detail', id],
    queryFn: () => getJadwalPemasanganDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useIsiHasilPemasangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: HasilPemasanganForm }) =>
      isiHasilPemasangan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-pemasangan'] })
      // Kalau hasil = selesai, ini trigger KonversiPermohonanService di backend ->
      // permohonan_layanan DAN layanan_internet ikut berubah, invalidasi keduanya.
      queryClient.invalidateQueries({ queryKey: ['permohonan-layanan'] })
      queryClient.invalidateQueries({ queryKey: ['layanan-internet'] })
    },
  })
}
