<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { usePermohonanLayananList } from '../composables/usePermohonanLayanan'
import { statusPermohonanEnum, jenisPermohonanEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { PermohonanLayanan } from '@/types/models'

const { data: hasil, isLoading } = usePermohonanLayananList()

const filterFields: FilterFieldConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: Object.entries(statusPermohonanEnum).map(([value, meta]) => ({ value, label: meta.label })),
  },
  {
    key: 'jenis_permohonan',
    label: 'Jenis',
    options: Object.entries(jenisPermohonanEnum).map(([value, meta]) => ({ value, label: meta.label })),
  },
]

const columns: ColumnDef<PermohonanLayanan, unknown>[] = [
  { accessorKey: 'nomor_permohonan', header: 'Nomor Permohonan' },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
  },
  {
    accessorKey: 'jenis_permohonan',
    header: 'Jenis',
    cell: ({ row }) =>
      h(StatusBadge, { value: row.original.jenis_permohonan, map: jenisPermohonanEnum }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusPermohonanEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/operasional/permohonan-layanan/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Permohonan Layanan</h1>
    </div>

    <FilterBar :fields="filterFields" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada permohonan"
      empty-deskripsi="Permohonan baru dari pendaftaran akan muncul di sini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
