<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import type { Tagihan } from '@/types/models'
import {
  useTagihanSayaDetail,
  useBayarTagihan,
  useDeposit,
  useRegenerateInvoice,
  useRiwayatPembayaran,
} from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { toast } from 'vue-sonner'
import { ExternalLink, Wifi, AlertTriangle } from 'lucide-vue-next'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanSayaDetail(id)
const { data: deposit } = useDeposit()
const { bayarSatu } = useBayarTagihan()
const { mutateAsync: gantiInvoice, isPending: isMenggantiInvoice } = useRegenerateInvoice()
const { data: riwayatPembayaran } = useRiwayatPembayaran()

const jumlahDibayar = ref('')
const pakaiDeposit = ref(false)
const konfirmasiGanti = ref(false)
const baruSajaBuatBayaranBaru = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null

watch(
  tagihan,
  (baru) => {
    if (baru?.status_pembayaran === 'belum_bayar') {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (refetch) refetch()
        }, 5000)
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const sisaTagihan = computed(() => Number(tagihan.value?.sisa_tagihan ?? tagihan.value?.total_tagihan ?? 0))
const saldoKredit = computed(() => Number(deposit.value?.saldo_deposit ?? 0))

const riwayatLista = computed(() => riwayatPembayaran.value?.data ?? [])

const pembayaranPending = computed(() =>
  riwayatLista.value.find(
    (p) => p.status === 'pending' && !!p.payment_url && (p.tagihan_terpilih ?? []).includes(Number(id.value)),
  ),
)

const adaPendingTanpaUrl = computed(() =>
  riwayatLista.value.some(
    (p) => p.status === 'pending' && !p.payment_url && (p.tagihan_terpilih ?? []).includes(Number(id.value)),
  ),
)

const bisaDibayar = computed(
  () => tagihan.value?.status_pembayaran === 'belum_bayar' && sisaTagihan.value > 0 && !pembayaranPending.value,
)

const tampilkanFormBayar = computed(
  () =>
    bisaDibayar.value ||
    (baruSajaBuatBayaranBaru.value &&
      tagihan.value?.status_pembayaran === 'belum_bayar' &&
      sisaTagihan.value > 0),
)

watch(
  tagihan,
  (t) => {
    if (t?.status_pembayaran === 'belum_bayar' && !jumlahDibayar.value) {
      jumlahDibayar.value = String(Number(t.sisa_tagihan ?? t.total_tagihan))
    }
  },
  { immediate: true },
)

const nominalBayar = computed(() => {
  const n = Number(jumlahDibayar.value)
  return Number.isFinite(n) && n > 0 ? n : sisaTagihan.value
})

const labelTombolBayar = computed(() =>
  pembayaranPending.value && baruSajaBuatBayaranBaru.value
    ? 'Bayar Sekarang'
    : `Bayar ${formatRupiah(nominalBayar.value)}`,
)

const statusTeks = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  if (pembayaranPending.value) return 'Pembayaran belum selesai'
  if (t.status_pembayaran === 'belum_bayar') return 'Belum dibayar'
  if (t.status_pembayaran === 'sudah_bayar') return 'Sudah dibayar'
  if (t.status_pembayaran === 'belum_diterbitkan') return 'Belum diterbitkan'
  return 'Tidak dapat dibayar'
})

const statusTeksClass = computed(() => {
  if (pembayaranPending.value) return 'text-amber-700'
  if (tagihan.value?.status_pembayaran === 'sudah_bayar') return 'text-emerald-700'
  return 'text-muted-foreground'
})

const namaPaket = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  const l = t.layanan_internet
  return l?.nama_paket_custom || l?.paket_internet?.nama_paket || t.nama_paket_snapshot
})

const kecepatanMbps = computed(() => {
  const t = tagihan.value
  if (!t) return 0
  const l = t.layanan_internet
  return l?.kecepatan_custom_mbps ?? l?.paket_internet?.kecepatan_mbps ?? t.kecepatan_snapshot_mbps
})

const layananNomor = computed(() => tagihan.value?.layanan_internet?.nomor_layanan)
const layananAlamat = computed(() => tagihan.value?.layanan_internet?.alamat_pemasangan)

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function teksPeriode(t: Tagihan | undefined) {
  if (!t) return ''
  return `${NAMA_BULAN[t.periode_bulan - 1]} ${t.periode_tahun}`
}

function formatRupiah(nilai: string | number | null | undefined) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai ?? 0),
  )
}

function formatTanggal(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function bukaHalamanBayar(url?: string | null) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

function pesanError(e: unknown) {
  const data = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined) : undefined
  return data?.message
}

async function bayar() {
  try {
    const hasilBayar = await bayarSatu.mutateAsync({
      id: id.value,
      jumlahDibayar: nominalBayar.value,
      gunakanDeposit: pakaiDeposit.value,
    })
    refetch?.()
    toast.success('Selesaikan pembayaran di jendela yang baru terbuka')
    const url = hasilBayar.payment_url
    if (url) bukaHalamanBayar(url)
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran')
  }
}

async function konfirmasiGantiInvoice() {
  try {
    await gantiInvoice(id.value)
    konfirmasiGanti.value = false
    baruSajaBuatBayaranBaru.value = true
    refetch?.()
    toast.success('Pembayaran baru berhasil dibuat.')
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran baru')
  }
}
</script>

<template>
  <div v-if="isLoading">
    <Skeleton class="h-64 w-full max-w-xl" />
  </div>

  <div v-else-if="tagihan" class="max-w-xl space-y-4">
    <Card class="rounded-xl border shadow-none">
      <CardContent class="p-5">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs text-muted-foreground">{{ tagihan.nomor_tagihan }}</p>
          <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
        </div>
        <p class="mt-4 text-sm font-medium text-muted-foreground">{{ teksPeriode(tagihan) }}</p>
        <p class="mt-1 text-3xl font-semibold tabular-nums">{{ formatRupiah(tagihan.total_tagihan) }}</p>
        <p class="mt-1.5 text-sm" :class="statusTeksClass">{{ statusTeks }}</p>
      </CardContent>
    </Card>

    <Card class="rounded-xl border shadow-none">
      <CardContent class="p-5">
        <div class="flex items-start gap-2.5">
          <Wifi class="mt-0.5 size-4 shrink-0 text-primary" />
          <div class="min-w-0">
            <p class="text-sm font-semibold">{{ namaPaket }} · {{ kecepatanMbps }} Mbps</p>
            <p v-if="layananAlamat" class="truncate text-xs text-muted-foreground">{{ layananAlamat }}</p>
            <p v-if="layananNomor" class="text-xs text-muted-foreground">Layanan: {{ layananNomor }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="rounded-xl border shadow-none">
      <CardContent class="space-y-2.5 p-5 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Total tagihan</span>
          <span class="tabular-nums">{{ formatRupiah(tagihan.total_tagihan) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Sudah dibayar</span>
          <span class="tabular-nums">{{ formatRupiah(tagihan.sudah_dibayar) }}</span>
        </div>
        <div v-if="Number(tagihan.saldo_kredit_digunakan) > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Saldo kredit digunakan</span>
          <span class="tabular-nums">{{ formatRupiah(tagihan.saldo_kredit_digunakan) }}</span>
        </div>
        <div class="flex items-center justify-between border-t pt-3">
          <span class="font-medium">Sisa</span>
          <span class="text-lg font-semibold tabular-nums">{{ formatRupiah(sisaTagihan) }}</span>
        </div>
      </CardContent>
    </Card>

    <Card class="rounded-xl border shadow-none">
      <CardContent class="space-y-3 p-5">
        <template
          v-if="
            (tampilkanFormBayar || pembayaranPending || adaPendingTanpaUrl) &&
            tagihan.status_pembayaran !== 'sudah_bayar'
          "
        >
          <template v-if="pembayaranPending">
            <div class="flex items-start gap-2 text-amber-800">
              <AlertTriangle class="mt-0.5 size-4 shrink-0" />
              <p class="text-sm font-medium">Pembayaran belum selesai</p>
            </div>
            <Button variant="outline" class="w-full" @click="bukaHalamanBayar(pembayaranPending.payment_url)">
              <ExternalLink class="mr-2 size-4" />
              Lanjutkan Pembayaran
            </Button>
          </template>

          <template v-else-if="adaPendingTanpaUrl">
            <p class="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle class="size-4" />
              Pembayaran belum selesai
            </p>
            <p class="text-xs text-muted-foreground">
              Ada pembayaran yang masih diproses. Muat ulang halaman ini sebentar lagi.
            </p>
          </template>

          <template v-if="tampilkanFormBayar">
            <div>
              <p class="text-sm font-medium">Sisa tagihan</p>
              <p class="text-2xl font-semibold tabular-nums">{{ formatRupiah(sisaTagihan) }}</p>
            </div>
            <div class="grid gap-1.5">
              <Label for="jumlah-bayar">Mau bayar berapa?</Label>
              <Input id="jumlah-bayar" v-model="jumlahDibayar" type="number" min="1" />
            </div>
            <p class="text-xs text-muted-foreground">
              <template v-if="nominalBayar < sisaTagihan">
                Pembayaran ini belum melunasi tagihan.
              </template>
              <template v-else-if="nominalBayar > sisaTagihan">
                Pembayaran lebih dari sisa tagihan akan menjadi saldo kredit.
              </template>
              <template v-else>
                Tagihan akan lunas setelah pembayaran berhasil.
              </template>
            </p>
            <label v-if="saldoKredit > 0" class="flex items-center gap-2 text-sm">
              <Checkbox v-model="pakaiDeposit" aria-label="Gunakan saldo kredit" />
              <span>Gunakan saldo kredit ({{ formatRupiah(saldoKredit) }})</span>
            </label>
            <Button class="w-full" :disabled="bayarSatu.isPending.value" @click="bayar">
              <ExternalLink class="mr-2 size-4" />
              {{ labelTombolBayar }}
            </Button>
          </template>

          <template v-if="pembayaranPending">
            <button
              type="button"
              class="w-full text-center text-xs font-medium text-primary underline underline-offset-2"
              @click="konfirmasiGanti = true"
            >
              Buat pembayaran baru
            </button>
            <p class="text-xs text-muted-foreground">
              Buat pembayaran baru hanya jika Anda tidak ingin melanjutkan pembayaran sebelumnya.
            </p>
          </template>
        </template>

        <div
          v-else-if="tagihan.status_pembayaran === 'sudah_bayar'"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
        >
          <p class="font-medium">Sudah dibayar</p>
          <p class="mt-0.5 text-sm text-emerald-800/80">
            Dibayar {{ formatTanggal(tagihan.dibayar_pada) }}
          </p>
        </div>

        <div
          v-else-if="tagihan.status_pembayaran === 'belum_diterbitkan'"
          class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
        >
          <p class="font-medium">Belum diterbitkan</p>
          <p class="mt-0.5 text-sm">
            Tagihan ini belum diterbitkan sehingga belum dapat dibayar.
          </p>
        </div>

        <p v-else class="text-sm text-muted-foreground">Tagihan ini tidak dapat dibayar.</p>
      </CardContent>
    </Card>

    <Card v-if="tagihan.riwayat_pembayaran?.length" class="rounded-xl border shadow-none">
      <CardContent class="p-5">
        <p class="mb-3 text-sm font-medium">Riwayat Pembayaran</p>
        <RiwayatPembayaranTable :pembayaran="tagihan.riwayat_pembayaran" />
      </CardContent>
    </Card>

    <ConfirmDialog
      :open="konfirmasiGanti"
      judul="Buat pembayaran baru?"
      deskripsi="Pembayaran sebelumnya akan digantikan dengan pembayaran baru."
      label-konfirmasi="Buat Pembayaran Baru"
      label-batal="Batal"
      :loading="isMenggantiInvoice"
      @update:open="(v: boolean) => !v && (konfirmasiGanti = false)"
      @confirm="konfirmasiGantiInvoice"
    />
  </div>
</template>