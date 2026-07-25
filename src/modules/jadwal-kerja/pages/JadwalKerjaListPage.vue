<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useJadwalKerjaList } from '@/modules/jadwal-kerja/composables/useJadwalKerja'
import { hasilKerjaEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { JadwalKerja } from '@/types/models'

const { data: hasil, isLoading } = useJadwalKerjaList()

const filterFields: FilterFieldConfig[] = [
  {
    key: 'hasil',
    label: 'Status',
    options: [
      { value: 'belum', label: 'Baru' },
      ...Object.entries(hasilKerjaEnum).map(([v, m]) => ({ value: v, label: m.label })),
    ],
  },
]

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

const columns: ColumnDef<JadwalKerja, unknown>[] = [
  {
    id: 'nomor_permohonan',
    header: 'Nomor Permohonan',
    cell: ({ row }) => row.original.permohonan_layanan?.nomor_permohonan ?? '-',
  },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.permohonan_layanan?.pelanggan?.nama_lengkap ?? '-',
  },
  {
    id: 'tim',
    header: 'Rekan Satu Tim',
    cell: ({ row }) => (row.original.teknisi ?? []).map((t) => t.nama_lengkap).join(', ') || '-',
  },
  {
    accessorKey: 'tanggal_kerja',
    header: 'Tanggal',
    cell: ({ row }) => formatTanggal(row.original.tanggal_kerja),
  },
  {
    id: 'hasil',
    header: 'Hasil',
    cell: ({ row }) => {
      if (!row.original.hasil) return h('span', { class: 'text-muted-foreground' }, '—')
      return h(StatusBadge, { value: row.original.hasil, map: hasilKerjaEnum })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/teknisi/jadwal-kerja/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Buka',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Jadwal Kerja</h1>
    </div>
    <p class="text-sm text-muted-foreground">
      Riwayat pekerjaan tim kamu — sudah selesai maupun masih perlu dikerjakan.
    </p>

    <FilterBar :fields="filterFields" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada jadwal kerja"
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>