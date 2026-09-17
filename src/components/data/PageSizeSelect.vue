<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

/**
 * Selector jumlah baris per halaman (10/20/50/All). Sinkron ke query-string
 * `per_page`, dipakai halaman Terbitkan Tagihan & ditempatkan di header
 * (pojok kanan atas) — tidak sama dengan Pagination di bawah tabel.
 */
const props = defineProps<{
  pageSizes: Array<{ label: string; value: string }>
  /** Per-page aktif bila selector menyala. Dipakai menghitung nilai tampilan. */
  perPage: number
}>()

const route = useRoute()
const router = useRouter()

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
  <Select
    :model-value="(typeof route.query.per_page === 'string' ? route.query.per_page : String(props.perPage))"
    @update:model-value="(nilai) => setPerPage(nilai as string)"
  >
    <SelectTrigger class="w-28"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem v-for="opt in pageSizes" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
    </SelectContent>
  </Select>
</template>