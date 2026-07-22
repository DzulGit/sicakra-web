<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useLaporanKendalaListTeknisi } from '../../composables/useTeknisiLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { LaporanKendala } from '@/types/models'

const { data: hasil, isLoading } = useLaporanKendalaListTeknisi()

const columns: ColumnDef<LaporanKendala, unknown>[] = [
  { accessorKey: 'nomor_laporan', header: 'Nomor Laporan' },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.layanan_internet?.pelanggan?.nama_lengkap ?? '-',
  },
  { accessorKey: 'kategori_kendala', header: 'Kategori' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusLaporanEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        {
          as: 'RouterLink',
          to: `/admin/teknisi/laporan-kendala/${row.original.id}`,
          variant: 'outline',
          size: 'sm',
        },
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Laporan Kendala</h1>
    <p class="text-sm text-muted-foreground">Laporan yang ditugaskan ke kamu.</p>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada laporan ditugaskan"
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
