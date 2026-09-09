<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'

import { useResellerTagihanList } from '../composables/useReseller'
import ResellerMonitoringTabs from '../components/ResellerMonitoringTabs.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import type { Tagihan } from '@/types/models'
import { statusPembayaranEnum } from '@/lib/enums'

const route = useRoute()
const resellerId = computed(() => String(route.params.id))
const { data: hasil, isLoading } = useResellerTagihanList(resellerId)

function formatRupiah(value: string | number) {
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

const columns: ColumnDef<Tagihan, unknown>[] = [
  { accessorKey: 'nomor_tagihan', header: 'Nomor Tagihan' },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.layanan_internet?.pelanggan?.nama_lengkap ?? '-',
  },
  {
    id: 'paket',
    header: 'Paket Internet',
    cell: ({ row }) => row.original.nama_paket_snapshot ?? '-',
  },
  {
    id: 'periode',
    header: 'Periode',
    cell: ({ row }) => `${row.original.periode_bulan}/${row.original.periode_tahun}`,
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
    accessorKey: 'status_pembayaran',
    header: 'Status',
    cell: ({ row }) => {
      const tagihan = row.original
      const terlambat =
        tagihan.status_pembayaran === 'belum_bayar' &&
        tagihan.tanggal_jatuh_tempo &&
        new Date(tagihan.tanggal_jatuh_tempo) < new Date()

      if (terlambat) {
        return h(Badge, { variant: 'destructive' }, () => 'Terlambat')
      }

      return h(StatusBadge, {
        value: tagihan.status_pembayaran,
        map: statusPembayaranEnum,
      })
    },
  },
  {
    id: 'aksi',
    header: 'Pelanggan',
    cell: ({ row }) => {
      const pelanggan = row.original.layanan_internet?.pelanggan
      if (!pelanggan) return '-'

      return h(
        RouterLink,
        {
          to: {
            name: 'admin.operasional.reseller.pelanggan.detail',
            params: {
              id: resellerId.value,
              pelangganId: pelanggan.id,
            },
          },
          class: 'text-sm font-medium text-primary hover:underline',
        },
        () => 'Lihat',
      )
    },
  },
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-semibold">Monitoring Reseller</h1>
      <p class="text-sm text-muted-foreground">
        Tagihan yang dibuat reseller untuk pelanggan-pelanggannya.
      </p>
    </div>

    <ResellerMonitoringTabs :reseller-id="resellerId" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada tagihan"
      empty-deskripsi="Belum terdapat tagihan untuk pelanggan reseller ini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
