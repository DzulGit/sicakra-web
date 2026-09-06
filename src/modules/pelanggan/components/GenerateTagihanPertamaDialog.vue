<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Loader2, ReceiptText } from 'lucide-vue-next'

import {
  useGenerateTagihanPertama,
  usePreviewTagihanPertama,
} from '@/modules/tagihan/composables/useKeuanganTagihan'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const props = defineProps<{
  open: boolean
  pelangganId: number | string | null
  namaPelanggan?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const {
  mutate: preview,
  isPending: isPreviewing,
} = usePreviewTagihanPertama()

const {
  mutate: generate,
  isPending: isGenerating,
} = useGenerateTagihanPertama()

const previewData = ref<PreviewItem[]>([])
const layananTerpilih = ref('')
const mode = ref<'prorata' | 'full'>('prorata')
const nominalManual = ref('')
const jumlahHariJatuhTempo = ref('7')
const error = ref('')

const isPending = computed(
  () => isPreviewing.value || isGenerating.value,
)

const layanan = computed(() =>
  previewData.value.find(
    (item) => String(item.layanan_internet_id) === layananTerpilih.value,
  ),
)

const perhitungan = computed(() => {
  if (!layanan.value) return null

  return mode.value === 'prorata'
    ? layanan.value.prorata
    : layanan.value.full
})

const nominalTerhitung = computed(() =>
  perhitungan.value?.nominal_terhitung ?? 0,
)

const nominalAkhir = computed(() => {
  if (nominalManual.value === '') {
    return nominalTerhitung.value
  }

  const nilai = Number(nominalManual.value)

  return Number.isFinite(nilai) && nilai >= 0
    ? nilai
    : nominalTerhitung.value
})

const tanggalJatuhTempo = computed(() => {
  const hari = Number(jumlahHariJatuhTempo.value || 0)
  const tanggal = new Date()

  tanggal.setDate(tanggal.getDate() + hari)

  return tanggal.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const formatRupiah = (nilai: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nilai)

function resetForm() {
  previewData.value = []
  layananTerpilih.value = ''
  mode.value = 'prorata'
  nominalManual.value = ''
  jumlahHariJatuhTempo.value = '7'
  error.value = ''
}

function ambilPreview() {
  if (props.pelangganId === null) return

  error.value = ''

  preview(
    props.pelangganId,
    {
      onSuccess: (data) => {
        previewData.value = data

        const pertama = data[0]

        layananTerpilih.value = pertama
          ? String(pertama.layanan_internet_id)
          : ''

        nominalManual.value = pertama
          ? String(pertama.prorata.nominal_terhitung)
          : ''
      },

      onError: (e: Error) => {
        const pesan =
          e instanceof AxiosError
            ? (e.response?.data as ApiErrorResponse | undefined)?.message
            : undefined

        error.value =
          pesan ?? 'Gagal mengambil perhitungan tagihan pertama.'
      },
    },
  )
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    resetForm()
    ambilPreview()
  },
)

watch(
  [layananTerpilih, mode],
  () => {
    if (!perhitungan.value) {
      nominalManual.value = ''
      return
    }

    nominalManual.value = String(
      perhitungan.value.nominal_terhitung,
    )
  },
)

function tutup() {
  if (!isPending.value) {
    emit('update:open', false)
  }
}

function konfirmasi() {
  if (props.pelangganId === null) {
    error.value = 'Pelanggan tidak ditemukan.'
    return
  }

  if (!layanan.value || !perhitungan.value) {
    error.value = 'Layanan aktif belum dipilih.'
    return
  }

  const nominal = Number(nominalManual.value)

  if (!Number.isFinite(nominal) || nominal < 0) {
    error.value = 'Nominal tagihan tidak valid.'
    return
  }

  const hari = Number(jumlahHariJatuhTempo.value)

  if (!Number.isInteger(hari) || hari < 1 || hari > 31) {
    error.value = 'Jumlah hari jatuh tempo harus 1–31.'
    return
  }

  error.value = ''

  generate(
    {
      pelangganId: props.pelangganId,
      payload: {
        layanan_internet_id: layanan.value.layanan_internet_id,
        mode: mode.value,
        nominal_manual: nominal,
        jumlah_hari_jatuh_tempo: hari,
      },
    },
    {
      onSuccess: (tagihan) => {
        toast.success(
          `Tagihan ${tagihan.nomor_tagihan} berhasil dibuat.`,
        )

        emit('saved')
        emit('update:open', false)
      },

      onError: (e: Error) => {
        const pesan =
          e instanceof AxiosError
            ? (e.response?.data as ApiErrorResponse | undefined)?.message
            : undefined

        toast.error(
          pesan ?? 'Gagal membuat tagihan pertama.',
        )
      },
    },
  )
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(v) => !isPending && emit('update:open', v)"
  >
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ReceiptText class="size-5" />
          Buat Tagihan Pertama
        </DialogTitle>

        <DialogDescription>
          Tentukan metode perhitungan dan nominal tagihan pertama pelanggan.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div
          v-if="isPreviewing"
          class="py-8 text-center text-sm text-muted-foreground"
        >
          Menghitung tagihan pertama...
        </div>

        <template v-else>
          <!-- Error -->
          <div
            v-if="error"
            class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {{ error }}
          </div>

          <!-- Pelanggan -->
          <div class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p class="font-medium">
              Pelanggan
            </p>

            <p class="mt-1">
              {{ namaPelanggan ?? '-' }}
            </p>
          </div>

          <!-- Layanan + Metode -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Layanan -->
            <div class="space-y-2">
              <Label for="layanan-pertama">
                Layanan
              </Label>

              <Select v-model="layananTerpilih">
                <SelectTrigger
                  id="layanan-pertama"
                  class="w-full"
                  :disabled="isPending || !previewData.length"
                >
                  <SelectValue placeholder="Pilih layanan" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    v-for="item in previewData"
                    :key="item.layanan_internet_id"
                    :value="String(item.layanan_internet_id)"
                  >
                    {{ item.prorata.nama_paket }}
                    ·
                    {{ item.prorata.kecepatan_mbps }} Mbps
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Metode Tagihan -->
            <div class="space-y-2">
              <Label for="mode-tagihan-pertama">
                Metode Tagihan
              </Label>

              <Select
                v-model="mode"
                :disabled="isPending || !layanan"
              >
                <SelectTrigger
                  id="mode-tagihan-pertama"
                  class="w-full"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="prorata">
                    Prorata — sampai akhir bulan
                  </SelectItem>

                  <SelectItem value="full">
                    Full — 1 bulan penuh
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Perhitungan -->
          <div
            v-if="perhitungan"
            class="rounded-lg border bg-muted/40 px-4 py-3 text-sm"
          >
            <p class="font-medium">
              Perhitungan
            </p>

            <dl class="mt-2 space-y-1">
              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">
                  Paket
                </dt>

                <dd class="text-right">
                  {{ perhitungan.nama_paket }}
                </dd>
              </div>

              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">
                  Tanggal Aktif
                </dt>

                <dd class="text-right">
                  {{ perhitungan.tanggal_aktif }}
                </dd>
              </div>

              <div class="flex justify-between gap-4">
                <dt class="text-muted-foreground">
                  Harga Bulanan
                </dt>

                <dd class="text-right">
                  {{ formatRupiah(perhitungan.harga_bulanan) }}
                </dd>
              </div>

              <div
                v-if="mode === 'prorata'"
                class="flex justify-between gap-4"
              >
                <dt class="text-muted-foreground">
                  Hari Ditagihkan
                </dt>

                <dd class="text-right">
                  {{ perhitungan.jumlah_hari }}
                  /
                  {{ perhitungan.jumlah_hari_dalam_bulan }}
                  hari
                </dd>
              </div>

              <div class="flex justify-between gap-4 font-medium">
                <dt>
                  Hasil Perhitungan
                </dt>

                <dd>
                  {{ formatRupiah(nominalTerhitung) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Nominal + Jatuh Tempo -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Nominal Tagihan -->
            <div class="space-y-2">
              <Label for="nominal-manual">
                Nominal Tagihan
              </Label>

              <Input
                id="nominal-manual"
                v-model="nominalManual"
                type="number"
                min="0"
                step="1"
                :disabled="isPending || !perhitungan"
              />

              <p class="text-xs text-muted-foreground">
                Nominal hasil perhitungan dapat diubah oleh Keuangan
                sebelum tagihan dibuat.
              </p>
            </div>

            <!-- Jatuh Tempo -->
            <div class="space-y-2">
              <Label for="jatuh-tempo-pertama">
                Jatuh Tempo (hari)
              </Label>

              <Input
                id="jatuh-tempo-pertama"
                v-model="jumlahHariJatuhTempo"
                type="number"
                min="1"
                max="31"
                :disabled="isPending"
              />

              <p class="text-xs text-muted-foreground">
                Jatuh tempo dihitung sejak tagihan dibuat:
                {{ tanggalJatuhTempo }}
              </p>
            </div>
          </div>

          <Separator />

          <!-- Total -->
          <div class="rounded-lg border px-4 py-3">
            <div class="flex justify-between gap-4">
              <span class="font-medium">
                Total Tagihan
              </span>

              <span class="font-semibold">
                {{ formatRupiah(nominalAkhir) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isPending"
          @click="tutup"
        >
          Batal
        </Button>

        <Button
          :disabled="isPending || !perhitungan"
          @click="konfirmasi"
        >
          <Loader2
            v-if="isGenerating"
            class="mr-2 size-4 animate-spin"
          />

          {{ isGenerating ? 'Membuat...' : 'Buat Tagihan Pertama' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>