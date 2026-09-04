import { z } from 'zod'

/**
 * Schema untuk form "Buat Pelanggan Baru" (Admin Operasional).
 * Sama dengan daftarSchema tapi foto_ktp & foto_selfie_ktp opsional
 * (admin bisa upload nanti atau belum punya file).
 */
export const buatPelangganSchema = z
  .object({
    nama_lengkap: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(1, 'Nama lengkap wajib diisi').max(255),
    nik: z.string({ required_error: 'NIK wajib diisi' }).length(16, 'NIK harus 16 digit'),
    nomor_hp: z.string({ required_error: 'Nomor HP wajib diisi' }).min(1, 'Nomor HP wajib diisi').max(20),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),

    alamat_pemasangan: z.string({ required_error: 'Alamat wajib diisi' }).min(1, 'Alamat wajib diisi'),
    detail_alamat: z.string().optional(),
    provinsi: z.string().optional(),
    kota: z.string().optional(),
    latitude: z.number({ required_error: 'Pilih lokasi di peta' }).min(-90, 'Latitude tidak valid').max(90, 'Latitude tidak valid'),
    longitude: z.number({ required_error: 'Pilih lokasi di peta' }).min(-180, 'Longitude tidak valid').max(180, 'Longitude tidak valid'),

    tipe_paket: z.enum(['reguler', 'custom'], { message: 'Pilih tipe paket' }),
    paket_internet_id: z.string().optional(),
    nama_paket_custom: z.string().optional(),
    kecepatan_custom_mbps: z.coerce.number().optional(),
    catatan_custom: z.string().optional(),

    foto_ktp: z
      .instanceof(File, { message: 'Foto KTP harus berupa berkas' })
      .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB')
      .optional(),
    foto_selfie_ktp: z
      .instanceof(File, { message: 'Foto selfie harus berupa berkas' })
      .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB')
      .optional(),
  })
  .refine((data) => data.tipe_paket !== 'reguler' || !!data.paket_internet_id, {
    message: 'Pilih salah satu paket',
    path: ['paket_internet_id'],
  })
  .refine((data) => data.tipe_paket !== 'custom' || !!data.nama_paket_custom?.trim(), {
    message: 'Nama paket custom wajib diisi',
    path: ['nama_paket_custom'],
  })
  .refine((data) => data.tipe_paket !== 'custom' || !!data.kecepatan_custom_mbps, {
    message: 'Perkiraan kecepatan wajib diisi',
    path: ['kecepatan_custom_mbps'],
  })

export type BuatPelangganForm = z.infer<typeof buatPelangganSchema>
