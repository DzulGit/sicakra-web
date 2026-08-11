import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { getNotifikasiList, tandaiDibaca, tandaiSemuaDibaca } from '../api/notifikasi.api'

export function useNotifikasiList() {
  return useQuery({
    queryKey: ['notifikasi', 'list'],
    queryFn: () => getNotifikasiList().then((res) => res.data),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  })
}

export function useTandaiDibaca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tandaiDibaca(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifikasi'] }),
  })
}

export function useTandaiSemuaDibaca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tandaiSemuaDibaca(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifikasi'] }),
  })
}