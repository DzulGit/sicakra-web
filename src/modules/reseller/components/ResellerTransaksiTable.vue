<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Activity } from 'lucide-vue-next'
import type { ResellerTransaksi } from '@/types/models'

defineProps<{ data?: ResellerTransaksi[]; loading?: boolean; title?: string }>()

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Activity class="size-4 text-muted-foreground" />
        {{ title ?? 'Transaksi Terbaru' }}
      </CardTitle>
    </CardHeader>
    <CardContent class="pt-0">
      <Skeleton v-if="loading" class="h-[240px] w-full" />
      <EmptyState
        v-else-if="!data?.length"
        judul="Belum ada transaksi"
        deskripsi="Tagihan diterbitkan dan pembayaran pelanggan akan muncul di sini."
      />
      <div v-else class="divide-y divide-border">
        <div v-for="t in data" :key="`${t.jenis}-${t.id}`" class="flex items-center justify-between gap-3 py-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <Badge :variant="t.jenis === 'pembayaran' ? 'success' : 'secondary'" class="uppercase">
                {{ t.jenis }}
              </Badge>
              <span class="truncate text-sm font-medium">{{ t.nomor }}</span>
            </div>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ t.reseller }} · {{ t.pelanggan }}
            </p>
            <p class="text-xs text-muted-foreground">{{ t.waktu }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-sm font-semibold">{{ formatRupiah(t.nominal) }}</p>
            <p class="text-xs text-muted-foreground">{{ t.status }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>