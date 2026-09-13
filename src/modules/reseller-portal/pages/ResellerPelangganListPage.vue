<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { Search, X, Users, UserPlus, Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Component } from 'vue'

import type { Pelanggan } from '@/types/models'

import { useResellerPelangganList } from '../composables/useResellerPortal'

import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type TabId = 'aktif' | 'baru'

const tabAktif = ref<TabId>('aktif')
const cariPelanggan = ref('')

const { data: hasil, isLoading } = useResellerPelangganList(cariPelanggan)

type KategoriPelanggan = 'aktif' | 'baru'

const semuaPelanggan = computed(() => hasil.value?.data ?? [])

const pelangganAktif = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]
    return layanan?.status === 'aktif' && (layanan.tagihan?.length ?? 0) > 0
  })
})

const pelangganBaru = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]
    return layanan?.status === 'aktif' && (layanan.tagihan?.length ?? 0) === 0
  })
})

const pelangganDitampilkan = computed(() => {
  return tabAktif.value === 'aktif' ? pelangganAktif.value : pelangganBaru.value
})

const tabs = computed<{ id: KategoriPelanggan; label: string; icon: Component; jumlah: number }[]>(() => [
  { id: 'aktif', label: 'Pelanggan Aktif', icon: Users, jumlah: pelangganAktif.value.length },
  { id: 'baru', label: 'Pelanggan Baru', icon: UserPlus, jumlah: pelangganBaru.value.length },
])

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor Pelanggan' },
  { accessorKey: 'nama_lengkap', header: 'Nama' },
  { accessorKey: 'nik', header: 'NIK' },
  { accessorKey: 'nomor_hp', header: 'No. HP' },
  {
    id: 'tanggal_tagihan',
    header: 'Tagihan Tgl',
    cell: ({ row }) => row.original.tanggal_tagihan ?? '-',
  },
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
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.layanan_internet?.[0]?.status
      if (!status) return h('span', { class: 'text-muted-foreground' }, 'Belum Aktif')
      return h(StatusBadge, {
        value: status,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(Button, {
        as: RouterLink,
        to: `/reseller/pelanggan/${row.original.id}`,
        variant: 'outline',
        size: 'sm',
      }, () => 'Detail'),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pelanggan</h1>
      <Button size="sm" class="gap-1.5" :as="RouterLink" to="/reseller/pelanggan/baru">
        <Plus class="size-4" />
        Daftarkan Pelanggan
      </Button>
    </div>

    <div class="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="tabAktif = tab.id"
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="tabAktif === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      >
        <component :is="tab.icon" class="size-4" />
        {{ tab.label }}
        <span class="rounded-full bg-muted px-1.5 py-0.5 text-xs">{{ tab.jumlah }}</span>
      </button>
    </div>

    <div class="relative w-full max-w-sm">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="cariPelanggan" placeholder="Cari nama / nomor / NIK / HP..." class="pl-9" />
      <button
        v-if="cariPelanggan"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="cariPelanggan = ''"
      >
        <X class="size-4" />
      </button>
    </div>

    <DataTable
      :columns="columns"
      :data="pelangganDitampilkan"
      :loading="isLoading"
      :empty-judul="tabAktif === 'aktif' ? 'Belum ada pelanggan aktif' : 'Belum ada pelanggan baru'"
      :empty-deskripsi="tabAktif === 'aktif' ? 'Pelanggan akan masuk ke kategori ini setelah memiliki tagihan pertama.' : 'Pelanggan baru adalah pelanggan dengan layanan aktif yang belum memiliki tagihan pertama.'"
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>