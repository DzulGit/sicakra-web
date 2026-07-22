<script setup lang="ts">
import { useLayananSayaList } from '../composables/usePelangganLayanan'
import { statusLayananEnum, tipePaketEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const { data: hasil, isLoading } = useLayananSayaList()
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Layanan Saya</h1>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-40 w-full" />
    </div>

    <EmptyState
      v-else-if="!hasil?.data.length"
      judul="Belum ada layanan aktif"
      deskripsi="Layanan internet kamu akan muncul di sini setelah pemasangan selesai."
    />

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <Card v-for="layanan in hasil.data" :key="layanan.id">
        <CardHeader class="flex-row items-center justify-between">
          <CardTitle class="text-base">{{ layanan.nomor_layanan }}</CardTitle>
          <StatusBadge :value="layanan.status" :map="statusLayananEnum" />
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p class="text-muted-foreground">{{ layanan.alamat_pemasangan }}</p>
          <div class="flex items-center gap-2">
            <StatusBadge :value="layanan.tipe_paket" :map="tipePaketEnum" />
            <span>{{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom }}</span>
          </div>
          <Button as="RouterLink" :to="`/pelanggan/layanan/${layanan.id}`" variant="outline" size="sm">
            Lihat Detail
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
