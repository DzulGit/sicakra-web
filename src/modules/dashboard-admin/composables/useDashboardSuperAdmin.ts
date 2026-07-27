import { useQuery } from '@tanstack/vue-query'
import { getDashboardSuperAdmin } from '../api/dashboardSuperAdmin.api'

export function useDashboardSuperAdmin() {
  return useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: () => getDashboardSuperAdmin().then((res) => res.data.data),
    refetchInterval: 60_000,
  })
}
