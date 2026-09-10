<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import type { Pelanggan } from '@/types/models'

import { useResellerPelangganList } from '../composables/useResellerPortal'

import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const { data: hasil, isLoading } = useResellerPelangganList()

type KategoriPelanggan = 'aktif' | 'baru'

const kategori = ref<KategoriPelanggan>('aktif')

const semuaPelanggan = computed(() => hasil.value?.data ?? [])

const pelangganAktif = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]

    return (
      layanan?.status === 'aktif' &&
      (layanan.tagihan?.length ?? 0) > 0
    )
  })
})

const pelangganBaru = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]

    return (
      layanan?.status === 'aktif' &&
      (layanan.tagihan?.length ?? 0) === 0
    )
  })
})

const pelangganDitampilkan = computed(() => {
  return kategori.value === 'aktif'
    ? pelangganAktif.value
    : pelangganBaru.value
})

const columns: ColumnDef<Pelanggan, unknown>[] = [
  {
    accessorKey: 'nama_lengkap',
    header: 'Nama',
  },
  {
    accessorKey: 'nik',
    header: 'NIK',
  },
  {
    accessorKey: 'nomor_hp',
    header: 'No. HP',
  },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]

      if (!layanan) {
        return '-'
      }

      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.layanan_internet?.[0]?.status

      if (!status) {
        return h(Badge, { variant: 'warning' }, () => 'Belum Aktif')
      }

      return h(StatusBadge, {
        value: status,
        map: {
          aktif: {
            label: 'Aktif',
            badgeVariant: 'success',
          },
          nonaktif: {
            label: 'Nonaktif',
            badgeVariant: 'secondary',
          },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        {
          as: RouterLink,
          to: `/reseller/pelanggan/${row.original.id}`,
          variant: 'ghost',
          size: 'sm',
        },
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">
        Pelanggan
      </h1>

      <Button size="sm" class="gap-1.5" :as="RouterLink" to="/reseller/pelanggan/baru">
        <Plus class="size-4" />
        Daftarkan Pelanggan
      </Button>
    </div>

    <div class="flex items-center gap-2 border-b">
      <button type="button" class="relative px-4 py-2 text-sm font-medium transition" :class="kategori === 'aktif'
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
        " @click="kategori = 'aktif'">
        Pelanggan Aktif

        <span class="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
          {{ pelangganAktif.length }}
        </span>

        <span v-if="kategori === 'aktif'" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </button>

      <button type="button" class="relative px-4 py-2 text-sm font-medium transition" :class="kategori === 'baru'
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
        " @click="kategori = 'baru'">
        Pelanggan Baru

        <span class="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
          {{ pelangganBaru.length }}
        </span>

        <span v-if="kategori === 'baru'" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </button>
    </div>

    <!-- TABLE -->
    <DataTable :columns="columns" :data="pelangganDitampilkan" :loading="isLoading" :empty-judul="kategori === 'aktif'
        ? 'Belum ada pelanggan aktif'
        : 'Belum ada pelanggan baru'
      " :empty-deskripsi="kategori === 'aktif'
      ? 'Pelanggan akan masuk ke kategori ini setelah memiliki tagihan pertama.'
      : 'Pelanggan baru adalah pelanggan dengan layanan aktif yang belum memiliki tagihan pertama.'
    " />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>