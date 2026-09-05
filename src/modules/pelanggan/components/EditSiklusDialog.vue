<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import { useAturSiklusLayanan } from '../composables/usePelanggan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { LayananInternetDetail } from '@/types/models'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Dialog override siklus penagihan per layanan: bebas_tagihan_bulan (promo)
 * &/atau tanggal_mulai_penagihan. Data siklus tinggal di layanan, bukan pelanggan.
 */
const props = defineProps<{
  open: boolean
  layanan: LayananInternetDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const { mutate, isPending } = useAturSiklusLayanan()

const bebas = ref('0')
const tanggalMulai = ref('')
const error = ref('')

watch(
  () => [props.open, props.layanan] as const,
  ([open, layanan]) => {
    if (open && layanan) {
      bebas.value = String(layanan.bebas_tagihan_bulan ?? 0)
      tanggalMulai.value = layanan.tanggal_mulai_penagihan ?? ''
      error.value = ''
    }
  },
  { immediate: true },
)

const tidakBerubah = computed(() => {
  if (!props.layanan) return true
  const bebasSama = Number(bebas.value || 0) === (props.layanan.bebas_tagihan_bulan ?? 0)
  const tglSama = (tanggalMulai.value || null) === (props.layanan.tanggal_mulai_penagihan ?? null)
  return bebasSama && tglSama
})

function validate(): boolean {
  const nilai = Number(bebas.value)
  if (!Number.isInteger(nilai) || nilai < 0 || nilai > 24) {
    error.value = 'Bebas tagihan harus bilangan bulat 0–24.'
    return false
  }
  if (tanggalMulai.value && !/^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai.value)) {
    error.value = 'Format tanggal tidak valid.'
    return false
  }
  error.value = ''
  return true
}

function tutup() {
  if (!isPending.value) emit('update:open', false)
}

function simpan() {
  const layanan = props.layanan
  if (!layanan || !validate()) return

  const bebasBaru = Number(bebas.value)
  const tglBaru = tanggalMulai.value || null
  const bebasBerubah = bebasBaru !== (layanan.bebas_tagihan_bulan ?? 0)
  const tglBerubah = tglBaru !== (layanan.tanggal_mulai_penagihan ?? null)

  const payload: { bebas_tagihan_bulan?: number; tanggal_mulai_penagihan?: string } = {}
  if (bebasBerubah) payload.bebas_tagihan_bulan = bebasBaru
  if (tglBaru) {
    if (tglBerubah) payload.tanggal_mulai_penagihan = tglBaru
  } else if (layanan.tanggal_mulai_penagihan) {
    // Tanggal dikosongkan -> kirim bebas (walau sama) supaya backend menghitung ulang
    // tanggal_mulai_penagihan dari tanggal_aktif (reset ke hitungan otomatis).
    payload.bebas_tagihan_bulan = bebasBaru
  }

  mutate(
    { id: layanan.id, ...payload },
    {
      onSuccess: () => {
        toast.success('Siklus penagihan berhasil diperbarui.')
        emit('saved')
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal memperbarui siklus penagihan.')
      },
    },
  )
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !isPending && emit('update:open', v)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Siklus Penagihan</DialogTitle>
        <DialogDescription>
          Atur masa bebas tagihan &amp; jadwal untuk layanan {{ layanan?.nomor_layanan ?? '-' }}.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="bebas-tagihan">Bebas Tagihan (bulan)</Label>
          <Input id="bebas-tagihan" v-model="bebas" type="number" min="0" max="24" />
          <p class="text-xs text-muted-foreground">
            Jumlah bulan gratis sebelum tagihan berbayar pertama (0–24). Ubah hanya ini untuk menghitung ulang tanggal mulai.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="tanggal-mulai">Tanggal Mulai Penagihan</Label>
          <Input id="tanggal-mulai" v-model="tanggalMulai" type="date" />
          <p class="text-xs text-muted-foreground">
            Kosongkan untuk memakai hitungan otomatis (tanggal aktif + 1 + bebas bulan), dengan Snap ke akhir bulan.
          </p>
        </div>

        <p v-if="error" class="text-sm font-medium text-destructive">{{ error }}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isPending" @click="tutup">Batal</Button>
        <Button :disabled="tidakBerubah || isPending" @click="simpan">
          <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ isPending ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
