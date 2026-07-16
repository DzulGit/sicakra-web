import { z } from 'zod'

// app/Http/Requests/Pendaftaran/SimpanPendaftaranRequest.php
export const daftarSchema = z
  .object({
    nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi').max(255),
    nik: z.string().min(1, 'NIK wajib diisi').length(16, 'NIK harus 16 digit'),
    nomor_hp: z.string().min(1, 'Nomor HP wajib diisi').max(20),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),

    alamat_pemasangan: z.string().min(1, 'Alamat wajib diisi'),
    rt: z.string().min(1, 'RT wajib diisi').max(3),
    rw: z.string().min(1, 'RW wajib diisi').max(3),
    kode_pos: z.string().min(1, 'Kode pos wajib diisi').max(5),
    latitude: z.coerce.number().min(-90, 'Latitude tidak valid').max(90, 'Latitude tidak valid'),
    longitude: z.coerce.number().min(-180, 'Longitude tidak valid').max(180, 'Longitude tidak valid'),

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
