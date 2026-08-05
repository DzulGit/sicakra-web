import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { PendapatanRingkasan } from '@/types/models'

export function getPendapatan(params: Record<string, string>) {
  return httpClient.get<ApiResponse<PendapatanRingkasan>>('/admin/keuangan/pendapatan', { params })
}

export function getLaporanPendapatanPdf(params: Record<string, string>) {
  return httpClient.get<Blob>('/admin/keuangan/pendapatan/report', { params, responseType: 'blob' })
}

export function getLaporanPendapatanExcel(params: Record<string, string>) {
  return httpClient.get<Blob>('/admin/keuangan/pendapatan/report/excel', { params, responseType: 'blob' })
}