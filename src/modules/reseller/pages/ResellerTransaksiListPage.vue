<script setup lang="ts">
import { h, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import { useResellerList, useResellerTransaksiList } from '../composables/useReseller'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import PageSizeSelect from '@/components/data/PageSizeSelect.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ResellerTransaksi } from '@/types/models'
import { formatAngka, formatRupiah } from '@/lib/currency'

const { data: hasil, isLoading } = useResellerTransaksiList()
const { data: daftarReseller } = useResellerList()

const NAMA_BULAN: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
}

// Periode dibatasi ke tahun berjalan ±5 supaya daftar pilihan tetap ringkas
// dan tidak melompong jauh melewati data yang ada.
const daftarTahun = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)

const filterFields = computed(() => [
  {
    key: 'reseller_id',
    label: 'Reseller',
    placeholder: 'Semua Reseller',
    options: [
      { label: 'Semua Reseller', value: 'semua' },
      ...(daftarReseller.value?.data ?? []).map((r) => ({ label: r.nama_lengkap, value: String(r.id) })),
    ],
  },
  {
    key: 'bulan',
    label: 'Bulan',
    placeholder: 'Semua Bulan',
    options: [
      { label: 'Semua Bulan', value: 'semua' },
      ...Object.entries(NAMA_BULAN).map(([value, label]) => ({ label, value })),
    ],
  },
  {
    key: 'tahun',
    label: 'Tahun',
    placeholder: 'Semua Tahun',
    options: [
      { label: 'Semua Tahun', value: 'semua' },
      ...daftarTahun.map((y) => ({ label: String(y), value: String(y) })),
    ],
  },
])

const columns: ColumnDef<ResellerTransaksi, unknown>[] = [
  { accessorKey: 'waktu', header: 'Waktu' },
  {
    id: 'jenis',
    header: 'Jenis',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.jenis === 'pembayaran' ? 'success' : 'secondary', class: 'uppercase' },
        () => row.original.jenis,
      ),
  },
  { accessorKey: 'nomor', header: 'Nomor' },
  { accessorKey: 'reseller', header: 'Reseller' },
  { accessorKey: 'pelanggan', header: 'Pelanggan' },
  {
    accessorKey: 'nominal',
    header: 'Nominal',
    cell: ({ row }) => formatRupiah(row.original.nominal),
  },
  { accessorKey: 'status', header: 'Status' },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <Button variant="ghost" size="sm" class="-ml-2 text-muted-foreground" as-child>
          <RouterLink to="/admin/operasional/reseller">
            <ArrowLeft class="size-4" /> Kembali
          </RouterLink>
        </Button>
        <h1 class="mt-1 text-xl font-semibold">Transaksi Reseller</h1>
        <p class="text-sm text-muted-foreground">
          Tagihan yang diterbitkan reseller dan pembayaran pelanggan yang masuk, tersaring per reseller dan periode.
        </p>
        <p v-if="hasil" class="mt-1 text-sm text-muted-foreground">
          {{ formatAngka(hasil.total) }} transaksi
        </p>
      </div>
      <PageSizeSelect
        v-if="hasil"
        :per-page="hasil.per_page"
        :page-sizes="[
          { label: '10', value: '10' },
          { label: '20', value: '20' },
          { label: '50', value: '50' },
        ]"
      />
    </div>

    <FilterBar :fields="filterFields" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada transaksi"
      empty-deskripsi="Tidak ada transaksi untuk filter reseller/periode ini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
