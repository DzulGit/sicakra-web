import { z } from 'zod'

export const ubahNamaResellerSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
})
export type UbahNamaResellerForm = z.infer<typeof ubahNamaResellerSchema>

export const mintaEmailResellerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})
export type MintaEmailResellerForm = z.infer<typeof mintaEmailResellerSchema>

export const ubahPasswordResellerSchema = z
  .object({
    password_lama: z.string().min(1, 'Password lama wajib diisi'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  })
export type UbahPasswordResellerForm = z.infer<typeof ubahPasswordResellerSchema>