import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'
import type { UbahProfilForm } from '@/schemas/profil.schema'

export function getProfil() {
  return httpClient.get<ApiResponse<Pelanggan>>('/pelanggan/profil')
}

export function ubahProfil(payload: UbahProfilForm) {
  return httpClient.patch<ApiResponse<Pelanggan>>('/pelanggan/profil', payload)
}
