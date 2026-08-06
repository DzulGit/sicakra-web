import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  aturSiklusLayanan,
  aturTanggalTagihan,
  bulkAturTanggalTagihan,
  getPelangganDetail,
  getPelangganList,
} from '../api/pelanggan.api'

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

export function usePelangganList() {
  const params = useFilterParams()

  return useQuery({
    queryKey: ['pelanggan', 'list', params],
    queryFn: () => getPelangganList(params.value).then((res) => res.data.data),
  })
}

export function usePelangganDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['pelanggan', 'detail', id],
    queryFn: () => getPelangganDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useAturTanggalTagihan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tanggalTagihan }: { id: number | string; tanggalTagihan: number }) =>
      aturTanggalTagihan(id, tanggalTagihan).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'list'] })
    },
  })
}

export function useBulkAturTanggalTagihan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tanggalTagihan, pelangganIds }: { tanggalTagihan: number; pelangganIds?: number[] }) =>
      bulkAturTanggalTagihan(tanggalTagihan, pelangganIds).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'list'] })
    },
  })
}

export function useAturSiklusLayanan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      bebasTagihanBulan,
      tanggalMulaiPenagihan,
    }: {
      id: number | string
      bebasTagihanBulan?: number
      tanggalMulaiPenagihan?: string
    }) =>
      aturSiklusLayanan(id, {
        bebas_tagihan_bulan: bebasTagihanBulan,
        tanggal_mulai_penagihan: tanggalMulaiPenagihan,
      }).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail'] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'list'] })
    },
  })
}
