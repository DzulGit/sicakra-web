<script setup lang="ts">
import { computed } from 'vue'
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

const bisaSelesaikan = computed(() => laporan.value?.status === 'ditugaskan')

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
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="laporan" class="max-w-xl space-y-6">
    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <div>
          <CardTitle>{{ laporan.nomor_laporan }}</CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ laporan.layanan_internet?.pelanggan?.nama_lengkap }}
          </p>
        </div>
        <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div>
          <p class="text-muted-foreground">Kategori Kendala</p>
          <p>{{ laporan.kategori_kendala }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Deskripsi dari Pelanggan</p>
          <p>{{ laporan.deskripsi }}</p>
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
</template>
