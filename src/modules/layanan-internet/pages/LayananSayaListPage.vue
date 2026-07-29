<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayananSayaList } from '../composables/usePelangganLayanan'
import { statusLayananEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Network, Gauge, Wifi, Monitor, MapPin, Replace,
  Plus, Activity
} from 'lucide-vue-next'
import PermohonanGantiPaketDialog from '../components/PermohonanGantiPaketDialog.vue'
import PermohonanRelokasiDialog from '../components/PermohonanRelokasiDialog.vue'
import PermohonanTambahPaketDialog from '../components/PermohonanTambahPaketDialog.vue'
import type { LayananInternetDetail } from '@/types/models'

const { data: hasil, isLoading } = useLayananSayaList()

const dialogGantiPaket = ref<LayananInternetDetail | null>(null)
const dialogRelokasi = ref<LayananInternetDetail | null>(null)
const dialogTambahPaket = ref<LayananInternetDetail | null>(null)

const stats = computed(() => {
  const items = hasil?.value?.data ?? []
  return {
    total: items.length,
    aktif: items.filter((s: LayananInternetDetail) => s.status === 'aktif').length,
    totalPerangkat: items.reduce((sum: number, s: LayananInternetDetail) => sum + (s.perangkat_count ?? 0), 0),
    kecepatanRata: items.length
      ? Math.round(
          items.reduce((sum: number, s: LayananInternetDetail) => {
            const speed = s.paket_internet?.kecepatan_mbps ?? s.kecepatan_custom_mbps ?? 0
            return sum + (typeof speed === 'number' ? speed : 0)
          }, 0) / items.length
        )
      : 0,
  }
})

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[30px] font-semibold tracking-tight">Layanan Saya</h1>
        <p class="mt-1 text-sm text-muted-foreground">Kelola dan pantau layanan internet Anda</p>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <Skeleton v-for="i in 2" :key="i" class="h-52 rounded-xl" />
      </div>
    </div>

    <template v-else-if="hasil?.data.length">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Network class="size-5 text-primary" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Total Layanan</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ stats.total }}</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Activity class="size-5 text-emerald-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Aktif</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ stats.aktif }}</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Gauge class="size-5 text-blue-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Rata-rata Kecepatan</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ stats.kecepatanRata }}<span class="text-sm font-normal text-muted-foreground"> Mbps</span></p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
              <Monitor class="size-5 text-violet-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Perangkat Terpasang</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ stats.totalPerangkat }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card
          v-for="layanan in hasil!.data"
          :key="layanan.id"
          class="group rounded-xl border shadow-none transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div class="flex items-start justify-between gap-2 border-b px-5 py-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <Wifi class="size-4 shrink-0 text-primary" />
                <p class="truncate text-sm font-medium">
                  {{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom ?? 'Layanan' }}
                </p>
                <StatusBadge :value="layanan.status" :map="statusLayananEnum" />
              </div>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ layanan.nomor_layanan }} &middot; {{ formatTanggal(layanan.tanggal_aktif) }}
              </p>
            </div>
            <Button as="RouterLink" :to="`/pelanggan/layanan/${layanan.id}`" variant="ghost" size="sm" class="shrink-0 gap-1 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100">
              Detail <ArrowRight class="size-3.5" />
            </Button>
          </div>

          <CardContent class="space-y-3 p-5 pt-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p class="text-xs text-muted-foreground">Kecepatan</p>
                <p class="font-medium">{{ layanan.paket_internet?.kecepatan_mbps ?? layanan.kecepatan_custom_mbps ?? '-' }} Mbps</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Harga</p>
                <p class="font-medium">{{ layanan.paket_internet?.harga ?? layanan.harga_custom ?? '-' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-muted-foreground">Alamat Pemasangan</p>
                <p class="truncate font-medium">{{ layanan.alamat_pemasangan }}{{ layanan.detail_alamat ? ` (${layanan.detail_alamat})` : '' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Perangkat</p>
                <p class="font-medium">{{ layanan.perangkat_count ?? 0 }} terpasang</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Tipe Paket</p>
                <p class="font-medium capitalize">{{ layanan.tipe_paket }}</p>
              </div>
            </div>
          </CardContent>

          <div class="flex flex-wrap items-center gap-1.5 border-t px-5 py-3">
            <Button variant="ghost" size="sm" class="h-8 gap-1.5 text-xs" @click="dialogGantiPaket = layanan">
              <Replace class="size-3.5" /> Ganti Paket
            </Button>
            <Button variant="ghost" size="sm" class="h-8 gap-1.5 text-xs" @click="dialogRelokasi = layanan">
              <MapPin class="size-3.5" /> Relokasi
            </Button>
            <Button variant="ghost" size="sm" class="h-8 gap-1.5 text-xs" @click="dialogTambahPaket = layanan">
              <Plus class="size-3.5" /> Tambah
            </Button>
          </div>
        </Card>
      </div>
    </template>

    <EmptyState
      v-else
      judul="Belum ada layanan aktif"
      deskripsi="Layanan internet Anda akan muncul di sini setelah pemasangan selesai."
    />

    <Teleport to="body">
      <PermohonanGantiPaketDialog
        v-if="dialogGantiPaket" :layanan="dialogGantiPaket"
        @close="dialogGantiPaket = null"
      />
      <PermohonanRelokasiDialog
        v-if="dialogRelokasi" :layanan="dialogRelokasi"
        @close="dialogRelokasi = null"
      />
      <PermohonanTambahPaketDialog
        v-if="dialogTambahPaket" :layanan="dialogTambahPaket"
        @close="dialogTambahPaket = null"
      />
    </Teleport>
  </div>
</template>
