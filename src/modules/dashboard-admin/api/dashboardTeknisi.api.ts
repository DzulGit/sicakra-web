import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DashboardTeknisiRingkasan } from '@/types/models'

export function getDashboardTeknisi() {
  return httpClient.get<ApiResponse<DashboardTeknisiRingkasan>>('/admin/dashboard/teknisi')
}
