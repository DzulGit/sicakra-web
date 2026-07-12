<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { hasilSurveySchema } from '@/schemas/jadwal-teknisi.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useIsiHasilSurvey, useJadwalSurveyDetail } from '../composables/useJadwalSurvey'
import { hasilSurveyEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: jadwal, isLoading } = useJadwalSurveyDetail(id)

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(hasilSurveySchema),
})
const [hasilField, hasilFieldAttrs] = defineField('hasil')
const [catatan, catatanAttrs] = defineField('catatan')

const { mutate, isPending } = useIsiHasilSurvey()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: id.value, payload: values },
    {
      onSuccess: () => {
        toast.success(
          values.hasil === 'berhasil'
            ? 'Hasil survey disimpan — permohonan lanjut ke tahap Pemasangan.'
            : 'Hasil survey disimpan — permohonan ditandai Ditunda.',
        )
        router.push('/admin/teknisi/jadwal-survey')
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="jadwal" class="max-w-xl space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ jadwal.permohonan_layanan?.nomor_permohonan }}</CardTitle>
        <p class="text-sm text-muted-foreground">
          {{ jadwal.permohonan_layanan?.pelanggan?.nama_lengkap }}
        </p>
      </CardHeader>
      <CardContent class="space-y-2 text-sm">
        <p class="text-muted-foreground">Alamat</p>
        <p>{{ jadwal.permohonan_layanan?.alamat_pemasangan }}</p>
      </CardContent>
    </Card>

    <Card v-if="jadwal.hasil">
      <CardHeader>
        <CardTitle class="text-base">Hasil Sudah Diisi</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <StatusBadge :value="jadwal.hasil" :map="hasilSurveyEnum" />
        <p v-if="jadwal.catatan" class="text-sm text-muted-foreground">{{ jadwal.catatan }}</p>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">Isi Hasil Survey</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label>Hasil</Label>
            <Select v-model="hasilField" v-bind="hasilFieldAttrs">
              <SelectTrigger><SelectValue placeholder="Pilih hasil" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="berhasil">Berhasil</SelectItem>
                <SelectItem value="kendala">Kendala</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.hasil" class="text-xs text-destructive">{{ errors.hasil }}</p>
          </div>
          <div class="space-y-2">
            <Label for="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              v-model="catatan"
              v-bind="catatanAttrs"
              placeholder="Wajib diisi kalau hasil Kendala"
            />
            <p v-if="errors.catatan" class="text-xs text-destructive">{{ errors.catatan }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Simpan Hasil' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
