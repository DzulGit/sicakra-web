import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { getJadwalKerjaDetail, getJadwalKerjaList, isiHasilKerja } from '../api/jadwalKerja.api'
import type { HasilKerjaForm } from '@/schemas/jadwal-kerja.schema'

export function useJadwalKerjaList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    if (typeof route.query.page === 'string') p.page = route.query.page
    return p
  })

  return useQuery({
    queryKey: ['jadwal-kerja', 'list', params],
    queryFn: () => getJadwalKerjaList(params.value).then((res) => res.data.data),
  })
}

export function useJadwalKerjaDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['jadwal-kerja', 'detail', id],
    queryFn: () => getJadwalKerjaDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useIsiHasilKerja() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: HasilKerjaForm }) =>
      isiHasilKerja(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-kerja'] })
      // Isi hasil bisa trigger konversi jadi layanan aktif -> ikut invalidasi
      queryClient.invalidateQueries({ queryKey: ['permohonan-layanan'] })
      queryClient.invalidateQueries({ queryKey: ['layanan-internet'] })
    },
  })
}