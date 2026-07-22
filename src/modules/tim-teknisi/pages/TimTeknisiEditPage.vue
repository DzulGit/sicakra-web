<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { ubahTimTeknisiSchema } from '@/schemas/tim-teknisi.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useTimTeknisiDetail, useUbahTimTeknisi } from '../composables/useTimTeknisi'
import { useDaftarTeknisi } from '@/modules/permohonan-layanan/composables/usePermohonanLayanan'
import TeknisiChecklist from '@/components/data/TeknisiChecklist.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: tim, isLoading } = useTimTeknisiDetail(id)
const { data: daftarTeknisi } = useDaftarTeknisi()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, setValues, values } = useForm({
  validationSchema: toTypedSchema(ubahTimTeknisiSchema),
})
const [namaTim, namaTimAttrs] = defineField('nama_tim')
const [statusAktif] = defineField('status_aktif')

watch(
  tim,
  (nilai) => {
    if (!nilai) return
    setValues({
      nama_tim: nilai.nama_tim,
      status_aktif: nilai.status_aktif,
      anggota_ids: (nilai.anggota ?? []).map((a) => a.id),
    })
  },
  { immediate: true },
)

const { mutate, isPending } = useUbahTimTeknisi()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    { id: id.value, payload: formValues },
    {
      onSuccess: () => {
        toast.success('Tim teknisi berhasil diperbarui.')
        router.push('/admin/super-admin/tim-teknisi')
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
  <div v-if="isLoading" class="max-w-lg space-y-4">
    <Skeleton class="h-64 w-full" />
  </div>

  <Card v-else class="max-w-lg">
    <CardHeader>
      <CardTitle>Ubah Tim Teknisi</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="nama_tim">Nama Tim</Label>
          <Input id="nama_tim" v-model="namaTim" v-bind="namaTimAttrs" :aria-invalid="!!errors.nama_tim" />
          <p v-if="errors.nama_tim" class="text-xs text-destructive">{{ errors.nama_tim }}</p>
        </div>
        <div class="space-y-2">
          <Label>Anggota</Label>
          <TeknisiChecklist
            :daftar-teknisi="daftarTeknisi ?? []"
            :model-value="values.anggota_ids ?? []"
            @update:model-value="(v) => setFieldValue('anggota_ids', v)"
          />
          <p v-if="errors.anggota_ids" class="text-xs text-destructive">{{ errors.anggota_ids }}</p>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="status_aktif" :model-value="statusAktif" @update:model-value="(v) => setFieldValue('status_aktif', !!v)" />
          <Label for="status_aktif" class="cursor-pointer font-normal">Tim aktif (bisa dipilih saat jadwalkan kerja)</Label>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>