<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagihanDetail } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading } = useTagihanDetail(id)

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}
function formatTanggal(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

const layanan = computed(() => tagihan.value?.layanan_internet)
const pelanggan = computed(() => layanan.value?.pelanggan)

function waHref(nomor: string) {
  const bersih = nomor.replace(/\D/g, '')
  const intl = bersih.startsWith('0') ? '62' + bersih.slice(1) : bersih
  return `https://wa.me/${intl}`
}
</script>

<template>
  <div class="space-y-4">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali
    </Button>

    <div v-if="isLoading"><Skeleton class="h-96 w-full max-w-2xl" /></div>

    <template v-else-if="tagihan">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <!-- Info Pelanggan & Layanan -->
        <Card v-if="pelanggan">
          <CardHeader>
            <CardTitle class="text-base">Pelanggan & Layanan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div>
              <p class="text-muted-foreground">Nama</p>
              <p class="font-medium">{{ pelanggan.nama_lengkap }}</p>
            </div>
            <div v-if="pelanggan.nomor_pelanggan" class="flex justify-between">
              <span class="text-muted-foreground">No. Pelanggan</span>
              <span class="font-mono text-xs">{{ pelanggan.nomor_pelanggan }}</span>
            </div>
            <div v-if="layanan?.nomor_layanan" class="flex justify-between">
              <span class="text-muted-foreground">No. Layanan</span>
              <span class="font-mono text-xs">{{ layanan.nomor_layanan }}</span>
            </div>
            <div v-if="pelanggan.nomor_hp">
              <p class="text-muted-foreground">No. HP</p>
              <a :href="waHref(pelanggan.nomor_hp)" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">
                {{ pelanggan.nomor_hp }} (WhatsApp)
              </a>
            </div>
            <div v-if="layanan?.alamat_pemasangan">
              <p class="text-muted-foreground">Alamat Instalasi</p>
              <p>{{ [layanan.detail_alamat, layanan.alamat_pemasangan].filter(Boolean).join(', ') }}</p>
            </div>
            <div v-if="layanan?.paket_internet">
              <p class="text-muted-foreground">Paket</p>
              <p>
                {{ layanan.paket_internet.nama_paket }} — {{ layanan.paket_internet.kecepatan_mbps }} Mbps
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Info Tagihan -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              {{ tagihan.nomor_tagihan }}
              <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Periode</span>
              <span>{{ tagihan.periode_bulan }}/{{ tagihan.periode_tahun }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Paket</span>
              <span>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Total</span>
              <span class="font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</span>
            </div>
            <div v-if="tagihan.jumlah_bulan > 1" class="flex justify-between">
              <span class="text-muted-foreground">Jumlah Bulan</span>
              <span>{{ tagihan.jumlah_bulan }} bulan</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Jatuh Tempo</span>
              <span>{{ formatTanggal(tagihan.tanggal_jatuh_tempo) }}</span>
            </div>
            <div v-if="tagihan.dibayar_pada" class="flex justify-between">
              <span class="text-muted-foreground">Dibayar Pada</span>
              <span>{{ formatTanggal(tagihan.dibayar_pada) }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Info Xendit -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Info Xendit</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Invoice ID</span>
              <span class="font-mono text-xs">{{ tagihan.xendit_invoice_id ?? '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status Invoice</span>
              <span>{{ tagihan.xendit_invoice_status ? (tagihan.xendit_invoice_status === 'active' ? 'Aktif' : 'Kedaluwarsa') : '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Kadaluwarsa</span>
              <span>{{ formatTanggal(tagihan.xendit_invoice_expires_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Retry Ke-</span>
              <span>{{ tagihan.xendit_invoice_retry_count || '0' }}/3</span>
            </div>
            <Separator class="my-2" />
            <Button
              v-if="tagihan.xendit_invoice_url"
              as="a"
              :href="tagihan.xendit_invoice_url"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              class="w-full"
            >
              <ExternalLink class="mr-2 size-3" /> Buka Invoice
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Riwayat Pembayaran -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <RiwayatPembayaranTable :pembayaran="tagihan.pembayaran ?? []" />
        </CardContent>
      </Card>
    </template>
  </div>
</template>
