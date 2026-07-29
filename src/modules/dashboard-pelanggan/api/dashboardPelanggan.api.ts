import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DashboardRingkasan } from '@/types/models'

export function getDashboardRingkasan() {
  return httpClient.get<ApiResponse<DashboardRingkasan>>('/pelanggan/dashboard/ringkasan')
}
