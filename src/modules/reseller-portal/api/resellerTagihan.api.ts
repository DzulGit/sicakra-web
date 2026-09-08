import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedData, PaginatedResponse } from '@/types/api'
import type { Tagihan } from '@/types/models'

const BASE = '/reseller/tagihan'

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

export function getResellerPendaftarBaru(params: Record<string, string>) {
  return httpClient.get<PaginatedData<PendaftarBaru>>(`${BASE}/pendaftar-baru`, { params })
}

export function previewResellerTagihanPertama(pelangganId: number | string) {
  return httpClient.get<ApiResponse<PreviewTagihanPertamaItem[]>>(`${BASE}/pertama/${pelangganId}/preview`)
}

export function generateResellerTagihanPertama(
  pelangganId: number | string,
  payload: {
    layanan_internet_id: number
    mode: 'prorata' | 'full'
    nominal_manual?: number
    jumlah_hari_jatuh_tempo?: number
  },
) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/pertama/${pelangganId}`, payload)
}

export function getResellerTagihanList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<Tagihan>>(BASE, { params })
}

export function getResellerTagihanDetail(id: number | string) {
  return httpClient.get<ApiResponse<Tagihan>>(`${BASE}/${id}`)
}

export function perbaruiLinkResellerTagihan(id: number | string) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/${id}/perbarui-link`)
}

export function bayarTunaiResellerTagihan(id: number | string, jumlahBulan: number) {
  return httpClient.post<ApiResponse<Tagihan>>(`${BASE}/${id}/bayar-tunai`, {
    jumlah_bulan: jumlahBulan,
  })
}