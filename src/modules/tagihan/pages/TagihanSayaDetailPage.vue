<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTagihanSayaDetail } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading } = useTagihanSayaDetail(id)

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
  <div v-if="isLoading"><Skeleton class="h-64 w-full max-w-lg" /></div>

  <Card v-else-if="tagihan" class="max-w-lg">
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
        <p class="text-muted-foreground">Total Tagihan</p>
        <p class="text-lg font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</p>
      </div>
      <div>
        <p class="text-muted-foreground">Jatuh Tempo</p>
        <p>{{ formatTanggal(tagihan.tanggal_jatuh_tempo) }}</p>
      </div>

      <Button
        v-if="tagihan.status_pembayaran === 'belum_bayar' && tagihan.xendit_invoice_url"
        as="a"
        :href="tagihan.xendit_invoice_url"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full"
      >
        Bayar Sekarang
      </Button>
    </CardContent>
  </Card>
</template>
