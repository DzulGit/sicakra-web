import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminLengkap, Pelanggan } from '@/types/models'
import type { SimpanResellerForm } from '@/schemas/reseller.schema'

const BASE = '/admin/operasional/reseller'

export function getResellerList() {
  return httpClient.get<PaginatedResponse<AdminLengkap>>(BASE)
}

export function simpanReseller(payload: SimpanResellerForm) {
  return httpClient.post<ApiResponse<AdminLengkap>>(BASE, payload)
}

export function getResellerPelangganList(id: number | string) {
  return httpClient.get<PaginatedResponse<Pelanggan>>(`${BASE}/${id}/pelanggan`)
}