<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import { useRegenerateInvoice, useTagihanSayaDetail } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { RefreshCw, ExternalLink, Clock } from 'lucide-vue-next'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading } = useTagihanSayaDetail(id)
const { mutate: regenerate, isPending: isRegenerating } = useRegenerateInvoice()

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function handleRegenerate() {
  regenerate(id.value, {
    onSuccess: (baru) => {
      if (baru.xendit_invoice_url) {
        window.open(baru.xendit_invoice_url, '_blank', 'noopener,noreferrer')
      }
      toast.success('Link pembayaran baru dibuat')
    },
    onError: (e: Error) => {
      const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
      toast.error(pesan ?? 'Gagal membuat link pembayaran')
    },
  })
}
</script>

<template>
  <div v-if="isLoading"><Skeleton class="h-64 w-full max-w-lg" /></div>

  <Card v-else-if="tagihan" class="max-w-xl">
    <CardHeader class="flex-row items-center justify-between">
      <CardTitle>{{ tagihan.nomor_tagihan }}</CardTitle>
      <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
    </CardHeader>
    <CardContent class="space-y-3 text-sm">
      <div>
        <p class="text-muted-foreground">Paket</p>
        <p>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</p>
      </div>
      <div>
        <p class="text-muted-foreground">Periode</p>
        <p>{{ tagihan.periode_bulan }}/{{ tagihan.periode_tahun }}</p>
      </div>
      <div>
        <p class="text-muted-foreground">Total Tagihan</p>
        <p class="text-lg font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</p>
      </div>
      <div v-if="tagihan.jumlah_bulan > 1">
        <p class="text-muted-foreground">Mencakup</p>
        <p>{{ tagihan.jumlah_bulan }} bulan pembayaran</p>
      </div>
      <div>
        <p class="text-muted-foreground">Jatuh Tempo</p>
        <p>{{ formatTanggal(tagihan.tanggal_jatuh_tempo) }}</p>
      </div>

      <!-- Belum bayar + link Xendit aktif -->
      <Button
        v-if="tagihan.status_pembayaran === 'belum_bayar' && tagihan.xendit_invoice_url"
        as="a"
        :href="tagihan.xendit_invoice_url"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full"
      >
        <ExternalLink class="mr-2 size-4" />
        Bayar Sekarang
      </Button>

      <!-- Belum bayar + invoice belum ke-generate (async) -->
      <div
        v-else-if="tagihan.status_pembayaran === 'belum_bayar' && !tagihan.xendit_invoice_url && !tagihan.xendit_invoice_id"
        class="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-muted-foreground"
      >
        <RefreshCw class="size-4 animate-spin" />
        <span class="text-sm">Menyiapkan pembayaran...</span>
      </div>

      <!-- Kedaluwarsa -->
      <div v-else-if="tagihan.status_pembayaran === 'kedaluwarsa'" class="space-y-3">
        <div v-if="tagihan.xendit_invoice_retry_count >= 3" class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
          <p class="font-medium text-destructive">Maksimal percobaan tercapai</p>
          <p class="mt-1 text-muted-foreground">Silakan hubungi customer service untuk bantuan.</p>
        </div>

        <div v-else class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <Clock class="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div class="flex-1">
            <p class="font-medium">Waktu pembayaran habis</p>
            <p class="mt-0.5 text-amber-800/80">Klik tombol di bawah untuk membuat link pembayaran baru.</p>
          </div>
        </div>

        <p v-if="tagihan.xendit_invoice_retry_count > 0" class="text-xs text-muted-foreground">
          Percobaan ke-{{ tagihan.xendit_invoice_retry_count }} dari 3
        </p>

        <Button
          v-if="tagihan.xendit_invoice_retry_count < 3"
          class="w-full"
          :disabled="isRegenerating"
          @click="handleRegenerate"
        >
          <RefreshCw class="mr-2 size-4" />
          Buat Ulang Link Pembayaran
        </Button>
      </div>

      <!-- Sudah bayar -->
      <div v-else-if="tagihan.status_pembayaran === 'sudah_bayar'" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        <p class="font-medium">Lunas</p>
        <p v-if="tagihan.dibayar_pada" class="mt-0.5 text-sm text-emerald-800/80">
          Dibayar {{ formatTanggal(tagihan.dibayar_pada) }}
        </p>
      </div>
    </CardContent>
  </Card>

  <!-- Riwayat Pembayaran -->
  <Card v-if="tagihan?.pembayaran" class="mt-6 max-w-xl">
    <CardHeader>
      <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
    </CardHeader>
    <CardContent>
      <RiwayatPembayaranTable :pembayaran="tagihan.pembayaran" />
    </CardContent>
  </Card>
</template>
