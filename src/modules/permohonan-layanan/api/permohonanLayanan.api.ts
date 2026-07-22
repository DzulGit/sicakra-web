import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminRingkas, JadwalKerja, PermohonanLayanan } from '@/types/models'
import type { JadwalkanKerjaForm, VerifikasiPermohonanForm } from '@/schemas/permohonan-layanan.schema'

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

/** Satu endpoint gabungan — dipakai penjadwalan awal MAUPUN reschedule setelah kendala. */
export function jadwalkanKerja(id: number | string, payload: JadwalkanKerjaForm) {
  return httpClient.post<ApiResponse<JadwalKerja>>(`${BASE}/${id}/jadwalkan-kerja`, payload)
}

export function getDaftarTeknisi() {
  return httpClient.get<ApiResponse<AdminRingkas[]>>('/admin/operasional/teknisi')
}