import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LayananInternetDetail, PermohonanLayanan } from '@/types/models'
import type { BuatPermohonanPelangganForm } from '@/schemas/pelanggan-permohonan.schema'

const BASE = '/pelanggan/layanan'
const BASE_PERMOHONAN = '/pelanggan/permohonan-layanan'

export function getLayananSayaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LayananInternetDetail>>(BASE, { params })
}

export function getLayananSayaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LayananInternetDetail>>(`${BASE}/${id}`)
}

export function buatPermohonanLayanan(payload: BuatPermohonanPelangganForm & { pelanggan_id: number }) {
  return httpClient.post<ApiResponse<PermohonanLayanan>>(BASE_PERMOHONAN, payload)
}
