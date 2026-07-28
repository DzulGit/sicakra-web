<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { selesaikanLaporanSchema } from '@/schemas/laporan-kendala.schema'
import { mapValidationErrors } from '@/lib/errors'
import {
  useLaporanKendalaDetailTeknisi,
  useSelesaikanLaporan,
} from '../../composables/useTeknisiLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: laporan, isLoading } = useLaporanKendalaDetailTeknisi(id)

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(selesaikanLaporanSchema),
})
const [hasilPenanganan, hasilPenangananAttrs] = defineField('hasil_penanganan')

const { mutate, isPending } = useSelesaikanLaporan()

const pelanggan = computed(() => laporan.value?.layanan_internet?.pelanggan)
const bisaSelesaikan = computed(() => laporan.value?.status === 'ditugaskan')

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: id.value, payload: values },
    {
      onSuccess: () => toast.success('Laporan ditandai Selesai — menunggu konfirmasi Operasional.'),
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

const isImageOpen = ref(false)
const selectedImage = ref<string | null>(null)

function bukaGambar(foto: string) {
  selectedImage.value = foto.startsWith('http') 
    ? foto 
    : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`
  isImageOpen.value = true
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="laporan" class="mx-auto max-w-2xl space-y-4">
    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <div>
          <CardTitle>{{ laporan.nomor_laporan }}</CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ pelanggan?.nama_lengkap }} &middot; {{ pelanggan?.nomor_hp }}
          </p>
        </div>
        <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div class="grid grid-cols-3 gap-x-6 gap-y-1.5">
          <div>
            <p class="text-xs text-muted-foreground">Kategori Kendala</p>
            <p>{{ laporan.kategori_kendala }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Tanggal Laporan</p>
            <p>{{ formatTanggal(laporan.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Layanan</p>
            <p>{{ laporan.layanan_internet?.nomor_layanan }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Kontak Pelanggan</p>
            <p>{{ pelanggan?.nomor_hp }} {{ pelanggan?.email ? '· ' + pelanggan.email : '' }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs text-muted-foreground">Deskripsi Kendala</p>
          <p>{{ laporan.deskripsi }}</p>
        </div>

        <div v-if="laporan.foto" class="mt-4">
          <p class="text-xs text-muted-foreground mb-2">Foto Kendala</p>
          <div class="flex flex-wrap gap-4">
            <img 
              v-for="(foto, index) in (Array.isArray(laporan.foto) ? laporan.foto : [laporan.foto])" 
              :key="index"
              :src="foto.startsWith('http') ? foto : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`" 
              alt="Foto Laporan" 
              class="h-32 w-32 rounded-md border object-cover cursor-pointer hover:opacity-80 transition-opacity"
              @click="bukaGambar(foto)"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="laporan.hasil_penanganan">
      <CardHeader>
        <CardTitle class="text-base">Hasil Penanganan</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm">{{ laporan.hasil_penanganan }}</p>
      </CardContent>
    </Card>

    <Card v-else-if="bisaSelesaikan">
      <CardHeader>
        <CardTitle class="text-base">Selesaikan Laporan</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label for="hasil_penanganan">Hasil Penanganan</Label>
            <Textarea
              id="hasil_penanganan"
              v-model="hasilPenanganan"
              v-bind="hasilPenangananAttrs"
              placeholder="Jelaskan tindakan yang sudah dilakukan"
            />
            <p v-if="errors.hasil_penanganan" class="text-xs text-destructive">
              {{ errors.hasil_penanganan }}
            </p>
          </div>
          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Tandai Selesai' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <p v-else class="text-sm text-muted-foreground">
      Laporan ini belum/tidak dalam status yang bisa kamu selesaikan.
    </p>
  </div>
  <Teleport to="body">
    <div 
      v-if="isImageOpen && selectedImage" 
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
      @click="isImageOpen = false; selectedImage = null"
    >
      <img 
        :src="selectedImage" 
        alt="Foto Laporan Full" 
        class="max-h-[90vh] max-w-[90vw] rounded-md object-contain" 
      />
    </div>
  </Teleport>
</template>
