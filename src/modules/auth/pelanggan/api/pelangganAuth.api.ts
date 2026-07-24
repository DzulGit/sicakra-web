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
  // TODO: pastikan field ini benar dikirim backend dari kolom `password_sudah_dibuat`
  // pada tabel pelanggan. Dipakai untuk munculkan popup opsional di dashboard.
  password_sudah_dibuat?: boolean
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

// TODO: endpoint ini diasumsikan mengikuti pola umum Laravel Sanctum
// ("data user yang sedang login"). Cross-check ke routes/api.php backend —
// path, method, atau bentuk response bisa jadi berbeda.
export function getProfilPelanggan() {
  return httpClient.get<ApiResponse<PelangganData>>('/pelanggan/me')
}