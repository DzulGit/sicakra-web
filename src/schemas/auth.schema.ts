import { z } from 'zod'

/**
 * Mirror 1:1 dari Laravel Form Request terkait — lihat forms-validation.md.
 * app/Http/Requests/Auth/LoginAdminRequest.php
 */
export const loginAdminSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginAdminForm = z.infer<typeof loginAdminSchema>

// app/Http/Requests/Auth/LoginPelangganRequest.php
export const loginPelangganSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginPelangganForm = z.infer<typeof loginPelangganSchema>

// app/Http/Requests/Auth/LupaPasswordPelangganRequest.php
export const lupaPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
})
export type LupaPasswordForm = z.infer<typeof lupaPasswordSchema>

// app/Http/Requests/Auth/ResetPasswordPelangganRequest.php
export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  token: z.string().min(1, 'Token tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
})
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>