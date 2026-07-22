import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Ubah error validasi 422 dari Laravel (format { errors: { field: [pesan] } })
 * jadi Record<string,string> yang dipahami VeeValidate setErrors().
 * Dipakai di SEMUA form yang submit ke backend — lihat forms-validation.md.
 * Return null kalau errornya bukan 422 (berarti bukan urusan form, biarkan
 * toast generik dari interceptor Axios yang tangani).
 */
export function mapValidationErrors(error: unknown): Record<string, string> | null {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const data = error.response.data as ApiErrorResponse
    if (data.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([field, messages]) => [field, messages[0]]),
      )
    }
  }
  return null
}
