import { z } from 'zod'

/**
 * Mirror 1:1 dari app/Http/Requests/Reseller/DaftarkanPelangganRequest.php.
 * Onboarding reseller sengaja DILONGGAKAN vs admin: foto KTP & koordinat
 * GPS opsional (backend menerimanya nullable).
 */
export const daftarkanPelangganSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nomor_hp: z.string().min(1, 'Nomor HP wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),

  alamat_pemasangan: z.string().min(1, 'Alamat pemasangan wajib diisi'),
  detail_alamat: z.string().optional(),
  provinsi: z.string().optional(),
  kota: z.string().optional(),

  tipe_paket: z.enum(['reguler', 'custom']),
  paket_internet_id: z.coerce.number().positive('Pilih paket internet').optional(),
  nama_paket_custom: z.string().optional(),
  kecepatan_custom_mbps: z.coerce.number().positive('Kecepatan harus di atas 0').optional(),
  catatan_custom: z.string().optional(),
})
export type DaftarkanPelangganForm = z.infer<typeof daftarkanPelangganSchema>