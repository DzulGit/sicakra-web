import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { LoginPelangganForm, ResetPasswordForm } from '@/schemas/auth.schema'

export interface PelangganData {
  id: number
  nama_lengkap: string
  nomor_pelanggan: string | null
  username: string | null
  password_sudah_dibuat?: boolean
}

interface LoginPelangganResponseData {
  pelanggan: PelangganData
  token: string
}

export function loginPelanggan(payload: LoginPelangganForm) {
  return httpClient.post<ApiResponse<LoginPelangganResponseData>>('/pelanggan/login', payload)
}

export function logoutPelanggan() {
  return httpClient.post('/pelanggan/logout')
}

export function lupaPasswordPelanggan(payload: { email: string }) {
  return httpClient.post<ApiResponse<{ message: string }>>('/pelanggan/lupa-password', payload)
}

export function resetPasswordPelanggan(payload: ResetPasswordForm) {
  return httpClient.post<ApiResponse<{ message: string }>>('/pelanggan/reset-password', payload)
}