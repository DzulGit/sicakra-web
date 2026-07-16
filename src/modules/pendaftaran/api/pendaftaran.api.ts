import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { DaftarForm } from '@/schemas/pendaftaran.schema'

interface DaftarResponseData {
  nomor_permohonan: string
}

/**
 * Endpoint publik multipart/form-data — payload dirakit manual jadi FormData
 * (bukan JSON) karena ada 2 file upload (foto_ktp, foto_selfie_ktp).
 */
export function daftar(payload: DaftarForm) {
  const formData = new FormData()

  formData.append('nama_lengkap', payload.nama_lengkap)
  formData.append('nik', payload.nik)
  formData.append('nomor_hp', payload.nomor_hp)
  if (payload.email) formData.append('email', payload.email)

  formData.append('alamat_pemasangan', payload.alamat_pemasangan)
  formData.append('rt', payload.rt)
  formData.append('rw', payload.rw)
  formData.append('kode_pos', payload.kode_pos)
  formData.append('latitude', String(payload.latitude))
  formData.append('longitude', String(payload.longitude))

  formData.append('tipe_paket', payload.tipe_paket)
  if (payload.tipe_paket === 'reguler' && payload.paket_internet_id) {
    formData.append('paket_internet_id', payload.paket_internet_id)
  }
  if (payload.tipe_paket === 'custom') {
    if (payload.nama_paket_custom) formData.append('nama_paket_custom', payload.nama_paket_custom)
    if (payload.kecepatan_custom_mbps) {
      formData.append('kecepatan_custom_mbps', String(payload.kecepatan_custom_mbps))
    }
    if (payload.catatan_custom) formData.append('catatan_custom', payload.catatan_custom)
  }

  formData.append('foto_ktp', payload.foto_ktp)
  formData.append('foto_selfie_ktp', payload.foto_selfie_ktp)

  return httpClient.post<ApiResponse<DaftarResponseData>>('/pendaftaran', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
