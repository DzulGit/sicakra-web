import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminRingkas, JadwalPemasangan, JadwalSurvey, PermohonanLayanan } from '@/types/models'
import type {
  JadwalkanPemasanganForm,
  JadwalkanSurveyForm,
  VerifikasiPermohonanForm,
} from '@/schemas/permohonan-layanan.schema'

const BASE = '/admin/operasional/permohonan-layanan'

export function getPermohonanLayananList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<PermohonanLayanan>>(BASE, { params })
}

export function getPermohonanLayananDetail(id: number | string) {
  return httpClient.get<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}`)
}

export function verifikasiPermohonan(id: number | string, payload: VerifikasiPermohonanForm) {
  return httpClient.patch<ApiResponse<PermohonanLayanan>>(`${BASE}/${id}/verifikasi`, payload)
}

export function jadwalkanSurvey(id: number | string, payload: JadwalkanSurveyForm) {
  return httpClient.post<ApiResponse<JadwalSurvey>>(`${BASE}/${id}/jadwalkan-survey`, payload)
}

export function jadwalkanPemasangan(id: number | string, payload: JadwalkanPemasanganForm) {
  return httpClient.post<ApiResponse<JadwalPemasangan>>(`${BASE}/${id}/jadwalkan-pemasangan`, payload)
}

/** Endpoint baru — lihat catatan gap backend di atas (perlu ditambahkan manual). */
export function getDaftarTeknisi() {
  return httpClient.get<ApiResponse<AdminRingkas[]>>('/admin/operasional/teknisi')
}
