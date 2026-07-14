import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { RingkasanOmzet, Tagihan } from '@/types/models'

const BASE = '/admin/keuangan/tagihan'

export function getTagihanList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Tagihan>>(BASE, { params })
}

export function getTagihanDetail(id: number | string) {
  return httpClient.get<ApiResponse<Tagihan>>(`${BASE}/${id}`)
}

export function getRingkasanOmzet(tahun: number) {
  return httpClient.get<ApiResponse<RingkasanOmzet[]>>(`${BASE}-ringkasan`, { params: { tahun } })
}

// SENGAJA tidak ada create()/update() — TagihanPolicy backend melarang keduanya,
// Keuangan bersifat read-only. Lihat docs/api/keuangan.md.

// ----- Sisi Pelanggan (hanya tagihan dari layanan miliknya sendiri) -----
const BASE_PELANGGAN = '/pelanggan/tagihan'

export function getTagihanSayaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Tagihan>>(BASE_PELANGGAN, { params })
}

export function getTagihanSayaDetail(id: number | string) {
  return httpClient.get<ApiResponse<Tagihan>>(`${BASE_PELANGGAN}/${id}`)
}
