<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Wallet, ArrowLeft } from 'lucide-vue-next'
import { useDetailPembayaranAdmin } from '../composables/usePembayaranHistory'
import { formatRupiah } from '@/lib/currency'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/data/StatusBadge.vue'

const route = useRoute()
const router = useRouter()

const scope = computed(() => (route.path.startsWith('/reseller') ? 'reseller' : 'admin'))
const basePath = computed(() => (scope.value === 'reseller' ? '/reseller' : '/admin/keuangan'))
const id = computed(() => route.params.id as string)

const { data: pembayaran, isLoading } = useDetailPembayaranAdmin(scope.value, id)

const STATUS_TRANSAKSI: Record<string, { label: string; kelas: string }> = {
  pending: { label: 'Pending', kelas: 'bg-amber-100 text-amber-800' },
  berhasil: { label: 'Berhasil', kelas: 'bg-emerald-100 text-emerald-800' },
  gagal: { label: 'Gagal', kelas: 'bg-rose-100 text-rose-800' },
}

const mapStatusTagihan = {
  belum_bayar: { label: 'Belum Bayar', badgeVariant: 'warning' },
  sedang_dicicil: { label: 'Sedang Dicicil', badgeVariant: 'info' },
  lunas: { label: 'Lunas', badgeVariant: 'success' },
} as const

function formatTanggalWib(iso: string | null | undefined) {
  if (!iso) return '—'
  // Backend sudah mengirimkan label WIB (waktu_wib); fallback mentah untuk aman.
  return iso
}
</script>

<template>
  <div class="space-y-4">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali
    </Button>

    <div v-if="isLoading"><Skeleton class="h-64 w-full max-w-3xl" /></div>

    <template v-else-if="pembayaran">
      <Card>
        <CardHeader>
          <CardTitle class="flex flex-wrap items-center gap-2 text-base">
            {{ pembayaran.nomor_pembayaran }}
            <span
              :class="`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TRANSAKSI[pembayaran.status]?.kelas ?? 'bg-slate-100 text-slate-700'}`"
            >
              {{ STATUS_TRANSAKSI[pembayaran.status]?.label ?? pembayaran.status }}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">Pelanggan</span>
            <span class="font-medium">{{ pembayaran.pelanggan?.nama_lengkap ?? '—' }}</span>
          </div>
          <div v-if="pembayaran.pelanggan?.nomor_pelanggan" class="flex justify-between gap-4">
            <span class="text-muted-foreground">No. Pelanggan</span>
            <span class="font-mono text-xs">{{ pembayaran.pelanggan.nomor_pelanggan }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">Waktu (WIB)</span>
            <span>{{ formatTanggalWib(pembayaran.waktu_wib) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">Metode</span>
            <span>{{ pembayaran.metode_pembayaran ?? '—' }}{{ pembayaran.provider ? ` · ${pembayaran.provider}` : '' }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">Dibayar oleh</span>
            <span>{{ pembayaran.dibayar_oleh ?? '—' }}</span>
          </div>
          <div class="flex justify-between gap-4 border-t pt-3">
            <span class="font-medium">Jumlah Dibayar</span>
            <span class="text-lg font-semibold tabular-nums">{{ formatRupiah(Number(pembayaran.jumlah_dibayar ?? 0)) }}</span>
          </div>
          <div v-if="Number(pembayaran.saldo_kredit_terbentuk) > 0" class="flex justify-between gap-4">
            <span class="text-muted-foreground">Yang menjadi saldo kredit</span>
            <span class="font-semibold text-primary tabular-nums">{{ formatRupiah(pembayaran.saldo_kredit_terbentuk) }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between gap-2">
          <CardTitle class="text-base">Alokasi ke Tagihan</CardTitle>
          <Button
            v-if="pembayaran.pelanggan"
            variant="outline"
            size="sm"
            @click="router.push(`${basePath}/saldo-kredit/${pembayaran.pelanggan?.id}`)"
          >
            <Wallet class="mr-2 size-4" /> Saldo Kredit
          </Button>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="a in pembayaran.alokasi_tagihan" :key="a.id" class="rounded-lg border p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-medium">{{ a.nomor_tagihan ?? '—' }}</p>
              <span class="font-semibold tabular-nums">{{ formatRupiah(a.jumlah_dialokasikan) }}</span>
            </div>
            <p v-if="a.periode_tagihan" class="text-xs text-muted-foreground">{{ a.periode_tagihan }}</p>

            <div v-if="a.tagihan" class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
              <span>Total {{ formatRupiah(Number(a.tagihan.total_tagihan)) }}</span>
              <span>Terbayar {{ formatRupiah(Number(a.tagihan.sudah_dibayar ?? 0)) }}</span>
              <span v-if="Number(a.tagihan.saldo_kredit_digunakan ?? 0) > 0">
                Kredit {{ formatRupiah(Number(a.tagihan.saldo_kredit_digunakan)) }}
              </span>
              <span class="font-semibold text-foreground">Sisa {{ formatRupiah(Number(a.tagihan.sisa_tagihan ?? 0)) }}</span>
              <StatusBadge :value="a.tagihan.status_tampilan ?? a.tagihan.status_pembayaran" :map="mapStatusTagihan" />
            </div>
          </div>
          <p v-if="!pembayaran.alokasi_tagihan?.length" class="text-sm text-muted-foreground">
            Pembayaran ini belum memiliki alokasi (atau transaksi belum berhasil).
          </p>
        </CardContent>
      </Card>
    </template>

    <p v-else class="text-sm text-muted-foreground">Transaksi tidak ditemukan.</p>
  </div>
</template>