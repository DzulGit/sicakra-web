import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'
import type { BuatPelangganForm } from '@/schemas/buat-pelanggan.schema'

interface BuatPelangganResponseData {
  pelanggan: Pelanggan
  username: string
  password: string
}

/**
 * Admin Operasional membuat pelanggan baru (pendaftaran offline/telepon).
 * Payload dikirim sebagai FormData karena ada optional file upload.
 */
export function buatPelangganBaru(payload: BuatPelangganForm) {
  const formData = new FormData()

  formData.append('nama_lengkap', payload.nama_lengkap)
  formData.append('nik', payload.nik)
  formData.append('nomor_hp', payload.nomor_hp)
  if (payload.email) formData.append('email', payload.email)

  formData.append('alamat_pemasangan', payload.alamat_pemasangan)
  if (payload.detail_alamat) formData.append('detail_alamat', payload.detail_alamat)
  if (payload.provinsi) formData.append('provinsi', payload.provinsi)
  if (payload.kota) formData.append('kota', payload.kota)
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

  if (payload.foto_ktp) formData.append('foto_ktp', payload.foto_ktp)
  if (payload.foto_selfie_ktp) formData.append('foto_selfie_ktp', payload.foto_selfie_ktp)

  return httpClient.post<ApiResponse<BuatPelangganResponseData>>('/admin/operasional/pelanggan/buat-baru', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
