<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserPlus, MapPin, PackagePlus, RefreshCw } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { useJadwalKerjaList } from '@/modules/jadwal-kerja/composables/useJadwalKerja'
import { hasilKerjaEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { JadwalKerja } from '@/types/models'

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

const { data: hasil, isLoading } = useJadwalKerjaList({ jenis_permohonan: 'pemasangan_baru' })

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
      empty-judul="Tidak ada jadwal kerja"
      empty-deskripsi="Belum ada jadwal kerja pada tab ini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>