import { z } from 'zod'

// app/Http/Requests/PermohonanLayanan/VerifikasiPermohonanRequest.php
export const verifikasiPermohonanSchema = z
  .object({
    status: z.enum(['DITERIMA', 'PERLU_REVISI', 'DITOLAK'], {
      message: 'Pilih keputusan verifikasi',
    }),
    catatan: z.string().optional(),
    harga_custom: z.coerce.number().min(0).optional(),
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

// app/Http/Requests/PermohonanLayanan/VerifikasiDanJadwalkanRequest.php
// Khusus pemasangan_baru — verifikasi + jadwalkan dalam satu langkah.
export const verifikasiDanJadwalkanSchema = z
  .object({
    status: z.enum(['DITERIMA', 'PERLU_REVISI', 'DITOLAK'], {
      message: 'Pilih keputusan verifikasi',
    }),
    catatan: z.string().optional(),
    tanggal_kerja: z.string().optional(),
    teknisi_ids: z.array(z.number()).optional(),
    tim_teknisi_id: z.string().optional(),
    tipe_paket: z.string().optional(), // Bantuan deteksi dari UI
    harga_custom: z.coerce.number().min(1, 'Harga wajib diisi').optional(), // Input harga khusus custom
  })
  .superRefine((data, ctx) => {
    if (data.status !== 'DITERIMA' && !data.catatan?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Catatan wajib diisi untuk Tolak / Perlu Revisi', path: ['catatan'] })
    }
    if (data.status === 'DITERIMA') {
      if (!data.tanggal_kerja) {
        ctx.addIssue({ code: 'custom', message: 'Tanggal kerja wajib diisi', path: ['tanggal_kerja'] })
      }
      if (!data.teknisi_ids?.length) {
        ctx.addIssue({ code: 'custom', message: 'Pilih minimal 1 teknisi', path: ['teknisi_ids'] })
      }
      // Wajibkan pengisian harga jika paket yang disetujui adalah custom
      if (data.tipe_paket === 'custom' && !data.harga_custom) {
        ctx.addIssue({ code: 'custom', message: 'Harga kesepakatan wajib diisi untuk paket custom', path: ['harga_custom'] })
      }
    }
  })
export type VerifikasiDanJadwalkanForm = z.infer<typeof verifikasiDanJadwalkanSchema>

export const jadwalkanSurveySchema = z.object({
  admin_id: z.string().min(1, 'Teknisi wajib dipilih'),
  tanggal_survey: z.string().min(1, 'Tanggal survey wajib diisi'),
})
export type JadwalkanSurveyForm = z.infer<typeof jadwalkanSurveySchema>