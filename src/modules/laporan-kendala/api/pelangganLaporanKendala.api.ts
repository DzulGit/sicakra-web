import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LaporanKendala } from '@/types/models'
import type { BuatLaporanForm } from '@/schemas/laporan-kendala.schema'

const BASE = '/pelanggan/laporan-kendala'

export function getLaporanKendalaSayaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LaporanKendala>>(BASE, { params })
}

export function getLaporanKendalaSayaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LaporanKendala>>(`${BASE}/${id}`)
}

export function buatLaporanKendala(payload: BuatLaporanForm) {
  return httpClient.post<ApiResponse<LaporanKendala>>(BASE, payload)
}
