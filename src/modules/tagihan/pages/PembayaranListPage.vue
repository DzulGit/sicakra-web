<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { useRiwayatPembayaranAdmin } from '../composables/usePembayaranHistory'
import { formatRupiah } from '@/lib/currency'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = useRoute()
const router = useRouter()

const scope = computed(() => (route.path.startsWith('/reseller') ? 'reseller' : 'admin'))
const basePath = computed(() => (scope.value === 'reseller' ? '/reseller' : '/admin/keuangan'))

const STATUS_TRANSAKSI: Record<string, { label: string; kelas: string }> = {
  pending: { label: 'Pending', kelas: 'bg-amber-100 text-amber-800' },
  berhasil: { label: 'Berhasil', kelas: 'bg-emerald-100 text-emerald-800' },
  gagal: { label: 'Gagal', kelas: 'bg-rose-100 text-rose-800' },
}

const { data: hasil, isLoading } = useRiwayatPembayaranAdmin(scope.value)

type Baris = NonNullable<typeof hasil.value>['data']['data'][number]

const col = createColumnHelper<Baris>()

const columns = [
  col.accessor('nomor_pembayaran', { header: 'Nomor', cell: ({ getValue }) => getValue() as string }),
  col.accessor('waktu_wib', {
    header: 'Waktu (WIB)',
    cell: ({ getValue }) => getValue() || '—',
  }),
  col.accessor((row) => row.pelanggan?.nama_lengkap ?? '—', {
    id: 'nama_pelanggan',
    header: 'Pelanggan',
  }),
  col.accessor('jumlah_dibayar', {
    header: 'Jumlah',
    cell: ({ getValue }) => formatRupiah(Number(getValue() ?? 0)),
  }),
  col.accessor((row) => row.metode_pembayaran ?? '—', {
    id: 'metode',
    header: 'Metode',
  }),
  col.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const s = STATUS_TRANSAKSI[getValue() as string] ?? { label: getValue() as string, kelas: 'bg-slate-100 text-slate-700' }
      return h('span', { class: `inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.kelas}` }, s.label)
    },
  }),
  col.accessor('id', {
    header: '',
    cell: ({ getValue }) =>
      h(Button, {
        variant: 'outline',
        size: 'sm',
        onClick: () => router.push(`${basePath.value}/pembayaran/${getValue()}`),
      }, () => 'Detail'),
  }),
]

function setQuery(key: string, nilai: string) {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) {
    if (typeof v === 'string' && k !== 'page') query[k] = v
  }
  if (nilai) query[key] = nilai
  else delete query[key]
  router.push({ query })
}

function nilaiQuery(key: string): string {
  const v = route.query[key]
  return typeof v === 'string' ? v : ''
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Riwayat Pembayaran</h1>
        <p v-if="hasil" class="text-sm text-muted-foreground">
          {{ new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(hasil.data.total) }} transaksi
        </p>
      </div>
    </div>

    <div class="space-y-3 rounded-xl border p-4">
      <FilterBar :fields="[
        { key: 'status', label: 'Status Transaksi', placeholder: 'Semua Status', options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Berhasil', value: 'berhasil' },
          { label: 'Gagal', value: 'gagal' },
        ] },
        { key: 'status_tagihan', label: 'Status Tagihan', placeholder: 'Semua Status Tagihan', options: [
          { label: 'Belum Bayar', value: 'belum_bayar' },
          { label: 'Sudah Bayar', value: 'sudah_bayar' },
        ] },
        { key: 'metode', label: 'Metode', placeholder: 'Semua Metode', options: [
          { label: 'Tunai', value: 'tunai' },
          { label: 'QRIS', value: 'QRIS' },
          { label: 'BCA', value: 'BCA' },
          { label: 'MANDIRI', value: 'MANDIRI' },
        ] },
      ]" />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-1">
          <Label>Dari tanggal (WIB)</Label>
          <Input type="date" :value="nilaiQuery('dari')" @input="setQuery('dari', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="space-y-1">
          <Label>Sampai tanggal (WIB)</Label>
          <Input type="date" :value="nilaiQuery('sampai')" @input="setQuery('sampai', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="space-y-1">
          <Label>Nomor tagihan</Label>
          <Input :value="nilaiQuery('no_tagihan')" placeholder="mis. INV000042" @input="setQuery('no_tagihan', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="space-y-1">
          <Label>Nomor pembayaran</Label>
          <Input :value="nilaiQuery('no_pembayaran')" placeholder="mis. PAY-000123" @input="setQuery('no_pembayaran', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </div>

    <DataTable :columns="columns as ColumnDef<Baris, unknown>[]" :data="hasil?.data.data ?? []" :loading="isLoading" empty-judul="Belum ada pembayaran" />

    <Pagination v-if="hasil" :meta="hasil.data" />
  </div>
</template>