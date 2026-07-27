import { useQuery } from '@tanstack/vue-query'
import { getDashboardKeuangan } from '../api/dashboardKeuangan.api'

export function useDashboardKeuangan() {
  return useQuery({
    queryKey: ['dashboard', 'keuangan'],
    queryFn: () => getDashboardKeuangan().then((res) => res.data.data),
    refetchInterval: 60_000,
  })
}
