import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LoginAdminForm } from '@/schemas/auth.schema'
import type { PeranAdmin } from '@/stores/auth.store'
import type { Pelanggan } from '@/types/models'
import type { DaftarkanPelangganForm } from '@/schemas/reseller-portal.schema'

const BASE = '/reseller'

export interface ResellerData {
  id: number
  nama_lengkap: string
  email: string
  peran: PeranAdmin
}

interface LoginResellerResponseData {
  admin: ResellerData
  token: string
}

export interface ResellerDashboardData {
  stats: {
    total_pelanggan: number
    pelanggan_aktif: number
    kendala_aktif: number
    tagihan_belum_bayar: number
    pendapatan: number
  }
  pelanggan_terbaru: Pelanggan[]
}

export function loginReseller(payload: LoginAdminForm) {
  return httpClient.post<ApiResponse<LoginResellerResponseData>>(`${BASE}/login`, payload)
}

export function logoutReseller() {
  return httpClient.post(`${BASE}/logout`)
}

export function getResellerDashboard() {
  return httpClient.get<ApiResponse<ResellerDashboardData>>(`${BASE}/dashboard`)
}

export function getResellerPelangganList() {
  return httpClient.get<PaginatedResponse<Pelanggan>>(`${BASE}/pelanggan`)
}

export function getResellerPelangganDetail(id: number | string) {
  return httpClient.get<ApiResponse<Pelanggan>>(`${BASE}/pelanggan/${id}`)
}

/** Foto KTP & selfie opsional (diunggah kalau ada) — sisanya form terisi. */
export function daftarkanPelanggan(form: DaftarkanPelangganForm, fotoKtp?: File | null, fotoSelfie?: File | null) {
  const payload = new FormData()
  for (const [key, value] of Object.entries(form)) {
    if (key === 'foto_ktp' || key === 'foto_selfie_ktp') continue
    if (value !== undefined && value !== '') payload.append(key, String(value))
  }
  if (fotoKtp) payload.append('foto_ktp', fotoKtp)
  if (fotoSelfie) payload.append('foto_selfie_ktp', fotoSelfie)
  return httpClient.post<ApiResponse<{id: number, nomor_pelanggan: string, nama_lengkap: string, layanan: Pelanggan['layanan_internet']}>>(
    `${BASE}/pelanggan`,
    payload,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}