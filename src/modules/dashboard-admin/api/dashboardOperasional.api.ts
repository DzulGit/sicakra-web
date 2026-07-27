import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DashboardOperasionalStats, DashboardStatusDist, DashboardTrendPoint, PermohonanLayanan } from '@/types/models'

export interface DashboardOperasionalRingkasan {
  stats: DashboardOperasionalStats
  tren_permohonan: DashboardTrendPoint[]
  distribusi_status: DashboardStatusDist[]
  permohonan_terbaru: PermohonanLayanan[]
}

export function getDashboardOperasional() {
  return httpClient.get<ApiResponse<DashboardOperasionalRingkasan>>('/admin/dashboard/operasional')
}
