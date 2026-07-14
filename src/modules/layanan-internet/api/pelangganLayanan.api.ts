import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LayananInternetDetail } from '@/types/models'

const BASE = '/pelanggan/layanan'

export function getLayananSayaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LayananInternetDetail>>(BASE, { params })
}

export function getLayananSayaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LayananInternetDetail>>(`${BASE}/${id}`)
}
