<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
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
import { RefreshCw, ExternalLink, Clock, MessageCircleWarning } from 'lucide-vue-next'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanSayaDetail(id)
const { mutate: regenerate, isPending: isRegenerating } = useRegenerateInvoice()

// Overdue lock: masih ada tagihan lain jatuh tempo terlewati belum lunas →
// pembayaran diblokir backend, arahkan pelanggan ke Admin via WhatsApp.
const WA_ADMIN = '6280015555555'
const overdueTerkunci = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null

watch(tagihan, (baru) => {
  if (baru) {
    overdueTerkunci.value = false
  }

  // Polling terus berjalan selama status masih "belum_bayar"
  if (baru?.status_pembayaran === 'belum_bayar') {
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (refetch) refetch()
      }, 3000) // Cek setiap 3 detik
    }
  } else {
    // Hentikan interval jika status sudah "sudah_bayar" atau "kedaluwarsa"
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}, { immediate: true, deep: true })

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const periodeTampilan = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  return `${t.periode_bulan}/${t.periode_tahun}`
})

function formatRupiah(nilai: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function pesanError(e: unknown) {
  const data = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined) : undefined
  overdueTerkunci.value = data?.kode === 'OVERDUE_LOCK'
  return data?.message
}

const waAdminHref = computed(() => {
  const pesan = `Halo Admin Sicakra, saya punya tagihan yang belum lunas dan ingin dibantu pembayarannya.`
  return `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(pesan)}`
})

function handleRegenerate() {
  regenerate(id.value, {
    onSuccess: (baru) => {
      if (baru?.xendit_invoice_url) {
        window.open(baru.xendit_invoice_url, '_blank', 'noopener,noreferrer')
      }
      toast.success('Link pembayaran baru dibuat')
    },
    onError: (e: Error) => {
      toast.error(pesanError(e) ?? 'Gagal membuat link pembayaran')
    },
  })
}
</script>

<template>
  <div v-if="isLoading">
    <Skeleton class="h-64 w-full max-w-lg" />
  </div>

  <div v-else-if="tagihan" class="max-w-xl space-y-6">
    <!-- Overdue lock: hubungi admin via WhatsApp -->
    <div v-if="overdueTerkunci"
      class="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
      <MessageCircleWarning class="mt-0.5 size-5 shrink-0 text-destructive" />
      <div class="flex-1 text-sm">
        <p class="font-medium text-destructive">Tagihan lain belum lunas</p>
        <p class="mt-0.5 text-muted-foreground">
          Masih ada tagihan yang jatuh temponya terlewati. Silakan hubungi Admin Sicakra via WhatsApp untuk dibantu.
        </p>
        <Button as="a" :href="waAdminHref" target="_blank" rel="noopener noreferrer" variant="outline" size="sm"
          class="mt-3">
          <MessageCircleWarning class="mr-2 size-4" /> Hubungi Admin via WhatsApp
        </Button>
      </div>
    </div>

    <Card>
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
          <p class="text-muted-foreground">Jatuh Tempo</p>
          <p>{{ formatTanggal(tagihan.tanggal_jatuh_tempo) }}</p>
        </div>
      </CardContent>
    </Card>



    <!-- Card 2: Ringkasan & Pembayaran -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base">Ringkasan & Pembayaran</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Periode</span>
          <span>{{ periodeTampilan }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Total Tagihan</span>
          <span class="text-lg font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</span>
        </div>

        <!-- Belum bayar + link Xendit aktif: murni bayar, tanpa logika generate -->
        <div v-if="tagihan.status_pembayaran === 'belum_bayar' && tagihan.xendit_invoice_url" class="space-y-3 pt-2">
          <Button as="a" :href="tagihan.xendit_invoice_url" target="_blank" rel="noopener noreferrer" class="w-full"
            :disabled="overdueTerkunci">
            <ExternalLink class="mr-2 size-4" />
            Bayar Sekarang via Xendit
          </Button>
        </div>

        <!-- Belum bayar + invoice belum ke-generate (async) -->
        <div
          v-else-if="tagihan.status_pembayaran === 'belum_bayar' && !tagihan.xendit_invoice_url && !tagihan.xendit_invoice_id"
          class="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-muted-foreground">
          <RefreshCw class="size-4 animate-spin" />
          <span class="text-sm">Menyiapkan pembayaran...</span>
        </div>

        <!-- Kedaluwarsa: buat ulang link pembayaran -->
        <div v-else-if="tagihan.status_pembayaran === 'kedaluwarsa'" class="space-y-3">
          <div v-if="tagihan.xendit_invoice_retry_count >= 3"
            class="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
            <p class="font-medium text-destructive">Maksimal percobaan tercapai</p>
            <p class="mt-1 text-muted-foreground">Silakan hubungi customer service untuk bantuan.</p>
          </div>

          <div v-else
            class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <Clock class="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div class="flex-1">
              <p class="font-medium">Waktu pembayaran habis</p>
              <p class="mt-0.5 text-amber-800/80">Klik tombol di bawah untuk membuat link pembayaran baru.</p>
            </div>
          </div>

          <p v-if="tagihan.xendit_invoice_retry_count > 0" class="text-xs text-muted-foreground">
            Percobaan ke-{{ tagihan.xendit_invoice_retry_count }} dari 3
          </p>

          <Button v-if="tagihan.xendit_invoice_retry_count < 3" class="w-full"
            :disabled="isRegenerating || overdueTerkunci" @click="handleRegenerate">
            <RefreshCw v-if="isRegenerating" class="mr-2 size-4 animate-spin" />
            Buat Ulang Link Pembayaran
          </Button>
        </div>

        <!-- Sudah bayar -->
        <div v-else-if="tagihan.status_pembayaran === 'sudah_bayar'"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <p class="font-medium">Lunas</p>
          <p v-if="tagihan.dibayar_pada" class="mt-0.5 text-sm text-emerald-800/80">
            Dibayar {{ formatTanggal(tagihan.dibayar_pada) }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Riwayat Pembayaran -->
    <Card v-if="tagihan.pembayaran">
      <CardHeader>
        <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <RiwayatPembayaranTable :pembayaran="tagihan.pembayaran" />
      </CardContent>
    </Card>
  </div>
</template>