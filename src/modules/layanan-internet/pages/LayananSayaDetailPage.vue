<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayananSayaDetail } from '../composables/usePelangganLayanan'
import { statusLayananEnum, jenisPerubahanPaketEnum, statusPerangkatEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Wifi, MapPin, Replace, Monitor, History, Package, Gauge, DollarSign } from 'lucide-vue-next'
import PermohonanGantiPaketDialog from '../components/PermohonanGantiPaketDialog.vue'
import PermohonanRelokasiDialog from '../components/PermohonanRelokasiDialog.vue'
import type { LayananInternetDetail } from '@/types/models'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: layanan, isLoading } = useLayananSayaDetail(id)

const dialogGantiPaket = ref<LayananInternetDetail | null>(null)
const dialogRelokasi = ref<LayananInternetDetail | null>(null)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="mb-4 h-8 w-24 rounded-lg" />
    <Skeleton class="h-48 w-full max-w-3xl rounded-xl" />
    <Skeleton class="h-40 w-full max-w-3xl rounded-xl" />
  </div>

  <div v-else-if="layanan" class="max-w-3xl space-y-6">
    <Button variant="ghost" class="mb-2 pl-0 text-muted-foreground hover:text-foreground" @click="router.back()">
      <ArrowLeft class="mr-1.5 size-4" /> Kembali
    </Button>

    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <Wifi class="size-5 text-primary" />
        <h1 class="text-[30px] font-semibold tracking-tight">
          {{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom ?? 'Layanan' }}
        </h1>
        <StatusBadge :value="layanan.status" :map="statusLayananEnum" />
      </div>
      <p class="text-sm text-muted-foreground">{{ layanan.nomor_layanan }} &middot; Terdaftar {{ formatTanggal(layanan.tanggal_aktif) }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card class="rounded-xl border shadow-none">
        <CardHeader class="pb-2 pt-4">
          <CardTitle class="flex items-center gap-1.5 text-sm font-medium">
            <Package class="size-4 text-muted-foreground" /> Detail Paket
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Nama Paket</span>
            <span class="font-medium">{{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom ?? '-' }}</span>
          </div>
          <Separator />
          <div class="flex justify-between">
            <span class="text-muted-foreground">Tipe</span>
            <Badge variant="outline" class="capitalize">{{ layanan.tipe_paket }}</Badge>
          </div>
          <Separator />
          <div class="flex justify-between">
            <span class="text-muted-foreground"><Gauge class="mr-1 inline size-3.5" />Kecepatan</span>
            <span class="font-medium">{{ layanan.paket_internet?.kecepatan_mbps ?? layanan.kecepatan_custom_mbps ?? '-' }} Mbps</span>
          </div>
          <Separator />
          <div class="flex justify-between">
            <span class="text-muted-foreground"><DollarSign class="mr-1 inline size-3.5" />Harga</span>
            <span class="font-medium">{{ layanan.paket_internet?.harga ?? layanan.harga_custom ?? '-' }}</span>
          </div>
          <Separator />
          <div class="flex justify-between">
            <span class="text-muted-foreground"><Monitor class="mr-1 inline size-3.5" />Perangkat</span>
            <span class="font-medium">{{ layanan.perangkat?.length ?? 0 }} terpasang</span>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-xl border shadow-none">
        <CardHeader class="pb-2 pt-4">
          <CardTitle class="flex items-center gap-1.5 text-sm font-medium">
            <MapPin class="size-4 text-muted-foreground" /> Alamat Pemasangan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p>{{ layanan.alamat_pemasangan }}{{ layanan.detail_alamat ? ` (${layanan.detail_alamat})` : '' }}</p>
          <p v-if="layanan.rt" class="text-muted-foreground">RT {{ layanan.rt }}/RW {{ layanan.rw }}{{ layanan.kode_pos ? `, ${layanan.kode_pos}` : '' }}</p>
          <div class="flex gap-2 pt-3">
            <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="dialogGantiPaket = layanan">
              <Replace class="size-3.5" /> Ganti Paket
            </Button>
            <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="dialogRelokasi = layanan">
              <MapPin class="size-3.5" /> Relokasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="rounded-xl border shadow-none">
      <CardHeader class="pb-2 pt-4">
        <CardTitle class="flex items-center gap-1.5 text-sm font-medium">
          <Monitor class="size-4 text-muted-foreground" /> Perangkat Terpasang
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="layanan.perangkat?.length" class="divide-y">
          <div v-for="p in layanan.perangkat" :key="p.id" class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
            <div>
              <p class="text-sm font-medium">{{ p.merek }} {{ p.tipe }}</p>
              <p class="text-xs text-muted-foreground">{{ p.serial_number }}</p>
            </div>
            <StatusBadge :value="p.status" :map="statusPerangkatEnum" />
          </div>
        </div>
        <p v-else class="py-4 text-center text-sm text-muted-foreground">Belum ada data perangkat</p>
      </CardContent>
    </Card>

    <Card v-if="layanan.riwayat_perubahan_paket?.length" class="rounded-xl border shadow-none">
      <CardHeader class="pb-2 pt-4">
        <CardTitle class="flex items-center gap-1.5 text-sm font-medium">
          <History class="size-4 text-muted-foreground" /> Riwayat Perubahan Paket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div v-for="r in layanan.riwayat_perubahan_paket" :key="r.id" class="flex items-center justify-between rounded-lg border p-3 text-sm">
            <div class="flex items-center gap-2">
              <StatusBadge :value="r.jenis_perubahan" :map="jenisPerubahanPaketEnum" />
              <span>
                <span class="font-medium">{{ r.nama_paket_lama }}</span>
                <span class="mx-1 text-muted-foreground">→</span>
                <span class="font-medium">{{ r.nama_paket_baru }}</span>
              </span>
            </div>
            <span class="text-xs text-muted-foreground">{{ formatTanggal(r.tanggal_perubahan) }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Teleport to="body">
      <PermohonanGantiPaketDialog
        v-if="dialogGantiPaket" :layanan="dialogGantiPaket"
        @close="dialogGantiPaket = null"
      />
      <PermohonanRelokasiDialog
        v-if="dialogRelokasi" :layanan="dialogRelokasi"
        @close="dialogRelokasi = null"
      />
    </Teleport>
  </div>
</template>
