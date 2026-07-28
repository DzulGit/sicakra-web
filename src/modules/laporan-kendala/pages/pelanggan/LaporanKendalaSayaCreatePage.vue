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
const { data: layananSaya } = useLayananSayaList()

const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(buatLaporanSchema),
})
const [layananInternetId, layananInternetIdAttrs] = defineField('layanan_internet_id')
const [kategoriKendala, kategoriKendalaAttrs] = defineField('kategori_kendala')
const [deskripsi, deskripsiAttrs] = defineField('deskripsi')

const fotoInputRef = ref<HTMLInputElement | null>(null)
const fotoFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])

const isImageOpen = ref(false)
const selectedImage = ref<string | null>(null)

function onPilihFoto(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  if (!files.length) return

  const allFiles = [...fotoFiles.value, ...files]
  fotoFiles.value = allFiles
  setFieldValue('foto', allFiles)

  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  previewUrls.value = allFiles.map(file => URL.createObjectURL(file))
}

function hapusFoto(index: number) {
  fotoFiles.value.splice(index, 1)
  setFieldValue('foto', fotoFiles.value.length ? fotoFiles.value : undefined)
  
  URL.revokeObjectURL(previewUrls.value[index])
  previewUrls.value.splice(index, 1)
  
  if (fotoInputRef.value) fotoInputRef.value.value = ''
}

function bukaGambar(url: string) {
  selectedImage.value = url
  isImageOpen.value = true
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
            Lampirkan foto kendala kalau ada, mis. lampu indikator perangkat atau kabel rusak. Bisa pilih beberapa foto.
          </p>

          <div class="flex flex-wrap gap-4 mt-2">
            <div v-for="(url, index) in previewUrls" :key="index" class="relative w-fit">
              <img 
                :src="url" 
                alt="Preview foto kendala" 
                class="h-32 w-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                @click="bukaGambar(url)"
              />
              <button
                type="button"
                class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Hapus foto"
                @click="hapusFoto(index)"
              >
                <X class="size-3.5" />
              </button>
            </div>
            
            <label
              for="foto"
              class="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
            >
              <ImagePlus class="size-6" />
              Pilih Foto
            </label>
          </div>

          <!-- Tambahkan atribut multiple di sini -->
          <input
            id="foto"
            ref="fotoInputRef"
            type="file"
            multiple
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

  <!-- Popup Modal Gambar -->
  <div 
    v-if="isImageOpen && selectedImage" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
    @click="isImageOpen = false; selectedImage = null"
  >
    <img 
      :src="selectedImage" 
      alt="Preview Foto Full" 
      class="max-h-[90vh] max-w-[90vw] rounded-md object-contain" 
    />
  </div>
</template>