import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getAdminDetail,
  getAdminList,
  nonaktifkanAdmin,
  simpanAdmin,
  ubahAdmin,
} from '../api/superAdminAdmin.api'
import type { SimpanAdminForm, UbahAdminForm } from '@/schemas/admin.schema'

export function useAdminList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') p[key] = value
    }
    return p
  })
  return useQuery({
    queryKey: ['admin', 'super-admin', 'list', params],
    queryFn: () => getAdminList(params.value).then((res) => res.data.data),
  })
}

export function useAdminDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['admin', 'super-admin', 'detail', id],
    queryFn: () => getAdminDetail(toValue(id)).then((res) => res.data.data),
  })
}

function useInvalidasiAdmin() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'super-admin'] })
}

export function useSimpanAdmin() {
  const invalidasi = useInvalidasiAdmin()
  return useMutation({
    mutationFn: (payload: SimpanAdminForm) => simpanAdmin(payload),
    onSuccess: invalidasi,
  })
}

export function useUbahAdmin() {
  const invalidasi = useInvalidasiAdmin()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UbahAdminForm }) =>
      ubahAdmin(id, payload),
    onSuccess: invalidasi,
  })
}

export function useNonaktifkanAdmin() {
  const invalidasi = useInvalidasiAdmin()
  return useMutation({
    mutationFn: (id: number | string) => nonaktifkanAdmin(id),
    onSuccess: invalidasi,
  })
}
