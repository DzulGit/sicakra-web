import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { JadwalKerja, RingkasanAktivasi } from '@/types/models'
import type { HasilKerjaForm } from '@/schemas/jadwal-kerja.schema'

const BASE = '/admin/teknisi/jadwal-kerja'

export interface IsiHasilKerjaResponseData {
  jadwal: JadwalKerja
  ringkasan_aktivasi: RingkasanAktivasi | null
}

export function getJadwalKerjaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<JadwalKerja>>(BASE, { params })
}

export function getJadwalKerjaDetail(id: number | string) {
  return httpClient.get<ApiResponse<JadwalKerja>>(`${BASE}/${id}`)
}

export function isiHasilKerja(id: number | string, payload: HasilKerjaForm) {
  return httpClient.patch<ApiResponse<IsiHasilKerjaResponseData>>(`${BASE}/${id}/hasil`, payload)
}