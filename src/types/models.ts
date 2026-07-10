/** Tipe TypeScript mencerminkan struktur response API — lihat docs/api/*.md. */

export interface Pelanggan {
  id: number
  nomor_pelanggan: string | null
  nama_lengkap: string
  nik: string
  nomor_hp: string
  email: string | null
}

export interface PaketInternet {
  id: number
  nama_paket: string
  kecepatan_mbps: number
  harga: string
  deskripsi: string | null
  status_aktif: boolean
}

export interface AdminRingkas {
  id: number
  nama_lengkap: string
}

export interface RiwayatStatusPermohonan {
  id: number
  status_sebelumnya: string | null
  status_sesudahnya: string
  catatan: string | null
  diubah_oleh: AdminRingkas | null
  created_at: string
}

export interface JadwalSurvey {
  id: number
  permohonan_layanan_id: number
  admin_id: number
  tanggal_survey: string
  hasil: 'berhasil' | 'kendala' | null
  catatan: string | null
}

export interface JadwalPemasangan {
  id: number
  permohonan_layanan_id: number
  admin_id: number
  tanggal_pemasangan: string
  hasil: 'selesai' | 'ditunda' | null
  alasan_penundaan: string | null
}

export interface PermohonanLayanan {
  id: number
  nomor_permohonan: string
  pelanggan_id: number
  jenis_permohonan: 'pemasangan_baru' | 'relokasi'
  layanan_internet_id: number | null
  paket_internet_id: number | null
  tipe_paket: 'reguler' | 'custom'
  nama_paket_custom: string | null
  kecepatan_custom_mbps: number | null
  harga_custom: string | null
  catatan_custom: string | null
  alamat_pemasangan: string
  rt: string
  rw: string
  kode_pos: string
  latitude: string
  longitude: string
  status: string
  alasan_ditolak: string | null
  alasan_ditunda: string | null
  created_at: string
  updated_at: string
  pelanggan?: Pelanggan
  paket_internet?: PaketInternet
  riwayat_status?: RiwayatStatusPermohonan[]
  jadwal_survey?: JadwalSurvey[]
  jadwal_pemasangan?: JadwalPemasangan[]
}
