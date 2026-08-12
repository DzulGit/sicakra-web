<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { useTagihanDetail, useRegenerateTagihan, useBayarTunaiTagihan, usePerbaruiLinkTagihan } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { RefreshCw, ExternalLink, ArrowLeft, HandCoins } from 'lucide-vue-next'
import type { ApiErrorResponse } from '@/types/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanDetail(id)
const { mutate: regenerate, isPending: isRegenerating } = useRegenerateTagihan()
const { mutate: bayarTunai, isPending: isBayarTunaiPending } = useBayarTunaiTagihan()
const { mutate: perbaruiLink, isPending: isPerbaruiLinkPending } = usePerbaruiLinkTagihan()

const jumlahBulan = ref('1')
const opsiBulan = Array.from({ length: 12 }, (_, i) => i + 1)

const showTunaiDialog = ref(false)
const jumlahBulanTunai = ref('1')

const totalBaru = computed(() => {
  if (!tagihan.value) return 0
  return Number(tagihan.value.harga_snapshot) * Number(jumlahBulan.value)
})

const totalTunai = computed(() => {
  if (!tagihan.value) return 0
  return Number(tagihan.value.harga_snapshot) * Number(jumlahBulanTunai.value)
})

const periodeTampilan = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  if (t.jumlah_bulan > 1 && t.periode_akhir_bulan) {
    return `${t.periode_bulan}/${t.periode_tahun} – ${t.periode_akhir_bulan}/${t.periode_akhir_tahun}`
  }
  return `${t.periode_bulan}/${t.periode_tahun}`
})

function handleRegenerate() {
  regenerate(
    { id: id.value, jumlahBulan: Number(jumlahBulan.value) },
    {
      onSuccess: () => {
        toast.success('Tagihan berhasil di-generate ulang.')
        refetch()
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal generate ulang tagihan.')
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

function bukaDialogTunai() {
  jumlahBulanTunai.value = String(tagihan.value?.jumlah_bulan ?? 1)
  showTunaiDialog.value = true
}

function handleBayarTunai() {
  bayarTunai(
    { id: id.value, jumlahBulan: Number(jumlahBulanTunai.value) },
    {
      onSuccess: () => {
        showTunaiDialog.value = false
        toast.success('Pembayaran tunai berhasil dicatat. Tagihan lunas.')
        refetch()
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal mencatat pembayaran tunai.')
      },
    },
  )
}

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
              <span>{{ periodeTampilan }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Paket</span>
              <span>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Harga / Bulan</span>
              <span>{{ formatRupiah(tagihan.harga_snapshot) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Jumlah Bulan</span>
              <span>{{ tagihan.jumlah_bulan }} bulan</span>
            </div>
            <Separator class="my-1" />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Total Tagihan</span>
              <span class="font-semibold">{{ formatRupiah(tagihan.total_tagihan) }}</span>
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
            <Button
              v-if="tagihan.status_pembayaran !== 'sudah_bayar'"
              size="sm"
              class="w-full"
              :disabled="isPerbaruiLinkPending"
              @click="handlePerbaruiLink"
            >
              <RefreshCw v-if="isPerbaruiLinkPending" class="mr-2 size-3 animate-spin" />
              {{ isPerbaruiLinkPending ? 'Memperbarui...' : 'Perbarui Link Pembayaran' }}
            </Button>
          </CardContent>
        </Card>

        <!-- Generate Ulang -->
        <Card v-if="tagihan.status_pembayaran !== 'sudah_bayar'">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <RefreshCw class="size-4 text-muted-foreground" />
              Generate Ulang
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p class="text-muted-foreground">
              Ubah jumlah bulan tagihan (semula {{ tagihan.jumlah_bulan }} bulan) — misal pelanggan
              berubah pikiran mau bayar lebih banyak/lebih sedikit bulan.
            </p>

            <Select v-model="jumlahBulan">
              <SelectTrigger>
                <SelectValue placeholder="Pilih jumlah bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="b in opsiBulan" :key="b" :value="String(b)">{{ b }} bulan</SelectItem>
              </SelectContent>
            </Select>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Total setelah generate ulang</span>
              <span class="font-semibold">{{ formatRupiah(String(totalBaru)) }}</span>
            </div>
            <Button
              class="w-full"
              :disabled="isRegenerating || Number(jumlahBulan) === tagihan.jumlah_bulan"
              @click="handleRegenerate"
            >
              <RefreshCw v-if="isRegenerating" class="mr-2 size-4 animate-spin" />
              {{ isRegenerating ? 'Memproses...' : 'Generate Ulang' }}
            </Button>
          </CardContent>
        </Card>

        <!-- Bayar Tunai -->
        <Card v-if="tagihan.status_pembayaran !== 'sudah_bayar'">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <HandCoins class="size-4 text-muted-foreground" />
              Pembayaran Tunai
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p class="text-muted-foreground">
              Pelanggan bayar tunai langsung di kantor. Tagihan langsung lunas tanpa Xendit, dan
              nama admin penerima dicatat.
            </p>
            <Button class="w-full" variant="outline" @click="bukaDialogTunai">
              <HandCoins class="mr-2 size-4" /> Bayar Tunai / Cash
            </Button>
          </CardContent>
        </Card>

        <!-- Dialog Bayar Tunai -->
        <Dialog :open="showTunaiDialog" @update:open="(v) => (showTunaiDialog = v)">
          <DialogContent class="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Bayar Tunai / Cash</DialogTitle>
              <DialogDescription>
                Pilih berapa bulan yang dibayar tunai. Tagihan langsung LUNAS dan masa aktif layanan bertambah.
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Jumlah bulan</p>
              <Select v-model="jumlahBulanTunai">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jumlah bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="b in opsiBulan" :key="b" :value="String(b)">{{ b }} bulan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Harga / Bulan</span>
                <span>{{ formatRupiah(String(tagihan?.harga_snapshot ?? 0)) }}</span>
              </div>
              <div class="flex justify-between font-semibold">
                <span>Total Diterima</span>
                <span>{{ formatRupiah(String(totalTunai)) }}</span>
              </div>
            </div>

            <DialogFooter class="gap-2 sm:gap-0">
              <Button variant="outline" @click="showTunaiDialog = false" :disabled="isBayarTunaiPending">Batal</Button>
              <Button :disabled="isBayarTunaiPending" @click="handleBayarTunai">
                {{ isBayarTunaiPending ? 'Mencatat...' : 'Konfirmasi Pembayaran Tunai' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
