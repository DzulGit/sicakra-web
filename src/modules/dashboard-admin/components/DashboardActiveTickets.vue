<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { statusLaporanEnum } from '@/lib/enums'
import { MessageSquareWarning, Wrench } from 'lucide-vue-next'
import type { LaporanKendala } from '@/types/models'

defineProps<{
  data?: LaporanKendala[]
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <MessageSquareWarning class="size-4 text-muted-foreground" />
        Kendala Ditugaskan
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[200px] w-full" />
      <EmptyState
        v-else-if="!data || data.length === 0"
        judul="Tidak ada kendala aktif"
        deskripsi="Kendala yang ditugaskan ke kamu akan muncul di sini."
      />
      <ul v-else class="space-y-2">
        <li
          v-for="item in data"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Wrench class="size-4" />
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium">{{ item.kategori_kendala }}</p>
              <p class="truncate text-xs text-muted-foreground">
                {{ item.layanan_internet?.pelanggan?.nama_lengkap ?? '—' }}
                <span class="before:mx-1 before:content-['·']">{{ item.nomor_laporan }}</span>
              </p>
            </div>
          </div>
          <StatusBadge :value="item.status" :map="statusLaporanEnum" class="shrink-0" />
        </li>
      </ul>
    </CardContent>
  </Card>
</template>