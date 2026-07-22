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

// app/Http/Requests/PermohonanLayanan/JadwalkanKerjaRequest.php
// GABUNGAN survey+pemasangan — satu jadwal kunjungan, satu form.
export const jadwalkanKerjaSchema = z.object({
  tim_teknisi_id: z.string().optional(),
  teknisi_ids: z.array(z.number()).min(1, 'Pilih minimal 1 teknisi'),
  tanggal_kerja: z.string().min(1, 'Tanggal wajib diisi'),
})
export type JadwalkanKerjaForm = z.infer<typeof jadwalkanKerjaSchema>