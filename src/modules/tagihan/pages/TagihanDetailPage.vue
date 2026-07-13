<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTagihanDetail } from '../composables/useKeuanganTagihan'
import { statusPembayaranEnum, statusTransaksiEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading } = useTagihanDetail(id)

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="tagihan" class="max-w-2xl space-y-6">
    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <div>
          <CardTitle>{{ tagihan.nomor_tagihan }}</CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ tagihan.layanan_internet?.pelanggan?.nama_lengkap }} &middot;
            {{ tagihan.layanan_internet?.nomor_layanan }}
          </p>
        </div>
        <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-muted-foreground">Paket (snapshot saat tagihan dibuat)</p>
          <p>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</p>
        </div>
        <div>
          <p class="text-muted-foreground">Total Tagihan</p>
          <p class="font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Periode</p>
          <p>{{ tagihan.periode_bulan }}/{{ tagihan.periode_tahun }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Jatuh Tempo</p>
          <p>{{ formatTanggal(tagihan.tanggal_jatuh_tempo) }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          v-if="!tagihan.pembayaran || tagihan.pembayaran.length === 0"
          judul="Belum ada percobaan pembayaran"
        />
        <ul v-else class="space-y-3">
          <li
            v-for="p in tagihan.pembayaran"
            :key="p.id"
            class="flex items-center justify-between border-b pb-3 text-sm last:border-0"
          >
            <div>
              <p>{{ p.metode_pembayaran ?? 'Metode tidak diketahui' }}</p>
              <p class="text-xs text-muted-foreground">{{ formatTanggal(p.created_at) }}</p>
            </div>
            <StatusBadge :value="p.status" :map="statusTransaksiEnum" />
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
