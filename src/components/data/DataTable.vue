<script setup lang="ts" generic="TData">
import { FlexRender, useVueTable, getCoreRowModel, type ColumnDef } from '@tanstack/vue-table'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from './EmptyState.vue'

/**
 * Wrapper headless TanStack Table + styling Tailwind kita sendiri.
 * Loading -> skeleton per baris (bentuk menyerupai tabel asli, bukan spinner).
 * Kosong -> EmptyState generik. Dipakai SEMUA tabel data di dashboard
 * (Permohonan, Jadwal, Laporan, Tagihan, Admin) — jangan bikin tabel custom
 * per modul, cukup konfigurasi `columns`.
 */
const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, unknown>[]
    data: TData[]
    loading?: boolean
    emptyJudul?: string
    emptyDeskripsi?: string
  }>(),
  {
    loading: false,
    emptyJudul: 'Belum ada data',
  },
)

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/50">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="px-4 py-3 text-left font-medium text-muted-foreground"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 5" :key="n" class="border-b last:border-0">
            <td v-for="c in columns.length" :key="c" class="px-4 py-3">
              <Skeleton class="h-4 w-full" />
            </td>
          </tr>
        </template>
        <template v-else-if="table.getRowModel().rows.length === 0">
          <tr>
            <td :colspan="columns.length">
              <EmptyState :judul="emptyJudul" :deskripsi="emptyDeskripsi" />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-b transition-colors last:border-0 hover:bg-muted/30"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-3">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
