<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, Wifi, FileText, Receipt } from 'lucide-vue-next'
import { useResellerPelangganDetail } from '../composables/useResellerPortal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import { statusPermohonanEnum, statusLayananEnum, statusPembayaranEnum } from '@/lib/enums'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: pelanggan, isLoading, isError } = useResellerPelangganDetail(id)
const layanan = computed(() => pelanggan.value?.layanan_internet?.[0])

function formatRupiah(nilai: string | number | null | undefined): string {
  if (nilai == null || nilai === '') return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}
</script>

<template>
  <div class="space-y-4">
    <Button as="RouterLink" to="/reseller/pelanggan" variant="ghost" size="sm" class="w-fit">
      <ChevronLeft class="size-4" /> Kembali
    </Button>

    <Skeleton v-if="isLoading" class="h-40 w-full" />

    <div v-else-if="isError || !pelanggan" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Pelanggan tidak ditemukan atau bukan milik reseller Anda.
    </div>

    <template v-else>
      <div class="rounded-xl border bg-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">{{ pelanggan.nama_lengkap }}</h1>
            <p class="mt-0.5 text-sm text-muted-foreground">{{ pelanggan.nomor_pelanggan ?? '-' }}</p>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>NIK: {{ pelanggan.nik }}</span>
              <span>{{ pelanggan.nomor_hp }}</span>
              <span v-if="pelanggan.email">{{ pelanggan.email }}</span>
            </div>
          </div>
          <StatusBadge
            v-if="layanan?.status"
            :value="layanan.status"
            :map="statusLayananEnum"
          />
          <Badge v-else variant="warning">Belum Aktif</Badge>
        </div>
      </div>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between py-3">
          <CardTitle class="flex items-center gap-2 text-sm font-medium"><Wifi class="size-4 text-muted-foreground" /> Layanan</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4 pb-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <template v-if="layanan">
            <div>
              <p class="text-xs text-muted-foreground">Paket</p>
              <p class="font-medium">{{ layanan.tipe_paket === 'custom' ? layanan.nama_paket_custom : layanan.paket_internet?.nama_paket }}</p>
              <p class="text-xs text-muted-foreground">{{ layanan.tipe_paket === 'custom' ? `${layanan.kecepatan_custom_mbps} Mbps` : `${layanan.paket_internet?.kecepatan_mbps ?? '-'} Mbps` }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Nomor Layanan</p>
              <p class="font-medium">{{ layanan.nomor_layanan }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Tanggal Aktif</p>
              <p class="font-medium">{{ layanan.tanggal_aktif }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Harga</p>
              <p class="font-medium">{{ formatRupiah(layanan.paket_internet?.harga ?? layanan.harga_custom) }}</p>
            </div>
          </template>
          <p v-else class="text-xs text-muted-foreground sm:col-span-full">
            Belum ada layanan aktif. Menunggu verifikasi & pemasangan oleh tim operasional.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between py-3">
          <CardTitle class="flex items-center gap-2 text-sm font-medium"><FileText class="size-4 text-muted-foreground" /> Permohonan</CardTitle>
        </CardHeader>
        <CardContent class="divide-y pb-2">
          <div v-for="permohonan in pelanggan.permohonan_layanan ?? []" :key="permohonan.id" class="flex items-center justify-between py-2 text-sm">
            <div>
              <p class="font-medium">{{ permohonan.nomor_permohonan }}</p>
              <p class="text-xs text-muted-foreground">
                {{ permohonan.tipe_paket === 'custom' ? permohonan.nama_paket_custom : permohonan.paket_internet?.nama_paket ?? '-' }}
              </p>
            </div>
            <StatusBadge :value="permohonan.status" :map="statusPermohonanEnum" />
          </div>
          <p v-if="!pelanggan.permohonan_layanan?.length" class="py-2 text-xs text-muted-foreground">Belum ada permohonan.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between py-3">
          <CardTitle class="flex items-center gap-2 text-sm font-medium"><Receipt class="size-4 text-muted-foreground" /> Tagihan</CardTitle>
        </CardHeader>
        <CardContent class="divide-y pb-2">
          <div v-for="tagihan in layanan?.tagihan ?? []" :key="tagihan.id" class="flex items-center justify-between py-2 text-sm">
            <div>
              <p class="font-medium">{{ tagihan.nomor_tagihan }}</p>
              <p class="text-xs text-muted-foreground">Periode {{ tagihan.periode_bulan }}-{{ tagihan.periode_tahun }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-medium">{{ formatRupiah(tagihan.total_tagihan) }}</span>
              <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
            </div>
          </div>
          <p v-if="!(layanan?.tagihan?.length)" class="py-2 text-xs text-muted-foreground">Belum ada tagihan.</p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>