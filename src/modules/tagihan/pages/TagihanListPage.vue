<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useRingkasanOmzet, useTagihanList } from '../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import OmzetChart from '../components/OmzetChart.vue'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { Tagihan } from '@/types/models'

const tahunSekarang = new Date().getFullYear()
const tahunOmzet = ref(tahunSekarang)
const { data: ringkasanOmzet } = useRingkasanOmzet(tahunOmzet)

const { data: hasil, isLoading } = useTagihanList()

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}

const filterFields: FilterFieldConfig[] = [
  {
    key: 'status_pembayaran',
    label: 'Status Pembayaran',
    options: Object.entries(statusPembayaranEnum).map(([value, meta]) => ({ value, label: meta.label })),
  },
]

const columns: ColumnDef<Tagihan, unknown>[] = [
  { accessorKey: 'nomor_tagihan', header: 'Nomor Tagihan' },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.layanan_internet?.pelanggan?.nama_lengkap ?? '-',
  },
  {
    id: 'periode',
    header: 'Periode',
    cell: ({ row }) => `${row.original.periode_bulan}/${row.original.periode_tahun}`,
  },
  {
    accessorKey: 'total_tagihan',
    header: 'Total',
    cell: ({ row }) => formatRupiah(row.original.total_tagihan),
  },
  {
    accessorKey: 'status_pembayaran',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status_pembayaran, map: statusPembayaranEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/keuangan/tagihan/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Tagihan</h1>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Omzet {{ tahunOmzet }}</CardTitle>
      </CardHeader>
      <CardContent>
        <OmzetChart :data="ringkasanOmzet ?? []" />
      </CardContent>
    </Card>

    <div class="space-y-4">
      <FilterBar :fields="filterFields" />

      <DataTable
        :columns="columns"
        :data="hasil?.data ?? []"
        :loading="isLoading"
        empty-judul="Belum ada tagihan"
      />

      <Pagination v-if="hasil" :meta="hasil" />
    </div>
  </div>
</template>
