import { z } from 'zod'

export const daftarkanPelangganSchema = z.object({
  nama_lengkap: z
    .string()
    .min(1, 'Nama lengkap wajib diisi'),

  nik: z
    .string()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),

  nomor_hp: z
    .string()
    .min(1, 'Nomor HP wajib diisi'),

  email: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),

  alamat_pemasangan: z
    .string()
    .min(1, 'Alamat pemasangan wajib diisi'),

  detail_alamat: z
    .string()
    .optional(),

  provinsi: z
    .string()
    .optional(),

  kota: z
    .string()
    .optional(),

  latitude: z
    .coerce
    .number()
    .min(-90, 'Pilih lokasi di peta')
    .max(90, 'Pilih lokasi di peta'),

  longitude: z
    .coerce
    .number()
    .min(-180, 'Pilih lokasi di peta')
    .max(180, 'Pilih lokasi di peta'),

  paket_internet_id: z
    .coerce
    .number()
    .positive('Pilih paket internet'),

  foto_ktp: z
    .instanceof(File, { message: 'Foto KTP wajib diunggah' })
    .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB'),
  foto_selfie_ktp: z
    .instanceof(File, { message: 'Foto selfie wajib berupa berkas' })
    .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB')
    .optional(),
})

export type DaftarkanPelangganForm = z.infer<
  typeof daftarkanPelangganSchema
>

// ===== Permohonan Layanan (reseller) =====

export const buatPermohonanResellerSchema = z
  .object({
    jenis_permohonan: z.enum(['relokasi', 'ganti_paket', 'tambah_paket'], {
      message: 'Pilih jenis permohonan',
    }),
    pelanggan_id: z.coerce.number().positive('Pilih pelanggan'),
    layanan_internet_id: z.coerce.number().positive('Pilih layanan'),
    tipe_paket: z.enum(['reguler', 'custom']).default('reguler'),
    paket_internet_id: z.coerce.number().positive('Pilih paket').optional(),
    nama_paket_custom: z.string().optional(),
    kecepatan_custom_mbps: z.coerce.number().min(1, 'Kecepatan minimal 1').optional(),
    harga_custom: z.coerce.number().min(1, 'Harga wajib diisi').optional(),
    catatan_custom: z.string().optional(),
    alasan: z.string().optional(),
    alamat_pemasangan: z.string().optional(),
    detail_alamat: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const gantiTambah = data.jenis_permohonan === 'ganti_paket' || data.jenis_permohonan === 'tambah_paket'
    if (data.tipe_paket === 'custom' && gantiTambah) {
      if (!data.nama_paket_custom?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Nama paket custom wajib diisi', path: ['nama_paket_custom'] })
      }
      if (!data.kecepatan_custom_mbps) {
        ctx.addIssue({ code: 'custom', message: 'Kecepatan custom wajib diisi', path: ['kecepatan_custom_mbps'] })
      }
      if (!data.harga_custom) {
        ctx.addIssue({ code: 'custom', message: 'Harga custom wajib diisi', path: ['harga_custom'] })
      }
    } else if (gantiTambah && !data.paket_internet_id) {
      ctx.addIssue({ code: 'custom', message: 'Pilih paket', path: ['paket_internet_id'] })
    }
    if (data.jenis_permohonan === 'relokasi' && !data.alamat_pemasangan?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Alamat baru wajib diisi', path: ['alamat_pemasangan'] })
    }
  })
export type BuatPermohonanResellerForm = z.infer<typeof buatPermohonanResellerSchema>

// app/Http/Requests/Reseller/VerifikasiDanJadwalkanResellerRequest.php
export const verifikasiResellerSchema = z
  .object({
    status: z.enum(['DITERIMA', 'PERLU_REVISI', 'DITOLAK'], {
      message: 'Pilih keputusan verifikasi',
    }),
    catatan: z.string().optional(),
    harga_custom: z.coerce.number().min(1, 'Harga wajib diisi').optional(),
  })
  .refine((data) => data.status === 'DITERIMA' || !!data.catatan?.trim(), {
    message: 'Catatan wajib diisi untuk Tolak / Perlu Revisi',
    path: ['catatan'],
  })
export type VerifikasiResellerForm = z.infer<typeof verifikasiResellerSchema>