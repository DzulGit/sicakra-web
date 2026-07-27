<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { Activity } from 'lucide-vue-next'
import type { DashboardAktivitasRingkas } from '@/types/models'

defineProps<{
  data?: DashboardAktivitasRingkas[]
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Activity class="size-4 text-muted-foreground" />
        Aktivitas Terbaru
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[200px] w-full" />
      <EmptyState
        v-else-if="!data || data.length === 0"
        judul="Belum ada aktivitas"
        deskripsi="Aktivitas terbaru akan muncul di sini."
      />
      <ul v-else class="space-y-1">
        <li
          v-for="item in data"
          :key="item.id"
          class="flex items-start gap-3 border-l-2 border-muted py-2 pl-4 text-sm"
        >
          <div class="flex-1 min-w-0">
            <p class="font-medium">{{ item.deskripsi }}</p>
            <p class="text-xs text-muted-foreground">
              {{ item.pengguna }} · {{ item.waktu }}
            </p>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
