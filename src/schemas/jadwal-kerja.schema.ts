import { z } from 'zod'

// app/Http/Requests/PermohonanLayanan/HasilKerjaRequest.php
export const hasilKerjaSchema = z
  .object({
    hasil: z.enum(['selesai', 'kendala'], { message: 'Pilih hasil kunjungan' }),
    catatan_kendala: z.string().optional(),
    foto_dokumentasi: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= 4 * 1024 * 1024, 'Ukuran foto maksimal 4MB')
          .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            'Format foto harus JPG, PNG, atau WEBP',
          ),
      )
      .max(3, 'Maksimal 3 foto')
      .optional(),
    latitude_hasil: z.string().optional(),
    longitude_hasil: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasil === 'selesai') {
      if (!data.foto_dokumentasi?.length) {
        ctx.addIssue({ code: 'custom', path: ['foto_dokumentasi'], message: 'Wajib lampirkan minimal 1 foto dokumentasi' })
      }
      if (!data.latitude_hasil?.trim() || !data.longitude_hasil?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['latitude_hasil'], message: 'Titik koordinat lokasi wajib diisi' })
      }
    } else if (!data.catatan_kendala?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['catatan_kendala'], message: 'Catatan kendala wajib diisi kalau ada kendala' })
    }
  })
export type HasilKerjaForm = z.infer<typeof hasilKerjaSchema>