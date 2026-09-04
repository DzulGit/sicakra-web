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

export interface DaerahItem {
  provinsi: string
  kota: string
}

function serializeParams(params: PendapatanFilterParams): string {
  const sp = new URLSearchParams()
  if (params.tahun) sp.append('tahun', params.tahun)
  params.bulan?.forEach((b) => sp.append('bulan[]', String(b)))
  params.pelanggan_ids?.forEach((id) => sp.append('pelanggan_ids[]', String(id)))
  return sp.toString()
}

export function getPendapatan(params: PendapatanFilterParams) {
  return httpClient.get<ApiResponse<PendapatanRingkasan>>('/admin/keuangan/pendapatan', {
    params: serializeParams(params),
  })
}

export function getPelangganList() {
  return httpClient.get<ApiResponse<PelangganList[]>>('/admin/keuangan/pendapatan/pelanggan-list')
}

export function getDaerahList() {
  return httpClient.get<ApiResponse<DaerahItem[]>>('/admin/keuangan/pendapatan/daerah')
}

export function getLaporanPendapatanPdf(params: PendapatanFilterParams) {
  return httpClient.post<Blob>('/admin/keuangan/pendapatan/report', params, {
    responseType: 'blob',
  })
}

export function getLaporanPendapatanExcel(params: PendapatanFilterParams) {
  return httpClient.post<Blob>('/admin/keuangan/pendapatan/report/excel', params, {
    responseType: 'blob',
  })
}
