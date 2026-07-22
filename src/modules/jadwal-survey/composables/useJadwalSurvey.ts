import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { getJadwalSurveyDetail, getJadwalSurveyList, isiHasilSurvey } from '../api/jadwalSurvey.api'
import type { HasilSurveyForm } from '@/schemas/jadwal-teknisi.schema'

/** List Jadwal Survey teknisi TIDAK punya filter dinamis (fixed scope di backend), cuma pagination. */
export function useJadwalSurveyList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    if (typeof route.query.page === 'string') p.page = route.query.page
    return p
  })

  return useQuery({
    queryKey: ['jadwal-survey', 'list', params],
    queryFn: () => getJadwalSurveyList(params.value).then((res) => res.data.data),
  })
}

export function useJadwalSurveyDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['jadwal-survey', 'detail', id],
    queryFn: () => getJadwalSurveyDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useIsiHasilSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: HasilSurveyForm }) =>
      isiHasilSurvey(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-survey'] })
      // Isi hasil survey bisa mengubah status permohonan terkait -> ikut invalidasi
      queryClient.invalidateQueries({ queryKey: ['permohonan-layanan'] })
    },
  })
}
