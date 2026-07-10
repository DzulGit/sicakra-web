import { z } from 'zod'

// app/Http/Requests/PermohonanLayanan/VerifikasiPermohonanRequest.php
export const verifikasiPermohonanSchema = z
  .object({
    status: z.enum(['DITERIMA', 'PERLU_REVISI', 'DITOLAK'], {
      message: 'Pilih keputusan verifikasi',
    }),
    catatan: z.string().optional(),
  })
  .refine((data) => data.status === 'DITERIMA' || !!data.catatan?.trim(), {
    message: 'Catatan wajib diisi untuk Tolak / Perlu Revisi',
    path: ['catatan'],
  })
export type VerifikasiPermohonanForm = z.infer<typeof verifikasiPermohonanSchema>

// app/Http/Requests/PermohonanLayanan/JadwalkanSurveyRequest.php
export const jadwalkanSurveySchema = z.object({
  admin_id: z.string().min(1, 'Pilih teknisi'),
  tanggal_survey: z.string().min(1, 'Tanggal wajib diisi'),
})
export type JadwalkanSurveyForm = z.infer<typeof jadwalkanSurveySchema>

// app/Http/Requests/PermohonanLayanan/JadwalkanPemasanganRequest.php
export const jadwalkanPemasanganSchema = z.object({
  admin_id: z.string().min(1, 'Pilih teknisi'),
  tanggal_pemasangan: z.string().min(1, 'Tanggal wajib diisi'),
})
export type JadwalkanPemasanganForm = z.infer<typeof jadwalkanPemasanganSchema>
