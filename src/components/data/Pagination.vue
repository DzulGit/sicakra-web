<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { PaginatedData } from '@/types/api'

/**
 * Sinkron langsung ke query-string (?page=2) — konsisten dengan FilterBar,
 * supaya composable data-fetching cukup baca route.query sebagai satu-satunya
 * sumber state (tidak ada state pagination terpisah di komponen manapun).
 */
defineProps<{
  meta: Pick<PaginatedData<unknown>, 'current_page' | 'last_page' | 'total' | 'per_page'>
}>()

const route = useRoute()
const router = useRouter()

function kePage(halaman: number) {
  router.push({ query: { ...route.query, page: String(halaman) } })
}
</script>

<template>
  <div class="flex items-center justify-between text-sm">
    <p class="text-muted-foreground">
      Halaman {{ meta.current_page }} dari {{ meta.last_page }} &middot; {{ meta.total }} total data
    </p>
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
