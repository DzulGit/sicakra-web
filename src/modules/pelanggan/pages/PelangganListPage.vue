<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { usePelangganList } from '../composables/usePelanggan'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Pelanggan } from '@/types/models'

const route = useRoute()
const router = useRouter()
const { data: hasil, isLoading } = usePelangganList()

const cari = ref((route.query.cari as string) ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(cari, (nilai) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    router.push({ query: nilai ? { cari: nilai } : {} })
  }, 400)
})

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor' },
  { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
  { accessorKey: 'nik', header: 'NIK' },
  { accessorKey: 'nomor_hp', header: 'No. HP' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: 'RouterLink', to: `/admin/operasional/pelanggan/${row.original.id}`, variant: 'outline', size: 'sm' },
        () => 'Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pelanggan</h1>
    </div>

    <div class="relative w-full max-w-sm">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="cari" placeholder="Cari nama / nomor / NIK / HP..." class="pl-9" />
      <button
        v-if="cari"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="cari = ''"
      >
        <X class="size-4" />
      </button>
    </div>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada pelanggan"
      empty-deskripsi="Data pelanggan akan muncul setelah pendaftaran."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
