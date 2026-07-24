import { useMutation, useQuery } from '@tanstack/vue-query'
import {
  buatPasswordPelanggan,
  getProfilPelanggan,
  loginPelanggan,
  loginPertamaPelanggan,
  logoutPelanggan,
} from '../api/pelangganAuth.api'

export function useLoginPertamaPelanggan() {
  return useMutation({ mutationFn: loginPertamaPelanggan })
}

// Dipakai di dashboard untuk cek status password_sudah_dibuat dari sumber
// data yang benar (tabel pelanggan), bukan dari response login.
export function useProfilPelanggan() {
  return useQuery({
    queryKey: ['pelanggan', 'profil'],
    queryFn: async () => {
      const { data } = await getProfilPelanggan()
      return data.data
    },
  })
}

export function useLoginPelanggan() {
  return useMutation({ mutationFn: loginPelanggan })
}

export function useBuatPasswordPelanggan() {
  return useMutation({ mutationFn: buatPasswordPelanggan })
}

export function useLogoutPelanggan() {
  return useMutation({ mutationFn: logoutPelanggan })
}