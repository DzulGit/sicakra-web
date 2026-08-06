import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  bayarTagihan,
  bayarTunaiTagihan,
  generateTagihanManual,
  getRingkasanOmzet,
  getTagihanDetail,
  getTagihanList,
  getTagihanSayaDetail,
  getTagihanSayaList,
  regenerateInvoice,
  regenerateTagihan,
} from '../api/keuanganTagihan.api'

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

export function useGenerateTagihanManual() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pelangganId }: { pelangganId: number | string }) =>
      generateTagihanManual(pelangganId).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'keuangan', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail'] })
    },
  })
}

export function useRegenerateTagihan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, jumlahBulan }: { id: number | string; jumlahBulan: number }) =>
      regenerateTagihan(id, jumlahBulan).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'keuangan', 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'keuangan', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail'] })
    },
  })
}

export function useBayarTunaiTagihan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, jumlahBulan }: { id: number | string; jumlahBulan: number }) =>
      bayarTunaiTagihan(id, jumlahBulan).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'keuangan', 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'keuangan', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['pelanggan', 'detail'] })
    },
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

export function useBayarTagihan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, jumlahBulan }: { id: number | string; jumlahBulan?: number }) =>
      bayarTagihan(id, jumlahBulan).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'saya', 'detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'saya', 'list'] })
    },
  })
}

export function useRegenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => regenerateInvoice(id).then((res) => res.data.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'saya', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['tagihan', 'saya', 'list'] })
    },
  })
}
