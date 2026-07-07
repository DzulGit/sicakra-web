/**
 * Tipe generik yang mencerminkan bentuk response API Laravel kita.
 * Semua response sukses dibungkus { data: ... }, list pakai format
 * Laravel paginator standar (lihat docs/api/README.md bagian "Konvensi Umum").
 */

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedData<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
