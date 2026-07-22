<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useTimTeknisiList } from '../composables/useTimTeknisi'
import DataTable from '@/components/data/DataTable.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TimTeknisi } from '@/types/models'

const { data: hasil, isLoading } = useTimTeknisiList()

const columns: ColumnDef<TimTeknisi, unknown>[] = [
  { accessorKey: 'nama_tim', header: 'Nama Tim' },
  {
    id: 'anggota',
    header: 'Anggota',
    cell: ({ row }) => (row.original.anggota ?? []).map((a) => a.nama_lengkap).join(', ') || '-',
  },
  {
    accessorKey: 'status_aktif',
    header: 'Status',
    cell: ({ row }) =>
      h(Badge, { variant: row.original.status_aktif ? 'success' : 'secondary' }, () =>
        row.original.status_aktif ? 'Aktif' : 'Nonaktif',
      ),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/super-admin/tim-teknisi/${row.original.id}/ubah`, variant: 'outline', size: 'sm' },
        () => 'Ubah',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Tim Teknisi</h1>
      <Button as="RouterLink" to="/admin/super-admin/tim-teknisi/baru">Tambah Tim</Button>
    </div>

    <DataTable :columns="columns" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada tim teknisi" />
  </div>
</template>