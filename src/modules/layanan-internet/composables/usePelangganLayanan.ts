import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { buatPermohonanLayanan, getLayananSayaDetail, getLayananSayaList } from '../api/pelangganLayanan.api'
import type { BuatPermohonanPelangganForm } from '@/schemas/pelanggan-permohonan.schema'

export function useLayananSayaList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    if (typeof route.query.page === 'string') p.page = route.query.page
    return p
  })
  return useQuery({
    queryKey: ['layanan-internet', 'saya', 'list', params],
    queryFn: () => getLayananSayaList(params.value).then((res) => res.data.data),
  })
}

export function useLayananSayaDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['layanan-internet', 'saya', 'detail', id],
    queryFn: () => getLayananSayaDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useBuatPermohonan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BuatPermohonanPelangganForm) =>
      buatPermohonanLayanan(payload as any).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['layanan-internet', 'saya'] })
    },
  })
}
