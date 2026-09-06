<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { useTagihanList } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { data: hasil, isLoading } = useTagihanList()

type TagihanRow = NonNullable<typeof hasil.value>['data'][number]

const col = createColumnHelper<TagihanRow>()

const columns = [
  col.accessor('nomor_tagihan', { header: 'Nomor' }),
  col.accessor('periode_bulan', {
    header: 'Periode',
    cell: ({ row }) => `${row.original.periode_bulan}/${row.original.periode_tahun}`,
  }),
  col.accessor('total_tagihan', {
    header: 'Total',
    cell: ({ getValue }) => {
      const v = Number(getValue())
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
    },
  }),
  col.accessor('status_pembayaran', {
    header: 'Status',
    cell: ({ getValue }) => h(StatusBadge, { value: getValue(), map: statusPembayaranEnum }),
  }),
  col.accessor('xendit_invoice_status', {
    header: 'Invoice Xendit',
    cell: ({ row }) => {
      const s = row.original.xendit_invoice_status
      if (!s) return '—'
      return s === 'active' ? 'Aktif' : 'Kedaluwarsa'
    },
  }),
  col.accessor('xendit_invoice_retry_count', {
    header: 'Retry',
    cell: ({ getValue }) => getValue() || '—',
  }),
  col.accessor('id', {
    header: '',
    cell: ({ getValue }) =>
      h(Button, {
        variant: 'outline',
        size: 'sm',
        onClick: () => router.push(`/admin/keuangan/tagihan/${getValue()}`),
      }, () => 'Detail'),
  }),
]

function formatAngka(nilai: string) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(nilai))
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold">Tagihan</h1>
      <p v-if="hasil" class="text-sm text-muted-foreground">
        {{ formatAngka(String(hasil.total)) }} Total tagihan
      </p>
    </div>

    <FilterBar :fields="[
      { key: 'status_pembayaran', label: 'Status', placeholder: 'Semua Status', options: [
        { label: 'Belum Bayar', value: 'belum_bayar' },
        { label: 'Sudah Bayar', value: 'sudah_bayar' },
        { label: 'Kedaluwarsa', value: 'kedaluwarsa' },
      ]},
    ]" />

    <DataTable :columns="columns as ColumnDef<TagihanRow, unknown>[]" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada tagihan" />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
