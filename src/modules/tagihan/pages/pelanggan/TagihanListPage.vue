<script setup lang="ts">
import { computed, ref } from 'vue'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import type { Pembayaran, BayarGabunganResult } from '@/types/models'
import {
  useTagihanSayaList,
  useDeposit,
  useTunggakan,
  useBayarTagihan,
  useGunakanDeposit,
  useRiwayatPembayaran,
} from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum, statusTransaksiEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import { Wallet, RefreshCw, ExternalLink } from 'lucide-vue-next'

const { data: hasil, isLoading } = useTagihanSayaList()
const { data: deposit, isLoading: isLoadingDeposit } = useDeposit()
const { data: tunggakan, isLoading: isLoadingTunggakan } = useTunggakan()
const { bayarSatu, bayarGabungan } = useBayarTagihan()
const { mutateAsync: gunaDeposit, isPending: isMenggunakanDeposit } = useGunakanDeposit()
const { data: riwayat, isLoading: isLoadingRiwayat } = useRiwayatPembayaran()

const tagihanLista = computed(() => hasil.value?.data ?? [])
const riwayatLista = computed(() => riwayat.value?.data ?? [])

const terpilih = ref<number[]>([])
const jumlahDibayar = ref<string>('')
const pakaiDeposit = ref(false)

const totalSisaTerpilih = computed(() =>
  tagihanLista.value
    .filter((t) => terpilih.value.includes(t.id))
    .reduce((total, t) => total + Number(t.sisa_tagihan ?? t.total_tagihan), 0),
)

function toggleSemua(checked: boolean) {
  terpilih.value = checked ? tagihanLista.value.map((t) => t.id) : []
}

function toggleSatu(id: number, checked: boolean) {
  terpilih.value = checked
    ? [...terpilih.value, id]
    : terpilih.value.filter((t) => t !== id)
}

function sisaTagihan(t: { sisa_tagihan?: number; total_tagihan: string }) {
  return Number(t.sisa_tagihan ?? t.total_tagihan)
}

function formatRupiah(nilai: string | number | null | undefined) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai ?? 0),
  )
}

function formatTanggal(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
}

function pesanError(e: unknown) {
  const data = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined) : undefined
  return data?.message
}

function bukaHalamanBayar(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function bayar() {
  if (terpilih.value.length === 0) {
    toast.warning('Pilih minimal satu tagihan yang mau dibayar')
    return
  }

  const jumlah = Number(jumlahDibayar.value)
  const opsi: { gunakanDeposit?: boolean; jumlahDibayar?: number } = { gunakanDeposit: pakaiDeposit.value }

  try {
    if (terpilih.value.length === 1) {
      opsi.jumlahDibayar = jumlah > 0 ? jumlah : undefined
      const hasilBayar = await bayarSatu.mutateAsync({ id: terpilih.value[0], ...opsi })
      const url = (hasilBayar as Pembayaran).payment_url
      if (url) bukaHalamanBayar(url)
    } else {
      if (!(jumlah > 0)) {
        opsi.jumlahDibayar = totalSisaTerpilih.value
      } else {
        opsi.jumlahDibayar = jumlah
      }
      const hasilBayar = await bayarGabungan.mutateAsync({
        jumlahDibayar: opsi.jumlahDibayar!,
        tagihanIds: terpilih.value,
        gunakanDeposit: pakaiDeposit.value,
      })
      const url = (hasilBayar as BayarGabunganResult).payment_url
      if (url) bukaHalamanBayar(url)
    }
    terpilih.value = []
    jumlahDibayar.value = ''
    toast.success('Invoice dibuat. Selesaikan pembayaran di jendela yang baru terbuka')
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran')
  }
}

async function pakaiSaldoDeposit() {
  try {
    const hasil = await gunaDeposit()
    if (hasil.total_digunakan > 0) {
      toast.success(`Deposit ${formatRupiah(hasil.total_digunakan)} digunakan untuk ${hasil.tagihan.length} tagihan`)
    } else {
      toast.info('Saldo deposit sudah habis atau tidak ada tunggakan')
    }
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal menggunakan deposit')
  }
}
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-xl font-semibold">Tagihan Saya</h1>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader class="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="flex items-center gap-2 text-sm font-medium">
            <Wallet class="size-4 text-primary" />
            Saldo Deposit
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            :disabled="isMenggunakanDeposit || !deposit?.saldo_deposit"
            @click="pakaiSaldoDeposit"
          >
            <RefreshCw v-if="isMenggunakanDeposit" class="mr-2 size-3.5 animate-spin" />
            Gunakan untuk Tunggakan
          </Button>
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoadingDeposit" class="h-10 w-32" />
          <template v-else>
            <p class="text-2xl font-semibold tabular-nums">{{ formatRupiah(deposit?.saldo_deposit) }}</p>
            <p v-if="deposit?.mutasi.length" class="mt-2 space-y-1 text-xs text-muted-foreground">
              <span v-for="m in deposit.mutasi.slice(0, 3)" :key="m.id" class="flex items-center justify-between gap-2">
                <span class="truncate">{{ m.jenis === 'kredit' ? 'Kelebihan pembayaran' : 'Dipakai untuk tagihan' }}</span>
                <span class="tabular-nums">{{ formatRupiah(m.jumlah) }} · {{ formatTanggal(m.created_at) }}</span>
              </span>
            </p>
            <p v-else class="text-xs text-muted-foreground">Belum ada mutasi deposit</p>
          </template>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Tunggakan</CardTitle>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="tunggakan?.jumlah_tagihan ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
          >
            {{ tunggakan?.jumlah_tagihan ? `${tunggakan.jumlah_tagihan} tagihan` : 'Lunas' }}
          </span>
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoadingTunggakan" class="h-10 w-32" />
          <template v-else>
            <p class="text-2xl font-semibold tabular-nums">{{ formatRupiah(tunggakan?.total_tunggakan) }}</p>
            <p class="text-xs text-muted-foreground">
              {{ tunggakan?.jumlah_tagihan ?? 0 }} tagihan belum lunas · sisa dari total, bukan nilai tagihan penuh
            </p>
          </template>
        </CardContent>
      </Card>
    </div>

    <Card v-if="terpilih.length" class="border-primary/40">
      <CardHeader>
        <CardTitle class="text-base">Pembayaran Terpilih ({{ terpilih.length }})</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Total sisa tagihan terpilih</span>
          <span class="font-semibold tabular-nums">{{ formatRupiah(totalSisaTerpilih) }}</span>
        </div>
        <div class="grid gap-2">
          <Label for="jumlah-bayar">Jumlah dibayar (kosongkan = lunasi sisa)</Label>
          <Input
            id="jumlah-bayar"
            v-model="jumlahDibayar"
            type="number"
            min="1"
            :placeholder="String(totalSisaTerpilih)"
          />
        </div>
        <label class="flex items-center gap-2 text-sm">
          <Checkbox v-model="pakaiDeposit" />
          <span>Pakai saldo deposit untuk transaksi ini</span>
        </label>
        <Button class="w-full" :disabled="bayarSatu.isPending || bayarGabungan.isPending" @click="bayar">
          <ExternalLink class="mr-2 size-4" />
          Buat Pembayaran via Xendit
        </Button>
      </CardContent>
    </Card>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <EmptyState v-else-if="!tagihanLista.length" judul="Belum ada tagihan" deskripsi="Tagihan akan muncul di sini setelah diterbitkan." />

    <Card v-else>
      <CardHeader class="flex-row items-center justify-between space-y-0">
        <CardTitle class="text-base">Daftar Tagihan</CardTitle>
        <Checkbox
          :checked="terpilih.length === tagihanLista.length"
          :aria-label="terpilih.length === tagihanLista.length ? 'Batalkan semua pilihan' : 'Pilih semua tagihan'"
          @update:checked="toggleSemua"
        />
      </CardHeader>
      <CardContent class="divide-y">
        <div v-for="tagihan in tagihanLista" :key="tagihan.id" class="flex items-center justify-between gap-3 py-3">
          <div class="flex min-w-0 items-center gap-3">
            <Checkbox
              :checked="terpilih.includes(tagihan.id)"
              :aria-label="`Pilih tagihan ${tagihan.nomor_tagihan}`"
              @update:checked="(c: boolean) => toggleSatu(tagihan.id, c)"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-medium">{{ tagihan.nomor_tagihan }}</p>
                <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
              </div>
              <p class="mt-0.5 truncate text-sm text-muted-foreground">
                Periode {{ tagihan.periode_bulan }}/{{ tagihan.periode_tahun }}
                <span v-if="tagihan.status_pembayaran === 'belum_bayar'" class="tabular-nums">
                  · Sisa {{ formatRupiah(sisaTagihan(tagihan)) }}
                </span>
              </p>
            </div>
          </div>
          <p class="shrink-0 text-sm font-medium tabular-nums">{{ formatRupiah(tagihan.total_tagihan) }}</p>
        </div>
      </CardContent>
    </Card>

    <Pagination v-if="hasil && hasil.last_page > 1" :meta="hasil" />

    <Card v-if="riwayatLista.length">
      <CardHeader>
        <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <Skeleton v-if="isLoadingRiwayat" class="h-12 w-full" />
        <div
          v-for="p in riwayatLista"
          :key="p.id"
          class="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"
        >
          <div class="min-w-0">
            <p class="font-medium tabular-nums">{{ formatRupiah(p.jumlah_dibayar) }} <span class="text-muted-foreground">· {{ p.metode_pembayaran ?? '—' }}</span></p>
            <p class="text-xs text-muted-foreground">{{ formatTanggal(p.dibayar_pada ?? p.created_at) }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <StatusBadge :value="p.status" :map="statusTransaksiEnum" />
            <Button
              v-if="p.status === 'pending' && p.payment_url"
              size="sm"
              variant="outline"
              @click="bukaHalamanBayar(p.payment_url!)"
            >
              Lanjutkan Bayar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>