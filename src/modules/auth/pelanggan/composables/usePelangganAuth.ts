import { useMutation } from '@tanstack/vue-query'
import { loginPelanggan, logoutPelanggan } from '../api/pelangganAuth.api'

export function useLoginPelanggan() {
  return useMutation({ mutationFn: loginPelanggan })
}

export function useLogoutPelanggan() {
  return useMutation({ mutationFn: logoutPelanggan })
}