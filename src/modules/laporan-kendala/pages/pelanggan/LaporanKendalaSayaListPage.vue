<script setup lang="ts">
import { useLaporanKendalaSayaList } from '../../composables/usePelangganLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const { data: hasil, isLoading } = useLaporanKendalaSayaList()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Laporan Kendala Saya</h1>
      <Button as="RouterLink" to="/pelanggan/laporan-kendala/baru">Buat Laporan</Button>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <EmptyState
      v-else-if="!hasil?.data.length"
      judul="Belum ada laporan kendala"
      deskripsi="Kalau ada gangguan pada layanan kamu, buat laporan lewat tombol di atas."
    />

    <div v-else class="space-y-3">
      <Card v-for="laporan in hasil.data" :key="laporan.id">
        <CardContent class="flex items-center justify-between p-4">
          <div>
            <p class="font-medium">{{ laporan.nomor_laporan }}</p>
            <p class="text-sm text-muted-foreground">{{ laporan.kategori_kendala }}</p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
            <Button as="RouterLink" :to="`/pelanggan/laporan-kendala/${laporan.id}`" variant="outline" size="sm">
              Detail
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
