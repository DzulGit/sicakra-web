import { z } from 'zod'

export const buatPermohonanPelangganSchema = z.object({
  jenis_permohonan: z.enum(['tambah_paket', 'ganti_paket', 'relokasi']),
  layanan_internet_id: z.number({ required_error: 'Pilih layanan' }),
  paket_internet_id: z.number().optional(),
  alasan: z.string().optional(),

  alamat_pemasangan: z.string().optional(),
  detail_alamat: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type BuatPermohonanPelangganForm = z.infer<typeof buatPermohonanPelangganSchema>
