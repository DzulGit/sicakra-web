import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { PaketInternet } from '@/types/models'

/** Endpoint PUBLIK — lihat catatan gap backend, perlu ditambahkan manual. */
export function getPaketInternetList() {
  return httpClient.get<ApiResponse<PaketInternet[]>>('/paket-internet')
}
