import { z } from 'zod'

// app/Http/Requests/Pelanggan/UbahProfilRequest.php
export const ubahProfilSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
})
export type UbahProfilForm = z.infer<typeof ubahProfilSchema>
