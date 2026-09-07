import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { getResellerList, getResellerPelangganList, simpanReseller } from '../api/reseller.api'
import type { SimpanResellerForm } from '@/schemas/reseller.schema'

export function useResellerList() {
  return useQuery({
    queryKey: ['reseller', 'list'],
    queryFn: () => getResellerList().then((res) => res.data.data),
  })
}

export function useResellerPelangganList(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller', 'pelanggan', id],
    queryFn: () => getResellerPelangganList(toValue(id)).then((res) => res.data.data),
  })
}

export function useSimpanReseller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SimpanResellerForm) => simpanReseller(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller'] }),
  })
}