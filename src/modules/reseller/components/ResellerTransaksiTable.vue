<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Activity, ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { formatRupiah } from '@/lib/currency'
import type { ResellerTransaksi } from '@/types/models'

const props = withDefaults(
  defineProps<{ data?: ResellerTransaksi[]; loading?: boolean; title?: string; limit?: number }>(),
  { limit: 0 },
)

/** `limit` > 0 = tampilkan N transaksi terbaru saja (rumah monitoring global). */
const tampil = computed(() => (props.limit > 0 ? (props.data ?? []).slice(0, props.limit) : (props.data ?? [])))
/** Tombol "Lihat Semua" hanya muncul kalau card ini memang memotong data. */
const bisaLihatSemua = computed(() => props.limit > 0)
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
        v-else-if="!tampil.length"
        judul="Belum ada transaksi"
        deskripsi="Tagihan diterbitkan dan pembayaran pelanggan akan muncul di sini."
      />
      <div v-else class="divide-y divide-border">
        <div v-for="t in tampil" :key="`${t.jenis}-${t.id}`" class="flex items-center justify-between gap-3 py-3">
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

    <CardFooter v-if="bisaLihatSemua" class="justify-end border-t pt-4">
      <Button variant="outline" size="sm" as-child>
        <RouterLink :to="{ name: 'admin.operasional.reseller.transaksi' }">
          Lihat Semua Transaksi
          <ArrowRight class="mr-2 size-4" />
        </RouterLink>
      </Button>
    </CardFooter>
  </Card>
</template>
