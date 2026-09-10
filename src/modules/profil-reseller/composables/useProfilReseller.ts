import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  getProfilReseller,
  ubahNamaReseller,
  mintaUbahEmailReseller,
  batalUbahEmailReseller,
  ubahPasswordReseller,
  ubahFotoReseller,
  type UbahPasswordResellerForm,
} from '../api/profilReseller.api'
import { useAuthStore } from '@/stores/auth.store'

export function useProfilReseller() {
  return useQuery({
    queryKey: ['profil-reseller'],
    queryFn: () => getProfilReseller().then((res) => res.data.data),
  })
}

export function useUbahNamaReseller() {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: (payload: { nama_lengkap: string }) => ubahNamaReseller(payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['profil-reseller'] })
      authStore.perbaruiPengguna({ nama_lengkap: data.data.nama_lengkap })
    },
  })
}

export function useMintaUbahEmailReseller() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { email: string }) => mintaUbahEmailReseller(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil-reseller'] }),
  })
}

export function useBatalUbahEmailReseller() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batalUbahEmailReseller,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil-reseller'] }),
  })
}

export function useUbahPasswordReseller() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UbahPasswordResellerForm) => ubahPasswordReseller(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profil-reseller'] }),
  })
}

export function useUbahFotoReseller() {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: (payload: FormData) => ubahFotoReseller(payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['profil-reseller'] })
      authStore.perbaruiPengguna({ foto_profil: data.data.foto_profil })
    },
  })
}