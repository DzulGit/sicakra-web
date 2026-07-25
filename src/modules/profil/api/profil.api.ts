import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'
import type { UbahProfilForm, UbahUsernameForm, UbahPasswordForm } from '@/schemas/profil.schema'

export function getProfil() {
  return httpClient.get<ApiResponse<Pelanggan>>('/pelanggan/profil')
}

export function ubahProfil(payload: UbahProfilForm) {
  return httpClient.patch<ApiResponse<Pelanggan>>('/pelanggan/profil', payload)
}

// TODO: cross-check path & method persis ke backend (ProfilController belum
// ditemukan saat file ini dibuat). Sesuaikan kalau ternyata beda.
export function ubahUsername(payload: UbahUsernameForm) {
  return httpClient.patch<ApiResponse<Pelanggan>>('/pelanggan/profil/username', payload)
}

export function ubahPassword(payload: UbahPasswordForm) {
  return httpClient.patch<ApiResponse<{ message: string }>>('/pelanggan/profil/password', payload)
}