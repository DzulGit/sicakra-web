<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ImagePlus, X } from 'lucide-vue-next'
import { buatLaporanSchema } from '@/schemas/laporan-kendala.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useBuatLaporanKendala } from '../../composables/usePelangganLaporanKendala'
import { useLayananSayaList } from '@/modules/layanan-internet/composables/usePelangganLayanan'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const router = useRouter()

// Hanya butuh daftar layanan aktif milik pelanggan untuk dropdown — cukup halaman pertama,
// realistisnya pelanggan tidak punya puluhan layanan sekaligus.
const { data: layananSaya } = useLayananSayaList()

const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(buatLaporanSchema),
})
const [layananInternetId, layananInternetIdAttrs] = defineField('layanan_internet_id')
const [kategoriKendala, kategoriKendalaAttrs] = defineField('kategori_kendala')
const [deskripsi, deskripsiAttrs] = defineField('deskripsi')

// Foto opsional — input file tidak cocok pakai v-model biasa, jadi
// ditangani manual lewat setFieldValue + preview URL lokal.
const fotoInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

function onPilihFoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  setFieldValue('foto', file)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function hapusFoto() {
  setFieldValue('foto', undefined)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  if (fotoInputRef.value) fotoInputRef.value.value = ''
}

const { mutate, isPending } = useBuatLaporanKendala()

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => {
      toast.success('Laporan berhasil dikirim, tim kami akan segera menindaklanjuti.')
      router.push('/pelanggan/laporan-kendala')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>

<template>
  <Card class="max-w-lg">
    <CardHeader>
      <CardTitle>Buat Laporan Kendala</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Layanan</Label>
          <Select v-model="layananInternetId" v-bind="layananInternetIdAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih layanan yang bermasalah" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="l in layananSaya?.data ?? []" :key="l.id" :value="String(l.id)">
                {{ l.nomor_layanan }} — {{ l.alamat_pemasangan }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.layanan_internet_id" class="text-xs text-destructive">
            {{ errors.layanan_internet_id }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="kategori_kendala">Kategori Kendala</Label>
          <Input
            id="kategori_kendala"
            v-model="kategoriKendala"
            v-bind="kategoriKendalaAttrs"
            placeholder="mis. Internet Lambat, Tidak Ada Sinyal"
            :aria-invalid="!!errors.kategori_kendala"
          />
          <p v-if="errors.kategori_kendala" class="text-xs text-destructive">{{ errors.kategori_kendala }}</p>
        </div>
        <div class="space-y-2">
          <Label for="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            v-model="deskripsi"
            v-bind="deskripsiAttrs"
            placeholder="Jelaskan kendala yang kamu alami"
          />
          <p v-if="errors.deskripsi" class="text-xs text-destructive">{{ errors.deskripsi }}</p>
        </div>
        <div class="space-y-2">
          <Label for="foto">Foto (Opsional)</Label>
          <p class="text-xs text-muted-foreground">
            Lampirkan foto kendala kalau ada, mis. lampu indikator perangkat atau kabel rusak.
          </p>

          <div v-if="previewUrl" class="relative w-fit">
            <img :src="previewUrl" alt="Preview foto kendala" class="h-32 w-32 rounded-lg object-cover" />
            <button
              type="button"
              class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              aria-label="Hapus foto"
              @click="hapusFoto"
            >
              <X class="size-3.5" />
            </button>
          </div>

          <label
            v-else
            for="foto"
            class="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50"
          >
            <ImagePlus class="size-4" />
            Pilih Foto
          </label>
          <input
            id="foto"
            ref="fotoInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            class="hidden"
            @change="onPilihFoto"
          />
          <p v-if="errors.foto" class="text-xs text-destructive">{{ errors.foto }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Mengirim...' : 'Kirim Laporan' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>