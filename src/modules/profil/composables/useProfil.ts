import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { getProfil, ubahProfil, ubahUsername, ubahPassword } from '../api/profil.api'
import { useAuthStore } from '@/stores/auth.store'
import type { UbahProfilForm, UbahUsernameForm, UbahPasswordForm } from '@/schemas/profil.schema'

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

export function useUbahUsername() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UbahUsernameForm) => ubahUsername(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profil'] })
    },
  })
}

export function useUbahPassword() {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: (payload: UbahPasswordForm) => ubahPassword(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profil'] })
      // Setelah ganti password, password_sudah_dibuat pasti true —
      // update sesi lokal supaya banner di dashboard langsung hilang
      // tanpa perlu refetch/reload.
      authStore.perbaruiPengguna({ password_sudah_dibuat: true })
    },
  })
}