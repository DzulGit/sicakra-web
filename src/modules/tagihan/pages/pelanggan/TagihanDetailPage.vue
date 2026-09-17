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
} from '../../composables/useKeuanganTagihan'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import RupiahInput from '@/components/data/RupiahInput.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import type { EnumMap } from '@/lib/enums'
import { Wifi } from 'lucide-vue-next'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanSayaDetail(id)
const { data: deposit } = useDeposit()
const { bayarSatu } = useBayarTagihan()

const jumlahDibayar = ref<number | null>(null)
const pakaiDeposit = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null

watch(
  tagihan,
  (baru) => {
    if (baru?.status_pembayaran === 'belum_bayar' || Number(baru?.sisa_tagihan ?? 0) > 0) {
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
const sudahTerbayar = computed(
  () => Number(tagihan.value?.sudah_dibayar ?? 0) + Number(tagihan.value?.saldo_kredit_digunakan ?? 0) > 0,
)

// Status customer dihitung dari kondisi finansial aktual tagihan,
// bukan status transaksi provider (PENDING bukan status tagihan).
const statusPembayaranSaya = computed((): string => {
  const t = tagihan.value
  if (!t) return ''
  if (sisaTagihan.value <= 0) return 'lunas'
  if (t.status_pembayaran === 'belum_bayar') return sudahTerbayar.value ? 'sedang_dicicil' : 'belum_bayar'
  if (t.status_pembayaran === 'belum_diterbitkan') return 'belum_diterbitkan'
  return 'tidak_dapat_dibayar'
})

const mapStatusTagihanSaya: EnumMap = {
  belum_bayar: { label: 'Belum Dibayar', badgeVariant: 'warning' },
  sedang_dicicil: { label: 'Sedang Cicil', badgeVariant: 'info' },
  lunas: { label: 'Lunas', badgeVariant: 'success' },
  belum_diterbitkan: { label: 'Belum Diterbitkan', badgeVariant: 'secondary' },
  tidak_dapat_dibayar: { label: 'Tidak Dapat Dibayar', badgeVariant: 'outline' },
}

const bisaDibayar = computed(
  () => tagihan.value?.status_pembayaran === 'belum_bayar' && sisaTagihan.value > 0,
)

const tampilkanFormBayar = computed(() => bisaDibayar.value)

watch(
  tagihan,
  (t) => {
    if (t?.status_pembayaran === 'belum_bayar' && t && !jumlahDibayar.value) {
      jumlahDibayar.value = Number(t.sisa_tagihan ?? t.total_tagihan)
    }
  },
  { immediate: true },
)

const nominalBayar = computed(() => {
  const n = jumlahDibayar.value
  if (n !== null && n > 0) return n
  return pakaiDeposit.value ? nominalHarusDibayar.value : sisaTagihan.value
})

const saldoDigunakanPreview = computed(() =>
  pakaiDeposit.value && sisaTagihan.value > 0
    ? Math.min(saldoKredit.value, sisaTagihan.value)
    : 0,
)

const nominalHarusDibayar = computed(() =>
  Math.max(0, sisaTagihan.value - saldoDigunakanPreview.value),
)

const sisaSaldoKreditPreview = computed(() =>
  Math.max(0, saldoKredit.value - saldoDigunakanPreview.value),
)

const depositCukupSemua = computed(() => pakaiDeposit.value && nominalHarusDibayar.value <= 0)

const catatanBayar = computed(() => {
  const target = pakaiDeposit.value ? nominalHarusDibayar.value : sisaTagihan.value
  const jumlah = nominalBayar.value

  if (jumlah < target) {
    return pakaiDeposit.value
      ? 'Pembayaran ini belum menutup seluruh tagihan setelah saldo kredit dipakai.'
      : 'Pembayaran ini belum melunasi tagihan.'
  }

  if (jumlah > target) {
    return 'Pembayaran lebih dari kebutuhan akan menjadi saldo kredit.'
  }

  return pakaiDeposit.value
    ? 'Tagihan akan lunas setelah pembayaran dan saldo kredit dipakai.'
    : 'Tagihan akan lunas setelah pembayaran berhasil.'
})

watch(pakaiDeposit, (aktif) => {
  const target = aktif ? nominalHarusDibayar.value : sisaTagihan.value
  jumlahDibayar.value = target > 0 ? target : null
})

const statusTeks = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  if (sisaTagihan.value <= 0) return 'Lunas'
  if (t.status_pembayaran === 'belum_bayar') return sudahTerbayar.value ? 'Sedang dicicil' : 'Belum dibayar'
  if (t.status_pembayaran === 'belum_diterbitkan') return 'Belum diterbitkan'
  return 'Tidak dapat dibayar'
})

const statusTeksClass = computed(() => {
  if (sisaTagihan.value <= 0) return 'text-emerald-700'
  if (sudahTerbayar.value) return 'text-primary'
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
  if (depositCukupSemua.value) {
    toast.error('Saldo kredit Anda sudah cukup. Tidak ada pembayaran tunai yang diperlukan.')
    return
  }

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
          <StatusBadge :value="statusPembayaranSaya" :map="mapStatusTagihanSaya" />
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
        <template v-if="tampilkanFormBayar">
          <div>
            <p class="text-sm font-medium">Sisa tagihan</p>
            <p class="text-2xl font-semibold tabular-nums">{{ formatRupiah(sisaTagihan) }}</p>
          </div>
          <div class="grid gap-1.5">
            <Label for="jumlah-bayar">Mau bayar berapa?</Label>
            <RupiahInput id="jumlah-bayar" v-model="jumlahDibayar" />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ catatanBayar }}
          </p>

          <div v-if="pakaiDeposit" class="space-y-1.5 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Sisa tagihan</span>
              <span class="tabular-nums">{{ formatRupiah(sisaTagihan) }}</span>
            </div>
            <div class="flex items-center justify-between text-emerald-700">
              <span>Saldo kredit digunakan</span>
              <span class="tabular-nums">-{{ formatRupiah(saldoDigunakanPreview) }}</span>
            </div>
            <div class="flex items-center justify-between border-t pt-1.5 font-medium">
              <span>Yang harus dibayar</span>
              <span class="tabular-nums">{{ formatRupiah(nominalHarusDibayar) }}</span>
            </div>
            <div v-if="sisaSaldoKreditPreview > 0" class="flex items-center justify-between text-xs text-muted-foreground">
              <span>Sisa saldo kredit</span>
              <span class="tabular-nums">{{ formatRupiah(sisaSaldoKreditPreview) }}</span>
            </div>
          </div>

          <label v-if="saldoKredit > 0" class="flex items-center gap-2 text-sm">
            <Checkbox v-model="pakaiDeposit" aria-label="Gunakan saldo kredit" />
            <span>Gunakan saldo kredit ({{ formatRupiah(saldoKredit) }})</span>
          </label>

          <p v-if="depositCukupSemua" class="text-xs font-medium text-amber-700">
            Saldo kredit Anda sudah cukup menutup tagihan ini. Tidak perlu pembayaran tambahan.
          </p>

          <Button class="w-full" :disabled="bayarSatu.isPending.value || depositCukupSemua" @click="bayar">
            Bayar Sekarang
          </Button>
        </template>

        <div
          v-else-if="sisaTagihan <= 0"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
        >
          <p class="font-medium">Lunas</p>
          <p class="mt-0.5 text-sm text-emerald-800/80">Tagihan sudah dibayar.</p>
          <p v-if="tagihan.dibayar_pada" class="mt-0.5 text-sm text-emerald-800/80">
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
  </div>
</template>