import { useMutation } from '@tanstack/vue-query'
import { daftar } from '../api/pendaftaran.api'

export function useDaftar() {
  return useMutation({ mutationFn: daftar })
}
