import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getLaporanKendalaDetail,
  getLaporanKendalaList,
  selesaikanLaporan,
} from '../api/teknisiLaporanKendala.api'
import type { SelesaikanLaporanForm } from '@/schemas/laporan-kendala.schema'

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

export function useLaporanKendalaListTeknisi() {
  const params = useFilterParams()
  return useQuery({
    queryKey: ['laporan-kendala', 'teknisi', 'list', params],
    queryFn: () => getLaporanKendalaList(params.value).then((res) => res.data.data),
  })
}

export function useLaporanKendalaDetailTeknisi(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['laporan-kendala', 'teknisi', 'detail', id],
    queryFn: () => getLaporanKendalaDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useSelesaikanLaporan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: SelesaikanLaporanForm }) =>
      selesaikanLaporan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kendala', 'teknisi'] })
    },
  })
}
