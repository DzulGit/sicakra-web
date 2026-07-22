<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useJadwalKerjaList } from '@/modules/jadwal-kerja/composables/useJadwalKerja'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Button } from '@/components/ui/button'
import type { JadwalKerja } from '@/types/models'

const { data: hasil, isLoading } = useJadwalKerjaList()

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
    <h1 class="text-xl font-semibold">Jadwal Kerja</h1>
    <p class="text-sm text-muted-foreground">
      Pekerjaan yang tim kamu tugaskan, belum diisi hasilnya. Semua anggota tim lihat data yang sama.
    </p>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada jadwal kerja"
      empty-deskripsi="Semua pekerjaan tim kamu sudah diisi hasilnya."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>