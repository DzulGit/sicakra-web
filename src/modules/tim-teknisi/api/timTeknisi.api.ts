import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { TimTeknisi } from '@/types/models'
import type { SimpanTimTeknisiForm, UbahTimTeknisiForm } from '@/schemas/tim-teknisi.schema'

const BASE = '/admin/super-admin/tim-teknisi'

export function getTimTeknisiList() {
  return httpClient.get<PaginatedResponse<TimTeknisi>>(BASE)
}

export function getTimTeknisiDetail(id: number | string) {
  return httpClient.get<ApiResponse<TimTeknisi>>(`${BASE}/${id}`)
}

export function simpanTimTeknisi(payload: SimpanTimTeknisiForm) {
  return httpClient.post<ApiResponse<TimTeknisi>>(BASE, payload)
}

export function ubahTimTeknisi(id: number | string, payload: UbahTimTeknisiForm) {
  return httpClient.patch<ApiResponse<TimTeknisi>>(`${BASE}/${id}`, payload)
}

/** Dipakai dropdown Operasional saat Jadwalkan Kerja — hanya tim aktif. */
export function getTimTeknisiAktif() {
  return httpClient.get<ApiResponse<TimTeknisi[]>>('/admin/operasional/tim-teknisi')
}