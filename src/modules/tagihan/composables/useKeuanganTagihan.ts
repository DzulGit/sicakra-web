import { useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { getRingkasanOmzet, getTagihanDetail, getTagihanList, getTagihanSayaDetail, getTagihanSayaList } from '../api/keuanganTagihan.api'

export function useTagihanList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') p[key] = value
    }
    return p
  })

  return useQuery({
    queryKey: ['tagihan', 'keuangan', 'list', params],
    queryFn: () => getTagihanList(params.value).then((res) => res.data.data),
  })
}

export function useTagihanDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['tagihan', 'keuangan', 'detail', id],
    queryFn: () => getTagihanDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useRingkasanOmzet(tahun: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: ['tagihan', 'ringkasan-omzet', tahun],
    queryFn: () => getRingkasanOmzet(toValue(tahun)).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000, // data agregat, tidak perlu refetch se-agresif list biasa
  })
}

// ----- Sisi Pelanggan -----
export function useTagihanSayaList() {
  const route = useRoute()
  const params = computed(() => {
    const p: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') p[key] = value
    }
    return p
  })
  return useQuery({
    queryKey: ['tagihan', 'saya', 'list', params],
    queryFn: () => getTagihanSayaList(params.value).then((res) => res.data.data),
  })
}

export function useTagihanSayaDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['tagihan', 'saya', 'detail', id],
    queryFn: () => getTagihanSayaDetail(toValue(id)).then((res) => res.data.data),
  })
}
