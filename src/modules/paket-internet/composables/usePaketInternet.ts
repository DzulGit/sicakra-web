import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  getAdminPaketInternetList,
  getPaketInternetDetail,
  getPaketInternetList,
  hapusPaketInternet,
  simpanPaketInternet,
  ubahPaketInternet,
} from '../api/paketInternet.api'
import type { SimpanPaketInternetForm, UbahPaketInternetForm } from '@/schemas/paket-internet.schema'

export function usePaketInternetList() {
  return useQuery({
    queryKey: ['paket-internet', 'publik', 'list'],
    queryFn: () => getPaketInternetList().then((res) => res.data.data),
    staleTime: 10 * 60 * 1000,
  })
}

export function useAdminPaketInternetList() {
  return useQuery({
    queryKey: ['paket-internet', 'admin', 'list'],
    queryFn: () => getAdminPaketInternetList().then((res) => res.data.data),
  })
}

export function useAdminPaketInternetDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['paket-internet', 'admin', 'detail', id],
    queryFn: () => getPaketInternetDetail(toValue(id)).then((res) => res.data.data),
  })
}

function useInvalidasiPaket() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['paket-internet'] })
}

export function useSimpanPaketInternet() {
  const invalidasi = useInvalidasiPaket()
  return useMutation({
    mutationFn: (payload: SimpanPaketInternetForm) => simpanPaketInternet(payload),
    onSuccess: invalidasi,
  })
}

export function useUbahPaketInternet() {
  const invalidasi = useInvalidasiPaket()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UbahPaketInternetForm }) =>
      ubahPaketInternet(id, payload),
    onSuccess: invalidasi,
  })
}

export function useHapusPaketInternet() {
  const invalidasi = useInvalidasiPaket()
  return useMutation({
    mutationFn: (id: number | string) => hapusPaketInternet(id),
    onSuccess: invalidasi,
  })
}
