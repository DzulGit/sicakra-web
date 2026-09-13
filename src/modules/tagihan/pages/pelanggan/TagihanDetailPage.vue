<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import { useTagihanSayaDetail, useBayarTagihan } from '../../composables/useKeuanganTagihan'
import { statusPembayaranEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatPembayaranTable from '@/components/data/RiwayatPembayaranTable.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import { ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: tagihan, isLoading, refetch } = useTagihanSayaDetail(id)
const { bayarSatu } = useBayarTagihan()

const jumlahDibayar = ref<string>('')
const pakaiDeposit = ref(false)

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

const periodeTampilan = computed(() => {
  const t = tagihan.value
  if (!t) return ''
  return `${t.periode_bulan}/${t.periode_tahun}`
})

function formatRupiah(nilai: string | number | null | undefined) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai ?? 0),
  )
}

function formatTanggal(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function pesanError(e: unknown) {
  const data = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined) : undefined
  return data?.message
}

async function bayar() {
  const jumlah = Number(jumlahDibayar.value)
  try {
    const hasilBayar = await bayarSatu.mutateAsync({
      id: id.value,
      jumlahDibayar: jumlah > 0 ? jumlah : undefined,
      gunakanDeposit: pakaiDeposit.value,
    })
    const url = hasilBayar.payment_url
    refetch?.()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success('Selesaikan pembayaran di jendela Xendit')
    }
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran')
  }
}
</script>

<template>
  <div v-if="isLoading">
    <Skeleton class="h-64 w-full max-w-lg" />
  </div>

  <div v-else-if="tagihan" class="max-w-xl space-y-6">
    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <CardTitle>{{ tagihan.nomor_tagihan }}</CardTitle>
        <StatusBadge :value="tagihan.status_pembayaran" :map="statusPembayaranEnum" />
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div>
          <p class="text-muted-foreground">Paket</p>
          <p>{{ tagihan.nama_paket_snapshot }} — {{ tagihan.kecepatan_snapshot_mbps }} Mbps</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Ringkasan & Pembayaran</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Periode</span>
          <span>{{ periodeTampilan }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Total Tagihan</span>
          <span>{{ formatRupiah(tagihan.total_tagihan) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Sudah Dibayar</span>
          <span>{{ formatRupiah(tagihan.sudah_dibayar) }}</span>
        </div>
        <div v-if="Number(tagihan.saldo_kredit_digunakan) > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Dibayar dari Deposit</span>
          <span>{{ formatRupiah(tagihan.saldo_kredit_digunakan) }}</span>
        </div>
        <div class="flex items-center justify-between border-t pt-3">
          <span class="font-medium">Sisa Tagihan</span>
          <span class="text-lg font-semibold tabular-nums">{{ formatRupiah(sisaTagihan) }}</span>
        </div>

        <div v-if="tagihan.status_pembayaran === 'belum_bayar'" class="space-y-3 pt-2">
          <div class="grid gap-2">
            <Label for="jumlah-bayar">Jumlah dibayar (kosongkan = lunasi sisa)</Label>
            <Input id="jumlah-bayar" v-model="jumlahDibayar" type="number" min="1" :placeholder="String(sisaTagihan)" />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <Checkbox v-model="pakaiDeposit" />
            <span>Pakai saldo deposit untuk transaksi ini</span>
          </label>
          <Button class="w-full" :disabled="bayarSatu.isPending" @click="bayar">
            <ExternalLink class="mr-2 size-4" />
            Bayar via Xendit
          </Button>
        </div>

        <div
          v-else-if="tagihan.status_pembayaran === 'sudah_bayar'"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
        >
          <p class="font-medium">Lunas</p>
          <p class="mt-0.5 text-sm text-emerald-800/80">
            Dibayar {{ formatTanggal(tagihan.dibayar_pada) }}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card v-if="tagihan.riwayat_pembayaran?.length">
      <CardHeader>
        <CardTitle class="text-base">Riwayat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <RiwayatPembayaranTable :pembayaran="tagihan.riwayat_pembayaran" />
      </CardContent>
    </Card>
  </div>
</template>