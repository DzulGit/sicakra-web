import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { JadwalSurvey } from '@/types/models'
import type { HasilSurveyForm } from '@/schemas/jadwal-teknisi.schema'

const BASE = '/admin/teknisi/jadwal-survey'

export function getJadwalSurveyList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<JadwalSurvey>>(BASE, { params })
}

export function getJadwalSurveyDetail(id: number | string) {
  return httpClient.get<ApiResponse<JadwalSurvey>>(`${BASE}/${id}`)
}

export function isiHasilSurvey(id: number | string, payload: HasilSurveyForm) {
  return httpClient.patch<ApiResponse<JadwalSurvey>>(`${BASE}/${id}/hasil`, payload)
}
