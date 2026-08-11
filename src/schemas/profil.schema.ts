import { z } from 'zod'

// app/Http/Requests/Pelanggan/UbahProfilRequest.php
export const ubahProfilSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
})
export type UbahProfilForm = z.infer<typeof ubahProfilSchema>

// app/Http/Requests/Pelanggan/UbahUsernameRequest.php
export const ubahUsernameSchema = z.object({
  username: z
    .string()
    .min(4, 'Username minimal 4 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username hanya boleh huruf, angka, titik, dan underscore'),
})
export type UbahUsernameForm = z.infer<typeof ubahUsernameSchema>

/**
 * app/Http/Requests/Pelanggan/UbahPasswordRequest.php
 *
 * Kondisional: kalau pelanggan sudah pernah membuat password sendiri
 * (password_sudah_dibuat === true), password_lama WAJIB diisi dan divalidasi
 * backend. Kalau belum pernah (masih pakai password default = nomor
 * pelanggan), password_lama TIDAK perlu diminta di form sama sekali.
 *
 * Dibuat sebagai function (bukan objek statis) karena kondisinya baru
 * diketahui saat runtime (dari data profil yang sedang dimuat).
 */
export function buatUbahPasswordSchema(wajibPasswordLama: boolean) {
  return z
    .object({
      password_lama: wajibPasswordLama
        ? z.string().min(1, 'Password lama wajib diisi')
        : z.string().optional(),
      password: z.string().min(8, 'Password minimal 8 karakter'),
      password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'Konfirmasi password tidak cocok',
      path: ['password_confirmation'],
    })
}
export type UbahPasswordForm = {
  password_lama?: string
  password: string
  password_confirmation: string
}

export const ubahFotoProfilSchema = z.object({
  foto: z.instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Format foto harus JPG atau PNG'
    )
})