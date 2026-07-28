import { z } from 'zod'

export const simpanPaketInternetSchema = z.object({
  nama_paket: z.string().min(1, 'Nama paket wajib diisi'),
  kecepatan_mbps: z.coerce.number().int().min(1, 'Kecepatan minimal 1 Mbps'),
  harga: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  jumlah_perangkat: z.coerce.number().int().min(1, 'Minimal 1 perangkat').max(255).optional().default(5),
  deskripsi: z.string().optional().default(''),
  status_aktif: z.boolean().optional().default(true),
})
export type SimpanPaketInternetForm = z.infer<typeof simpanPaketInternetSchema>

export const ubahPaketInternetSchema = z.object({
  nama_paket: z.string().min(1, 'Nama paket wajib diisi'),
  kecepatan_mbps: z.coerce.number().int().min(1, 'Kecepatan minimal 1 Mbps'),
  harga: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  jumlah_perangkat: z.coerce.number().int().min(1, 'Minimal 1 perangkat').max(255).optional().default(5),
  deskripsi: z.string().optional().default(''),
  status_aktif: z.boolean(),
})
export type UbahPaketInternetForm = z.infer<typeof ubahPaketInternetSchema>
