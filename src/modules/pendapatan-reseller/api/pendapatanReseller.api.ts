import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { PendapatanRingkasan } from '@/types/models'

export interface PendapatanFilterParams {
  tahun?: string
  bulan?: number[]
  pelanggan_ids?: number[]
}

export interface PelangganList {
  id: number
  nama_lengkap: string
  nomor_pelanggan: string
  provinsi?: string
  kota?: string
}

function serializeParams(params: PendapatanFilterParams): string {
  const sp = new URLSearchParams()
  if (params.tahun) sp.append('tahun', params.tahun)
  params.bulan?.forEach((b) => sp.append('bulan[]', String(b)))
  params.pelanggan_ids?.forEach((id) => sp.append('pelanggan_ids[]', String(id)))
  return sp.toString()
}

export function getPendapatanReseller(params: PendapatanFilterParams) {
  return httpClient.get<ApiResponse<PendapatanRingkasan>>('/reseller/pendapatan', {
    params: serializeParams(params),
  })
}

export function getPelangganResellerList() {
  return httpClient.get<ApiResponse<PelangganList[]>>('/reseller/pendapatan/pelanggan-list')
}

export function getLaporanPendapatanResellerPdf(params: PendapatanFilterParams) {
  return httpClient.post<Blob>('/reseller/pendapatan/report', params, {
    responseType: 'blob',
  })
}

export function getLaporanPendapatanResellerExcel(params: PendapatanFilterParams) {
  return httpClient.post<Blob>('/reseller/pendapatan/report/excel', params, {
    responseType: 'blob',
  })
}