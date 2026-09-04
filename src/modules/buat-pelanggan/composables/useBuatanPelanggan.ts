import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { buatPelangganBaru } from '../api/buatPelanggan.api'
import type { BuatPelangganForm } from '@/schemas/buat-pelanggan.schema'

export function useBuatanPelanggan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BuatPelangganForm) => buatPelangganBaru(payload).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan'] })
    },
  })
}
