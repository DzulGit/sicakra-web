import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { getProfil, ubahProfil } from '../api/profil.api'
import { useAuthStore } from '@/stores/auth.store'
import type { UbahProfilForm } from '@/schemas/profil.schema'

export function useProfil() {
  return useQuery({
    queryKey: ['profil'],
    queryFn: () => getProfil().then((res) => res.data.data),
  })
}

export function useUbahProfil() {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: (payload: UbahProfilForm) => ubahProfil(payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['profil'] })
      // Sinkronkan nama di sesi (dipakai di Topbar) supaya langsung update tanpa reload
      authStore.perbaruiPengguna({ nama_lengkap: data.data.nama_lengkap })
    },
  })
}
