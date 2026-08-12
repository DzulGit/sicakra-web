import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getPelangganDetail,
  getPelangganList,
  resetAkunPelanggan,
} from '../api/pelanggan.api'

function useFilterParams() {
  const route = useRoute()
  return computed(() => {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') params[key] = value
    }
    return params
  })
}

export function usePelangganList() {
  const params = useFilterParams()

  return useQuery({
    queryKey: ['pelanggan', 'list', params],
    queryFn: () => getPelangganList(params.value).then((res) => res.data.data),
  })
}

export function usePelangganDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['pelanggan', 'detail', id],
    queryFn: () => getPelangganDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useResetAkun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => resetAkunPelanggan(id).then((res) => res.data.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'list'] })
    },
  })
}
