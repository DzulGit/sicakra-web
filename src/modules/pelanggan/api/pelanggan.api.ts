import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LayananInternetDetail, Pelanggan } from '@/types/models'

const BASE = '/admin/operasional/pelanggan'

export function getPelangganList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Pelanggan>>(BASE, { params })
}

export function getPelangganDetail(id: number | string) {
  return httpClient.get<ApiResponse<Pelanggan>>(`${BASE}/${id}`)
}

export function aturTanggalTagihan(id: number | string, tanggalTagihan: number) {
  return httpClient.patch<ApiResponse<Pelanggan>>(`${BASE}/${id}/tanggal-tagihan`, {
    tanggal_tagihan: tanggalTagihan,
  })
}

export function bulkAturTanggalTagihan(tanggalTagihan: number, pelangganIds?: number[]) {
  return httpClient.post<ApiResponse<{ ter_update: number }>>(`${BASE}/tanggal-tagihan/bulk`, {
    tanggal_tagihan: tanggalTagihan,
    pelanggan_ids: pelangganIds,
  })
}

/** Override siklus penagihan per layanan (bebas_tagihan_bulan &/atau tanggal_mulai_penagihan). */
export function aturSiklusLayanan(
  id: number | string,
  data: { bebas_tagihan_bulan?: number; tanggal_mulai_penagihan?: string },
) {
  return httpClient.patch<ApiResponse<LayananInternetDetail>>(`/admin/operasional/layanan/${id}/siklus-penagihan`, data)
}
