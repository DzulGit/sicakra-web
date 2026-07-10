import type { BadgeVariants } from '@/components/ui/badge'

export interface EnumMeta {
  label: string
  badgeVariant: NonNullable<BadgeVariants['variant']>
}

export type EnumMap = Record<string, EnumMeta>

/**
 * Mirror LENGKAP dari app/Enums/*.php backend. Setiap enum backend berubah
 * -> file ini WAJIB ikut diperbarui di PR yang sama. Sumber kebenaran mapping
 * ada di docs/frontend/design-system/enums-and-status.md — JANGAN ubah warna
 * di sini tanpa update dokumen itu juga (dan sebaliknya).
 */

export const statusPermohonanEnum: EnumMap = {
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', badgeVariant: 'warning' },
  PERLU_REVISI: { label: 'Perlu Revisi', badgeVariant: 'warning' },
  DITERIMA: { label: 'Diterima', badgeVariant: 'info' },
  DITOLAK: { label: 'Ditolak', badgeVariant: 'destructive' },
  DIJADWALKAN: { label: 'Dijadwalkan', badgeVariant: 'info' },
  SURVEY: { label: 'Survey', badgeVariant: 'info' },
  PEMASANGAN: { label: 'Pemasangan', badgeVariant: 'info' },
  DITUNDA: { label: 'Ditunda', badgeVariant: 'warning' },
  DIKONVERSI: { label: 'Aktif (Dikonversi)', badgeVariant: 'success' },
}

export const statusLaporanEnum: EnumMap = {
  menunggu: { label: 'Menunggu', badgeVariant: 'warning' },
  diproses: { label: 'Diproses', badgeVariant: 'info' },
  ditugaskan: { label: 'Ditugaskan', badgeVariant: 'info' },
  selesai: { label: 'Selesai', badgeVariant: 'success' },
  ditutup: { label: 'Ditutup', badgeVariant: 'secondary' },
}

export const statusLayananEnum: EnumMap = {
  aktif: { label: 'Aktif', badgeVariant: 'success' },
  nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
}

export const statusPembayaranEnum: EnumMap = {
  belum_bayar: { label: 'Belum Bayar', badgeVariant: 'warning' },
  sudah_bayar: { label: 'Sudah Bayar', badgeVariant: 'success' },
}

export const statusTransaksiEnum: EnumMap = {
  pending: { label: 'Pending', badgeVariant: 'warning' },
  berhasil: { label: 'Berhasil', badgeVariant: 'success' },
  gagal: { label: 'Gagal', badgeVariant: 'destructive' },
}

export const hasilSurveyEnum: EnumMap = {
  berhasil: { label: 'Berhasil', badgeVariant: 'success' },
  kendala: { label: 'Kendala', badgeVariant: 'warning' },
}

export const hasilPemasanganEnum: EnumMap = {
  selesai: { label: 'Selesai', badgeVariant: 'success' },
  ditunda: { label: 'Ditunda', badgeVariant: 'warning' },
}

export const statusPerangkatEnum: EnumMap = {
  terpasang: { label: 'Terpasang', badgeVariant: 'success' },
  dilepas: { label: 'Dilepas', badgeVariant: 'secondary' },
  rusak: { label: 'Rusak', badgeVariant: 'destructive' },
}

// ----- Kategorikal (BUKAN status kesehatan/progress) — selalu 'outline' -----

export const jenisPermohonanEnum: EnumMap = {
  pemasangan_baru: { label: 'Pemasangan Baru', badgeVariant: 'outline' },
  relokasi: { label: 'Relokasi', badgeVariant: 'outline' },
}

export const tipePaketEnum: EnumMap = {
  reguler: { label: 'Reguler', badgeVariant: 'outline' },
  custom: { label: 'Custom', badgeVariant: 'outline' },
}

export const peranAdminEnum: EnumMap = {
  super_admin: { label: 'Super Admin', badgeVariant: 'outline' },
  operasional: { label: 'Operasional', badgeVariant: 'outline' },
  teknisi: { label: 'Teknisi', badgeVariant: 'outline' },
  keuangan: { label: 'Keuangan', badgeVariant: 'outline' },
}
