import { z } from 'zod'

export const simpanAdminSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  peran: z.enum(['operasional', 'teknisi', 'keuangan'], { message: 'Pilih peran' }),
})
export type SimpanAdminForm = z.infer<typeof simpanAdminSchema>

export const ubahAdminSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  peran: z.enum(['operasional', 'teknisi', 'keuangan'], { message: 'Pilih peran' }),
})
export type UbahAdminForm = z.infer<typeof ubahAdminSchema>