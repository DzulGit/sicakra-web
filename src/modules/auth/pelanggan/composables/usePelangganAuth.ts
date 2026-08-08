import { useMutation } from '@tanstack/vue-query'
import { loginPelanggan, logoutPelanggan, lupaPasswordPelanggan, resetPasswordPelanggan } from '../api/pelangganAuth.api'

export function useLoginPelanggan() {
  return useMutation({ mutationFn: loginPelanggan })
}

export function useLogoutPelanggan() {
  return useMutation({ mutationFn: logoutPelanggan })
}

export function useLupaPasswordPelanggan() {
  return useMutation({ mutationFn: lupaPasswordPelanggan })
}

export function useResetPasswordPelanggan() {
  return useMutation({ mutationFn: resetPasswordPelanggan })
}