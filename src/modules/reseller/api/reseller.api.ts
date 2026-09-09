import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminLengkap, PaketInternet, Pelanggan, Tagihan } from '@/types/models'
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

export function getResellerPaketInternetList(id: number | string) {
  return httpClient.get<PaginatedResponse<PaketInternet>>(`${BASE}/${id}/paket`)
}

export function getResellerTagihanList(id: number | string) {
  return httpClient.get<PaginatedResponse<Tagihan>>(`${BASE}/${id}/tagihan`)
}

export function getResellerPelangganDetail(
  resellerId: number | string,
  pelangganId: number | string,
) {
  return httpClient.get<ApiResponse<Pelanggan>>(
    `${BASE}/${resellerId}/pelanggan/${pelangganId}`,
  )
}
