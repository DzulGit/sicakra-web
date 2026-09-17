<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { useResellerTagihanList } from '../composables/useResellerTagihan'
import { statusTagihanFinanceEnum } from '@/lib/enums'
import { formatRupiah, formatRupiahBertanda } from '@/lib/currency'
import StatusBadge from '@/components/data/StatusBadge.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { data: hasil, isLoading } = useResellerTagihanList()

type TagihanRow = NonNullable<typeof hasil.value>['data'][number]

const col = createColumnHelper<TagihanRow>()

const columns = [
  col.accessor('nomor_tagihan', { header: 'Nomor' }),
  col.accessor((row) => row.layanan_internet?.pelanggan?.nama_lengkap, {
    id: 'nama_pelanggan',
    header: 'Nama Pelanggan',
    cell: ({ getValue }) => getValue() || '—',
  }),
  col.accessor('periode_bulan', {
    header: 'Periode',
    cell: ({ row }) => `${row.original.periode_bulan}/${row.original.periode_tahun}`,
  }),
  col.accessor('total_tagihan', {
    header: 'Total Tagihan',
    cell: ({ getValue }) => formatRupiah(getValue()),
  }),
  col.accessor('telah_terbayar', {
    header: 'Telah Terbayar',
    cell: ({ getValue }) => formatRupiah(getValue()),
  }),
  col.accessor('sisa', {
    header: 'Sisa',
    cell: ({ getValue }) => formatRupiahBertanda(getValue()),
  }),
  col.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => h(StatusBadge, { value: getValue() ?? 'Belum Bayar', map: statusTagihanFinanceEnum }),
  }),
  col.accessor('id', {
    header: '',
    cell: ({ getValue }) =>
      h(Button, {
        variant: 'outline',
        size: 'sm',
        onClick: () => router.push(`/reseller/tagihan/${getValue()}`),
      }, () => 'Detail'),
  }),
]

function formatAngka(nilai: string | number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(nilai))
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold">Tagihan</h1>
      <p v-if="hasil" class="text-sm text-muted-foreground">
        {{ formatAngka(hasil.total) }} Total tagihan
      </p>
    </div>

    <FilterBar :fields="[
      { key: 'status_pembayaran', label: 'Status', placeholder: 'Semua Status', options: [
        { label: 'Belum Bayar', value: 'belum_bayar' },
        { label: 'Lunas', value: 'sudah_bayar' },
      ]},
    ]" />

    <DataTable :columns="columns as ColumnDef<TagihanRow, unknown>[]" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada tagihan" />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>