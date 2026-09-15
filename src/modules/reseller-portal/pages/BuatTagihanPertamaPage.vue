<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowLeft, Loader2, ReceiptText, X } from 'lucide-vue-next'
import {
  useResellerGenerateTagihanPertama,
  useResellerPreviewTagihanPertama,
} from '../composables/useResellerTagihan'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RupiahInput from '@/components/data/RupiahInput.vue'

type ModeTagihan = 'prorata' | 'full'

type PreviewTagihanPertama = {
  mode: ModeTagihan
  tanggal_aktif: string
  periode_bulan: number
  periode_tahun: number
  nama_paket: string
  kecepatan_mbps: number
  harga_bulanan: number
  jumlah_hari: number
  jumlah_hari_dalam_bulan: number
  nominal_prorata: number
  nominal_full: number
  nominal_terhitung: number
}

type PreviewTagihanPertamaItem = {
  layanan_internet_id: number
  prorata: PreviewTagihanPertama
  full: PreviewTagihanPertama
}

const route = useRoute()
const router = useRouter()
const pelangganId = computed(() => route.params.id as string)

const { mutateAsync: previewTagihan, isPending: isLoadingPreview } = useResellerPreviewTagihanPertama()
const { mutateAsync: generateTagihan, isPending: isGenerating } = useResellerGenerateTagihanPertama()

const preview = ref<PreviewTagihanPertamaItem[]>([])
const layananId = ref<number | null>(null)
const mode = ref<ModeTagihan>('prorata')
const nominalManual = ref<number | null>(null)
const errorMessage = ref('')

const layananTerpilih = computed(() => {
  if (!layananId.value) return null
  return preview.value.find((item) => item.layanan_internet_id === layananId.value) ?? null
})

const detailTerpilih = computed(() => {
  if (!layananTerpilih.value) return null
  return mode.value === 'prorata' ? layananTerpilih.value.prorata : layananTerpilih.value.full
})

const nominalRekomendasi = computed(() => detailTerpilih.value?.nominal_terhitung ?? 0)

const nominalTerpilih = computed(() => {
  if (nominalManual.value === null) return nominalRekomendasi.value
  return nominalManual.value
})

const nominalDiubah = computed(() =>
  nominalManual.value !== null && nominalManual.value !== nominalRekomendasi.value,
)

function formatRupiah(nilai: number | string | null | undefined) {
  if (nilai == null || nilai === '') return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}

function formatTanggal(tanggal: string) {
  if (!tanggal) return '-'
  const date = new Date(tanggal)
  if (Number.isNaN(date.getTime())) return tanggal
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

function handleNominalInput(value: string | number | null) {
  if (value === '' || value === null || value === undefined) { nominalManual.value = null; return }
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) { nominalManual.value = null; return }
  nominalManual.value = numericValue
}

function gunakanNominalRekomendasi() { nominalManual.value = null }

async function loadPreview() {
  preview.value = []
  layananId.value = null
  mode.value = 'prorata'
  nominalManual.value = null
  errorMessage.value = ''

  try {
    const data = await previewTagihan(pelangganId.value)
    preview.value = data
    if (data.length > 0) layananId.value = data[0].layanan_internet_id
  } catch {
    errorMessage.value = 'Gagal mengambil preview tagihan pertama.'
  }
}

watch([layananId, mode], () => { nominalManual.value = null })

async function submit() {
  if (!layananId.value) { toast.error('Layanan pelanggan belum tersedia.'); return }
  if (nominalTerpilih.value < 0) { toast.error('Nominal tagihan tidak boleh kurang dari 0.'); return }

  try {
    await generateTagihan({
      pelangganId: pelangganId.value,
      payload: {
        layanan_internet_id: layananId.value,
        mode: mode.value,
        nominal_manual: nominalTerpilih.value,
      },
    })
    toast.success('Tagihan pertama berhasil dibuat.')
    router.push(`/reseller/pelanggan/${pelangganId.value}`)
  } catch {
    toast.error('Gagal membuat tagihan pertama.')
  }
}

loadPreview()
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

    <div v-if="isLoadingPreview" class="py-12 text-center text-sm text-muted-foreground">
      Mengambil data tagihan...
    </div>

    <div v-else-if="errorMessage" class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {{ errorMessage }}
    </div>

    <div v-else-if="preview.length === 0" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Tidak ada layanan aktif yang bisa dibuatkan tagihan pertama.
    </div>

    <template v-else>
      <!-- Pilih layanan jika lebih dari satu -->
      <div v-if="preview.length > 1" class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <p class="font-medium">{{ preview[0].prorata.nama_paket }} · {{ preview[0].prorata.kecepatan_mbps }} Mbps</p>
        <p class="mt-1 text-xs text-muted-foreground">Hanya ada satu layanan aktif.</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Layanan</CardTitle>
          </CardHeader>
          <CardContent v-if="detailTerpilih" class="space-y-4">
            <div class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <p class="text-xs text-muted-foreground">Paket</p>
                <p class="font-medium">{{ detailTerpilih.nama_paket }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Kecepatan</p>
                <p class="font-medium">{{ detailTerpilih.kecepatan_mbps }} Mbps</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Tanggal Aktif</p>
                <p class="font-medium">{{ formatTanggal(detailTerpilih.tanggal_aktif) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Harga Bulanan</p>
                <p class="font-medium">{{ formatRupiah(detailTerpilih.harga_bulanan) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <p class="pt-1 text-sm font-semibold">{{ formatRupiah(layananTerpilih?.prorata.nominal_terhitung) }}</p>
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
                  <p class="pt-1 text-sm font-semibold">{{ formatRupiah(layananTerpilih?.full.nominal_terhitung) }}</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card v-if="detailTerpilih">
        <CardHeader>
          <CardTitle>Perhitungan</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between gap-4 text-sm">
            <span class="text-muted-foreground">Paket</span>
            <span class="font-medium">{{ detailTerpilih.nama_paket }}</span>
          </div>
          <div class="flex justify-between gap-4 text-sm">
            <span class="text-muted-foreground">Tanggal Aktif</span>
            <span class="font-medium">{{ formatTanggal(detailTerpilih.tanggal_aktif) }}</span>
          </div>
          <div class="flex justify-between gap-4 text-sm">
            <span class="text-muted-foreground">Harga Bulanan</span>
            <span class="font-medium">{{ formatRupiah(detailTerpilih.harga_bulanan) }}</span>
          </div>
          <div v-if="mode === 'prorata'" class="flex justify-between gap-4 text-sm">
            <span class="text-muted-foreground">Hari Ditagihkan</span>
            <span class="font-medium">{{ Math.round(detailTerpilih.jumlah_hari) }} / {{ Math.round(detailTerpilih.jumlah_hari_dalam_bulan) }} hari</span>
          </div>
          <Separator />
          <div v-if="mode === 'prorata'" class="rounded-md bg-muted/30 p-3 text-center text-sm">
            <p class="text-xs text-muted-foreground mb-1">Perhitungan</p>
            <p class="font-medium">
              {{ Math.round(detailTerpilih.jumlah_hari) }} ÷ {{ Math.round(detailTerpilih.jumlah_hari_dalam_bulan) }} × {{ Math.round(detailTerpilih.harga_bulanan) }}
            </p>
            <p class="mt-1 font-semibold">= {{ formatRupiah(nominalRekomendasi) }}</p>
          </div>
          <div v-else class="rounded-md bg-muted/30 p-3 text-center text-sm">
            <p class="text-xs text-muted-foreground mb-1">Perhitungan</p>
            <p class="font-medium">1 bulan × {{ formatRupiah(detailTerpilih.harga_bulanan) }}</p>
            <p class="mt-1 font-semibold">= {{ formatRupiah(nominalRekomendasi) }}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nominal Tagihan</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex max-w-sm items-start gap-2">
            <RupiahInput
              id="nominal-tagihan"
              :model-value="nominalManual"
              @update:model-value="handleNominalInput"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Kembalikan nominal awal"
              @click="gunakanNominalRekomendasi"
            >
              <X class="size-4" />
            </Button>
          </div>

          <div v-if="nominalDiubah" class="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p class="font-medium">Nominal disesuaikan</p>
            <p class="mt-1 text-muted-foreground">
              Sistem merekomendasikan {{ formatRupiah(nominalRekomendasi) }}, tetapi nominal yang akan dibuat adalah {{ formatRupiah(nominalTerpilih) }}.
            </p>
          </div>
          <p v-else class="text-xs text-muted-foreground">
            Nominal mengikuti hasil perhitungan sistem. Kamu masih bisa mengubahnya jika diperlukan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Tagihan</p>
            <p class="text-xs text-muted-foreground">{{ mode === 'prorata' ? 'Prorata' : 'Full' }}</p>
          </div>
          <p class="text-lg font-semibold">{{ formatRupiah(nominalTerpilih) }}</p>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-3">
        <Button variant="outline" :disabled="isGenerating" @click="router.back()">Batal</Button>
        <Button
          :disabled="isLoadingPreview || isGenerating || !layananTerpilih || nominalTerpilih < 0"
          @click="submit"
        >
          <Loader2 v-if="isGenerating" class="mr-2 size-4 animate-spin" />
          {{ isGenerating ? 'Membuat...' : 'Buat Tagihan Pertama' }}
        </Button>
      </div>
    </template>
  </div>
</template>
