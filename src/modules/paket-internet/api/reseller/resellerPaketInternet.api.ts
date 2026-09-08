import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { PaketInternet } from '@/types/models'
import type { SimpanPaketInternetForm, UbahPaketInternetForm } from '@/schemas/paket-internet.schema'

const BASE = '/reseller/paket-internet'

export function getResellerPaketInternetList() {
  return httpClient.get<ApiResponse<PaketInternet[]>>(BASE)
}

export function getResellerPaketInternetDetail(id: number | string) {
  return httpClient.get<ApiResponse<PaketInternet>>(`${BASE}/${id}`)
}

export function simpanResellerPaketInternet(payload: SimpanPaketInternetForm) {
  return httpClient.post<ApiResponse<PaketInternet>>(BASE, payload)
}

export function ubahResellerPaketInternet(id: number | string, payload: UbahPaketInternetForm) {
  return httpClient.patch<ApiResponse<PaketInternet>>(`${BASE}/${id}`, payload)
}

export function hapusResellerPaketInternet(id: number | string) {
  return httpClient.delete<ApiResponse<void>>(`${BASE}/${id}`)
}