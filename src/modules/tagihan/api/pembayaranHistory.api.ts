import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { PembayaranAdmin, SaldoKreditInfo } from '@/types/models'

/**
 * Api riwayat pembayaran lintas scope. `base` menentukan portal:
 * admin keuangan = '/admin/keuangan', portal reseller = '/reseller'.
 * Kontrak backend identik (PembayaranController + ResellerPembayaranController).
 */
export function buatPembayaranHistoryApi(base: string) {
  return {
    list(params: Record<string, string>) {
      return httpClient.get<PaginatedResponse<PembayaranAdmin>>(`${base}/pembayaran`, { params })
    },
    detail(id: number | string) {
      return httpClient.get<ApiResponse<PembayaranAdmin>>(`${base}/pembayaran/${id}`)
    },
    saldoKredit(pelangganId: number | string) {
      return httpClient.get<ApiResponse<SaldoKreditInfo>>(`${base}/saldo-kredit/${pelangganId}`)
    },
    exportExcel(params: Record<string, string>) {
      return httpClient.get<Blob>(`${base}/pembayaran/export/excel`, { params, responseType: 'blob' })
    },
    exportPdf(params: Record<string, string>) {
      return httpClient.get<Blob>(`${base}/pembayaran/export/pdf`, { params, responseType: 'blob' })
    },
  }
}

export const pembayaranAdminApi = buatPembayaranHistoryApi('/admin/keuangan')
export const pembayaranResellerApi = buatPembayaranHistoryApi('/reseller')