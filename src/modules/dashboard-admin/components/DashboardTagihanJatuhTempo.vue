<script setup lang="ts">
import { CalendarClock } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Button } from '@/components/ui/button'
import type { Tagihan } from '@/types/models'
import { RouterLink } from 'vue-router'

withDefaults(defineProps<{ data?: Tagihan[]; loading?: boolean }>(), {
  data: () => [],
  loading: false,
})

function rupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}

function tanggal(t: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(t))
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <CalendarClock class="size-4 text-muted-foreground" />
        Tagihan Jatuh Tempo 7 Hari
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <Skeleton v-if="loading" class="mx-4 mb-4 h-24" />
      <EmptyState
        v-else-if="data.length === 0"
        judul="Tidak ada tagihan jatuh tempo"
        deskripsi="Tagihan 7 hari ke depan akan muncul di sini."
      />
      <ul v-else class="divide-y">
        <li v-for="tagihan in data" :key="tagihan.id" class="flex items-center justify-between gap-4 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ tagihan.nomor_tagihan }}</p>
            <p class="truncate text-xs text-muted-foreground">
              {{ tagihan.layanan_internet?.pelanggan?.nama_lengkap ?? '—' }} · {{ tanggal(tagihan.tanggal_jatuh_tempo) }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="text-sm font-semibold">{{ rupiah(tagihan.total_tagihan) }}</span>
            <Button :as="RouterLink" :to="`/admin/keuangan/tagihan/${tagihan.id}`" variant="outline" size="sm">
              Detail
            </Button>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
