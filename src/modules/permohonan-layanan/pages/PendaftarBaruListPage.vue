<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { getPermohonanLayananList } from '../api/permohonanLayanan.api'
import { statusPermohonanEnum } from '@/lib/enums'
import { useQuery } from '@tanstack/vue-query'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { PermohonanLayanan } from '@/types/models'

const { data: hasil, isLoading } = useQuery({
  queryKey: ['permohonan-layanan', 'pendaftar-baru'],
  queryFn: () => getPermohonanLayananList({ status: 'MENUNGGU_VERIFIKASI' }).then((res) => res.data.data),
})

const columns: ColumnDef<PermohonanLayanan, unknown>[] = [
  { accessorKey: 'nomor_permohonan', header: 'Nomor Daftar' },
  {
    id: 'pelanggan',
    header: 'Nama Pendaftar',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
  },
  {
    id: 'nik',
    header: 'NIK',
    cell: ({ row }) => row.original.pelanggan?.nik ?? '-',
  },
  {
    id: 'kontak',
    header: 'No. HP',
    cell: ({ row }) => row.original.pelanggan?.nomor_hp ?? '-',
  },
  {
    accessorKey: 'jenis_permohonan',
    header: 'Jenis',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusPermohonanEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/operasional/permohonan-layanan/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Verifikasi',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pendaftar Baru</h1>
    </div>
    <p class="text-sm text-muted-foreground">
      Pendaftar yang menunggu verifikasi — segera diproses.
    </p>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada pendaftar baru"
      empty-deskripsi="Semua pendaftar sudah diverifikasi."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
