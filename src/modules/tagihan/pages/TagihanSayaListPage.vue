<script setup lang="ts">
import { useTagihanSayaList } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const { data: hasil, isLoading } = useTagihanSayaList()

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Tagihan Saya</h1>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <EmptyState v-else-if="!hasil?.data.length" judul="Belum ada tagihan" />

    <div v-else class="space-y-3">
      <Card v-for="tagihan in hasil.data" :key="tagihan.id">
        <CardContent class="flex items-center justify-between p-4">
          <div>
            <p class="font-medium">{{ tagihan.nomor_tagihan }}</p>
            <p class="text-sm text-muted-foreground">
              Periode {{ tagihan.periode_bulan }}/{{ tagihan.periode_tahun }} &middot;
              {{ formatRupiah(tagihan.total_tagihan) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
            <Button as="RouterLink" :to="`/pelanggan/tagihan/${tagihan.id}`" variant="outline" size="sm">
              Detail
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
