import { z } from 'zod'

// app/Http/Requests/Operasional/SimpanResellerRequest.php
export const simpanResellerSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})
export type SimpanResellerForm = z.infer<typeof simpanResellerSchema>