import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'

const BASE = '/admin/operasional/pelanggan'

export function getPelangganList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Pelanggan>>(BASE, { params })
}

export function getPelangganDetail(id: number | string) {
  return httpClient.get<ApiResponse<Pelanggan>>(`${BASE}/${id}`)
}
