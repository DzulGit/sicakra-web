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
  permohonan_layanan?: PermohonanLayanan
}

export interface JadwalPemasangan {
  id: number
  permohonan_layanan_id: number
  admin_id: number
  tanggal_pemasangan: string
  hasil: 'selesai' | 'ditunda' | null
  alasan_penundaan: string | null
  permohonan_layanan?: PermohonanLayanan
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

export interface LayananInternetRingkas {
  id: number
  nomor_layanan: string
  pelanggan?: Pelanggan
}

export interface LaporanKendala {
  id: number
  nomor_laporan: string
  layanan_internet_id: number
  kategori_kendala: string
  deskripsi: string
  status: 'menunggu' | 'diproses' | 'ditugaskan' | 'selesai' | 'ditutup'
  // Backend nge-load relasi dengan nama yang sama dengan kolom FK-nya (ditugaskan_ke,
  // ditutup_oleh) — jadi nilainya bisa angka ID mentah ATAU object Admin tergantung
  // apakah controller eager-load relasinya. Frontend HARUS handle keduanya defensif.
  ditugaskan_ke: number | AdminRingkas | null
  hasil_penanganan: string | null
  ditutup_oleh: number | AdminRingkas | null
  created_at: string
  updated_at: string
  layanan_internet?: LayananInternetRingkas
}

export interface Pembayaran {
  id: number
  tagihan_id: number
  metode_pembayaran: string | null
  jumlah_dibayar: string | null
  referensi_xendit: string | null
  status: 'pending' | 'berhasil' | 'gagal'
  dibayar_pada: string | null
  created_at: string
}

export interface Tagihan {
  id: number
  nomor_tagihan: string
  layanan_internet_id: number
  periode_bulan: number
  periode_tahun: number
  nama_paket_snapshot: string
  kecepatan_snapshot_mbps: number
  harga_snapshot: string
  total_tagihan: string
  tanggal_jatuh_tempo: string
  status_pembayaran: 'belum_bayar' | 'sudah_bayar'
  xendit_invoice_id: string | null
  xendit_invoice_url: string | null
  dibayar_pada: string | null
  created_at: string
  layanan_internet?: LayananInternetRingkas
  pembayaran?: Pembayaran[]
}

export interface RingkasanOmzet {
  periode_bulan: number
  total_omzet: string
  jumlah_tagihan: number
}
