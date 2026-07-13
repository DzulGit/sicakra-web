import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { JadwalPemasangan } from '@/types/models'
import type { HasilPemasanganForm } from '@/schemas/jadwal-teknisi.schema'

const BASE = '/admin/teknisi/jadwal-pemasangan'

export function getJadwalPemasanganList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<JadwalPemasangan>>(BASE, { params })
}

export function getJadwalPemasanganDetail(id: number | string) {
  return httpClient.get<ApiResponse<JadwalPemasangan>>(`${BASE}/${id}`)
}

export function isiHasilPemasangan(id: number | string, payload: HasilPemasanganForm) {
  return httpClient.patch<ApiResponse<unknown>>(`${BASE}/${id}/hasil`, payload)
}
