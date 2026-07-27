<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Calendar } from 'lucide-vue-next'
import type { DashboardJadwalRingkas } from '@/types/models'

defineProps<{
  data?: DashboardJadwalRingkas[]
  loading?: boolean
  title?: string
}>()

defineEmits<{
  view?: [id: number]
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Calendar class="size-4 text-muted-foreground" />
        {{ title ?? 'Jadwal Hari Ini' }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[200px] w-full" />
      <EmptyState
        v-else-if="!data || data.length === 0"
        judul="Tidak ada jadwal"
        deskripsi="Tidak ada jadwal pekerjaan untuk hari ini."
      />
      <ul v-else class="space-y-2">
        <li
          v-for="item in data"
          :key="item.id"
          class="rounded-lg border px-3 py-2.5 text-sm"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium">{{ item.nomor_permohonan }}</p>
            <Badge variant="outline" class="text-xs shrink-0">{{ item.waktu }}</Badge>
          </div>
          <p class="mt-0.5 text-xs text-muted-foreground">{{ item.pelanggan }} — {{ item.jenis_pekerjaan }}</p>
          <p class="mt-0.5 truncate text-xs text-muted-foreground/70">{{ item.alamat }}</p>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
