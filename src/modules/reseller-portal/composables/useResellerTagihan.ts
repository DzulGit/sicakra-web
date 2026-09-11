import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
    getResellerPendaftarBaru,
    previewResellerTagihanPertama,
    generateResellerTagihanPertama,
    getResellerTagihanList,
    getResellerTagihanDetail,
    perbaruiLinkResellerTagihan,
    bayarTunaiResellerTagihan,
    getResellerDraftTagihanList,
    terbitkanResellerTagihan,
} from '../api/resellerTagihan.api'

export function useResellerTagihanList() {
    const route = useRoute()
    const params = computed(() => {
        const p: Record<string, string> = {}
        for (const [key, value] of Object.entries(route.query)) {
            if (typeof value === 'string') p[key] = value
        }
        return p
    })

    return useQuery({
        queryKey: ['tagihan', 'reseller', 'list', params],
        queryFn: () => getResellerTagihanList(params.value).then((res) => res.data.data),
    })
}

export function useResellerPendaftarBaru() {
    const route = useRoute()
    const params = computed(() => {
        const p: Record<string, string> = {}
        for (const [key, value] of Object.entries(route.query)) {
            if (typeof value === 'string') p[key] = value
        }
        return p
    })

    return useQuery({
        queryKey: ['tagihan', 'reseller', 'pendaftar-baru', params],
        queryFn: () => getResellerPendaftarBaru(params.value).then((res) => res.data),
    })
}

export function useResellerPreviewTagihanPertama() {
    return useMutation({
        mutationFn: (pelangganId: number | string) =>
            previewResellerTagihanPertama(pelangganId).then((res) => res.data.data),
    })
}

export function useResellerGenerateTagihanPertama() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            pelangganId,
            payload,
        }: {
            pelangganId: number | string
            payload: Parameters<typeof generateResellerTagihanPertama>[1]
        }) => generateResellerTagihanPertama(pelangganId, payload).then((res) => res.data.data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['tagihan', 'reseller', 'list'],
            })

            queryClient.invalidateQueries({
                queryKey: ['tagihan', 'reseller', 'pendaftar-baru'],
            })

            queryClient.invalidateQueries({
                queryKey: ['reseller-portal', 'pelanggan', variables.pelangganId],
            })

            queryClient.invalidateQueries({
                queryKey: ['reseller-portal', 'pelanggan'],
            })

            queryClient.invalidateQueries({
                queryKey: ['reseller-portal', 'dashboard'],
            })
        },
    })
}

export function useResellerTagihanDetail(id: MaybeRefOrGetter<number | string>) {
    return useQuery({
        queryKey: ['tagihan', 'reseller', 'detail', id],
        queryFn: () => getResellerTagihanDetail(toValue(id)).then((res) => res.data.data),
    })
}

export function useResellerPerbaruiLinkTagihan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number | string) => perbaruiLinkResellerTagihan(id).then((res) => res.data.data),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'detail', id] })
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'list'] })
        },
    })
}

export function useResellerBayarTunaiTagihan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, jumlahBulan }: { id: number | string; jumlahBulan: number }) =>
            bayarTunaiResellerTagihan(id, jumlahBulan).then((res) => res.data.data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'detail', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'list'] })
        },
    })
}

// ----- Draft / Terbitkan Tagihan -----

export function useResellerDraftTagihanList() {
    const route = useRoute()
    const params = computed(() => {
        const p: Record<string, string> = {}
        for (const [key, value] of Object.entries(route.query)) {
            if (typeof value === 'string') p[key] = value
        }
        return p
    })

    return useQuery({
        queryKey: ['tagihan', 'reseller', 'draft', params],
        queryFn: () => getResellerDraftTagihanList(params.value).then((res) => res.data.data),
    })
}

export function useTerbitkanResellerTagihan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: { tagihan_ids: number[]; nominal?: Record<number, number> }) =>
            terbitkanResellerTagihan(payload).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'draft'] })
            queryClient.invalidateQueries({ queryKey: ['tagihan', 'reseller', 'list'] })
        },
    })
}