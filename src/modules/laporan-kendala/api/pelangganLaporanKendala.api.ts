import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { LaporanKendala } from '@/types/models'
import type { BuatLaporanForm } from '@/schemas/laporan-kendala.schema'

const BASE = '/pelanggan/laporan-kendala'

export function getLaporanKendalaSayaList(params: Record<string, string>) {
  return httpClient.get<PaginatedResponse<LaporanKendala>>(BASE, { params })
}

export function getLaporanKendalaSayaDetail(id: number | string) {
  return httpClient.get<ApiResponse<LaporanKendala>>(`${BASE}/${id}`)
}

export function buatLaporanKendala(payload: BuatLaporanForm) {
  const formData = new FormData()
  formData.append('layanan_internet_id', payload.layanan_internet_id)
  formData.append('kategori_kendala', payload.kategori_kendala)
  formData.append('deskripsi', payload.deskripsi)
  if (payload.foto) {
    formData.append('foto', payload.foto)
  }

  return httpClient.post<ApiResponse<LaporanKendala>>(BASE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}