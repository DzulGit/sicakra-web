import { z } from 'zod'

// app/Http/Requests/PermohonanLayanan/HasilKerjaRequest.php
export const hasilKerjaSchema = z
  .object({
    hasil: z.enum(['selesai', 'kendala'], { message: 'Pilih hasil kunjungan' }),
    catatan_kendala: z.string().optional(),
  })
  .refine((data) => data.hasil === 'selesai' || !!data.catatan_kendala?.trim(), {
    message: 'Catatan kendala wajib diisi kalau ada kendala',
    path: ['catatan_kendala'],
  })
export type HasilKerjaForm = z.infer<typeof hasilKerjaSchema>