import { z } from 'zod'

// app/Http/Requests/SuperAdmin/SimpanTimTeknisiRequest.php
export const simpanTimTeknisiSchema = z.object({
  nama_tim: z.string().min(1, 'Nama tim wajib diisi'),
  anggota_ids: z.array(z.number()).min(1, 'Pilih minimal 1 anggota'),
})
export type SimpanTimTeknisiForm = z.infer<typeof simpanTimTeknisiSchema>

// app/Http/Requests/SuperAdmin/UbahTimTeknisiRequest.php
export const ubahTimTeknisiSchema = z.object({
  nama_tim: z.string().min(1, 'Nama tim wajib diisi'),
  anggota_ids: z.array(z.number()).min(1, 'Pilih minimal 1 anggota'),
  status_aktif: z.boolean(),
})
export type UbahTimTeknisiForm = z.infer<typeof ubahTimTeknisiSchema>