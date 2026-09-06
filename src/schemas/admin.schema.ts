import { z } from 'zod'

export const simpanAdminSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  peran: z.enum(['operasional', 'teknisi', 'keuangan'], { message: 'Pilih peran' }),
})
export type SimpanAdminForm = z.infer<typeof simpanAdminSchema>

export const ubahAdminSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi').max(255, 'Nama lengkap maksimal 255 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password_lama: z.string().optional(),
  password_baru: z.string().min(8, 'Password minimal 8 karakter').optional().or(z.literal('')),
}).refine((data) => !data.password_baru || !!data.password_lama, {
  message: 'Password lama wajib diisi jika ingin mengganti password',
  path: ['password_lama'],
})
export type UbahAdminForm = z.infer<typeof ubahAdminSchema>