import { z } from 'zod'

// app/Http/Requests/PermohonanLayanan/HasilSurveyRequest.php
export const hasilSurveySchema = z
  .object({
    hasil: z.enum(['berhasil', 'kendala'], { message: 'Pilih hasil survey' }),
    catatan: z.string().optional(),
  })
  .refine((data) => data.hasil === 'berhasil' || !!data.catatan?.trim(), {
    message: 'Catatan wajib diisi kalau hasil Kendala',
    path: ['catatan'],
  })
export type HasilSurveyForm = z.infer<typeof hasilSurveySchema>

// app/Http/Requests/PermohonanLayanan/HasilPemasanganRequest.php
export const hasilPemasanganSchema = z
  .object({
    hasil: z.enum(['selesai', 'ditunda'], { message: 'Pilih hasil pemasangan' }),
    alasan_penundaan: z.string().optional(),
  })
  .refine((data) => data.hasil === 'selesai' || !!data.alasan_penundaan?.trim(), {
    message: 'Alasan penundaan wajib diisi kalau hasil Ditunda',
    path: ['alasan_penundaan'],
  })
export type HasilPemasanganForm = z.infer<typeof hasilPemasanganSchema>
