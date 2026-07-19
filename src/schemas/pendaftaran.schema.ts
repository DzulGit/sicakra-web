import { z } from 'zod'

// app/Http/Requests/Pendaftaran/SimpanPendaftaranRequest.php
//
// PENTING: pakai z.string({ required_error: '...' }).min(1, '...') — BUKAN
// cuma z.string().min(1, '...'). Kalau field belum pernah disentuh user,
// value-nya `undefined` (bukan ''), dan .min() TIDAK menangkap kasus itu —
// Zod jatuh ke pesan default bahasa Inggris ("Required") sebelum .min()
// sempat jalan. required_error menutup celah itu.
export const daftarSchema = z
  .object({
    nama_lengkap: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(1, 'Nama lengkap wajib diisi').max(255),
    nik: z.string({ required_error: 'NIK wajib diisi' }).length(16, 'NIK harus 16 digit'),
    nomor_hp: z.string({ required_error: 'Nomor HP wajib diisi' }).min(1, 'Nomor HP wajib diisi').max(20),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),

    alamat_pemasangan: z.string({ required_error: 'Alamat wajib diisi' }).min(1, 'Alamat wajib diisi'),
    rt: z.string({ required_error: 'RT wajib diisi' }).min(1, 'RT wajib diisi').max(3),
    rw: z.string({ required_error: 'RW wajib diisi' }).min(1, 'RW wajib diisi').max(3),
    kode_pos: z.string({ required_error: 'Kode pos wajib diisi' }).min(1, 'Kode pos wajib diisi').max(5),
    // z.coerce.number() pada input kosong ('') akan jadi NaN SEBELUM .min/.max
    // custom message sempat jalan — makanya perlu .refine() manual bukan cuma .min/.max
    // buat mastiin pesan yang muncul selalu yang kita tulis, bukan default Zod.
    latitude: z
      .string({ required_error: 'Latitude wajib diisi' })
      .min(1, 'Latitude wajib diisi')
      .pipe(z.coerce.number().refine((n) => n >= -90 && n <= 90, 'Latitude tidak valid')),
    longitude: z
      .string({ required_error: 'Longitude wajib diisi' })
      .min(1, 'Longitude wajib diisi')
      .pipe(z.coerce.number().refine((n) => n >= -180 && n <= 180, 'Longitude tidak valid')),

    tipe_paket: z.enum(['reguler', 'custom'], { message: 'Pilih tipe paket' }),
    paket_internet_id: z.string().optional(),
    nama_paket_custom: z.string().optional(),
    kecepatan_custom_mbps: z.coerce.number().optional(),
    catatan_custom: z.string().optional(),

    foto_ktp: z
      .instanceof(File, { message: 'Foto KTP wajib diunggah' })
      .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB'),
    foto_selfie_ktp: z
      .instanceof(File, { message: 'Foto selfie dengan KTP wajib diunggah' })
      .refine((f) => f.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB'),
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

export type DaftarForm = z.infer<typeof daftarSchema>
