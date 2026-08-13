<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { simpanPaketInternetSchema, ubahPaketInternetSchema } from '@/schemas/paket-internet.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAdminPaketInternetDetail, useSimpanPaketInternet, useUbahPaketInternet } from '../composables/usePaketInternet'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string | undefined)
const modeEdit = computed(() => !!id.value)

const { data: paket, isLoading: isLoadingDetail } = modeEdit.value
  ? useAdminPaketInternetDetail(id as any)
  : { data: computed(() => null), isLoading: computed(() => false) }

const schema = computed(() => (modeEdit.value ? ubahPaketInternetSchema : simpanPaketInternetSchema))

const { handleSubmit, errors, defineField, setErrors, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(schema.value),
})

const [namaPaket, namaPaketAttrs] = defineField('nama_paket')
const [kecepatanMbps, kecepatanMbpsAttrs] = defineField('kecepatan_mbps')
const [harga, hargaAttrs] = defineField('harga')
const [jumlahPerangkat, jumlahPerangkatAttrs] = defineField('jumlah_perangkat')
const [promoGratisBulan, promoGratisBulanAttrs] = defineField('promo_gratis_bulan')
const [deskripsi, deskripsiAttrs] = defineField('deskripsi')
const [statusAktif] = defineField('status_aktif')

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

const { mutate: simpan, isPending: isPendingSimpan } = useSimpanPaketInternet()
const { mutate: ubah, isPending: isPendingUbah } = useUbahPaketInternet()
const isPending = computed(() => isPendingSimpan.value || isPendingUbah.value)

const onSubmit = handleSubmit((values) => {
  if (modeEdit.value) {
    ubah(
      { id: id.value as string, payload: values },
      {
        onSuccess: () => {
          toast.success('Paket internet berhasil diperbarui.')
          router.push('/admin/operasional/paket-internet')
        },
        onError: (error) => {
          const fieldErrors = mapValidationErrors(error)
          if (fieldErrors) setErrors(fieldErrors)
          else toast.error('Terjadi kesalahan, coba lagi.')
        },
      },
    )
  } else {
    simpan(values, {
      onSuccess: () => {
        toast.success('Paket internet baru berhasil dibuat.')
        router.push('/admin/operasional/paket-internet')
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    })
  }
})
</script>

<template>
  <div v-if="isLoadingDetail" class="max-w-lg space-y-4">
    <Skeleton class="h-64 w-full" />
  </div>

  <Card v-else class="max-w-lg">
    <CardHeader>
      <CardTitle>{{ modeEdit ? 'Ubah Paket Internet' : 'Tambah Paket Internet' }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="nama_paket">Nama Paket</Label>
          <Input id="nama_paket" v-model="namaPaket" v-bind="namaPaketAttrs" :aria-invalid="!!errors.nama_paket" />
          <p v-if="errors.nama_paket" class="text-xs text-destructive">{{ errors.nama_paket }}</p>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="kecepatan_mbps">Kecepatan (Mbps)</Label>
            <Input id="kecepatan_mbps" v-model="kecepatanMbps" v-bind="kecepatanMbpsAttrs" type="number" min="1" />
            <p v-if="errors.kecepatan_mbps" class="text-xs text-destructive">{{ errors.kecepatan_mbps }}</p>
          </div>
          <div class="space-y-2">
            <Label for="harga">Harga (Rp)</Label>
            <Input id="harga" v-model="harga" v-bind="hargaAttrs" type="number" min="0" />
            <p v-if="errors.harga" class="text-xs text-destructive">{{ errors.harga }}</p>
          </div>
          <div class="space-y-2">
            <Label for="jumlah_perangkat">Jumlah Perangkat</Label>
            <Input id="jumlah_perangkat" v-model="jumlahPerangkat" v-bind="jumlahPerangkatAttrs" type="number" min="1" max="255" />
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
          <Textarea id="deskripsi" v-model="deskripsi" v-bind="deskripsiAttrs" placeholder="Keunggulan paket, dll." />
          <p v-if="errors.deskripsi" class="text-xs text-destructive">{{ errors.deskripsi }}</p>
        </div>
        <div v-if="modeEdit" class="flex items-center gap-2">
          <Checkbox id="status_aktif" :model-value="statusAktif" @update:model-value="(v) => setFieldValue('status_aktif', !!v)" />
          <Label for="status_aktif" class="cursor-pointer font-normal">Paket aktif (tampil di halaman publik)</Label>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
