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

// app/Http/Requests/Auth/LoginPertamaPelangganRequest.php
export const loginPertamaPelangganSchema = z.object({
  nomor_pelanggan: z.string().min(1, 'Nomor pelanggan wajib diisi'),
  nomor_hp: z.string().min(1, 'Nomor HP wajib diisi'),
})
export type LoginPertamaPelangganForm = z.infer<typeof loginPertamaPelangganSchema>

// app/Http/Requests/Auth/LoginPelangganRequest.php
export const loginPelangganSchema = z.object({
  nomor_pelanggan: z.string().min(1, 'Nomor pelanggan wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginPelangganForm = z.infer<typeof loginPelangganSchema>

// app/Http/Requests/Auth/BuatPasswordPelangganRequest.php
export const buatPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  })
export type BuatPasswordForm = z.infer<typeof buatPasswordSchema>
