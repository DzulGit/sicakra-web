import { useQuery } from '@tanstack/vue-query'
import { getDashboardTeknisi } from '../api/dashboardTeknisi.api'

export function useDashboardTeknisi() {
  return useQuery({
    queryKey: ['dashboard', 'teknisi'],
    queryFn: () => getDashboardTeknisi().then((res) => res.data.data),
    refetchInterval: 60_000,
  })
}
