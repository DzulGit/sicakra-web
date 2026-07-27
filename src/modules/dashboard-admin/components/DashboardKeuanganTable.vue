<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Receipt } from 'lucide-vue-next'
import type { DashboardPembayaranRingkas } from '@/types/models'
import { statusTransaksiEnum } from '@/lib/enums'

const columns: ColumnDef<DashboardPembayaranRingkas, unknown>[] = [
  { accessorKey: 'nomor_tagihan', header: 'Tagihan' },
  { accessorKey: 'pelanggan', header: 'Pelanggan' },
  {
    accessorKey: 'jumlah',
    header: 'Jumlah',
    cell: ({ row }) => row.original.jumlah,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusTransaksiEnum }),
  },
  { accessorKey: 'waktu', header: 'Waktu' },
]

defineProps<{
  data?: DashboardPembayaranRingkas[]
  loading?: boolean
  title?: string
  emptyJudul?: string
  emptyDeskripsi?: string
  linkTo?: string
}>()
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Receipt class="size-4 text-muted-foreground" />
        {{ title ?? 'Pembayaran Terbaru' }}
      </CardTitle>
      <Button v-if="linkTo" as="RouterLink" :to="linkTo" variant="ghost" size="sm">
        Lihat Semua
      </Button>
    </CardHeader>
    <CardContent class="p-0">
      <DataTable
        :columns="columns"
        :data="data ?? []"
        :loading="loading"
        :empty-judul="emptyJudul ?? 'Belum ada pembayaran'"
        :empty-deskripsi="emptyDeskripsi ?? 'Pembayaran terbaru akan muncul di sini.'"
      />
    </CardContent>
  </Card>
</template>
