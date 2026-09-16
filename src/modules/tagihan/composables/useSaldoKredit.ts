import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  saldoKreditAdminApi,
  saldoKreditResellerApi,
} from '../api/saldoKredit.api'

type Scope = 'admin' | 'reseller'

function apiUntuk(scope: Scope) {
  return scope === 'admin' ? saldoKreditAdminApi : saldoKreditResellerApi
}

export function useSaldoKreditAdmin(scope: Scope, pelangganId: MaybeRefOrGetter<number | string>) {
  const api = apiUntuk(scope)

  return useQuery({
    queryKey: ['saldo-kredit', scope, pelangganId],
    queryFn: () => api.saldoKredit(toValue(pelangganId)).then((res) => res.data.data),
  })
}