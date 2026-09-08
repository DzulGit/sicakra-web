import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  daftarkanPelanggan,
  getResellerDashboard,
  getResellerPelangganDetail,
  getResellerPelangganList,
  loginReseller,
  logoutReseller,
} from '../api/resellerPortal.api'
import type { DaftarkanPelangganForm } from '@/schemas/reseller-portal.schema'

export function useLoginReseller() {
  return useMutation({ mutationFn: loginReseller })
}

export function useLogoutReseller() {
  return useMutation({ mutationFn: logoutReseller })
}

export function useResellerDashboard() {
  return useQuery({
    queryKey: ['reseller-portal', 'dashboard'],
    queryFn: () => getResellerDashboard().then((res) => res.data.data),
  })
}

export function useResellerPelangganList() {
  return useQuery({
    queryKey: ['reseller-portal', 'pelanggan'],
    queryFn: () => getResellerPelangganList().then((res) => res.data.data),
  })
}

export function useResellerPelangganDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller-portal', 'pelanggan', toValue(id)],
    queryFn: () => getResellerPelangganDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useDaftarkanPelanggan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ form, fotoKtp, fotoSelfie }: { form: DaftarkanPelangganForm; fotoKtp?: File | null; fotoSelfie?: File | null }) =>
      daftarkanPelanggan(form, fotoKtp, fotoSelfie),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reseller-portal'] }),
  })
}