import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { LoginAdminForm } from '@/schemas/auth.schema'
import type { PeranAdmin } from '@/stores/auth.store'

export interface AdminData {
  id: number
  nama_lengkap: string
  email: string
  peran: PeranAdmin
}

interface LoginAdminResponseData {
  admin: AdminData
  token: string
}

export function loginAdmin(payload: LoginAdminForm) {
  return httpClient.post<ApiResponse<LoginAdminResponseData>>('/admin/login', payload)
}

export function logoutAdmin() {
  return httpClient.post('/admin/logout')
}
