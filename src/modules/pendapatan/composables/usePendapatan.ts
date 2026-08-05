import { useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { getPendapatan } from '../api/pendapatan.api'

export function usePendapatan() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    if (typeof route.query.tahun === 'string') p.tahun = route.query.tahun
    if (typeof route.query.bulan === 'string') p.bulan = route.query.bulan
    return p
  })
  return useQuery({
    queryKey: ['pendapatan', params],
    queryFn: () => getPendapatan(params.value).then((res) => res.data.data),
  })
}