import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DashboardSuperAdminRingkasan } from '@/types/models'

export function getDashboardSuperAdmin() {
  return httpClient.get<ApiResponse<DashboardSuperAdminRingkasan>>('/admin/dashboard/super-admin')
}
