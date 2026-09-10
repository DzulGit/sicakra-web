import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  buatResellerPermohonan,
  getResellerPermohonanLayananDetail,
  getResellerPermohonanLayananList,
  jadwalkanResellerKerja,
  verifikasiDanJadwalkanReseller,
  verifikasiResellerPermohonan,
} from '../api/resellerPermohonanLayanan.api'
import type {
  JadwalkanResellerForm,
  VerifikasiDanJadwalkanResellerForm,
  VerifikasiResellerForm,
} from '@/schemas/reseller-portal.schema'

function useFilterParams(forced?: Record<string, string>) {
  const route = useRoute()
  return computed(() => {
    const params: Record<string, string> = { ...forced }
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') params[key] = value
    }
    return params
  })
}

export function useResellerPermohonanLayananList(forcedParams?: Record<string, string>) {
  const params = useFilterParams(forcedParams)

  return useQuery({
    queryKey: ['reseller-portal', 'permohonan-layanan', 'list', params],
    queryFn: () => getResellerPermohonanLayananList(params.value).then((res) => res.data.data),
  })
}

export function useResellerPermohonanLayananDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['reseller-portal', 'permohonan-layanan', 'detail', toValue(id)],
    queryFn: () => getResellerPermohonanLayananDetail(toValue(id)).then((res) => res.data.data),
  })
}

function useInvalidasiPermohonan() {
  const queryClient = useQueryClient()
  return (id?: number | string) => {
    queryClient.invalidateQueries({ queryKey: ['reseller-portal', 'permohonan-layanan'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['reseller-portal', 'permohonan-layanan', 'detail', id] })
  }
}

export function useBuatResellerPermohonan() {
  const invalidate = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: buatResellerPermohonan,
    onSuccess: () => invalidate(),
  })
}

export function useVerifikasiResellerPermohonan() {
  const invalidate = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: VerifikasiResellerForm }) =>
      verifikasiResellerPermohonan(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  })
}

export function useVerifikasiDanJadwalkanReseller() {
  const invalidate = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: VerifikasiDanJadwalkanResellerForm }) =>
      verifikasiDanJadwalkanReseller(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  })
}

export function useJadwalkanResellerKerja() {
  const invalidate = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: JadwalkanResellerForm }) =>
      jadwalkanResellerKerja(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  })
}