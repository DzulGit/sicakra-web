import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { JadwalKerja, PermohonanLayanan } from '@/types/models'
import type {
  BuatPermohonanResellerForm,
  JadwalkanResellerForm,
  VerifikasiDanJadwalkanResellerForm,
  VerifikasiResellerForm,
} from '@/schemas/reseller-portal.schema'

const BASE = '/reseller/permohonan-layanan'

export function getResellerPermohonanLayananList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<PermohonanLayanan>>(BASE, { params })
}

export function getResellerPermohonanLayananDetail(id: number | string) {
  return httpClient.get<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}`)
}

export function buatResellerPermohonan(payload: BuatPermohonanResellerForm) {
  return httpClient.post<ApiResponse<PermohonanLayanan>>(BASE, payload)
}

export function verifikasiResellerPermohonan(id: number | string, payload: VerifikasiResellerForm) {
  return httpClient.patch<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}/verifikasi`, payload)
}

export function verifikasiDanJadwalkanReseller(id: number | string, payload: VerifikasiDanJadwalkanResellerForm) {
  return httpClient.post<ApiResponse<{ permohonan: PermohonanLayanan; jadwal_kerja: JadwalKerja }>>(
    `${BASE}/${id}/verifikasi-dan-jadwalkan`,
    payload,
  )
}

export function jadwalkanResellerKerja(id: number | string, payload: JadwalkanResellerForm) {
  return httpClient.post<ApiResponse<JadwalKerja>>(`${BASE}/${id}/jadwalkan-kerja`, payload)
}