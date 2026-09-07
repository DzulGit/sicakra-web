<script setup lang="ts">
import { h, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { useResellerPelangganList } from '../composables/useReseller'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import type { Pelanggan } from '@/types/models'

const route = useRoute()
const resellerId = computed(() => String(route.params.id))
const { data: hasil, isLoading } = useResellerPelangganList(resellerId)

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor Pelanggan' },
  { accessorKey: 'nama_lengkap', header: 'Nama' },
  { accessorKey: 'nik', header: 'NIK' },
  { accessorKey: 'nomor_hp', header: 'No. HP' },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]
      if (!layanan) return '-'
      if (layanan.tipe_paket === 'custom') return layanan.nama_paket_custom ?? 'Custom'
      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status_layanan',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.layanan_internet?.[0]?.status
      if (!s) return h('span', { class: 'text-muted-foreground' }, '-')
      return h(StatusBadge, {
        value: s,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pelanggan Reseller</h1>
      <p class="text-sm text-muted-foreground">Mode read-only — admin tidak dapat mengubah data pelanggan di sini.</p>
    </div>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Reseller ini belum memiliki pelanggan"
      empty-deskripsi="Pelanggan yang didaftarkan reseller akan muncul di sini."
    />
    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>