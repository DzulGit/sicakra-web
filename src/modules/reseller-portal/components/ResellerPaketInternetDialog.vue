<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  simpanPaketInternetSchema,
  ubahPaketInternetSchema,
  type SimpanPaketInternetForm,
  type UbahPaketInternetForm,
} from '@/schemas/paket-internet.schema'
import { mapValidationErrors } from '@/lib/errors'
import {
  useSimpanResellerPaketInternet,
  useUbahResellerPaketInternet,
  useResellerPaketInternetDetail,
} from '@/modules/paket-internet/composables/reseller/useResellerPaketInternet'

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'tambah' | 'ubah'
    paketId?: number | string | null
  }>(),
  { open: false, mode: 'tambah', paketId: null },
)
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'success'): void
}>()

// ---------------------------------------------------------------------------
// Mode & schema
// ---------------------------------------------------------------------------
const modeEdit = computed(() => props.mode === 'ubah' && !!props.paketId)
const schema = computed(() =>
  modeEdit.value ? ubahPaketInternetSchema : simpanPaketInternetSchema,
)

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
const {
  handleSubmit,
  errors,
  defineField,
  setErrors,
  setValues,
  setFieldValue,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(schema),
})

const [namaPaket, namaPaketAttrs] = defineField('nama_paket')
const [kecepatanMbps, kecepatanMbpsAttrs] = defineField('kecepatan_mbps')
const [harga, hargaAttrs] = defineField('harga')
const [jumlahPerangkat, jumlahPerangkatAttrs] = defineField('jumlah_perangkat')
const [promoGratisBulan, promoGratisBulanAttrs] = defineField('promo_gratis_bulan')
const [deskripsi, deskripsiAttrs] = defineField('deskripsi')
const [statusAktif] = defineField('status_aktif')

// Load paket saat mode edit
const { data: paket, isLoading: isLoadingDetail } = useResellerPaketInternetDetail(
  computed(() => (modeEdit.value ? props.paketId : undefined)),
)

watch(
  paket,
  (nilai) => {
    if (!nilai) return
    setValues({
      nama_paket: nilai.nama_paket,
      kecepatan_mbps: nilai.kecepatan_mbps,
      harga: Number(nilai.harga),
      jumlah_perangkat: nilai.jumlah_perangkat,
      promo_gratis_bulan: nilai.promo_gratis_bulan ?? 0,
      deskripsi: nilai.deskripsi ?? '',
      status_aktif: nilai.status_aktif,
    })
  },
  { immediate: true },
)

watch(
  () => props.open,
  (v) => {
    if (v && !modeEdit.value) {
      resetForm()
    }
  },
)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const { mutate: simpan, isPending: isPendingSimpan } = useSimpanResellerPaketInternet()
const { mutate: ubah, isPending: isPendingUbah } = useUbahResellerPaketInternet()
const isPending = computed(() => isPendingSimpan.value || isPendingUbah.value)

const onSubmit = handleSubmit((values) => {
  if (modeEdit.value) {
    ubah(
      { id: props.paketId as number, payload: values as UbahPaketInternetForm },
      {
        onSuccess: () => {
          toast.success('Paket internet berhasil diperbarui.')
          emit('success')
          emit('update:open', false)
        },
        onError: (error) => {
          const fe = mapValidationErrors(error)
          if (fe) setErrors(fe)
          else toast.error('Terjadi kesalahan, coba lagi.')
        },
      },
    )
  } else {
    simpan(values as SimpanPaketInternetForm, {
      onSuccess: () => {
        toast.success('Paket internet berhasil dibuat.')
        emit('success')
        emit('update:open', false)
      },
      onError: (error) => {
        const fe = mapValidationErrors(error)
        if (fe) setErrors(fe)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    })
  }
})

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {{ modeEdit ? 'Ubah Paket Internet' : 'Tambah Paket Internet' }}
        </DialogTitle>
        <DialogDescription>
          {{ modeEdit ? 'Perbarui detail paket internet ini.' : 'Buat paket internet baru untuk pelanggan Anda.' }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="modeEdit && isLoadingDetail" class="space-y-4">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
      </div>

      <form v-else class="space-y-4" novalidate @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="nama_paket">Nama Paket</Label>
          <Input
            id="nama_paket"
            v-model="namaPaket"
            v-bind="namaPaketAttrs"
            :aria-invalid="!!errors.nama_paket"
          />
          <p v-if="errors.nama_paket" class="text-xs text-destructive">{{ errors.nama_paket }}</p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="kecepatan_mbps">Kecepatan (Mbps)</Label>
            <Input
              id="kecepatan_mbps"
              v-model="kecepatanMbps"
              v-bind="kecepatanMbpsAttrs"
              type="number"
              min="1"
            />
            <p v-if="errors.kecepatan_mbps" class="text-xs text-destructive">{{ errors.kecepatan_mbps }}</p>
          </div>

          <div class="space-y-2">
            <Label for="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              v-model="harga"
              v-bind="hargaAttrs"
              type="number"
              min="0"
            />
            <p v-if="errors.harga" class="text-xs text-destructive">{{ errors.harga }}</p>
          </div>

          <div class="space-y-2">
            <Label for="jumlah_perangkat">Jumlah Perangkat</Label>
            <Input
              id="jumlah_perangkat"
              v-model="jumlahPerangkat"
              v-bind="jumlahPerangkatAttrs"
              type="number"
              min="1"
              max="255"
            />
            <p v-if="errors.jumlah_perangkat" class="text-xs text-destructive">{{ errors.jumlah_perangkat }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="promo_gratis_bulan">Promo Gratis (bulan)</Label>
          <Input
            id="promo_gratis_bulan"
            v-model="promoGratisBulan"
            v-bind="promoGratisBulanAttrs"
            type="number"
            min="0"
            max="24"
            placeholder="0"
          />
          <p v-if="errors.promo_gratis_bulan" class="text-xs text-destructive">{{ errors.promo_gratis_bulan }}</p>
          <p class="text-xs text-muted-foreground">
            Pelanggan baru dengan paket ini otomatis bebas tagihan pada pemasangan pertama.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            v-model="deskripsi"
            v-bind="deskripsiAttrs"
            placeholder="Keunggulan paket, dll."
          />
          <p v-if="errors.deskripsi" class="text-xs text-destructive">{{ errors.deskripsi }}</p>
        </div>

        <div v-if="modeEdit" class="flex items-center gap-2">
          <Checkbox
            id="status_aktif"
            :model-value="statusAktif"
            @update:model-value="(v: boolean) => setFieldValue('status_aktif', v)"
          />
          <Label for="status_aktif" class="cursor-pointer font-normal">
            Paket aktif
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="handleClose" :disabled="isPending">
            Batal
          </Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : (modeEdit ? 'Simpan Perubahan' : 'Simpan') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
