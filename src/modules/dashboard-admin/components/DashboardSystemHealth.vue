<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Activity } from 'lucide-vue-next'
import type { DashboardKesehatanSistem } from '@/types/models'

const props = withDefaults(
  defineProps<{ data?: DashboardKesehatanSistem | null; loading?: boolean }>(),
  { data: null, loading: false },
)

function statusColor(status?: string) {
  if (status === 'sehat') return 'text-success'
  if (status === 'peringatan') return 'text-warning'
  if (status === 'kritis') return 'text-destructive'
  return 'text-muted-foreground'
}

function statusDotColor(status?: string) {
  if (status === 'sehat') return 'bg-success'
  if (status === 'peringatan') return 'bg-warning'
  if (status === 'kritis') return 'bg-destructive'
  return 'bg-muted-foreground'
}

function statusLabel(status?: string) {
  if (status === 'sehat') return 'Sehat'
  if (status === 'peringatan') return 'Peringatan'
  if (status === 'kritis') return 'Kritis'
  return 'Tidak Diketahui'
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Activity class="size-4 text-muted-foreground" />
        Kesehatan Sistem
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[120px] w-full" />
      <div v-else-if="!data" class="flex items-center justify-center py-6 text-sm text-muted-foreground">
        Data kesehatan sistem belum tersedia.
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center gap-2">
          <span :class="cn('inline-block size-2 rounded-full', statusDotColor(data.status_server))" />
          <span :class="cn('text-sm font-medium', statusColor(data.status_server))">
            {{ statusLabel(data.status_server) }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-muted-foreground">Uptime</p>
            <p class="font-medium">{{ data.uptime }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Response Time</p>
            <p class="font-medium">{{ data.response_time }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">CPU</p>
            <p class="font-medium">{{ data.cpu_usage }}%</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Memory</p>
            <p class="font-medium">{{ data.memory_usage }}%</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
