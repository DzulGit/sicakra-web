import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { PermohonanLayanan } from '@/types/models'
import type {
  VerifikasiResellerForm,
} from '@/schemas/reseller-portal.schema'

const BASE = '/reseller/permohonan-layanan'

export function getResellerPermohonanLayananList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<PermohonanLayanan>>(BASE, { params })
}

export function getResellerPermohonanLayananDetail(id: number | string) {
  return httpClient.get<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}`)
}

export function verifikasiResellerPermohonan(id: number | string, payload: VerifikasiResellerForm) {
  return httpClient.patch<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}/verifikasi`, payload)
}