<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { ArrowLeft, Loader2, ReceiptText, X } from 'lucide-vue-next'

import {
  useGenerateTagihanPertama,
  usePreviewTagihanPertama,
} from '@/modules/tagihan/composables/useKeuanganTagihan'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RupiahInput from '@/components/data/RupiahInput.vue'
import type { ApiErrorResponse } from '@/types/api'

type PreviewItem = {
  layanan_internet_id: number
  prorata: {
    tanggal_aktif: string
    nama_paket: string
    kecepatan_mbps: number
    harga_bulanan: number
    jumlah_hari: number
    jumlah_hari_dalam_bulan: number
    nominal_prorata: number
    nominal_full: number
    nominal_terhitung: number
  }
  full: {
    tanggal_aktif: string
    nama_paket: string
    kecepatan_mbps: number
    harga_bulanan: number
    jumlah_hari: number
    jumlah_hari_dalam_bulan: number
    nominal_prorata: number
    nominal_full: number
    nominal_terhitung: number
  }
}

const route = useRoute()
const router = useRouter()
const pelangganId = computed(() => route.params.pelangganId as string)
const namaPelanggan = computed(() => (route.query.nama as string) ?? '')

const { mutate: preview, isPending: isPreviewing } = usePreviewTagihanPertama()
const { mutate: generate, isPending: isGenerating } = useGenerateTagihanPertama()

const previewData = ref<PreviewItem[]>([])
const layananTerpilih = ref('')
const mode = ref<'prorata' | 'full'>('prorata')
const nominalManual = ref<number | null>(null)
const error = ref('')

const isPending = computed(() => isPreviewing.value || isGenerating.value)

const layanan = computed(() =>
  previewData.value.find((item) => String(item.layanan_internet_id) === layananTerpilih.value),
)

const perhitungan = computed(() => {
  if (!layanan.value) return null
  return mode.value === 'prorata' ? layanan.value.prorata : layanan.value.full
})

const nominalTerhitung = computed(() => perhitungan.value?.nominal_terhitung ?? 0)

const nominalAkhir = computed(() => {
  if (nominalManual.value === null) return nominalTerhitung.value
  const nilai = nominalManual.value
  return Number.isFinite(nilai) && nilai >= 0 ? nilai : nominalTerhitung.value
})

const formatRupiah = (nilai: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai)

function ambilPreview() {
  if (pelangganId.value === null) return
  error.value = ''

  preview(pelangganId.value, {
    onSuccess: (data) => {
      previewData.value = data
      const pertama = data[0]
      layananTerpilih.value = pertama ? String(pertama.layanan_internet_id) : ''
      nominalManual.value = pertama ? pertama.prorata.nominal_terhitung : null
    },
    onError: (e: Error) => {
      const pesan = e instanceof AxiosError
        ? (e.response?.data as ApiErrorResponse | undefined)?.message
        : undefined
      error.value = pesan ?? 'Gagal mengambil perhitungan tagihan pertama.'
    },
  })
}

watch(
  [layananTerpilih, mode],
  () => {
    if (!perhitungan.value) { nominalManual.value = null; return }
    nominalManual.value = perhitungan.value.nominal_terhitung
  },
)

function konfirmasi() {
  if (pelangganId.value === null) { error.value = 'Pelanggan tidak ditemukan.'; return }
  if (!layanan.value || !perhitungan.value) { error.value = 'Layanan aktif belum dipilih.'; return }
  if (nominalManual.value !== null && (nominalManual.value < 0 || !Number.isFinite(nominalManual.value))) {
    error.value = 'Nominal tagihan tidak valid.'; return
  }
  error.value = ''

  generate(
    {
      pelangganId: pelangganId.value,
      payload: {
        layanan_internet_id: layanan.value.layanan_internet_id,
        mode: mode.value,
        nominal_manual: nominalManual.value ?? undefined,
      },
    },
    {
      onSuccess: (tagihan) => {
        toast.success(`Tagihan ${tagihan.nomor_tagihan} berhasil dibuat.`)
        router.push(`/admin/keuangan/tagihan/${tagihan.id}`)
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError
          ? (e.response?.data as ApiErrorResponse | undefined)?.message
          : undefined
        toast.error(pesan ?? 'Gagal membuat tagihan pertama.')
      },
    },
  )
}

ambilPreview()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="mr-2 size-4" /> Kembali
      </Button>
    </div>

    <div class="flex items-center gap-3">
      <ReceiptText class="size-6 text-primary" />
      <h1 class="text-2xl font-semibold tracking-tight">Buat Tagihan Pertama</h1>
    </div>

    <div v-if="isPreviewing" class="py-12 text-center text-sm text-muted-foreground">
      Menghitung tagihan pertama...
    </div>

    <template v-else>
      <div v-if="error" class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {{ error }}
      </div>

      <div v-if="previewData.length === 0 && !error" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Tidak ada layanan aktif yang bisa dibuatkan tagihan pertama.
      </div>

      <template v-else>
        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm font-medium">{{ namaPelanggan || '-' }}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pilih Layanan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="previewData.length > 1" class="space-y-2">
                <label for="layanan-pertama" class="text-sm font-medium">Layanan</label>
                <select
                  id="layanan-pertama"
                  v-model="layananTerpilih"
                  :disabled="isPending"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option v-for="item in previewData" :key="item.layanan_internet_id" :value="String(item.layanan_internet_id)">
                    {{ item.prorata.nama_paket }} · {{ item.prorata.kecepatan_mbps }} Mbps
                  </option>
                </select>
              </div>

              <div v-if="previewData.length === 1" class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                <p class="font-medium">{{ previewData[0].prorata.nama_paket }}</p>
                <p class="text-muted-foreground">{{ previewData[0].prorata.kecepatan_mbps }} Mbps</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jenis Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid gap-3 sm:grid-cols-2">
                <label
                  class="cursor-pointer rounded-lg border p-4 transition"
                  :class="mode === 'prorata' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'"
                >
                  <input v-model="mode" type="radio" value="prorata" class="sr-only" />
                  <div class="space-y-1">
                    <p class="font-medium">Prorata</p>
                    <p class="text-xs text-muted-foreground">Berdasarkan sisa hari pada bulan berjalan.</p>
                    <p class="pt-1 text-sm font-semibold">{{ formatRupiah(layanan?.prorata.nominal_terhitung ?? 0) }}</p>
                  </div>
                </label>

                <label
                  class="cursor-pointer rounded-lg border p-4 transition"
                  :class="mode === 'full' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'"
                >
                  <input v-model="mode" type="radio" value="full" class="sr-only" />
                  <div class="space-y-1">
                    <p class="font-medium">Full</p>
                    <p class="text-xs text-muted-foreground">Menggunakan harga bulanan penuh.</p>
                    <p class="pt-1 text-sm font-semibold">{{ formatRupiah(layanan?.full.nominal_terhitung ?? 0) }}</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card v-if="perhitungan">
            <CardHeader>
              <CardTitle>Perhitungan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">Paket</span>
                <span class="font-medium">{{ perhitungan.nama_paket }}</span>
              </div>
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">Tanggal Aktif</span>
                <span class="font-medium">{{ perhitungan.tanggal_aktif }}</span>
              </div>
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">Harga Bulanan</span>
                <span class="font-medium">{{ formatRupiah(perhitungan.harga_bulanan) }}</span>
              </div>
              <div v-if="mode === 'prorata'" class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">Hari Ditagihkan</span>
                <span class="font-medium">{{ Math.round(perhitungan.jumlah_hari) }} / {{ perhitungan.jumlah_hari_dalam_bulan }} hari</span>
              </div>
              <Separator />
              <div v-if="mode === 'prorata'" class="rounded-md bg-muted/30 p-3 text-center text-sm">
                <p class="text-xs text-muted-foreground mb-1">Perhitungan</p>
                <p class="font-medium">
                  {{ Math.round(perhitungan.jumlah_hari) }} ÷ {{ Math.round(perhitungan.jumlah_hari_dalam_bulan) }} × {{ Math.round(perhitungan.harga_bulanan) }}
                </p>
                <p class="mt-1 font-semibold">= {{ formatRupiah(nominalTerhitung) }}</p>
              </div>
              <div v-else class="rounded-md bg-muted/30 p-3 text-center text-sm">
                <p class="text-xs text-muted-foreground mb-1">Perhitungan</p>
                <p class="font-medium">1 bulan × {{ formatRupiah(perhitungan.harga_bulanan) }}</p>
                <p class="mt-1 font-semibold">= {{ formatRupiah(nominalTerhitung) }}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nominal Tagihan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex max-w-sm items-start gap-2">
              <RupiahInput
                id="nominal-manual"
                v-model="nominalManual"
                :disabled="isPending || !perhitungan"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Kembalikan nominal awal"
                :disabled="isPending || !perhitungan"
                @click="nominalManual = null"
              >
                <X class="size-4" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              Nominal hasil perhitungan dapat diubah oleh Keuangan sebelum tagihan dibuat.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Tagihan</p>
              <p class="text-xs text-muted-foreground">{{ mode === 'prorata' ? 'Prorata' : 'Full' }}</p>
            </div>
            <p class="text-lg font-semibold">{{ formatRupiah(nominalAkhir) }}</p>
          </CardContent>
        </Card>

        <div class="flex justify-end gap-3">
          <Button variant="outline" :disabled="isPending" @click="router.back()">Batal</Button>
          <Button :disabled="isPending || !perhitungan" @click="konfirmasi">
            <Loader2 v-if="isGenerating" class="mr-2 size-4 animate-spin" />
            {{ isGenerating ? 'Membuat...' : 'Buat Tagihan Pertama' }}
          </Button>
        </div>
      </template>
    </template>
  </div>
</template>
