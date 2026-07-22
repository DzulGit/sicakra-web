import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  getTimTeknisiAktif,
  getTimTeknisiDetail,
  getTimTeknisiList,
  simpanTimTeknisi,
  ubahTimTeknisi,
} from '../api/timTeknisi.api'
import type { SimpanTimTeknisiForm, UbahTimTeknisiForm } from '@/schemas/tim-teknisi.schema'

export function useTimTeknisiList() {
  return useQuery({
    queryKey: ['tim-teknisi', 'list'],
    queryFn: () => getTimTeknisiList().then((res) => res.data.data),
  })
}

export function useTimTeknisiDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['tim-teknisi', 'detail', id],
    queryFn: () => getTimTeknisiDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useTimTeknisiAktif() {
  return useQuery({
    queryKey: ['tim-teknisi', 'aktif'],
    queryFn: () => getTimTeknisiAktif().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

function useInvalidasiTimTeknisi() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['tim-teknisi'] })
}

export function useSimpanTimTeknisi() {
  const invalidasi = useInvalidasiTimTeknisi()
  return useMutation({
    mutationFn: (payload: SimpanTimTeknisiForm) => simpanTimTeknisi(payload),
    onSuccess: invalidasi,
  })
}

export function useUbahTimTeknisi() {
  const invalidasi = useInvalidasiTimTeknisi()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UbahTimTeknisiForm }) =>
      ubahTimTeknisi(id, payload),
    onSuccess: invalidasi,
  })
}