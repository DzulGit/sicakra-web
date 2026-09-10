import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'

export interface ProfilReseller {
  id: number
  nama_lengkap: string
  email: string
  email_baru: string | null
  foto_profil: string | null
  peran: 'reseller'
}

export interface UbahPasswordResellerForm {
  password_lama: string
  password: string
  password_confirmation: string
}

export function getProfilReseller() {
  return httpClient.get<ApiResponse<ProfilReseller>>('/reseller/profil')
}

export function ubahNamaReseller(payload: { nama_lengkap: string }) {
  return httpClient.patch<ApiResponse<ProfilReseller>>('/reseller/profil', payload)
}

export function mintaUbahEmailReseller(payload: { email: string }) {
  return httpClient.post<ApiResponse<ProfilReseller>>('/reseller/profil/email', payload)
}

export function batalUbahEmailReseller() {
  return httpClient.delete<ApiResponse<ProfilReseller>>('/reseller/profil/email')
}

export function ubahPasswordReseller(payload: UbahPasswordResellerForm) {
  return httpClient.patch<ApiResponse<ProfilReseller>>('/reseller/profil/password', payload)
}

export function ubahFotoReseller(payload: FormData) {
  return httpClient.post<ApiResponse<ProfilReseller>>('/reseller/profil/foto', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}