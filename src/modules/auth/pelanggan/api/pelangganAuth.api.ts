import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type {
  BuatPasswordForm,
  LoginPelangganForm,
  LoginPertamaPelangganForm,
} from '@/schemas/auth.schema'

export interface PelangganData {
  id: number
  nama_lengkap: string
  nomor_pelanggan: string | null
}

interface LoginPertamaResponseData {
  pelanggan: PelangganData
  token: string
  wajib_buat_password: true
}

interface LoginPelangganResponseData {
  pelanggan: PelangganData
  token: string
}

interface BuatPasswordResponseData {
  token: string
}

export function loginPertamaPelanggan(payload: LoginPertamaPelangganForm) {
  return httpClient.post<ApiResponse<LoginPertamaResponseData>>('/pelanggan/login-pertama', payload)
}

export function loginPelanggan(payload: LoginPelangganForm) {
  return httpClient.post<ApiResponse<LoginPelangganResponseData>>('/pelanggan/login', payload)
}

export function buatPasswordPelanggan(payload: BuatPasswordForm) {
  return httpClient.post<ApiResponse<BuatPasswordResponseData>>('/pelanggan/buat-password', payload)
}

export function logoutPelanggan() {
  return httpClient.post('/pelanggan/logout')
}
