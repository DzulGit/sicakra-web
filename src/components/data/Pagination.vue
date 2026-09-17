<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { PaginatedData } from '@/types/api'

/**
 * Sinkron langsung ke query-string (?page=2) — konsisten dengan FilterBar,
 * supaya composable data-fetching cukup baca route.query sebagai satu-satunya
 * sumber state (tidak ada state pagination terpisah di komponen manapun).
 *
 * `pageSizes` opsional: bila diisi, menampilkan selector jumlah baris per
 * halaman. Nilai 'all' dipakai halaman Terbitkan Tagihan untuk memuat seluruh
 * data sekaligus (backend memperlakukannya sebagai per_page = 100000).
 */
defineProps<{
  meta: Pick<PaginatedData<unknown>, 'current_page' | 'last_page' | 'total' | 'per_page'>
  pageSizes?: Array<{ label: string; value: string }>
}>()

const route = useRoute()
const router = useRouter()

function kePage(halaman: number) {
  router.push({ query: { ...route.query, page: String(halaman) } })
}

function setPerPage(nilai: string) {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) {
    if (typeof v === 'string' && k !== 'page') query[k] = v
  }
  if (nilai) query.per_page = nilai
  else delete query.per_page
  router.push({ query })
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
    <div class="flex items-center gap-2">
      <Select
        v-if="pageSizes"
        :model-value="(typeof route.query.per_page === 'string' ? route.query.per_page : String(meta.per_page))"
        @update:model-value="(nilai) => setPerPage(nilai as string)"
      >
        <SelectTrigger class="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in pageSizes" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
        </SelectContent>
      </Select>
      <p class="text-muted-foreground">
        Halaman {{ meta.current_page }} dari {{ meta.last_page }} &middot; {{ meta.total }} total data
      </p>
    </div>
    <div class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="meta.current_page <= 1"
        @click="kePage(meta.current_page - 1)"
      >
        <ChevronLeft class="size-4" />
        Sebelumnya
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="meta.current_page >= meta.last_page"
        @click="kePage(meta.current_page + 1)"
      >
        Berikutnya
        <ChevronRight class="size-4" />
      </Button>
    </div>
  </div>
</template>