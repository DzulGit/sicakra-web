import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  getResellerPaketInternetList,
  getResellerPaketInternetDetail,
  hapusResellerPaketInternet,
  simpanResellerPaketInternet,
  ubahResellerPaketInternet,
} from '../../api/reseller/resellerPaketInternet.api'
import type { SimpanPaketInternetForm, UbahPaketInternetForm } from '@/schemas/paket-internet.schema'

export function useResellerPaketInternetList() {
  return useQuery({
    queryKey: ['paket-internet', 'reseller', 'list'],
    queryFn: () => getResellerPaketInternetList().then((res) => res.data.data),
  })
}

export function useResellerPaketInternetDetail(id: MaybeRefOrGetter<number | string | undefined>) {
  return useQuery({
    queryKey: ['paket-internet', 'reseller', 'detail', id],
    enabled: () => !!toValue(id),
    queryFn: () => getResellerPaketInternetDetail(toValue(id)!).then((res) => res.data.data),
  })
}

function useInvalidasiResellerPaket() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['paket-internet', 'reseller'] })
}

export function useSimpanResellerPaketInternet() {
  const invalidasi = useInvalidasiResellerPaket()
  return useMutation({
    mutationFn: (payload: SimpanPaketInternetForm) => simpanResellerPaketInternet(payload),
    onSuccess: invalidasi,
  })
}

export function useUbahResellerPaketInternet() {
  const invalidasi = useInvalidasiResellerPaket()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UbahPaketInternetForm }) =>
      ubahResellerPaketInternet(id, payload),
    onSuccess: invalidasi,
  })
}

export function useHapusResellerPaketInternet() {
  const invalidasi = useInvalidasiResellerPaket()
  return useMutation({
    mutationFn: (id: number | string) => hapusResellerPaketInternet(id),
    onSuccess: invalidasi,
  })
}