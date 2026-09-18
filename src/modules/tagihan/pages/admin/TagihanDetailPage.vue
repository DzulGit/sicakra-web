<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { useTagihanDetail, useBayarTunaiTagihan, usePerbaruiLinkTagihan } from '../../composables/useKeuanganTagihan'

import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { RefreshCw, ExternalLink, ArrowLeft, HandCoins, ReceiptText, History } from 'lucide-vue-next'
import { formatRupiah, formatRupiahBertanda, parseRupiah } from '@/lib/currency'
import { statusTagihanFinanceEnum } from '@/lib/enums'
import type { ApiErrorResponse } from '@/types/api'
import type { TimelinePembayaranTagihan } from '@/types/models'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanDetail(id)
const { mutate: bayarTunai, isPending: isBayarTunaiPending } = useBayarTunaiTagihan()
const { mutate: perbaruiLink, isPending: isPerbaruiLinkPending } = usePerbaruiLinkTagihan()

const showTunaiDialog = ref(false)
const nominalTunai = ref('')

// ----- Kondisi finansial (sumber: PembayaranAllocationService::detailTagihan) -----
const totalTagihan = computed(() => Number(tagihan.value?.total_tagihan ?? 0))
const telahTerbayar = computed(() => Number(tagihan.value?.telah_terbayar ?? 0))
const sisa = computed(() => Number(tagihan.value?.sisa ?? 0))
const sisaTagihan = computed(() => Number(tagihan.value?.sisa_tagihan ?? Math.max(0, totalTagihan.value - telahTerbayar.value)))

// Signed sisa < 0 = kekurangan. Lunas saat sisa >= 0 (termasuk overpayment).
const isLunas = computed(() => sisa.value >= 0)

const statusFinansial = computed(() => tagihan.value?.status ?? '')

const persenPembayaran = computed(() => {
  if (totalTagihan.value <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((telahTerbayar.value / totalTagihan.value) * 100)))
})

// Total kelebihan yang pernah masuk saldo kredit dari pembayaran tagihan ini.
const kreditDariPembayaran = computed(() =>
  (tagihan.value?.timeline_pembayaran ?? [])
    .filter((ev) => ev.jenis === 'pembayaran')
    .reduce((total, ev) => total + Number(ev.jumlah_kredit ?? 0), 0),
)

// ----- Nominal bayar tunai -----
const nominalTunaiAngka = computed(() => parseRupiah(nominalTunai.value))
const kelebihanTunai = computed(() => Math.max(0, nominalTunaiAngka.value - sisaTagihan.value))
const kekuranganSetelah = computed(() => Math.max(0, sisaTagihan.value - nominalTunaiAngka.value))

// ----- Metadata tagihan -----
const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const labelPeriodePanjang = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  if (t.jumlah_bulan > 1 && t.periode_akhir_bulan) {
    return `${namaBulan[t.periode_bulan - 1]} ${t.periode_tahun} – ${namaBulan[t.periode_akhir_bulan - 1]} ${t.periode_akhir_tahun}`
  }
  return `${namaBulan[t.periode_bulan - 1]} ${t.periode_tahun}`
})

const periodeTampilan = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  if (t.jumlah_bulan > 1 && t.periode_akhir_bulan) {
    return `${t.periode_bulan}/${t.periode_tahun} – ${t.periode_akhir_bulan}/${t.periode_akhir_tahun}`
  }
  return `${t.periode_bulan}/${t.periode_tahun}`
})

const layanan = computed(() => tagihan.value?.layanan_internet)
const pelanggan = computed(() => layanan.value?.pelanggan)

// ----- Riwayat pembayaran (timeline backend, paling baru di atas) -----
const riwayat = computed<TimelinePembayaranTagihan[]>(() => [...(tagihan.value?.timeline_pembayaran ?? [])].reverse())

function labelJenisRiwayat(ev: TimelinePembayaranTagihan) {
  return ev.jenis === 'kredit' ? 'Saldo kredit dipakai' : 'Pembayaran diterima'
}

function jumlahRiwayat(ev: TimelinePembayaranTagihan) {
  return ev.jenis === 'pembayaran' && ev.jumlah_dibayar !== undefined
    ? Number(ev.jumlah_dibayar)
    : Number(ev.jumlah)
}

function isOverbayar(ev: TimelinePembayaranTagihan) {
  return ev.jenis === 'pembayaran' && ev.jumlah_dibayar !== undefined && Number(ev.jumlah_dibayar) !== Number(ev.jumlah)
}

// ----- Pembayaran online/Xendit (invoice tersimpan di baris Pembayaran) -----
const pembayaranOnline = computed(() => {
  const transaksi = (tagihan.value?.riwayat_pembayaran ?? [])
    .filter((p) => p.metode_pembayaran === 'xendit' || p.provider === 'xendit')

  if (!transaksi.length) return null

  // Utamakan invoice yang masih aktif (pending + punya URL), terbaru di atas.
  return (
    transaksi.find((p) => p.status === 'pending' && p.payment_url) ??
    transaksi[transaksi.length - 1] ??
    transaksi[0]
  )
})

function labelStatusOnline(status: string | null | undefined) {
  if (status === 'active' || status === 'pending') return 'Pending'
  if (status === 'paid') return 'Berhasil'
  if (status === 'expired') return 'Kedaluwarsa'
  if (status === 'failed') return 'Gagal'
  return status ?? '—'
}

// ----- Aksi -----
function bukaDialogTunai() {
  nominalTunai.value = String(sisaTagihan.value)
  showTunaiDialog.value = true
}

function handleBayarTunai() {
  if (nominalTunaiAngka.value <= 0) return

  bayarTunai(
    { id: id.value, jumlahDibayar: nominalTunaiAngka.value },
    {
      onSuccess: () => {
        showTunaiDialog.value = false
        toast.success('Pembayaran tunai berhasil dicatat.')
        refetch()
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal mencatat pembayaran tunai.')
      },
    },
  )
}

function handlePerbaruiLink() {
  perbaruiLink(id.value, {
    onSuccess: () => {
      toast.success('Link pembayaran berhasil diperbarui.')
      refetch()
    },
    onError: (e: Error) => {
      const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
      toast.error(pesan ?? 'Gagal memperbarui link pembayaran.')
    },
  })
}

function formatTanggal(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function waHref(nomor: string) {
  const bersih = nomor.replace(/\D/g, '')
  const intl = bersih.startsWith('0') ? '62' + bersih.slice(1) : bersih
  return `https://wa.me/${intl}`
}
</script>

<template>
  <div class="space-y-6">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali ke Tagihan
    </Button>

    <div v-if="isLoading"><Skeleton class="h-96 w-full" /></div>

    <template v-else-if="tagihan">
      <!-- HEADER INVOICE -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-semibold tracking-tight">{{ tagihan.nomor_tagihan }}</h1>
            <StatusBadge :value="statusFinansial" :map="statusTagihanFinanceEnum" />
          </div>
          <p class="text-sm text-muted-foreground">{{ labelPeriodePanjang }}</p>
          <p class="text-xs text-muted-foreground">Dibuat {{ formatTanggal(tagihan.created_at) }}</p>
        </div>
      </div>

      <!-- FINANCIAL SUMMARY -->
      <Card>
        <CardContent class="space-y-5 p-6">
          <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p class="text-xs text-muted-foreground">Total Tagihan</p>
              <p class="text-lg font-bold tabular-nums">{{ formatRupiah(totalTagihan) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Telah Terbayar</p>
              <p class="text-lg font-bold tabular-nums">{{ formatRupiah(telahTerbayar) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Sisa</p>
              <p class="text-lg font-bold tabular-nums" :class="isLunas ? 'text-emerald-600' : 'text-destructive'">
                {{ formatRupiahBertanda(sisa) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Status</p>
              <StatusBadge :value="statusFinansial" :map="statusTagihanFinanceEnum" />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" :aria-valuenow="persenPembayaran" aria-valuemin="0" aria-valuemax="100">
              <div class="h-2 rounded-full transition-all" :class="isLunas ? 'bg-emerald-500' : 'bg-primary'" :style="{ width: `${persenPembayaran}%` }" />
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>{{ persenPembayaran }}% terbayar</span>
              <span v-if="tagihan.tanggal_lunas">Lunas {{ tagihan.tanggal_lunas }} WIB</span>
            </div>
          </div>

          <p v-if="kreditDariPembayaran > 0" class="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Kelebihan pembayaran {{ formatRupiah(kreditDariPembayaran) }} telah masuk saldo kredit pelanggan.
          </p>
        </CardContent>
      </Card>

      <!-- PELANGGAN & LAYANAN | PEMBAYARAN -->
      <div class="grid gap-4 lg:grid-cols-2">
        <Card v-if="pelanggan">
          <CardHeader>
            <CardTitle class="text-base">Pelanggan & Layanan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-muted-foreground">Nama</span>
              <span class="text-right font-medium">{{ pelanggan.nama_lengkap }}</span>
            </div>
            <div v-if="pelanggan.nomor_pelanggan" class="flex justify-between gap-3">
              <span class="text-muted-foreground">No. Pelanggan</span>
              <span class="font-mono text-xs">{{ pelanggan.nomor_pelanggan }}</span>
            </div>
            <div v-if="layanan?.nomor_layanan" class="flex justify-between gap-3">
              <span class="text-muted-foreground">No. Layanan</span>
              <span class="font-mono text-xs">{{ layanan.nomor_layanan }}</span>
            </div>
            <div v-if="pelanggan.nomor_hp" class="flex justify-between gap-3">
              <span class="text-muted-foreground">No. HP</span>
              <a :href="waHref(pelanggan.nomor_hp)" target="_blank" rel="noopener noreferrer" class="text-right text-blue-600 underline">
                {{ pelanggan.nomor_hp }} (WhatsApp)
              </a>
            </div>
            <Separator class="my-1" />
            <div v-if="layanan?.alamat_pemasangan">
              <p class="text-muted-foreground">Alamat Instalasi</p>
              <p>{{ [layanan.detail_alamat, layanan.alamat_pemasangan].filter(Boolean).join(', ') }}</p>
            </div>
            <div v-if="layanan?.paket_internet">
              <p class="text-muted-foreground">Paket</p>
              <p>{{ layanan.paket_internet.nama_paket }} — {{ layanan.paket_internet.kecepatan_mbps }} Mbps</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Pembayaran</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm text-muted-foreground">Sisa tagihan</p>
              <p class="text-2xl font-bold tabular-nums">{{ formatRupiah(sisaTagihan) }}</p>
            </div>

            <template v-if="!isLunas">
              <p class="text-sm text-muted-foreground">
                Bayar tagihan ini secara tunai. Nominal bebas — mendukung cicilan, pelunasan, dan kelebihan yang masuk saldo
                kredit pelanggan.
              </p>
              <Button class="w-full" @click="bukaDialogTunai">
                <HandCoins class="mr-2 size-4" /> Bayar Tunai
              </Button>
            </template>
            <p v-else class="text-sm text-muted-foreground">Tagihan sudah lunas. Pembayaran tunai tidak tersedia.</p>
          </CardContent>
        </Card>
      </div>

      <!-- RINCIAN TAGIHAN -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <ReceiptText class="size-4 text-muted-foreground" />
            Rincian Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <span class="text-muted-foreground">Periode</span>
            <span>{{ labelPeriodePanjang }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span class="text-muted-foreground">Paket</span>
            <span>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</span>
          </div>
          <div class="flex justify-between gap-3">
            <span class="text-muted-foreground">Harga Paket</span>
            <span>{{ formatRupiah(tagihan.harga_snapshot) }}</span>
          </div>
          <p v-if="tagihan.jumlah_bulan > 1" class="text-xs text-muted-foreground">
            Tagihan mencakup {{ tagihan.jumlah_bulan }} bulan ({{ periodeTampilan }}).
          </p>
          <Separator class="my-1" />
          <div class="flex justify-between gap-3">
            <span class="text-muted-foreground">Total Tagihan</span>
            <span class="font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- RIWAYAT PEMBAYARAN -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <History class="size-4 text-muted-foreground" />
            Riwayat Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol v-if="riwayat.length" class="space-y-5 border-l border-muted pl-5">
            <li v-for="(ev, i) in riwayat" :key="i" class="relative space-y-1">
              <span class="absolute -left-[26px] top-1.5 size-2.5 rounded-full" :class="ev.jenis === 'kredit' ? 'bg-sky-500' : 'bg-emerald-500'" />
              <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ labelJenisRiwayat(ev) }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ ev.waktu_wib }} WIB
                    <template v-if="ev.nomor_pembayaran"> · {{ ev.nomor_pembayaran }}</template>
                    <template v-if="ev.metode_pembayaran"> · {{ ev.metode_pembayaran }}</template>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold tabular-nums">{{ formatRupiah(jumlahRiwayat(ev)) }}</p>
                  <p class="text-xs text-muted-foreground">Berhasil</p>
                </div>
              </div>
              <div v-if="isOverbayar(ev)" class="space-y-0.5 rounded-md bg-muted/40 px-3 py-2 text-xs">
                <p>Dialokasikan ke tagihan <span class="font-medium tabular-nums">{{ formatRupiah(ev.jumlah) }}</span></p>
                <p v-if="Number(ev.jumlah_kredit ?? 0) > 0" class="text-emerald-600">
                  Masuk saldo kredit <span class="font-medium tabular-nums">{{ formatRupiah(ev.jumlah_kredit) }}</span>
                </p>
              </div>
              <p v-if="ev.keterangan" class="text-xs text-muted-foreground">{{ ev.keterangan }}</p>
            </li>
          </ol>
          <p v-else class="text-sm text-muted-foreground">Belum ada pembayaran untuk tagihan ini.</p>
        </CardContent>
      </Card>

      <!-- PEMBAYARAN ONLINE / XENDIT -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <ExternalLink class="size-4 text-muted-foreground" />
            Pembayaran Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <template v-if="pembayaranOnline">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <span class="text-muted-foreground">Invoice ID</span>
                <span class="font-mono text-xs">{{ pembayaranOnline.provider_reference ?? '—' }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-muted-foreground">Status</span>
                <span>{{ labelStatusOnline(pembayaranOnline.provider_status) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-muted-foreground">Kedaluwarsa</span>
                <span>{{ formatTanggal(pembayaranOnline.provider_expires_at) }}</span>
              </div>
            </div>
            <Separator class="my-3" />
            <div class="grid gap-2 sm:grid-cols-2">
              <Button v-if="pembayaranOnline.payment_url" as="a" :href="pembayaranOnline.payment_url" target="_blank" rel="noopener noreferrer" variant="outline" size="sm" class="w-full">
                <ExternalLink class="mr-2 size-3" /> Buka Invoice
              </Button>
              <Button v-if="!isLunas" size="sm" class="w-full" :disabled="isPerbaruiLinkPending" @click="handlePerbaruiLink">
                <RefreshCw v-if="isPerbaruiLinkPending" class="mr-2 size-3 animate-spin" />
                {{ isPerbaruiLinkPending ? 'Memperbarui...' : 'Perbarui Link Pembayaran' }}
              </Button>
            </div>
          </template>
          <p v-else class="text-sm text-muted-foreground">
            Belum ada invoice pembayaran online. Pelanggan membuat link saat membayar melalui portal pelanggan.
          </p>
        </CardContent>
      </Card>

      <!-- DIALOG BAYAR TUNAI -->
      <Dialog :open="showTunaiDialog" @update:open="(v) => (showTunaiDialog = v)">
        <DialogContent class="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bayar Tunai</DialogTitle>
            <DialogDescription>
              Masukkan nominal uang yang benar-benar diterima. Alokasi hanya untuk tagihan ini; kelebihan otomatis menjadi
              saldo kredit pelanggan.
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-3">
            <div class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tagihan</span>
                <span class="font-mono text-xs">{{ tagihan.nomor_tagihan }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Periode</span>
                <span>{{ periodeTampilan }}</span>
              </div>
              <Separator class="my-2" />
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sisa Tagihan</span>
                <span class="font-semibold tabular-nums">{{ formatRupiah(sisaTagihan) }}</span>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-sm text-muted-foreground">Nominal Pembayaran</p>
              <Input v-model="nominalTunai" inputmode="numeric" placeholder="Rp 0" />
              <p class="text-right text-sm font-semibold tabular-nums">{{ formatRupiah(nominalTunaiAngka) }}</p>
            </div>

            <div v-if="kelebihanTunai > 0" class="rounded-lg border bg-emerald-50/60 px-4 py-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Dialokasikan ke tagihan</span>
                <span class="font-medium tabular-nums">{{ formatRupiah(sisaTagihan) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-emerald-700">
                <span>Saldo kredit</span>
                <span class="tabular-nums">{{ formatRupiah(kelebihanTunai) }}</span>
              </div>
            </div>
            <p v-else-if="kekuranganSetelah > 0" class="text-xs text-muted-foreground">
              Setelah pembayaran, sisa tagihan menjadi {{ formatRupiah(kekuranganSetelah) }}.
            </p>
          </div>

          <DialogFooter class="gap-2 sm:gap-0">
            <Button variant="outline" @click="showTunaiDialog = false" :disabled="isBayarTunaiPending">Batal</Button>
            <Button :disabled="isBayarTunaiPending || nominalTunaiAngka <= 0" @click="handleBayarTunai">
              {{ isBayarTunaiPending ? 'Mencatat...' : 'Bayar' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>