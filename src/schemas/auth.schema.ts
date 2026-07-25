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