import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { LaporanKendala, PaketInternet, Pelanggan, PermohonanLayanan, TimTeknisi } from '@/types/models'

export interface DashboardOperasionalStats {
  permohonan_baru_hari_ini: number
  menunggu_verifikasi: number
  pemasangan_hari_ini: number
  teknisi_aktif: number
  kendala_aktif: number
}

export interface DashboardStatusDist {
  status: string
  label: string
  jumlah: number
}

export interface DashboardTrendPoint {
  bulan: string
  jumlah: number
}

export interface PermohonanRingkasan {
  total: number
  by_status: Record<string, number>
  terbaru: PermohonanLayanan[]
}

export interface PelangganRingkasan {
  total: number
  total_aktif: number
  terbaru: Pelanggan[]
}

export interface PaketRingkasan {
  total: number
  total_aktif: number
  terbaru: PaketInternet[]
}

export interface LaporanKendalaRingkasan {
  total_aktif: number
  by_status: Record<string, number>
  terbaru: LaporanKendala[]
}

export interface TimTeknisiRingkasan {
  total: number
  total_aktif: number
  anggota_aktif: number
  terbaru: TimTeknisi[]
}

export interface DashboardOperasionalRingkasan {
  stats: DashboardOperasionalStats
  permohonan_layanan: PermohonanRingkasan
  pendaftar_baru: PermohonanRingkasan
  pelanggan: PelangganRingkasan
  paket_internet: PaketRingkasan
  laporan_kendala: LaporanKendalaRingkasan
  tim_teknisi: TimTeknisiRingkasan
  tren_permohonan: DashboardTrendPoint[]
  distribusi_status: DashboardStatusDist[]
  permohonan_terbaru: PermohonanLayanan[]
}

export function getDashboardOperasional() {
  return httpClient.get<ApiResponse<DashboardOperasionalRingkasan>>('/admin/operasional/dashboard')
}
