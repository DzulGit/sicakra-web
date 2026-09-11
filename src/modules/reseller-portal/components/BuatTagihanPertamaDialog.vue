<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  useResellerGenerateTagihanPertama,
  useResellerPreviewTagihanPertama,
} from '../composables/useResellerTagihan'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

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

const props = defineProps<{
  open: boolean
  pelangganId: number | string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const {
  mutateAsync: previewTagihan,
  isPending: isLoadingPreview,
} = useResellerPreviewTagihanPertama()

const {
  mutateAsync: generateTagihan,
  isPending: isGenerating,
} = useResellerGenerateTagihanPertama()

const preview = ref<PreviewTagihanPertamaItem[]>([])
const layananId = ref<number | null>(null)
const mode = ref<ModeTagihan>('prorata')
const jumlahHariJatuhTempo = ref(7)

const nominalManual = ref<number | null>(null)
const errorMessage = ref('')

const layananTerpilih = computed(() => {
  if (!layananId.value) return null

  return (
    preview.value.find(
      (item) => item.layanan_internet_id === layananId.value,
    ) ?? null
  )
})

const detailTerpilih = computed(() => {
  if (!layananTerpilih.value) return null

  return mode.value === 'prorata'
    ? layananTerpilih.value.prorata
    : layananTerpilih.value.full
})

/**
 * Nominal yang dihitung otomatis oleh sistem.
 */
const nominalRekomendasi = computed(() => {
  if (!detailTerpilih.value) return 0

  return detailTerpilih.value.nominal_terhitung
})

/**
 * Nominal yang benar-benar akan dikirim ke backend.
 *
 * Jika user belum mengubah apa pun, gunakan nominal rekomendasi.
 */
const nominalTerpilih = computed(() => {
  if (nominalManual.value === null) {
    return nominalRekomendasi.value
  }

  return nominalManual.value
})

/**
 * Menentukan apakah nominal sudah diubah oleh user.
 */
const nominalDiubah = computed(() => {
  return (
    nominalManual.value !== null &&
    nominalManual.value !== nominalRekomendasi.value
  )
})

function formatRupiah(nilai: number | string | null | undefined) {
  if (nilai == null || nilai === '') return '-'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(nilai))
}

function formatTanggal(tanggal: string) {
  if (!tanggal) return '-'

  const date = new Date(tanggal)

  if (Number.isNaN(date.getTime())) return tanggal

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Reset nominal manual ke hasil perhitungan sistem.
 */
function gunakanNominalRekomendasi() {
  nominalManual.value = null
}

/**
 * Ketika user mulai mengetik nominal,
 * nilai tersebut menjadi nominal manual.
 */
function handleNominalInput(value: string | number) {
  if (value === '' || value === null || value === undefined) {
    nominalManual.value = null
    return
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    nominalManual.value = null
    return
  }

  nominalManual.value = numericValue
}

function tutup() {
  if (isGenerating.value) return

  emit('update:open', false)
}

async function loadPreview() {
  preview.value = []
  layananId.value = null
  mode.value = 'prorata'
  jumlahHariJatuhTempo.value = 7
  nominalManual.value = null
  errorMessage.value = ''

  try {
    const data = await previewTagihan(props.pelangganId)

    preview.value = data

    if (data.length > 0) {
      layananId.value = data[0].layanan_internet_id
    }
  } catch {
    errorMessage.value = 'Gagal mengambil preview tagihan pertama.'
  }
}

/**
 * Ketika layanan atau mode berubah,
 * nominal manual dikembalikan ke hasil rekomendasi sistem.
 */
watch(
  [layananId, mode],
  () => {
    nominalManual.value = null
  },
)

async function submit() {
  if (!layananId.value) {
    toast.error('Layanan pelanggan belum tersedia.')
    return
  }

  if (
    jumlahHariJatuhTempo.value < 1 ||
    jumlahHariJatuhTempo.value > 31
  ) {
    toast.error('Jatuh tempo harus antara 1 sampai 31 hari.')
    return
  }

  if (nominalTerpilih.value < 0) {
    toast.error('Nominal tagihan tidak boleh kurang dari 0.')
    return
  }

  try {
    await generateTagihan({
      pelangganId: props.pelangganId,
      payload: {
        layanan_internet_id: layananId.value,
        mode: mode.value,
        nominal_manual: nominalTerpilih.value,
        jumlah_hari_jatuh_tempo: jumlahHariJatuhTempo.value,
      },
    })

    toast.success('Tagihan pertama berhasil dibuat.')

    emit('success')
    emit('update:open', false)
  } catch {
    toast.error('Gagal membuat tagihan pertama.')
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      loadPreview()
    }
  },
)
</script>

<template>
  <Dialog :open="props.open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Buat Tagihan Pertama</DialogTitle>

        <DialogDescription>
          Sistem akan menghitung nominal awal berdasarkan paket dan tanggal
          aktif. Nominal tersebut masih bisa disesuaikan sebelum tagihan
          dibuat.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5">
        <!-- Loading preview -->
        <div v-if="isLoadingPreview" class="rounded-lg border p-4 text-sm text-muted-foreground">
          Mengambil data tagihan...
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage"
          class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {{ errorMessage }}
        </div>

        <!-- Tidak ada layanan -->
        <div v-else-if="preview.length === 0"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Tidak ada layanan aktif yang bisa dibuatkan tagihan pertama.
        </div>

        <template v-else>
          <!-- Pilih layanan jika lebih dari satu -->
          <div v-if="preview.length > 1" class="space-y-2">
            <Label for="layanan-internet">
              Layanan
            </Label>

            <select id="layanan-internet" v-model="layananId"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option v-for="item in preview" :key="item.layanan_internet_id" :value="item.layanan_internet_id">
                {{ item.prorata.nama_paket }}
                — {{ item.prorata.kecepatan_mbps }} Mbps
              </option>
            </select>
          </div>

          <!-- Informasi layanan -->
          <div v-if="detailTerpilih" class="rounded-lg border bg-muted/30 p-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-xs text-muted-foreground">
                  Paket
                </p>

                <p class="font-medium">
                  {{ detailTerpilih.nama_paket }}
                </p>
              </div>

              <div>
                <p class="text-xs text-muted-foreground">
                  Kecepatan
                </p>

                <p class="font-medium">
                  {{ detailTerpilih.kecepatan_mbps }} Mbps
                </p>
              </div>

              <div>
                <p class="text-xs text-muted-foreground">
                  Tanggal Aktif
                </p>

                <p class="font-medium">
                  {{ formatTanggal(detailTerpilih.tanggal_aktif) }}
                </p>
              </div>

              <div>
                <p class="text-xs text-muted-foreground">
                  Harga Bulanan
                </p>

                <p class="font-medium">
                  {{ formatRupiah(detailTerpilih.harga_bulanan) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Mode tagihan -->
          <div class="space-y-2">
            <Label>
              Jenis Tagihan
            </Label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="cursor-pointer rounded-lg border p-4 transition" :class="mode === 'prorata'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                ">
                <input v-model="mode" type="radio" value="prorata" class="sr-only" />

                <div class="space-y-1">
                  <p class="font-medium">
                    Prorata
                  </p>

                  <p class="text-xs text-muted-foreground">
                    Berdasarkan sisa hari pada bulan berjalan.
                  </p>

                  <p class="pt-1 text-sm font-semibold">
                    {{
                      formatRupiah(
                        layananTerpilih?.prorata.nominal_terhitung,
                      )
                    }}
                  </p>
                </div>
              </label>

              <label class="cursor-pointer rounded-lg border p-4 transition" :class="mode === 'full'
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
                ">
                <input v-model="mode" type="radio" value="full" class="sr-only" />

                <div class="space-y-1">
                  <p class="font-medium">
                    Full
                  </p>

                  <p class="text-xs text-muted-foreground">
                    Menggunakan harga bulanan penuh.
                  </p>

                  <p class="pt-1 text-sm font-semibold">
                    {{
                      formatRupiah(
                        layananTerpilih?.full.nominal_terhitung,
                      )
                    }}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Penjelasan perhitungan -->
          <div v-if="detailTerpilih" class="rounded-lg border bg-muted/20 p-4">
            <div class="mb-3">
              <p class="text-sm font-medium">
                Perhitungan nominal
              </p>

              <p class="text-xs text-muted-foreground">
                Nominal berikut adalah rekomendasi otomatis dari sistem.
              </p>
            </div>

            <!-- Perhitungan prorata -->
            <div v-if="mode === 'prorata'" class="space-y-2">
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">
                  Jumlah hari tersisa
                </span>

                <span class="font-medium">
                  {{ Math.round(detailTerpilih.jumlah_hari) }} hari
                </span>
              </div>

              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">
                  Jumlah hari dalam bulan
                </span>

                <span class="font-medium">
                  {{ Math.round(detailTerpilih.jumlah_hari_dalam_bulan) }} hari
                </span>
              </div>

              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">
                  Harga paket bulanan
                </span>

                <span class="font-medium">
                  {{ formatRupiah(detailTerpilih.harga_bulanan) }}
                </span>
              </div>

              <div class="my-2 border-t" />

              <div class="rounded-md bg-background p-3 text-center">
                <p class="text-sm text-muted-foreground">
                  Perhitungan
                </p>

                <p class="mt-1 font-medium">
                  {{ Math.round(detailTerpilih.jumlah_hari) }}
                  ÷
                  {{ Math.round(detailTerpilih.jumlah_hari_dalam_bulan) }}
                  ×
                  {{ Math.round(detailTerpilih.harga_bulanan) }}
                </p>

                <p class="mt-1 text-lg font-semibold">
                  =
                  {{ formatRupiah(nominalRekomendasi) }}
                </p>
              </div>
            </div>

            <!-- Perhitungan full -->
            <div v-else class="space-y-2">
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-muted-foreground">
                  Harga paket bulanan
                </span>

                <span class="font-medium">
                  {{ formatRupiah(detailTerpilih.harga_bulanan) }}
                </span>
              </div>

              <div class="my-2 border-t" />

              <div class="rounded-md bg-background p-3 text-center">
                <p class="text-sm text-muted-foreground">
                  Perhitungan
                </p>

                <p class="mt-1 font-medium">
                  1 bulan ×
                  {{ formatRupiah(detailTerpilih.harga_bulanan) }}
                </p>

                <p class="mt-1 text-lg font-semibold">
                  =
                  {{ formatRupiah(nominalRekomendasi) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Nominal tagihan -->
          <div class="space-y-2">
            <Label for="nominal-tagihan">
              Nominal Tagihan
            </Label>

            <div class="flex gap-2">
              <Input id="nominal-tagihan" :model-value="nominalTerpilih" type="number" min="0" step="1000"
                @update:model-value="handleNominalInput" />

              <Button v-if="nominalDiubah" type="button" variant="outline" @click="gunakanNominalRekomendasi">
                Gunakan Rekomendasi
              </Button>
            </div>

            <div v-if="nominalDiubah" class="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <p class="font-medium">
                Nominal disesuaikan
              </p>

              <p class="mt-1 text-muted-foreground">
                Sistem merekomendasikan
                {{ formatRupiah(nominalRekomendasi) }},
                tetapi nominal yang akan dibuat adalah
                {{ formatRupiah(nominalTerpilih) }}.
              </p>
            </div>

            <p v-else class="text-xs text-muted-foreground">
              Nominal mengikuti hasil perhitungan sistem. Kamu masih bisa
              mengubahnya jika diperlukan.
            </p>
          </div>

          <!-- Jatuh tempo -->
          <div class="space-y-2">
            <Label for="jumlah-hari-jatuh-tempo">
              Jatuh Tempo
            </Label>

            <div class="flex items-center gap-2">
              <Input id="jumlah-hari-jatuh-tempo" v-model.number="jumlahHariJatuhTempo" type="number" min="1" max="31"
                class="w-28" />

              <span class="text-sm text-muted-foreground">
                hari dari hari ini
              </span>
            </div>

            <p class="text-xs text-muted-foreground">
              Default 7 hari.
            </p>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p class="text-sm text-muted-foreground">
                Total Tagihan
              </p>

              <p class="text-xs text-muted-foreground">
                {{ mode === 'prorata' ? 'Prorata' : 'Full' }}
              </p>
            </div>

            <p class="text-lg font-semibold">
              {{ formatRupiah(nominalTerpilih) }}
            </p>
          </div>
        </template>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isGenerating" @click="tutup">
          Batal
        </Button>

        <Button :disabled="isLoadingPreview ||
          isGenerating ||
          !layananTerpilih ||
          nominalTerpilih < 0
          " @click="submit">
          {{ isGenerating ? 'Membuat...' : 'Buat Tagihan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>