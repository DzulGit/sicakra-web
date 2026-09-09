<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'

import { useResellerPelangganList } from '../composables/useReseller.ts'
import ResellerMonitoringTabs from '../components/ResellerMonitoringTabs.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import type { Pelanggan, Tagihan } from '@/types/models'

const route = useRoute()
const resellerId = computed(() => String(route.params.id))
const { data: hasil, isLoading } = useResellerPelangganList(resellerId)

function formatRupiah(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getLatestTagihan(pelanggan: Pelanggan): Tagihan | null {
  const tagihan = pelanggan.layanan_internet?.[0]?.tagihan ?? []
  if (!tagihan.length) return null

  return [...tagihan].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
}

function getStatusTagihan(tagihan: Tagihan) {
  if (tagihan.status_pembayaran === 'sudah_bayar') {
    return { label: 'Sudah Dibayar', variant: 'success' as const }
  }

  if (
    tagihan.status_pembayaran === 'belum_bayar' &&
    tagihan.tanggal_jatuh_tempo &&
    new Date(tagihan.tanggal_jatuh_tempo) < new Date()
  ) {
    return { label: 'Terlambat', variant: 'destructive' as const }
  }

  return { label: 'Belum Dibayar', variant: 'secondary' as const }
}

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor Pelanggan' },
  { accessorKey: 'nama_lengkap', header: 'Pelanggan' },
  {
    id: 'paket',
    header: 'Paket Internet',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]
      if (!layanan) return '-'

      if (layanan.tipe_paket === 'custom') {
        return layanan.nama_paket_custom ?? 'Custom'
      }

      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'tagihan',
    header: 'Tagihan',
    cell: ({ row }) => {
      const tagihan = getLatestTagihan(row.original)
      if (!tagihan) return h('span', { class: 'text-muted-foreground' }, 'Belum ada tagihan')

      const status = getStatusTagihan(tagihan)

      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium' }, formatRupiah(tagihan.total_tagihan)),
        h(Badge, { variant: status.variant }, () => status.label),
      ])
    },
  },
  {
    id: 'status_layanan',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.layanan_internet?.[0]?.status
      if (!status) return h('span', { class: 'text-muted-foreground' }, '-')

      return h(StatusBadge, {
        value: status,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: 'Detail',
    cell: ({ row }) =>
      h(
        RouterLink,
        {
          to: {
            name: 'admin.operasional.reseller.pelanggan.detail',
            params: {
              id: resellerId.value,
              pelangganId: row.original.id,
            },
          },
          class: 'text-sm font-medium text-primary hover:underline',
        },
        () => 'Lihat Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-semibold">Monitoring Reseller</h1>
      <p class="text-sm text-muted-foreground">
        Pantau pelanggan, paket internet, dan tagihan reseller secara read-only.
      </p>
    </div>

    <ResellerMonitoringTabs :reseller-id="resellerId" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Reseller ini belum memiliki pelanggan"
      empty-deskripsi="Pelanggan yang didaftarkan reseller akan muncul di sini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
