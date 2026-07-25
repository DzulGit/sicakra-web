import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { PaketInternet } from '@/types/models'
import type { SimpanPaketInternetForm, UbahPaketInternetForm } from '@/schemas/paket-internet.schema'

const BASE = '/admin/operasional/paket-internet'

export function getPaketInternetList() {
  return httpClient.get<ApiResponse<PaketInternet[]>>('/paket-internet')
}

export function getAdminPaketInternetList() {
  return httpClient.get<ApiResponse<PaketInternet[]>>(BASE)
}

export function getPaketInternetDetail(id: number | string) {
  return httpClient.get<ApiResponse<PaketInternet>>(`${BASE}/${id}`)
}

export function simpanPaketInternet(payload: SimpanPaketInternetForm) {
  return httpClient.post<ApiResponse<PaketInternet>>(BASE, payload)
}

export function ubahPaketInternet(id: number | string, payload: UbahPaketInternetForm) {
  return httpClient.patch<ApiResponse<PaketInternet>>(`${BASE}/${id}`, payload)
}

export function hapusPaketInternet(id: number | string) {
  return httpClient.delete<ApiResponse<void>>(`${BASE}/${id}`)
}
