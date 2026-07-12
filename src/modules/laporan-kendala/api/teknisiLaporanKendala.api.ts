import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LaporanKendala } from '@/types/models'
import type { SelesaikanLaporanForm } from '@/schemas/laporan-kendala.schema'

const BASE = '/admin/teknisi/laporan-kendala'

export function getLaporanKendalaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LaporanKendala>>(BASE, { params })
}

export function getLaporanKendalaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LaporanKendala>>(`${BASE}/${id}`)
}

export function selesaikanLaporan(id: number | string, payload: SelesaikanLaporanForm) {
  return httpClient.patch<ApiResponse<LaporanKendala>>(`${BASE}/${id}/selesaikan`, payload)
}
