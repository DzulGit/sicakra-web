/** Tipe TypeScript mencerminkan struktur response API — lihat docs/api/*.md. */

export interface Pelanggan {
  id: number
  nomor_pelanggan: string | null
  nama_lengkap: string
  nik: string
  nomor_hp: string
  email: string | null
  foto_ktp?: string | null
  foto_selfie_ktp?: string | null
  password_sudah_dibuat?: boolean
  created_at?: string
  updated_at?: string
  layanan_internet?: LayananInternetDetail[]
  permohonan_layanan?: PermohonanLayanan[]
  username?: string
}

export interface PaketInternet {
  id: number
  nama_paket: string
  kecepatan_mbps: number
  harga: string
  jumlah_perangkat: number
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
  anggota_count?: number
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
  foto?: string | null
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

export interface DashboardStats {
  total_pelanggan: number
  pelanggan_aktif: number
  permohonan_menunggu: number
  teknisi_aktif: number
  kendala_aktif: number
  pemasangan_hari_ini: number
}

export interface DashboardTrendPoint {
  bulan: string
  jumlah: number
}

export interface DashboardStatusDist {
  status: string
  label: string
  jumlah: number
}

export interface DashboardAktivitasTeknisi {
  id: number
  teknisi: string
  aktivitas: string
  waktu: string
  status: string
}

export interface DashboardKesehatanSistem {
  status_server: 'sehat' | 'peringatan' | 'kritis'
  uptime: string
  cpu_usage: number
  memory_usage: number
  response_time: string
}

export interface DashboardOperasionalStats {
  permohonan_baru_hari_ini: number
  menunggu_verifikasi: number
  pemasangan_hari_ini: number
  teknisi_aktif: number
  kendala_aktif: number
}

export interface DashboardPembayaranRingkas {
  id: number
  nomor_tagihan: string
  pelanggan: string
  jumlah: string
  status: string
  waktu: string
}

export interface DashboardKeuanganStats {
  pembayaran_hari_ini: number
  total_pembayaran_hari_ini: string
  tagihan_tertunggak: number
  total_tertunggak: string
  jatuh_tempo_minggu_ini: number
  pendapatan_bulan_ini: string
}

export interface DashboardKeuanganRingkasan {
  stats: DashboardKeuanganStats
  tren_pendapatan: DashboardTrendPoint[]
  distribusi_pembayaran: DashboardStatusDist[]
  pembayaran_terbaru: DashboardPembayaranRingkas[]
  tagihan_akan_jatuh_tempo: Tagihan[]
}

export interface DashboardJadwalRingkas {
  id: number
  nomor_permohonan: string
  pelanggan: string
  jenis_pekerjaan: string
  alamat: string
  waktu: string
  status: string
}

export interface DashboardTeknisiStats {
  pekerjaan_hari_ini: number
  sedang_dikerjakan: number
  selesai_hari_ini: number
  tiket_kendala_aktif: number
}

export interface DashboardTeknisiRingkasan {
  stats: DashboardTeknisiStats
  jadwal_hari_ini: DashboardJadwalRingkas[]
  tiket_kendala_aktif: LaporanKendala[]
  riwayat_pekerjaan: DashboardJadwalRingkas[]
}

export interface DashboardSuperAdminStats {
  total_pelanggan: number
  pelanggan_aktif: number
  pertumbuhan_pelanggan: number
  total_teknisi: number
  pendapatan_bulan_ini: string
  kendala_aktif: number
}

export interface DashboardAktivitasRingkas {
  id: number
  tipe: string
  deskripsi: string
  pengguna: string
  waktu: string
}

export interface DashboardSuperAdminRingkasan {
  stats: DashboardSuperAdminStats
  tren_pelanggan: DashboardTrendPoint[]
  tren_pendapatan: DashboardTrendPoint[]
  aktivitas_terbaru: DashboardAktivitasRingkas[]
  kesehatan_sistem: DashboardKesehatanSistem
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
  detail_alamat?: string | null
  status: 'aktif' | 'nonaktif'
  tanggal_aktif: string
  perangkat_count?: number
  paket_internet?: PaketInternet
  perangkat?: Perangkat[]
  riwayat_perubahan_paket?: RiwayatPerubahanPaket[]
  riwayat_relokasi?: RiwayatRelokasi[]
}

export interface DashboardRingkasan {
  pelanggan: {
    nama_lengkap: string
    nomor_pelanggan: string
  }
  ringkasan: {
    total_layanan: number
    layanan_aktif: number
    tagihan_belum_bayar: number
    total_tagihan_belum_bayar: number
    kendala_aktif: number
    permohonan_pending: number
  }
  layanan_terbaru: Array<{
    id: number
    nomor_layanan: string
    nama_paket: string | null
    kecepatan_mbps: number | null
    status: string
    alamat_pemasangan: string
  }>
  tagihan_terbaru: Array<{
    id: number
    nomor_tagihan: string
    total: number
    status_pembayaran: string
    tenggat: string | null
    layanan: string
  }>
  kendala_terbaru: Array<{
    id: number
    nomor_laporan: string
    kategori_kendala: string
    status: string
    created_at: string
  }>
  permohonan_terbaru: Array<{
    id: number
    nomor_permohonan: string
    jenis_permohonan: string
    status_permohonan: string
    created_at: string
  }>
}
