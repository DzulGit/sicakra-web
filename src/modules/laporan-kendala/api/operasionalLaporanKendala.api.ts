import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LaporanKendala } from '@/types/models'
import type { TeruskanKeTeknisiForm } from '@/schemas/laporan-kendala.schema'

const BASE = '/admin/operasional/laporan-kendala'

export function getLaporanKendalaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LaporanKendala>>(BASE, { params })
}

export function getLaporanKendalaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LaporanKendala>>(`${BASE}/${id}`)
}

export function terimaLaporan(id: number | string) {
  return httpClient.patch<ApiResponse<LaporanKendala>>(`${BASE}/${id}/terima`)
}

export function teruskanKeTeknisi(id: number | string, payload: TeruskanKeTeknisiForm) {
  return httpClient.patch<ApiResponse<LaporanKendala>>(`${BASE}/${id}/teruskan-ke-teknisi`, payload)
}

export function tutupLaporan(id: number | string) {
  return httpClient.patch<ApiResponse<LaporanKendala>>(`${BASE}/${id}/tutup`)
}
