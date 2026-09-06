<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Wifi, Receipt, MessageSquareWarning, FileText, ShieldAlert, X,
  AlertTriangle, CreditCard, ArrowRight, Network
} from 'lucide-vue-next'
import { useDashboardRingkasan } from '../composables/useDashboardPelanggan'
import { statusPermohonanEnum, statusLaporanEnum, statusPembayaranEnum, statusLayananEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfil } from '@/modules/profil/composables/useProfil'
import { RouterLink } from 'vue-router'
const { data: profil } = useProfil()
const { data: ringkasan, isLoading } = useDashboardRingkasan()

const showBannerGantiKredensial = ref(false)
const sudahDitutupManual = ref(false)

watch(
  profil,
  (data) => {
    if (!data) return
    if (data.password_sudah_dibuat === false && !sudahDitutupManual.value) {
      showBannerGantiKredensial.value = true
    }
  },
  { immediate: true },
)

function tutupBanner() {
  showBannerGantiKredensial.value = false
  sudahDitutupManual.value = true
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const sapaan = () => {
  const jam = new Date().getHours()
  if (jam < 10) return 'Selamat pagi'
  if (jam < 15) return 'Selamat siang'
  if (jam < 18) return 'Selamat sore'
  return 'Selamat malam'
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="showBannerGantiKredensial"
      class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <ShieldAlert class="mt-0.5 size-5 shrink-0 text-amber-600" />
      <div class="flex-1 text-sm">
        <p class="font-medium">Amankan akun kamu</p>
        <p class="mt-0.5 text-amber-800/80">
          Kamu masih pakai username & password default (nomor pelanggan). Yuk ganti supaya akun
          kamu lebih aman — bisa dilakukan kapan saja lewat halaman Profil.
        </p>
        <Button
          :as="RouterLink"
          to="/pelanggan/profil"
          size="sm"
          variant="outline"
          class="mt-3 border-amber-300 bg-white hover:bg-amber-100"
          @click="tutupBanner"
        >
          Ganti di Profil
        </Button>
      </div>
      <button
        type="button"
        class="shrink-0 text-amber-500 hover:text-amber-700"
        aria-label="Tutup"
        @click="tutupBanner"
      >
        <X class="size-4" />
      </button>
    </div>

    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-8 w-72" />
      <div class="grid gap-4 sm:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <Skeleton v-for="i in 2" :key="i" class="h-56 rounded-xl" />
      </div>
    </div>

    <template v-else-if="ringkasan">
      <div>
        <h1 class="text-[30px] font-semibold tracking-tight">
          {{ sapaan() }}, {{ ringkasan.pelanggan.nama_lengkap }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ ringkasan.pelanggan.nomor_pelanggan }} &middot; Ringkasan layanan Anda
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Network class="size-5 text-primary" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Total Layanan</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ ringkasan.ringkasan.total_layanan }}</p>
              <p class="text-xs text-muted-foreground">{{ ringkasan.ringkasan.layanan_aktif }} aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <CreditCard class="size-5 text-amber-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Tagihan Tertunggak</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ ringkasan.ringkasan.tagihan_belum_bayar }}</p>
              <p v-if="ringkasan.ringkasan.tagihan_belum_bayar" class="text-xs font-medium text-destructive">
                {{ formatCurrency(ringkasan.ringkasan.total_tagihan_belum_bayar) }}
              </p>
              <p v-else class="text-xs text-emerald-600">Lunas semua</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-50">
              <AlertTriangle class="size-5 text-rose-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Kendala Aktif</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ ringkasan.ringkasan.kendala_aktif }}</p>
              <p v-if="ringkasan.ringkasan.kendala_aktif" class="text-xs text-rose-600">Butuh perhatian</p>
              <p v-else class="text-xs text-emerald-600">Semua baik</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <FileText class="size-5 text-blue-600" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">Permohonan Diproses</p>
              <p class="text-2xl font-semibold leading-tight tracking-tight">{{ ringkasan.ringkasan.permohonan_pending }}</p>
              <p v-if="ringkasan.ringkasan.permohonan_pending" class="text-xs text-blue-600">Menunggu verifikasi</p>
              <p v-else class="text-xs text-muted-foreground">Tidak ada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card class="rounded-xl border shadow-none min-w-0">
          <div class="flex items-center justify-between border-b px-5 py-3.5">
            <div class="flex items-center gap-2">
              <Wifi class="size-4 text-primary" />
              <h2 class="text-sm font-medium">Layanan Terbaru</h2>
            </div>
            <Button :as="RouterLink" to="/pelanggan/layanan" variant="ghost" size="sm" class="gap-1 text-xs">
              Semua <ArrowRight class="size-3.5" />
            </Button>
          </div>
          <div class="divide-y px-5">
            <div v-for="l in ringkasan.layanan_terbaru" :key="l.id" class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 overflow-hidden">
                  <p class="truncate text-sm font-medium">{{ l.nama_paket }}</p>
                  <StatusBadge :value="l.status" :map="statusLayananEnum" />
                </div>
                <p class="mt-0.5 truncate text-xs text-muted-foreground">{{ l.nomor_layanan }} &middot; {{ l.alamat_pemasangan }}</p>
                <p v-if="l.status === 'aktif' && l.masa_aktif_berakhir" class="mt-0.5 text-xs font-medium text-primary">
                  Layanan Aktif Sampai: {{ formatDate(l.masa_aktif_berakhir) }}
                </p>
              </div>
              <Button :as="RouterLink" :to="`/pelanggan/layanan/${l.id}`" variant="ghost" size="sm" class="shrink-0">
                <ArrowRight class="size-3.5" />
              </Button>
            </div>
            <p v-if="!ringkasan.layanan_terbaru.length" class="py-5 text-center text-sm text-muted-foreground">
              Belum ada layanan
            </p>
          </div>
        </Card>

        <Card class="rounded-xl border shadow-none min-w-0">
          <div class="flex items-center justify-between border-b px-5 py-3.5">
            <div class="flex items-center gap-2">
              <Receipt class="size-4 text-amber-600" />
              <h2 class="text-sm font-medium">Tagihan Terbaru</h2>
            </div>
            <Button :as="RouterLink" to="/pelanggan/tagihan" variant="ghost" size="sm" class="gap-1 text-xs">
              Semua <ArrowRight class="size-3.5" />
            </Button>
          </div>
          <div class="divide-y px-5">
            <div v-for="t in ringkasan.tagihan_terbaru" :key="t.id" class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 overflow-hidden">
                  <p class="truncate text-sm font-medium">{{ formatCurrency(t.total) }}</p>
                  <StatusBadge :value="t.status_pembayaran" :map="statusPembayaranEnum" />
                </div>
                <p class="mt-0.5 truncate text-xs text-muted-foreground">
                  {{ t.nomor_tagihan }} &middot; {{ t.layanan }}
                  <span v-if="t.tenggat"> &middot; Jatuh tempo {{ formatDate(t.tenggat) }}</span>
                </p>
              </div>
              <Button :as="RouterLink" :to="`/pelanggan/tagihan/${t.id}`" variant="ghost" size="sm" class="shrink-0">
                <ArrowRight class="size-3.5" />
              </Button>
            </div>
            <p v-if="!ringkasan.tagihan_terbaru.length" class="py-5 text-center text-sm text-muted-foreground">
              Belum ada tagihan
            </p>
          </div>
        </Card>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card class="rounded-xl border shadow-none min-w-0">
          <div class="flex items-center justify-between border-b px-5 py-3.5">
            <div class="flex items-center gap-2">
              <MessageSquareWarning class="size-4 text-rose-600" />
              <h2 class="text-sm font-medium">Kendala Aktif</h2>
            </div>
            <Button :as="RouterLink" to="/pelanggan/laporan-kendala" variant="ghost" size="sm" class="gap-1 text-xs">
              Semua <ArrowRight class="size-3.5" />
            </Button>
          </div>
          <div class="divide-y px-5">
            <div v-for="k in ringkasan.kendala_terbaru" :key="k.id" class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 overflow-hidden">
                  <p class="truncate text-sm font-medium">{{ k.kategori_kendala }}</p>
                  <StatusBadge :value="k.status" :map="statusLaporanEnum" />
                </div>
                <p class="mt-0.5 truncate text-xs text-muted-foreground">{{ k.nomor_laporan }} &middot; {{ formatDate(k.created_at) }}</p>
              </div>
              <Button :as="RouterLink" :to="`/pelanggan/laporan-kendala/${k.id}`" variant="ghost" size="sm" class="shrink-0">
                <ArrowRight class="size-3.5" />
              </Button>
            </div>
            <p v-if="!ringkasan.kendala_terbaru.length" class="py-5 text-center text-sm text-muted-foreground">
              Tidak ada kendala aktif &mdash; semua berjalan normal
            </p>
          </div>
        </Card>

        <Card class="rounded-xl border shadow-none min-w-0">
          <div class="flex items-center justify-between border-b px-5 py-3.5">
            <div class="flex items-center gap-2">
              <FileText class="size-4 text-blue-600" />
              <h2 class="text-sm font-medium">Permohonan Diproses</h2>
            </div>
            <Button :as="RouterLink" to="/pelanggan/layanan" variant="ghost" size="sm" class="gap-1 text-xs">
              Lihat <ArrowRight class="size-3.5" />
            </Button>
          </div>
          <div class="divide-y px-5">
            <div v-for="p in ringkasan.permohonan_terbaru" :key="p.id" class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 overflow-hidden">
                  <p class="truncate text-sm font-medium capitalize">{{ p.jenis_permohonan.replace(/_/g, ' ') }}</p>
                  <StatusBadge :value="p.status_permohonan" :map="statusPermohonanEnum" />
                </div>
                <p class="mt-0.5 truncate text-xs text-muted-foreground">{{ p.nomor_permohonan }} &middot; {{ formatDate(p.created_at) }}</p>
              </div>
            </div>
            <p v-if="!ringkasan.permohonan_terbaru.length" class="py-5 text-center text-sm text-muted-foreground">
              Tidak ada permohonan yang sedang diproses
            </p>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>
