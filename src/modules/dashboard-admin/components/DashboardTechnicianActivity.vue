<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Wrench } from 'lucide-vue-next'
import type { DashboardAktivitasTeknisi } from '@/types/models'

defineProps<{
  data?: DashboardAktivitasTeknisi[]
  loading?: boolean
}>()

function statusVariant(status: string) {
  if (status === 'selesai') return 'success'
  if (status === 'kendala') return 'warning'
  return 'secondary'
}

function statusLabel(status: string) {
  if (status === 'selesai') return 'Selesai'
  if (status === 'kendala') return 'Kendala'
  return status
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Wrench class="size-4 text-muted-foreground" />
        Aktivitas Teknisi
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[200px] w-full" />
      <EmptyState
        v-else-if="!data || data.length === 0"
        judul="Belum ada aktivitas"
        deskripsi="Aktivitas teknisi hari ini akan muncul di sini."
      />
      <ul v-else class="space-y-3">
        <li
          v-for="item in data"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {{ item.teknisi.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-medium">{{ item.teknisi }}</p>
              <p class="text-xs text-muted-foreground">{{ item.aktivitas }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">{{ item.waktu }}</span>
            <Badge :variant="statusVariant(item.status)" class="text-xs">
              {{ statusLabel(item.status) }}
            </Badge>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
