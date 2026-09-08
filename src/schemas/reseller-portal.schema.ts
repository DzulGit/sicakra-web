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

  paket_internet_id: z
    .coerce
    .number()
    .positive('Pilih paket internet'),
})

export type DaftarkanPelangganForm = z.infer<
  typeof daftarkanPelangganSchema
>