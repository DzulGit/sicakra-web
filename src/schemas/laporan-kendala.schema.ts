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
  foto: z
  .array(
    z
      .instanceof(File, { message: 'Berkas foto tidak valid' })
      .refine((file) => file.size <= 4 * 1024 * 1024, 'Ukuran foto maksimal 4MB')
      .refine(
        (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
        'Format foto harus JPG, PNG, atau WEBP',
      )
  )
  .max(3, 'Maksimal 3 foto')
  .optional(),
})
export type BuatLaporanForm = z.infer<typeof buatLaporanSchema>

export const tindakLanjutLaporanSchema = z.object({
  keputusan: z.enum(['SELESAI_REMOTE', 'TERUSKAN_TEKNISI']),
  teknisi_ids: z.array(z.number()).optional(),
  tim_teknisi_id: z.string().optional(),
  tanggal_kerja: z.string().optional(),
  hasil_penanganan: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.keputusan === 'SELESAI_REMOTE' && !data.hasil_penanganan?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Hasil penanganan wajib diisi', path: ['hasil_penanganan'] })
  }
  if (data.keputusan === 'TERUSKAN_TEKNISI') {
    if (!data.teknisi_ids?.length) {
      ctx.addIssue({ code: 'custom', message: 'Pilih minimal 1 teknisi', path: ['teknisi_ids'] })
    }
    if (!data.tanggal_kerja) {
      ctx.addIssue({ code: 'custom', message: 'Tanggal kunjungan wajib diisi', path: ['tanggal_kerja'] })
    }
  }
})
export type TindakLanjutLaporanForm = z.infer<typeof tindakLanjutLaporanSchema>