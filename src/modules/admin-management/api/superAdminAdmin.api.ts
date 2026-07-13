import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { AdminLengkap } from '@/types/models'
import type { SimpanAdminForm, UbahAdminForm } from '@/schemas/admin.schema'

const BASE = '/admin/super-admin/admin'

export function getAdminList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<AdminLengkap>>(BASE, { params })
}

export function getAdminDetail(id: number | string) {
  return httpClient.get<ApiResponse<AdminLengkap>>(`${BASE}/${id}`)
}

export function simpanAdmin(payload: SimpanAdminForm) {
  return httpClient.post<ApiResponse<AdminLengkap>>(BASE, payload)
}

export function ubahAdmin(id: number | string, payload: UbahAdminForm) {
  return httpClient.patch<ApiResponse<AdminLengkap>>(`${BASE}/${id}`, payload)
}

export function nonaktifkanAdmin(id: number | string) {
  return httpClient.patch<ApiResponse<AdminLengkap>>(`${BASE}/${id}/nonaktifkan`)
}
