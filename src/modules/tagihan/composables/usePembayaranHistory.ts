import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute } from 'vue-router'
import {
  pembayaranAdminApi,
  pembayaranResellerApi,
} from '../api/pembayaranHistory.api'

type Scope = 'admin' | 'reseller'

function apiUntuk(scope: Scope) {
  return scope === 'admin' ? pembayaranAdminApi : pembayaranResellerApi
}

export function useRiwayatPembayaranAdmin(scope: Scope) {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') p[key] = value
    }
    return p
  })

  const api = apiUntuk(scope)

  return useQuery({
    queryKey: ['pembayaran', scope, 'list', params],
    queryFn: () => api.list(params.value).then((res) => res.data),
  })
}

export function useDetailPembayaranAdmin(scope: Scope, id: MaybeRefOrGetter<number | string>) {
  const api = apiUntuk(scope)

  return useQuery({
    queryKey: ['pembayaran', scope, 'detail', id],
    queryFn: () => api.detail(toValue(id)).then((res) => res.data.data),
  })
}

export function useSaldoKreditAdmin(scope: Scope, pelangganId: MaybeRefOrGetter<number | string>) {
  const api = apiUntuk(scope)

  return useQuery({
    queryKey: ['pembayaran', scope, 'saldo-kredit', pelangganId],
    queryFn: () => api.saldoKredit(toValue(pelangganId)).then((res) => res.data.data),
  })
}