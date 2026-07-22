<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { hasilPemasanganSchema } from '@/schemas/jadwal-teknisi.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useIsiHasilPemasangan, useJadwalPemasanganDetail } from '../composables/useJadwalPemasangan'
import { hasilPemasanganEnum } from '@/lib/enums'
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

const { data: jadwal, isLoading } = useJadwalPemasanganDetail(id)

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(hasilPemasanganSchema),
})
const [hasilField, hasilFieldAttrs] = defineField('hasil')
const [alasanPenundaan, alasanPenundaanAttrs] = defineField('alasan_penundaan')

const { mutate, isPending } = useIsiHasilPemasangan()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: id.value, payload: values },
    {
      onSuccess: () => {
        toast.success(
          values.hasil === 'selesai'
            ? 'Pemasangan selesai — layanan pelanggan resmi AKTIF.'
            : 'Hasil pemasangan disimpan — permohonan ditandai Ditunda.',
        )
        router.push('/admin/teknisi/jadwal-pemasangan')
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
        <StatusBadge :value="jadwal.hasil" :map="hasilPemasanganEnum" />
        <p v-if="jadwal.alasan_penundaan" class="text-sm text-muted-foreground">
          {{ jadwal.alasan_penundaan }}
        </p>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">Isi Hasil Pemasangan</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label>Hasil</Label>
            <Select v-model="hasilField" v-bind="hasilFieldAttrs">
              <SelectTrigger><SelectValue placeholder="Pilih hasil" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="ditunda">Ditunda</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.hasil" class="text-xs text-destructive">{{ errors.hasil }}</p>
          </div>
          <div class="space-y-2">
            <Label for="alasan_penundaan">Alasan Penundaan</Label>
            <Textarea
              id="alasan_penundaan"
              v-model="alasanPenundaan"
              v-bind="alasanPenundaanAttrs"
              placeholder="Wajib diisi kalau hasil Ditunda"
            />
            <p v-if="errors.alasan_penundaan" class="text-xs text-destructive">
              {{ errors.alasan_penundaan }}
            </p>
          </div>
          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Simpan Hasil' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
