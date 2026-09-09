<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'

import { useResellerPaketInternetList } from '../composables/useReseller'
import ResellerMonitoringTabs from '../components/ResellerMonitoringTabs.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import type { PaketInternet } from '@/types/models'
import { statusAktifEnum } from '@/lib/enums'

const route = useRoute()
const resellerId = computed(() => String(route.params.id))
const { data: hasil, isLoading } = useResellerPaketInternetList(resellerId)

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

const columns: ColumnDef<PaketInternet, unknown>[] = [
  { accessorKey: 'nama_paket', header: 'Nama Paket' },
  {
    accessorKey: 'kecepatan_mbps',
    header: 'Kecepatan',
    cell: ({ row }) => `${row.original.kecepatan_mbps} Mbps`,
  },
  {
    accessorKey: 'harga',
    header: 'Harga',
    cell: ({ row }) => formatRupiah(row.original.harga),
  },
  {
    accessorKey: 'promo_gratis_bulan',
    header: 'Promo',
    cell: ({ row }) => `${row.original.promo_gratis_bulan ?? 0} bulan`,
  },
  {
    accessorKey: 'status_aktif',
    header: 'Status',
    cell: ({ row }) =>
      h(StatusBadge, {
        value: String(row.original.status_aktif),
        map: statusAktifEnum,
      }),
  },
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-semibold">Monitoring Reseller</h1>
      <p class="text-sm text-muted-foreground">
        Paket internet yang dibuat dan dimiliki reseller ini.
      </p>
    </div>

    <ResellerMonitoringTabs :reseller-id="resellerId" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada paket internet"
      empty-deskripsi="Reseller ini belum membuat paket internet sendiri."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
