import { z } from 'zod'

export const teruskanKeTeknisiSchema = z.object({
  teknisi_id: z.string().min(1, 'Pilih teknisi'),
})
export type TeruskanKeTeknisiForm = z.infer<typeof teruskanKeTeknisiSchema>

export const selesaikanLaporanSchema = z.object({
  hasil_penanganan: z.string().min(1, 'Hasil penanganan wajib diisi'),
})
export type SelesaikanLaporanForm = z.infer<typeof selesaikanLaporanSchema>

export const buatLaporanSchema = z.object({
  layanan_internet_id: z.string().min(1, 'Pilih layanan'),
  kategori_kendala: z.string().min(1, 'Kategori wajib diisi'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
})
export type BuatLaporanForm = z.infer<typeof buatLaporanSchema>