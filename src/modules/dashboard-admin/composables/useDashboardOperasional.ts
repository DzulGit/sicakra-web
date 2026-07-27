import { useQuery } from '@tanstack/vue-query'
import { getDashboardOperasional } from '../api/dashboardOperasional.api'

export function useDashboardOperasional() {
  return useQuery({
    queryKey: ['dashboard', 'operasional'],
    queryFn: () => getDashboardOperasional().then((res) => res.data.data),
    refetchInterval: 60_000,
  })
}
