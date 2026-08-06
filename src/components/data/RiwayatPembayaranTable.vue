<script setup lang="ts">
import type { Pembayaran } from '@/types/models'
import { statusTransaksiEnum } from '@/lib/enums'
import StatusBadge from './StatusBadge.vue'
import EmptyState from './EmptyState.vue'

defineProps<{
  pembayaran: Pembayaran[]
}>()

function formatRupiah(nilai: string | null) {
  if (!nilai) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}

function formatTanggal(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<template>
  <div v-if="!pembayaran.length">
    <EmptyState judul="Belum ada riwayat pembayaran" deskripsi="Riwayat akan muncul setelah ada transaksi." />
  </div>

  <div v-else class="overflow-hidden rounded-lg border">
    <table class="w-full text-sm">
      <thead class="border-b bg-muted/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Metode</th>
          <th class="px-4 py-3 text-right font-medium text-muted-foreground">Jumlah</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Diterima oleh</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pembayaran" :key="p.id" class="border-b last:border-0">
          <td class="px-4 py-3">{{ p.metode_pembayaran ?? '—' }}</td>
          <td class="px-4 py-3 text-right font-medium tabular-nums">{{ formatRupiah(p.jumlah_dibayar) }}</td>
          <td class="px-4 py-3 text-muted-foreground">{{ p.dibayar_oleh ?? '—' }}</td>
          <td class="px-4 py-3">
            <StatusBadge :value="p.status" :map="statusTransaksiEnum" />
          </td>
          <td class="px-4 py-3 text-muted-foreground">{{ formatTanggal(p.dibayar_pada ?? p.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
