import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getLaporanKendalaDetail,
  getLaporanKendalaList,
  terimaLaporan,
  teruskanKeTeknisi,
  tutupLaporan,
} from '../api/operasionalLaporanKendala.api'
import type { TeruskanKeTeknisiForm } from '@/schemas/laporan-kendala.schema'

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

export function useTerimaLaporan() {
  const invalidasi = useInvalidasiLaporan()
  return useMutation({
    mutationFn: (id: number | string) => terimaLaporan(id),
    onSuccess: (_, id) => invalidasi(id),
  })
}

export function useTeruskanKeTeknisi() {
  const invalidasi = useInvalidasiLaporan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: TeruskanKeTeknisiForm }) =>
      teruskanKeTeknisi(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}

export function useTutupLaporan() {
  const invalidasi = useInvalidasiLaporan()
  return useMutation({
    mutationFn: (id: number | string) => tutupLaporan(id),
    onSuccess: (_, id) => invalidasi(id),
  })
}
