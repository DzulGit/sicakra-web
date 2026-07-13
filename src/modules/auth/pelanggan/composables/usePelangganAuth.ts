import { useMutation } from '@tanstack/vue-query'
import {
  buatPasswordPelanggan,
  loginPelanggan,
  loginPertamaPelanggan,
  logoutPelanggan,
} from '../api/pelangganAuth.api'

export function useLoginPertamaPelanggan() {
  return useMutation({ mutationFn: loginPertamaPelanggan })
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
