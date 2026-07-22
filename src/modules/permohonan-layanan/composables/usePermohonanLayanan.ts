import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getDaftarTeknisi,
  getPermohonanLayananDetail,
  getPermohonanLayananList,
  jadwalkanKerja,
  verifikasiPermohonan,
} from '../api/permohonanLayanan.api'
import type { JadwalkanKerjaForm, VerifikasiPermohonanForm } from '@/schemas/permohonan-layanan.schema'

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

export function usePermohonanLayananList() {
  const params = useFilterParams()

  return useQuery({
    queryKey: ['permohonan-layanan', 'list', params],
    queryFn: () => getPermohonanLayananList(params.value).then((res) => res.data.data),
  })
}

export function usePermohonanLayananDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['permohonan-layanan', 'detail', id],
    queryFn: () => getPermohonanLayananDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useDaftarTeknisi() {
  return useQuery({
    queryKey: ['teknisi', 'daftar'],
    queryFn: () => getDaftarTeknisi().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

function useInvalidasiPermohonan() {
  const queryClient = useQueryClient()
  return (id: number | string) => {
    queryClient.invalidateQueries({ queryKey: ['permohonan-layanan', 'list'] })
    queryClient.invalidateQueries({ queryKey: ['permohonan-layanan', 'detail', id] })
  }
}

export function useVerifikasiPermohonan() {
  const invalidasi = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: VerifikasiPermohonanForm }) =>
      verifikasiPermohonan(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}

export function useJadwalkanKerja() {
  const invalidasi = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: JadwalkanKerjaForm }) =>
      jadwalkanKerja(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}