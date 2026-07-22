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

export interface TimTeknisi {
  id: number
  nama_tim: string
  status_aktif: boolean
  anggota?: AdminRingkas[]
}

export interface RingkasanAktivasi {
  nomor_pelanggan: string | null
  nama_pelanggan: string
  nomor_layanan: string
  nama_paket: string | null
  kecepatan_mbps: number | null
  status: string
}

export interface JadwalKerja {
  id: number
  permohonan_layanan_id: number
  tim_teknisi_id: number | null
  tanggal_kerja: string
  hasil: 'selesai' | 'kendala' | null
  catatan_kendala: string | null
  permohonan_layanan?: PermohonanLayanan
  teknisi?: AdminRingkas[]
  tim_teknisi?: TimTeknisi
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
  jadwal_kerja?: JadwalKerja[]
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

export interface AdminLengkap {
  id: number
  nama_lengkap: string
  email: string
  peran: 'super_admin' | 'operasional' | 'teknisi' | 'keuangan'
  status_aktif: boolean
  dibuat_oleh: number | null
  created_at: string
  updated_at: string
}

export interface Perangkat {
  id: number
  layanan_internet_id: number
  serial_number: string
  mac_address: string | null
  merek: string
  tipe: string
  status: 'terpasang' | 'dilepas' | 'rusak'
}

export interface RiwayatPerubahanPaket {
  id: number
  layanan_internet_id: number
  nama_paket_lama: string
  kecepatan_lama_mbps: number
  harga_lama: string
  nama_paket_baru: string
  kecepatan_baru_mbps: number
  harga_baru: string
  jenis_perubahan: 'upgrade' | 'downgrade'
  tanggal_perubahan: string
}

export interface RiwayatRelokasi {
  id: number
  layanan_internet_id: number
  alamat_lama: string
  alamat_baru: string
  tanggal_relokasi: string
}

export interface LayananInternetDetail {
  id: number
  nomor_layanan: string
  pelanggan_id: number
  paket_internet_id: number | null
  tipe_paket: 'reguler' | 'custom'
  nama_paket_custom: string | null
  kecepatan_custom_mbps: number | null
  harga_custom: string | null
  alamat_pemasangan: string
  rt: string
  rw: string
  kode_pos: string
  status: 'aktif' | 'nonaktif'
  tanggal_aktif: string
  paket_internet?: PaketInternet
  perangkat?: Perangkat[]
  riwayat_perubahan_paket?: RiwayatPerubahanPaket[]
  riwayat_relokasi?: RiwayatRelokasi[]
}
