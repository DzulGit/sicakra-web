import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DashboardKeuanganRingkasan } from '@/types/models'

export function getDashboardKeuangan() {
  return httpClient.get<ApiResponse<DashboardKeuanganRingkasan>>('/admin/keuangan/dashboard')
}
