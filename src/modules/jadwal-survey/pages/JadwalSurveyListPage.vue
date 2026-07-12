<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useJadwalSurveyList } from '../composables/useJadwalSurvey'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Button } from '@/components/ui/button'
import type { JadwalSurvey } from '@/types/models'

const { data: hasil, isLoading } = useJadwalSurveyList()

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

const columns: ColumnDef<JadwalSurvey, unknown>[] = [
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
    accessorKey: 'tanggal_survey',
    header: 'Tanggal Survey',
    cell: ({ row }) => formatTanggal(row.original.tanggal_survey),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/teknisi/jadwal-survey/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Isi Hasil',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Jadwal Survey</h1>
    <p class="text-sm text-muted-foreground">Menampilkan jadwal survey milik kamu yang belum diisi hasilnya.</p>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada jadwal survey"
      empty-deskripsi="Semua jadwal survey kamu sudah diisi hasilnya."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
