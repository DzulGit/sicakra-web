<script setup lang="ts">
import { computed } from 'vue'
import { statusPermohonanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import type { RiwayatStatusPermohonan } from '@/types/models'

const props = defineProps<{ riwayat: RiwayatStatusPermohonan[] }>()

/** Status terbaru ditampilkan paling atas (id desc sebagai tiebreaker saat timestamp sama). */
const riwayatTerurut = computed(() =>
  [...props.riwayat].sort((a, b) => {
    const selisihWaktu = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return selisihWaktu !== 0 ? selisihWaktu : b.id - a.id
  }),
)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * `diubah_oleh` dari API kadang berupa id mentah (angka) dan kadang object Admin.
 * Tampilkan actor hanya bila object-nya berisi nama.
 */
function namaPengubah(item: RiwayatStatusPermohonan): string | null {
  const o = item.diubah_oleh
  if (o && typeof o === 'object' && 'nama_lengkap' in o && o.nama_lengkap) return o.nama_lengkap
  return null
}
</script>

<template>
  <ol class="space-y-3">
    <li v-for="item in riwayatTerurut" :key="item.id" class="flex gap-2.5">
      <div class="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      <div class="min-w-0 flex-1 space-y-0.5 text-sm">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <StatusBadge :value="item.status_sesudahnya" :map="statusPermohonanEnum" />
          <span class="text-xs text-muted-foreground">{{ formatTanggal(item.created_at) }}</span>
        </div>
        <p v-if="item.catatan" class="text-xs text-muted-foreground">{{ item.catatan }}</p>
        <p v-if="namaPengubah(item)" class="text-xs text-muted-foreground/80">
          oleh {{ namaPengubah(item) }}
        </p>
      </div>
    </li>
    <li v-if="riwayatTerurut.length === 0" class="text-sm text-muted-foreground">
      Belum ada riwayat status.
    </li>
  </ol>
</template>