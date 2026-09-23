import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'
import type { UbahProfilForm, UbahPasswordForm } from '@/schemas/profil.schema'

export function getProfil() {
  return httpClient.get<ApiResponse<Pelanggan>>('/pelanggan/profil')
}

export function ubahProfil(payload: UbahProfilForm) {
  return httpClient.patch<ApiResponse<Pelanggan>>('/pelanggan/profil', payload)
}

export function ubahPassword(payload: UbahPasswordForm) {
  return httpClient.patch<ApiResponse<{ message: string }>>('/pelanggan/profil/password', payload)
}

export function ubahFotoProfil(payload: FormData) {
  // Gunakan POST untuk pengiriman multipart/form-data
  return httpClient.post<ApiResponse<Pelanggan>>('/pelanggan/profil/foto', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}