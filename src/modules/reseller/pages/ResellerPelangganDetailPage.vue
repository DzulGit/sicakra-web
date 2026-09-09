<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { ArrowLeft } from 'lucide-vue-next'

import { useResellerPelangganDetail } from '../composables/useReseller'
import type { Tagihan, Pembayaran } from '@/types/models'

import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const route = useRoute()

const resellerId = computed(() => String(route.params.id))
const pelangganId = computed(() => String(route.params.pelangganId))

const { data: pelanggan, isLoading } = useResellerPelangganDetail(
    resellerId,
    pelangganId,
)

const layanan = computed(() => pelanggan.value?.layanan_internet?.[0] ?? null)

const tagihan = computed<Tagihan[]>(() => layanan.value?.tagihan ?? [])

function formatRupiah(value: number | string | null | undefined) {
    if (value === null || value === undefined) return '-'

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value))
}

function formatTanggal(value: string | null | undefined) {
    if (!value) return '-'

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function statusTagihan(item: Tagihan) {
    if (item.status_pembayaran === 'sudah_bayar') {
        return {
            label: 'Sudah Dibayar',
            variant: 'success' as const,
        }
    }

    if (
        item.status_pembayaran === 'belum_bayar' &&
        item.tanggal_jatuh_tempo &&
        new Date(item.tanggal_jatuh_tempo) < new Date()
    ) {
        return {
            label: 'Terlambat',
            variant: 'destructive' as const,
        }
    }

    return {
        label: 'Belum Dibayar',
        variant: 'secondary' as const,
    }
}

const tagihanColumns: ColumnDef<Tagihan, unknown>[] = [
    {
        accessorKey: 'nomor_tagihan',
        header: 'No. Tagihan',
    },
    {
        id: 'periode',
        header: 'Periode',
        cell: ({ row }) =>
            `${row.original.periode_bulan}/${row.original.periode_tahun}`,
    },
    {
        accessorKey: 'tanggal_jatuh_tempo',
        header: 'Jatuh Tempo',
        cell: ({ row }) => formatTanggal(row.original.tanggal_jatuh_tempo),
    },
    {
        accessorKey: 'total_tagihan',
        header: 'Total',
        cell: ({ row }) => formatRupiah(row.original.total_tagihan),
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = statusTagihan(row.original)

            return h(
                Badge,
                { variant: status.variant },
                () => status.label,
            )
        },
    },
]

const pembayaran = computed<Pembayaran[]>(() =>
    tagihan.value.flatMap((item) => item.pembayaran ?? []),
)

const pembayaranColumns: ColumnDef<Pembayaran, unknown>[] = [
    {
        accessorKey: 'dibayar_pada',
        header: 'Tanggal',
        cell: ({ row }) => formatTanggal(row.original.dibayar_pada),
    },
    {
        accessorKey: 'jumlah_dibayar',
        header: 'Jumlah',
        cell: ({ row }) => formatRupiah(row.original.jumlah_dibayar),
    },
    {
        accessorKey: 'metode_pembayaran',
        header: 'Metode',
        cell: ({ row }) => row.original.metode_pembayaran ?? '-',
    },
]
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <Button :as="RouterLink" :to="`/admin/operasional/reseller/${resellerId}/pelanggan`" variant="outline"
                size="sm">
                <ArrowLeft class="size-4" />
                Kembali
            </Button>

            <div>
                <h1 class="text-xl font-semibold">
                    Detail Pelanggan Reseller
                </h1>
                <p class="text-sm text-muted-foreground">
                    Mode read-only — admin hanya dapat memantau data pelanggan.
                </p>
            </div>
        </div>

        <div v-if="isLoading" class="text-sm text-muted-foreground">
            Memuat data pelanggan...
        </div>

        <template v-else-if="pelanggan">
            <section class="rounded-lg border p-5 space-y-4">
                <h2 class="font-semibold">Informasi Pelanggan</h2>

                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <p class="text-sm text-muted-foreground">Nomor Pelanggan</p>
                        <p class="font-medium">
                            {{ pelanggan.nomor_pelanggan ?? '-' }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-muted-foreground">Nama Lengkap</p>
                        <p class="font-medium">
                            {{ pelanggan.nama_lengkap ?? '-' }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-muted-foreground">NIK</p>
                        <p class="font-medium">
                            {{ pelanggan.nik ?? '-' }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-muted-foreground">No. HP</p>
                        <p class="font-medium">
                            {{ pelanggan.nomor_hp ?? '-' }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-muted-foreground">Alamat Pemasangan</p>
                        <p class="font-medium">
                            {{ layanan?.alamat_pemasangan ?? layanan?.detail_alamat ?? '-' }}
                        </p>
                    </div>
                </div>
            </section>

            <section class="rounded-lg border p-5 space-y-4">
                <h2 class="font-semibold">Layanan Internet</h2>

                <div v-if="layanan" class="grid gap-4 md:grid-cols-2">
                    <div>
                        <p class="text-sm text-muted-foreground">Paket</p>
                        <p class="font-medium">
                            {{
                                layanan.tipe_paket === 'custom'
                                    ? layanan.nama_paket_custom ?? 'Custom'
                                    : layanan.paket_internet?.nama_paket ?? '-'
                            }}
                        </p>
                    </div>

                    <div>
                        <p class="text-sm text-muted-foreground">Status Layanan</p>
                        <StatusBadge :value="layanan.status" :map="{
                            aktif: { label: 'Aktif', badgeVariant: 'success' },
                            nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
                        }" />
                    </div>
                </div>

                <p v-else class="text-sm text-muted-foreground">
                    Pelanggan belum memiliki layanan internet.
                </p>
            </section>

            <section class="rounded-lg border p-5 space-y-4">
                <div>
                    <h2 class="font-semibold">Tagihan Pelanggan</h2>
                    <p class="text-sm text-muted-foreground">
                        Daftar tagihan reseller kepada pelanggan ini.
                    </p>
                </div>

                <DataTable :columns="tagihanColumns" :data="tagihan" :loading="false" empty-judul="Belum ada tagihan"
                    empty-deskripsi="Belum terdapat tagihan untuk pelanggan ini." />
            </section>

            <section class="rounded-lg border p-5 space-y-4">
                <div>
                    <h2 class="font-semibold">Riwayat Pembayaran</h2>
                    <p class="text-sm text-muted-foreground">
                        Riwayat pembayaran tagihan pelanggan.
                    </p>
                </div>

                <DataTable :columns="pembayaranColumns" :data="pembayaran" :loading="false"
                    empty-judul="Belum ada pembayaran" empty-deskripsi="Belum terdapat riwayat pembayaran." />
            </section>
        </template>

        <div v-else class="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Data pelanggan tidak ditemukan.
        </div>
    </div>
</template>