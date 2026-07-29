import { useQuery } from '@tanstack/vue-query'
import { getDashboardRingkasan } from '../api/dashboardPelanggan.api'

export function useDashboardRingkasan() {
  return useQuery({
    queryKey: ['dashboard-pelanggan', 'ringkasan'],
    queryFn: () => getDashboardRingkasan().then((res) => res.data.data),
  })
}
