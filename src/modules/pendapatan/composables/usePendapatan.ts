import { useQuery } from '@tanstack/vue-query'
import { useRoute, type LocationQueryValue } from 'vue-router'
import { computed } from 'vue'
import { getPendapatan, type PendapatanFilterParams } from '../api/pendapatan.api'

function parseIntArray(raw: LocationQueryValue | LocationQueryValue[] | undefined): number[] {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : [raw]
  return arr.map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 12)
}

function parsePelangganIds(raw: LocationQueryValue | LocationQueryValue[] | undefined): number[] {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : [raw]
  return arr.map(Number).filter((n) => !isNaN(n) && n > 0)
}

export function usePendapatan() {
  const route = useRoute()
  const params = computed<PendapatanFilterParams>(() => {
    const q = route.query
    const p: PendapatanFilterParams = {}

    if (typeof q.tahun === 'string') p.tahun = q.tahun

    const bulanList = parseIntArray(q.bulan)
    if (bulanList.length > 0) p.bulan = bulanList

    const pelangganIds = parsePelangganIds(q.pelanggan_ids)
    if (pelangganIds.length > 0) p.pelanggan_ids = pelangganIds

    return p
  })

  return useQuery({
    queryKey: ['pendapatan', params],
    queryFn: () => getPendapatan(params.value).then((res) => res.data.data),
  })
}
