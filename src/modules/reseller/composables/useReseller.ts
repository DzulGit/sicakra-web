import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getResellerList,
  getResellerPelangganList,
  getResellerPelangganDetail,
  getResellerPaketInternetList,
  getResellerStatistikDetail,
  getResellerStatistikGlobal,
  getResellerTagihanList,
  getResellerTransaksiList,
  simpanReseller,
  setujuiEmailReseller,
  tolakEmailReseller,
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

/**
 * Daftar seluruh transaksi reseller. Filter (reseller, bulan, tahun) dibaca
 * dari query-string supaya sinkron dengan FilterBar + Pagination.
 */
export function useResellerTransaksiList() {
  const route = useRoute()

  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      // 'semua' = opsi "Semua …" di FilterBar, bukan filter — jangan dikirim.
      if (typeof value === 'string' && value !== 'semua') p[key] = value
    }
    return p
  })

  return useQuery({
    queryKey: ['reseller', 'transaksi', params],
    queryFn: () => getResellerTransaksiList(params.value).then((res) => res.data.data),
  })
}

export function useSimpanReseller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SimpanResellerForm) => simpanReseller(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller'] }),
  })
}

export function useSetujuiEmailReseller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => setujuiEmailReseller(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller'] }),
  })
}

export function useTolakEmailReseller() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => tolakEmailReseller(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller'] }),
  })
}
