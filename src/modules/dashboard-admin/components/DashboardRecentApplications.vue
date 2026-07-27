<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { PermohonanLayanan } from '@/types/models'
import { statusPermohonanEnum } from '@/lib/enums'
import type { ColumnDef } from '@tanstack/vue-table'
import { FileText } from 'lucide-vue-next'

const columns: ColumnDef<PermohonanLayanan, unknown>[] = [
  {
    accessorKey: 'nomor_permohonan',
    header: 'Nomor',
    cell: ({ row }) =>
      h(RouterLink, { to: `/admin/operasional/permohonan-layanan/${row.original.id}`, class: 'font-medium text-primary hover:underline' }, () => row.original.nomor_permohonan),
  },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
  },
  {
    accessorKey: 'jenis_permohonan',
    header: 'Jenis',
    cell: ({ row }) => row.original.jenis_permohonan === 'pemasangan_baru' ? 'Baru' : 'Relokasi',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusPermohonanEnum }),
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal',
    cell: ({ row }) => {
      if (!row.original.created_at) return '-'
      const d = new Date(row.original.created_at)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    },
  },
]

defineProps<{
  data?: PermohonanLayanan[]
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <FileText class="size-4 text-muted-foreground" />
        Permohonan Terbaru
      </CardTitle>
      <Button as="RouterLink" to="/admin/operasional/permohonan-layanan" variant="ghost" size="sm">
        Lihat Semua
      </Button>
    </CardHeader>
    <CardContent class="p-0">
      <DataTable
        :columns="columns"
        :data="data ?? []"
        :loading="loading"
        empty-judul="Belum ada permohonan"
        empty-deskripsi="Permohonan baru akan muncul di sini."
      />
    </CardContent>
  </Card>
</template>
