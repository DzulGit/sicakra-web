<script setup lang="ts">
import { statusPermohonanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import type { RiwayatStatusPermohonan } from '@/types/models'

defineProps<{ riwayat: RiwayatStatusPermohonan[] }>()

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <ol class="space-y-4">
    <li v-for="item in riwayat" :key="item.id" class="flex gap-3">
      <div class="mt-1 size-2 shrink-0 rounded-full bg-primary" />
      <div class="flex-1 space-y-1 border-b pb-4 last:border-0">
        <div class="flex items-center gap-2">
          <StatusBadge :value="item.status_sesudahnya" :map="statusPermohonanEnum" />
          <span class="text-xs text-muted-foreground">{{ formatTanggal(item.created_at) }}</span>
        </div>
        <p v-if="item.catatan" class="text-sm text-muted-foreground">{{ item.catatan }}</p>
        <p v-if="item.diubah_oleh" class="text-xs text-muted-foreground">
          oleh {{ item.diubah_oleh.nama_lengkap }}
        </p>
      </div>
    </li>
  </ol>
</template>
