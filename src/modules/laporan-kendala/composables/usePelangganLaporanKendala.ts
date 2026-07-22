import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  buatLaporanKendala,
  getLaporanKendalaSayaDetail,
  getLaporanKendalaSayaList,
} from '../api/pelangganLaporanKendala.api'
import type { BuatLaporanForm } from '@/schemas/laporan-kendala.schema'

export function useLaporanKendalaSayaList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') p[key] = value
    }
    return p
  })
  return useQuery({
    queryKey: ['laporan-kendala', 'saya', 'list', params],
    queryFn: () => getLaporanKendalaSayaList(params.value).then((res) => res.data.data),
  })
}

export function useLaporanKendalaSayaDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['laporan-kendala', 'saya', 'detail', id],
    queryFn: () => getLaporanKendalaSayaDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useBuatLaporanKendala() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BuatLaporanForm) => buatLaporanKendala(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kendala', 'saya'] })
    },
  })
}
