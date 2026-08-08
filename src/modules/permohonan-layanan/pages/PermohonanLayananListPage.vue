<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserPlus, MapPin, PackagePlus, RefreshCw } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { usePermohonanLayananList } from '../composables/usePermohonanLayanan'
import { statusPermohonanEnum, jenisPermohonanEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { PermohonanLayanan } from '@/types/models'

const route = useRoute()
const router = useRouter()

type TabId = 'pemasangan_baru' | 'relokasi' | 'tambah_paket' | 'ganti_paket'

const tabs: { id: TabId; label: string; icon: Component }[] = [
  { id: 'pemasangan_baru', label: 'Pendaftar Baru', icon: UserPlus },
  { id: 'relokasi', label: 'Relokasi', icon: MapPin },
  { id: 'tambah_paket', label: 'Tambah Paket', icon: PackagePlus },
  { id: 'ganti_paket', label: 'Ganti Paket', icon: RefreshCw },
]

const tabAktif = computed<TabId>(() => (route.query.jenis_permohonan as TabId) || 'pemasangan_baru')

function pilihTab(id: TabId) {
  router.push({ query: { ...route.query, jenis_permohonan: id } })
}

const { data: hasil, isLoading } = usePermohonanLayananList({ jenis_permohonan: 'pemasangan_baru' })

const filterFields: FilterFieldConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: Object.entries(statusPermohonanEnum).map(([value, meta]) => ({ value, label: meta.label })),
  },
]

const columns: ColumnDef<PermohonanLayanan, unknown>[] = [
  { accessorKey: 'nomor_permohonan', header: 'Nomor Permohonan' },
  {
    id: 'jenis',
    header: 'Jenis',
    cell: ({ row }) => h(StatusBadge, { value: row.original.jenis_permohonan, map: jenisPermohonanEnum }),
  },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
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
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Permohonan Layanan</h1>
    </div>

    <div class="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="pilihTab(tab.id)"
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="tabAktif === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      >
        <component :is="tab.icon" class="size-4" />
        {{ tab.label }}
      </button>
    </div>

    <FilterBar :fields="filterFields" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada permohonan"
      empty-deskripsi="Belum ada permohonan pada tab ini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>