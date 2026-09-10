import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  getResellerList,
  getResellerPelangganList,
  getResellerPelangganDetail,
  getResellerPaketInternetList,
  getResellerStatistikDetail,
  getResellerStatistikGlobal,
  getResellerTagihanList,
  simpanReseller,
} from '../api/reseller.api'
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

export function useResellerPaketInternetList(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller', 'paket', id],
    queryFn: () => getResellerPaketInternetList(toValue(id)).then((res) => res.data.data),
  })
}

export function useResellerTagihanList(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller', 'tagihan', id],
    queryFn: () => getResellerTagihanList(toValue(id)).then((res) => res.data.data),
  })
}

export function useResellerPelangganDetail(
  resellerId: MaybeRefOrGetter<number | string>,
  pelangganId: MaybeRefOrGetter<number | string>,
) {
  return useQuery({
    queryKey: ['reseller', 'pelanggan', 'detail', resellerId, pelangganId],
    queryFn: () =>
      getResellerPelangganDetail(
        toValue(resellerId),
        toValue(pelangganId),
      ).then((res) => res.data.data),
  })
}

export function useResellerStatistikGlobal() {
  return useQuery({
    queryKey: ['reseller', 'statistik'],
    queryFn: () => getResellerStatistikGlobal().then((res) => res.data.data),
  })
}

export function useResellerStatistikDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller', 'statistik', id],
    queryFn: () => getResellerStatistikDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useSimpanReseller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SimpanResellerForm) => simpanReseller(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller'] }),
  })
}
