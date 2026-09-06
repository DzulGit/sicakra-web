import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedData, PaginatedResponse } from '@/types/api'
import type { RingkasanOmzet, Tagihan } from '@/types/models'

const BASE = '/admin/keuangan/tagihan'

export type PendaftarBaru = {
  id: number
  nama_lengkap: string
  nomor_hp: string
  layanan_internet: Array<{
    id: number
    status: string
    tipe_paket: 'reguler' | 'custom'
    nama_paket_custom: string | null
    paket_internet?: {
      id: number
      nama_paket: string
    } | null
  }>
}

type PreviewTagihanPertama = {
  mode: 'prorata' | 'full'
  tanggal_aktif: string
  periode_bulan: number
  periode_tahun: number
  nama_paket: string
  kecepatan_mbps: number
  harga_bulanan: number
  jumlah_hari: number
  jumlah_hari_dalam_bulan: number
  nominal_prorata: number
  nominal_full: number
  nominal_terhitung: number
}

type PreviewTagihanPertamaItem = {
  layanan_internet_id: number
  prorata: PreviewTagihanPertama
  full: PreviewTagihanPertama
}

export function getPendaftarBaru(params: Record<string, string>) {
  return httpClient.get<PaginatedData<PendaftarBaru>>(
    '/admin/keuangan/pendaftar-baru',
    { params },
  )
}

export function previewTagihanPertama(pelangganId: number | string) {
  return httpClient.get<ApiResponse<PreviewTagihanPertamaItem[]>>(
    `${BASE}/pertama/${pelangganId}/preview`,
  )
}

export function generateTagihanPertama(
  pelangganId: number | string,
  payload: {
    layanan_internet_id: number
    mode: 'prorata' | 'full'
    nominal_manual?: number
    jumlah_hari_jatuh_tempo?: number
  },
) {
  return httpClient.post<ApiResponse<Tagihan>>(
    `${BASE}/pertama/${pelangganId}`,
    payload,
  )
}

export function getTagihanList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Tagihan>>(BASE, { params })
}

export function getTagihanDetail(id: number | string) {
  return httpClient.get<ApiResponse<Tagihan>>(`${BASE}/${id}`)
}

export function getRingkasanOmzet(tahun: number) {
  return httpClient.get<ApiResponse<RingkasanOmzet[]>>(`${BASE}-ringkasan`, { params: { tahun } })
}

export function generateTagihanManual(pelangganId: number | string, payload: { periode_bulan: number; periode_tahun: number; jumlah_hari_jatuh_tempo?: number }) {
  return httpClient.post<ApiResponse<Tagihan[]>>(`${BASE}/generate/${pelangganId}`, payload)
}

export function regenerateTagihan(id: number | string, jumlahBulan: number) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/${id}/regenerate`, {
    jumlah_bulan: jumlahBulan,
  })
}

export function perbaruiLinkTagihan(id: number | string) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/${id}/perbarui-link`)
}

export function bayarTunaiTagihan(id: number | string, jumlahBulan: number) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/${id}/bayar-tunai`, {
    jumlah_bulan: jumlahBulan,
  })
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

export function bayarTagihan(id: number | string, jumlahBulan?: number) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE_PELANGGAN}/${id}/bayar`, {
    jumlah_bulan: jumlahBulan,
  })
}

export function regenerateInvoice(id: number | string) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE_PELANGGAN}/${id}/regenerate-invoice`)
}
