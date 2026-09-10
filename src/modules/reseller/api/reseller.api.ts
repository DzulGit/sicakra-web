import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type {
  AdminLengkap,
  PaketInternet,
  Pelanggan,
  ResellerStatistikDetail,
  ResellerStatistikGlobal,
  Tagihan,
} from '@/types/models'
import type { SimpanResellerForm } from '@/schemas/reseller.schema'

const BASE = '/admin/operasional/reseller'

export interface LaporanResellerParams {
  reseller_id?: number | null
  tahun: number
  bulan?: number | null
}

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

export function getResellerStatistikGlobal() {
  return httpClient.get<ApiResponse<ResellerStatistikGlobal>>(`${BASE}/statistik`)
}

export function getResellerStatistikDetail(id: number | string) {
  return httpClient.get<ApiResponse<ResellerStatistikDetail>>(`${BASE}/${id}/statistik`)
}

export function getLaporanResellerPdf(params: LaporanResellerParams) {
  return httpClient.post<Blob>(`${BASE}/laporan`, params, { responseType: 'blob' })
}

export function getLaporanResellerExcel(params: LaporanResellerParams) {
  return httpClient.post<Blob>(`${BASE}/laporan/excel`, params, { responseType: 'blob' })
}

export function setujuiEmailReseller(id: number | string) {
  return httpClient.patch<ApiResponse<AdminLengkap>>(`${BASE}/${id}/setujui-email`)
}

export function tolakEmailReseller(id: number | string) {
  return httpClient.patch<ApiResponse<AdminLengkap>>(`${BASE}/${id}/tolak-email`)
}
